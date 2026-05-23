package com.cardrive.service;

import com.cardrive.model.dto.BudgetDTO;
import com.cardrive.model.dto.CreateBudgetRequest;
import com.cardrive.model.entity.Automobile;
import com.cardrive.model.entity.MonthlyBudget;
import com.cardrive.model.entity.User;
import com.cardrive.repository.AutomobileRepository;
import com.cardrive.repository.MonthlyBudgetRepository;
import com.cardrive.repository.UserRepository;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.LocalDate;

@Service
public class BudgetService {

    private final MonthlyBudgetRepository budgetRepository;
    private final UserRepository userRepository;
    private final AutomobileRepository automobileRepository;

    public BudgetService(MonthlyBudgetRepository budgetRepository,
                         UserRepository userRepository,
                         AutomobileRepository automobileRepository) {
        this.budgetRepository = budgetRepository;
        this.userRepository = userRepository;
        this.automobileRepository = automobileRepository;
    }

    private User getCurrentUser() {
        UserDetails userDetails = (UserDetails) SecurityContextHolder.getContext().getAuthentication().getPrincipal();
        return userRepository.findByEmail(userDetails.getUsername())
                .orElseThrow(() -> new RuntimeException("User not found"));
    }

    private BudgetDTO convertToDTO(MonthlyBudget budget, BigDecimal spentAmount) {
        BudgetDTO dto = new BudgetDTO();
        dto.setId(budget.getId());
        dto.setYear(budget.getYear());
        dto.setMonth(budget.getMonth());
        dto.setLimitAmount(budget.getLimitAmount());
        dto.setSpentAmount(spentAmount != null ? spentAmount : BigDecimal.ZERO);
        dto.setAutomobileId(budget.getAutomobile().getId());
        dto.setAutomobilePlateNumber(budget.getAutomobile().getPlateNumber());

        BigDecimal spent = spentAmount != null ? spentAmount : BigDecimal.ZERO;
        BigDecimal remaining = budget.getLimitAmount().subtract(spent);

        dto.setRemainingAmount(remaining);

        double progress = 0.0;
        if (budget.getLimitAmount().compareTo(BigDecimal.ZERO) > 0 && spent.compareTo(BigDecimal.ZERO) > 0) {
            progress = spent.doubleValue() / budget.getLimitAmount().doubleValue() * 100;
        }
        dto.setProgressPercent(Math.min(progress, 100));
        dto.setIsExceeded(spent.compareTo(budget.getLimitAmount()) > 0);

        return dto;
    }

    @Transactional
    public BudgetDTO setBudget(CreateBudgetRequest request) {
        User currentUser = getCurrentUser();

        Automobile automobile = automobileRepository.findById(request.getAutomobileId())
                .orElseThrow(() -> new RuntimeException("Automobile not found"));

        if (!automobile.getUser().getId().equals(currentUser.getId())) {
            throw new RuntimeException("Access denied");
        }

        MonthlyBudget existingBudget = budgetRepository
                .findByAutomobileIdAndYearAndMonth(request.getAutomobileId(), request.getYear(), request.getMonth())
                .orElse(null);

        MonthlyBudget budget;
        if (existingBudget != null) {
            existingBudget.setLimitAmount(request.getLimitAmount());
            budget = existingBudget;
        } else {
            budget = new MonthlyBudget();
            budget.setYear(request.getYear());
            budget.setMonth(request.getMonth());
            budget.setLimitAmount(request.getLimitAmount());
            budget.setAutomobile(automobile);
        }

        MonthlyBudget saved = budgetRepository.save(budget);

        BigDecimal spentAmount = budgetRepository.getSpentAmount(
                request.getAutomobileId(), request.getYear(), request.getMonth());

        return convertToDTO(saved, spentAmount);
    }

    public BudgetDTO getCurrentBudget(Long automobileId) {
        User currentUser = getCurrentUser();

        Automobile automobile = automobileRepository.findById(automobileId)
                .orElseThrow(() -> new RuntimeException("Automobile not found"));

        if (!automobile.getUser().getId().equals(currentUser.getId())) {
            throw new RuntimeException("Access denied");
        }

        LocalDate now = LocalDate.now();
        int year = now.getYear();
        int month = now.getMonthValue();

        MonthlyBudget budget = budgetRepository
                .findByAutomobileIdAndYearAndMonth(automobileId, year, month)
                .orElse(null);

        if (budget == null) {
            return null;
        }

        BigDecimal spentAmount = budgetRepository.getSpentAmount(automobileId, year, month);
        return convertToDTO(budget, spentAmount);
    }

    public BudgetDTO getBudgetForMonth(Long automobileId, int year, int month) {
        User currentUser = getCurrentUser();

        Automobile automobile = automobileRepository.findById(automobileId)
                .orElseThrow(() -> new RuntimeException("Automobile not found"));

        if (!automobile.getUser().getId().equals(currentUser.getId())) {
            throw new RuntimeException("Access denied");
        }

        MonthlyBudget budget = budgetRepository
                .findByAutomobileIdAndYearAndMonth(automobileId, year, month)
                .orElse(null);

        if (budget == null) {
            return null;
        }

        BigDecimal spentAmount = budgetRepository.getSpentAmount(automobileId, year, month);
        return convertToDTO(budget, spentAmount);
    }
}