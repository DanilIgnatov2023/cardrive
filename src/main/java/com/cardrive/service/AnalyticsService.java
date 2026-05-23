package com.cardrive.service;

import com.cardrive.model.dto.CategoryStatDTO;
import com.cardrive.model.dto.ComparisonDTO;
import com.cardrive.model.dto.MonthlyFuelConsumptionDTO;
import com.cardrive.model.dto.MonthlyStatDTO;
import com.cardrive.model.dto.SummaryDTO;
import com.cardrive.model.entity.Automobile;
import com.cardrive.model.entity.Expense;
import com.cardrive.model.entity.ExpenseCategory;
import com.cardrive.model.entity.User;
import com.cardrive.repository.AutomobileRepository;
import com.cardrive.repository.ExpenseCategoryRepository;
import com.cardrive.repository.ExpenseRepository;
import com.cardrive.repository.UserRepository;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.LocalDate;
import java.time.YearMonth;
import java.time.format.DateTimeFormatter;
import java.util.ArrayList;
import java.util.Collections;
import java.util.Comparator;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;
import java.util.OptionalInt;
import java.util.stream.Collectors;

@Service
public class AnalyticsService {

    private final ExpenseRepository expenseRepository;
    private final UserRepository userRepository;
    private final AutomobileRepository automobileRepository;
    private final ExpenseCategoryRepository categoryRepository;

    public AnalyticsService(ExpenseRepository expenseRepository,
                            UserRepository userRepository,
                            AutomobileRepository automobileRepository,
                            ExpenseCategoryRepository categoryRepository) {
        this.expenseRepository = expenseRepository;
        this.userRepository = userRepository;
        this.automobileRepository = automobileRepository;
        this.categoryRepository = categoryRepository;
    }

    public List<ComparisonDTO> compareAutomobiles(Long userId, LocalDate startDate, LocalDate endDate) {
        List<Automobile> automobiles = automobileRepository.findByUserId(userId);
        List<ComparisonDTO> result = new ArrayList<>();

        for (Automobile auto : automobiles) {
            List<Expense> expenses = expenseRepository.findByUserIdAndAutomobileIdAndDateBetween(
                    userId, auto.getId(), startDate, endDate);

            BigDecimal totalExpenses = expenses.stream()
                    .map(Expense::getAmount)
                    .reduce(BigDecimal.ZERO, BigDecimal::add);

            Integer totalDistance = calculateDistance(expenses);

            BigDecimal costPerKm = BigDecimal.ZERO;
            if (totalDistance != null && totalDistance > 0 && totalExpenses.compareTo(BigDecimal.ZERO) > 0) {
                costPerKm = totalExpenses.divide(BigDecimal.valueOf(totalDistance), 2, RoundingMode.HALF_UP);
            }

            ComparisonDTO dto = new ComparisonDTO();
            dto.setAutomobileId(auto.getId());
            dto.setPlateNumber(auto.getPlateNumber());
            dto.setBrandName(auto.getBrand() != null ? auto.getBrand().getName() : null);
            dto.setModelName(auto.getModel() != null ? auto.getModel().getName() : null);
            dto.setYear(auto.getYear());
            dto.setTotalExpenses(totalExpenses);
            dto.setCostPerKm(costPerKm);
            dto.setTotalDistance(totalDistance);
            dto.setExpenseCount(expenses.size());

            result.add(dto);
        }

        result.sort(Comparator.comparing(ComparisonDTO::getCostPerKm));
        return result;
    }

    private User getCurrentUser() {
        UserDetails userDetails = (UserDetails) SecurityContextHolder.getContext().getAuthentication().getPrincipal();
        return userRepository.findByEmail(userDetails.getUsername())
                .orElseThrow(() -> new RuntimeException("User not found"));
    }

    private Integer calculateDistance(List<Expense> expenses) {
        List<Integer> odometers = expenses.stream()
                .map(Expense::getOdometer)
                .filter(o -> o != null && o > 0)
                .collect(Collectors.toList());
        if (odometers.size() < 2) {
            return null;
        }
        OptionalInt maxOdometer = odometers.stream().mapToInt(Integer::intValue).max();
        OptionalInt minOdometer = odometers.stream().mapToInt(Integer::intValue).min();
        if (maxOdometer.isPresent() && minOdometer.isPresent()) {
            int distance = maxOdometer.getAsInt() - minOdometer.getAsInt();
            return distance > 0 ? distance : null;
        }
        return null;
    }

