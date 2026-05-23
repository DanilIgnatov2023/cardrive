package com.cardrive.service;

import com.cardrive.model.dto.CategoryBudgetDTO;
import com.cardrive.model.dto.CategoryBudgetProgressDTO;
import com.cardrive.model.dto.CreateCategoryBudgetRequest;
import com.cardrive.model.entity.Automobile;
import com.cardrive.model.entity.CategoryBudget;
import com.cardrive.model.entity.ExpenseCategory;
import com.cardrive.model.entity.User;
import com.cardrive.repository.AutomobileRepository;
import com.cardrive.repository.CategoryBudgetRepository;
import com.cardrive.repository.ExpenseCategoryRepository;
import com.cardrive.repository.ExpenseRepository;
import com.cardrive.repository.UserRepository;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.util.ArrayList;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@Service
public class CategoryBudgetService {

    private final CategoryBudgetRepository categoryBudgetRepository;
    private final ExpenseRepository expenseRepository;
    private final UserRepository userRepository;
    private final AutomobileRepository automobileRepository;
    private final ExpenseCategoryRepository categoryRepository;

    public CategoryBudgetService(CategoryBudgetRepository categoryBudgetRepository,
                                 ExpenseRepository expenseRepository,
                                 UserRepository userRepository,
                                 AutomobileRepository automobileRepository,
                                 ExpenseCategoryRepository categoryRepository) {
        this.categoryBudgetRepository = categoryBudgetRepository;
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

    private Automobile getOwnedAutomobile(Long automobileId) {
        User currentUser = getCurrentUser();
        Automobile automobile = automobileRepository.findById(automobileId)
                .orElseThrow(() -> new RuntimeException("Automobile not found"));
        if (!automobile.getUser().getId().equals(currentUser.getId())) {
            throw new RuntimeException("Access denied");
        }
        return automobile;
    }

    private CategoryBudgetDTO convertToDTO(CategoryBudget budget) {
        CategoryBudgetDTO dto = new CategoryBudgetDTO();
        dto.setId(budget.getId());
        dto.setCategoryId(budget.getCategory().getId());
        dto.setCategoryName(budget.getCategory().getName());
        dto.setCategoryIcon(budget.getCategory().getIcon());
        dto.setCategoryColor(budget.getCategory().getColor());
        dto.setAutomobileId(budget.getAutomobile().getId());
        dto.setAutomobilePlateNumber(budget.getAutomobile().getPlateNumber());
        dto.setYear(budget.getYear());
        dto.setMonth(budget.getMonth());
        dto.setLimitAmount(budget.getLimitAmount());
        return dto;
    }

    @Transactional
    public CategoryBudgetDTO setCategoryBudget(CreateCategoryBudgetRequest request) {
        Automobile automobile = getOwnedAutomobile(request.getAutomobileId());
        ExpenseCategory category = categoryRepository.findById(request.getCategoryId())
                .orElseThrow(() -> new RuntimeException("Category not found"));

        CategoryBudget budget = categoryBudgetRepository
                .findByAutomobileIdAndCategoryIdAndYearAndMonth(
                        request.getAutomobileId(), request.getCategoryId(), request.getYear(), request.getMonth())
                .orElseGet(CategoryBudget::new);

        budget.setAutomobile(automobile);
        budget.setCategory(category);
        budget.setYear(request.getYear());
        budget.setMonth(request.getMonth());
        budget.setLimitAmount(request.getLimitAmount() != null ? request.getLimitAmount() : BigDecimal.ZERO);

        return convertToDTO(categoryBudgetRepository.save(budget));
    }

    public List<CategoryBudgetDTO> getCategoryBudgets(Long automobileId, Integer year, Integer month) {
        getOwnedAutomobile(automobileId);
        return categoryBudgetRepository.findByAutomobileIdAndYearAndMonth(automobileId, year, month)
                .stream()
                .map(this::convertToDTO)
                .collect(Collectors.toList());
    }

    public List<CategoryBudgetProgressDTO> getCategoryBudgetProgress(Long automobileId, Integer year, Integer month) {
        getOwnedAutomobile(automobileId);

        Map<Long, CategoryBudget> budgetsByCategory = categoryBudgetRepository
                .findByAutomobileIdAndYearAndMonth(automobileId, year, month)
                .stream()
                .collect(Collectors.toMap(b -> b.getCategory().getId(), b -> b));

        List<CategoryBudgetProgressDTO> result = new ArrayList<>();
        for (ExpenseCategory category : categoryRepository.findAll()) {
            CategoryBudget budget = budgetsByCategory.get(category.getId());
            BigDecimal limit = budget != null && budget.getLimitAmount() != null
                    ? budget.getLimitAmount()
                    : BigDecimal.ZERO;
            BigDecimal spent = expenseRepository.getSpentAmountByCategory(automobileId, category.getId(), year, month);
            if (spent == null) {
                spent = BigDecimal.ZERO;
            }

            CategoryBudgetProgressDTO dto = new CategoryBudgetProgressDTO();
            dto.setCategoryId(category.getId());
            dto.setCategoryName(category.getName());
            dto.setCategoryIcon(category.getIcon());
            dto.setCategoryColor(category.getColor());
            dto.setSpentAmount(spent);
            dto.setLimitAmount(limit);
            dto.setRemainingAmount(limit.subtract(spent));

            double progress = 0.0;
            if (limit.compareTo(BigDecimal.ZERO) > 0) {
                progress = spent.doubleValue() / limit.doubleValue() * 100.0;
            }
            dto.setProgressPercent(Math.min(progress, 100.0));
            dto.setIsExceeded(limit.compareTo(BigDecimal.ZERO) > 0 && spent.compareTo(limit) > 0);
            result.add(dto);
        }
        return result;
    }
}
