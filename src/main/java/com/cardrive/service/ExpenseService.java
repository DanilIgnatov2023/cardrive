package com.cardrive.service;

import com.cardrive.model.dto.CreateExpenseRequest;
import com.cardrive.model.dto.ExpenseDTO;
import com.cardrive.model.entity.*;
import com.cardrive.repository.*;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.LocalDate;
import java.util.Comparator;
import java.util.List;
import java.util.stream.Collectors;

@Service
public class ExpenseService {

    private final ExpenseRepository expenseRepository;
    private final UserRepository userRepository;
    private final AutomobileRepository automobileRepository;
    private final ExpenseCategoryRepository categoryRepository;

    public ExpenseService(ExpenseRepository expenseRepository,
                          UserRepository userRepository,
                          AutomobileRepository automobileRepository,
                          ExpenseCategoryRepository categoryRepository) {
        this.expenseRepository = expenseRepository;
        this.userRepository = userRepository;
        this.automobileRepository = automobileRepository;
        this.categoryRepository = categoryRepository;
    }

    private User getCurrentUser() {
        UserDetails userDetails = (UserDetails) SecurityContextHolder.getContext().getAuthentication().getPrincipal();
        return userRepository.findByEmail(userDetails.getUsername())
                .orElseThrow(() -> new RuntimeException("User not found"));
    }

    private ExpenseDTO convertToDTO(Expense expense) {
        ExpenseDTO dto = new ExpenseDTO();
        dto.setId(expense.getId());
        dto.setDate(expense.getDate());
        dto.setAmount(expense.getAmount());
        dto.setOdometer(expense.getOdometer());
        dto.setFuelLiters(expense.getFuelLiters());
        dto.setFuelPricePerLiter(expense.getFuelPricePerLiter());
        dto.setComment(expense.getComment());
        dto.setCategoryId(expense.getCategory().getId());
        dto.setCategoryName(expense.getCategory().getName());
        if (expense.getSubcategory() != null) {
            dto.setSubcategoryId(expense.getSubcategory().getId());
            dto.setSubcategoryName(expense.getSubcategory().getName());
        }
        dto.setAutomobileId(expense.getAutomobile().getId());
        dto.setAutomobilePlateNumber(expense.getAutomobile().getPlateNumber());
        return dto;
    }

    private Integer getLastOdometer(Long automobileId) {
        List<Expense> lastExpenses = expenseRepository.findByAutomobileIdOrderByDateDesc(automobileId);

        if (lastExpenses.isEmpty()) {
            Automobile auto = automobileRepository.findById(automobileId).orElse(null);
            return auto != null ? auto.getStartOdometer() : null;
        }

        return lastExpenses.stream()
                .map(Expense::getOdometer)
                .filter(odometer -> odometer != null && odometer > 0)
                .max(Integer::compareTo)
                .orElse(null);
    }

    public List<ExpenseDTO> getUserExpenses(Long automobileId, Long categoryId, LocalDate startDate, LocalDate endDate) {
        User currentUser = getCurrentUser();
        List<Expense> expenses;

        if (automobileId != null) {
            expenses = expenseRepository.findByUserIdAndAutomobileIdAndDateBetween(
                    currentUser.getId(), automobileId, startDate, endDate);
        } else {
            expenses = expenseRepository.findByUserIdAndDateBetweenOrderByDateDesc(
                    currentUser.getId(), startDate, endDate);
        }

        return expenses.stream()
                .filter(expense -> categoryId == null || expense.getCategory().getId().equals(categoryId))
                .sorted(Comparator.comparing(Expense::getDate).reversed())
                .map(this::convertToDTO)
                .collect(Collectors.toList());
    }

    @Transactional
    public ExpenseDTO createExpense(CreateExpenseRequest request) {
        User currentUser = getCurrentUser();

        Automobile automobile = automobileRepository.findById(request.getAutomobileId())
                .orElseThrow(() -> new RuntimeException("Automobile not found"));

        if (!automobile.getUser().getId().equals(currentUser.getId())) {
            throw new RuntimeException("Access denied");
        }

        if (request.getOdometer() != null) {
            Integer lastOdometer = getLastOdometer(automobile.getId());

            if (lastOdometer != null && request.getOdometer() < lastOdometer) {
                throw new RuntimeException(
                        String.format("Пробег не может быть меньше последнего зафиксированного (%d км). " +
                                        "Текущий пробег: %d км, последний: %d км",
                                lastOdometer, request.getOdometer(), lastOdometer)
                );
            }

            if (automobile.getStartOdometer() != null &&
                    request.getOdometer() < automobile.getStartOdometer()) {
                throw new RuntimeException(
                        String.format("Пробег не может быть меньше начального пробега автомобиля (%d км)",
                                automobile.getStartOdometer())
                );
            }
        }

        ExpenseCategory category = categoryRepository.findById(request.getCategoryId())
                .orElseThrow(() -> new RuntimeException("Category not found"));

        Expense expense = new Expense();
        expense.setDate(request.getDate() != null ? request.getDate() : LocalDate.now());
        expense.setAmount(request.getAmount());
        expense.setOdometer(request.getOdometer());
        expense.setComment(request.getComment());
        expense.setUser(currentUser);
        expense.setAutomobile(automobile);
        expense.setCategory(category);

        boolean isFuelExpense = "Топливо".equalsIgnoreCase(category.getName());
        if (isFuelExpense) {
            expense.setFuelLiters(request.getFuelLiters());

            BigDecimal pricePerLiter = request.getFuelPricePerLiter();
            if (pricePerLiter == null && request.getFuelLiters() != null
                    && request.getFuelLiters().compareTo(BigDecimal.ZERO) > 0
                    && request.getAmount() != null) {
                pricePerLiter = request.getAmount().divide(request.getFuelLiters(), 2, RoundingMode.HALF_UP);
            }
            expense.setFuelPricePerLiter(pricePerLiter);
        }

        Expense savedExpense = expenseRepository.save(expense);

        if (request.getOdometer() != null) {
            automobile.setStartOdometer(request.getOdometer());
            automobileRepository.save(automobile);
        }

        return convertToDTO(savedExpense);
    }

    @Transactional
    public void deleteExpense(Long id) {
        User currentUser = getCurrentUser();
        Expense expense = expenseRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Expense not found"));

        if (!expense.getUser().getId().equals(currentUser.getId())) {
            throw new RuntimeException("Access denied");
        }

        expenseRepository.delete(expense);
    }
}