    public SummaryDTO getSummary(Long automobileId, LocalDate startDate, LocalDate endDate) {
        User currentUser = getCurrentUser();
        Automobile automobile = automobileRepository.findById(automobileId)
                .orElseThrow(() -> new RuntimeException("Automobile not found"));

        if (!automobile.getUser().getId().equals(currentUser.getId())) {
            throw new RuntimeException("Access denied");
        }

        List<Expense> expenses = expenseRepository.findByUserIdAndAutomobileIdAndDateBetween(
                currentUser.getId(), automobileId, startDate, endDate);

        BigDecimal totalExpenses = expenses.stream()
                .map(Expense::getAmount)
                .reduce(BigDecimal.ZERO, BigDecimal::add);

        Integer totalDistance = calculateDistance(expenses);

        BigDecimal costPerKm = BigDecimal.ZERO;
        if (totalDistance != null && totalDistance > 0 && totalExpenses.compareTo(BigDecimal.ZERO) > 0) {
            costPerKm = totalExpenses.divide(BigDecimal.valueOf(totalDistance), 2, RoundingMode.HALF_UP);
        }

        Double avgFuelConsumption = null;
        BigDecimal fuelLiters = expenses.stream()
                .filter(e -> e.getCategory() != null && "Топливо".equalsIgnoreCase(e.getCategory().getName()))
                .map(Expense::getFuelLiters)
                .filter(v -> v != null && v.compareTo(BigDecimal.ZERO) > 0)
                .reduce(BigDecimal.ZERO, BigDecimal::add);
        if (totalDistance != null && totalDistance > 0 && fuelLiters.compareTo(BigDecimal.ZERO) > 0) {
            avgFuelConsumption = fuelLiters
                    .divide(BigDecimal.valueOf(totalDistance), 4, RoundingMode.HALF_UP)
                    .multiply(BigDecimal.valueOf(100))
                    .setScale(2, RoundingMode.HALF_UP)
                    .doubleValue();
        }

        return new SummaryDTO(
                totalExpenses, costPerKm, totalDistance, avgFuelConsumption,
                startDate.toString(), endDate.toString(), automobile.getPlateNumber()
        );
    }

    public List<CategoryStatDTO> getCategoryStats(Long automobileId, LocalDate startDate, LocalDate endDate) {
        User currentUser = getCurrentUser();

        List<Expense> expenses = expenseRepository.findByUserIdAndAutomobileIdAndDateBetween(
                currentUser.getId(), automobileId, startDate, endDate);

        BigDecimal totalAmount = expenses.stream()
                .map(Expense::getAmount)
                .reduce(BigDecimal.ZERO, BigDecimal::add);

        Map<ExpenseCategory, List<Expense>> expensesByCategory = expenses.stream()
                .collect(Collectors.groupingBy(Expense::getCategory));

        List<CategoryStatDTO> result = new ArrayList<>();

        for (Map.Entry<ExpenseCategory, List<Expense>> entry : expensesByCategory.entrySet()) {
            ExpenseCategory category = entry.getKey();
            List<Expense> categoryExpenses = entry.getValue();

            BigDecimal categoryTotal = categoryExpenses.stream()
                    .map(Expense::getAmount)
                    .reduce(BigDecimal.ZERO, BigDecimal::add);

            double percentage = 0.0;
            if (totalAmount.compareTo(BigDecimal.ZERO) > 0) {
                percentage = categoryTotal.doubleValue() / totalAmount.doubleValue() * 100;
            }

            CategoryStatDTO dto = new CategoryStatDTO();
            dto.setCategoryId(category.getId());
            dto.setCategoryName(category.getName());
            dto.setCategoryIcon(category.getIcon());
            dto.setCategoryColor(category.getColor());
            dto.setTotalAmount(categoryTotal);
            dto.setPercentage(percentage);
            dto.setExpenseCount(categoryExpenses.size());

            result.add(dto);
        }

        result.sort((a, b) -> b.getTotalAmount().compareTo(a.getTotalAmount()));
        return result;
    }

    public List<MonthlyStatDTO> getMonthlyStats(Long automobileId, int months) {
        User currentUser = getCurrentUser();

        LocalDate endDate = LocalDate.now();
        LocalDate startDate = endDate.minusMonths(months);

        List<Expense> expenses = expenseRepository.findByUserIdAndAutomobileIdAndDateBetween(
                currentUser.getId(), automobileId, startDate, endDate);

        Map<String, MonthlyStatDTO> statsMap = new LinkedHashMap<>();

        for (int i = 0; i < months; i++) {
            LocalDate date = endDate.minusMonths(i);
            String monthKey = date.format(DateTimeFormatter.ofPattern("yyyy-MM"));
            MonthlyStatDTO dto = new MonthlyStatDTO();
            dto.setMonth(date.format(DateTimeFormatter.ofPattern("MMM")));
            dto.setYear(date.getYear());
            dto.setAmount(BigDecimal.ZERO);
            dto.setExpenseCount(0);
            statsMap.put(monthKey, dto);
        }

        for (Expense expense : expenses) {
            String monthKey = expense.getDate().format(DateTimeFormatter.ofPattern("yyyy-MM"));
            MonthlyStatDTO dto = statsMap.get(monthKey);
            if (dto != null) {
                dto.setAmount(dto.getAmount().add(expense.getAmount()));
                dto.setExpenseCount(dto.getExpenseCount() + 1);
            }
        }

        List<MonthlyStatDTO> result = new ArrayList<>(statsMap.values());
        Collections.reverse(result);
        return result;
    }

    public List<MonthlyFuelConsumptionDTO> getMonthlyFuelConsumption(Long automobileId, int months) {
        User currentUser = getCurrentUser();
        Automobile automobile = automobileRepository.findById(automobileId)
                .orElseThrow(() -> new RuntimeException("Automobile not found"));

        if (!automobile.getUser().getId().equals(currentUser.getId())) {
            throw new RuntimeException("Access denied");
        }

        LocalDate endDate = LocalDate.now();
        LocalDate startDate = endDate.minusMonths(Math.max(months - 1, 0)).withDayOfMonth(1);
        List<Expense> fuelExpenses = expenseRepository.findFuelExpenses(
                currentUser.getId(), automobileId, "Топливо", startDate, endDate);

        Map<String, MonthlyFuelConsumptionDTO> resultMap = new LinkedHashMap<>();
        for (int i = months - 1; i >= 0; i--) {
            YearMonth ym = YearMonth.from(endDate.minusMonths(i));
            String key = ym.format(DateTimeFormatter.ofPattern("yyyy-MM"));
            MonthlyFuelConsumptionDTO dto = new MonthlyFuelConsumptionDTO();
            dto.setMonth(ym.atDay(1).format(DateTimeFormatter.ofPattern("MMM")));
            dto.setYear(ym.getYear());
            dto.setFuelLiters(BigDecimal.ZERO);
            dto.setDistanceKm(0);
            dto.setConsumptionPer100Km(BigDecimal.ZERO);
            resultMap.put(key, dto);
        }

        Map<String, List<Expense>> byMonth = fuelExpenses.stream()
                .collect(Collectors.groupingBy(e -> e.getDate().format(DateTimeFormatter.ofPattern("yyyy-MM"))));

        for (Map.Entry<String, List<Expense>> entry : byMonth.entrySet()) {
            MonthlyFuelConsumptionDTO dto = resultMap.get(entry.getKey());
            if (dto == null) {
                continue;
            }

            BigDecimal liters = entry.getValue().stream()
                    .map(Expense::getFuelLiters)
                    .filter(v -> v != null && v.compareTo(BigDecimal.ZERO) > 0)
                    .reduce(BigDecimal.ZERO, BigDecimal::add);
            Integer distance = calculateDistance(entry.getValue());

            dto.setFuelLiters(liters);
            dto.setDistanceKm(distance != null ? distance : 0);
            if (distance != null && distance > 0 && liters.compareTo(BigDecimal.ZERO) > 0) {
                BigDecimal consumption = liters
                        .divide(BigDecimal.valueOf(distance), 4, RoundingMode.HALF_UP)
                        .multiply(BigDecimal.valueOf(100))
                        .setScale(2, RoundingMode.HALF_UP);
                dto.setConsumptionPer100Km(consumption);
            }
        }

        return new ArrayList<>(resultMap.values());
    }
}
