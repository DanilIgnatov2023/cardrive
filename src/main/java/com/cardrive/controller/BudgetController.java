package com.cardrive.controller;

import com.cardrive.model.dto.BudgetDTO;
import com.cardrive.model.dto.CategoryBudgetDTO;
import com.cardrive.model.dto.CategoryBudgetProgressDTO;
import com.cardrive.model.dto.CreateBudgetRequest;
import com.cardrive.model.dto.CreateCategoryBudgetRequest;
import com.cardrive.service.BudgetService;
import com.cardrive.service.CategoryBudgetService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("/api/budgets")
public class BudgetController {

    private final BudgetService budgetService;
    private final CategoryBudgetService categoryBudgetService;

    public BudgetController(BudgetService budgetService, CategoryBudgetService categoryBudgetService) {
        this.budgetService = budgetService;
        this.categoryBudgetService = categoryBudgetService;
    }

    @PostMapping
    public ResponseEntity<BudgetDTO> setBudget(@RequestBody CreateBudgetRequest request) {
        return ResponseEntity.ok(budgetService.setBudget(request));
    }

    @GetMapping("/current")
    public ResponseEntity<BudgetDTO> getCurrentBudget(@RequestParam Long automobileId) {
        BudgetDTO budget = budgetService.getCurrentBudget(automobileId);
        if (budget == null) {
            return ResponseEntity.noContent().build();
        }
        return ResponseEntity.ok(budget);
    }

    @GetMapping
    public ResponseEntity<BudgetDTO> getBudgetForMonth(
            @RequestParam Long automobileId,
            @RequestParam int year,
            @RequestParam int month) {
        BudgetDTO budget = budgetService.getBudgetForMonth(automobileId, year, month);
        if (budget == null) {
            return ResponseEntity.noContent().build();
        }
        return ResponseEntity.ok(budget);
    }

    @PostMapping("/category")
    public ResponseEntity<CategoryBudgetDTO> setCategoryBudget(@RequestBody CreateCategoryBudgetRequest request) {
        return ResponseEntity.ok(categoryBudgetService.setCategoryBudget(request));
    }

    @GetMapping("/category")
    public ResponseEntity<List<CategoryBudgetDTO>> getCategoryBudgets(
            @RequestParam Long automobileId,
            @RequestParam int year,
            @RequestParam int month) {
        return ResponseEntity.ok(categoryBudgetService.getCategoryBudgets(automobileId, year, month));
    }

    @GetMapping("/category/progress")
    public ResponseEntity<List<CategoryBudgetProgressDTO>> getCategoryBudgetProgress(
            @RequestParam Long automobileId,
            @RequestParam int year,
            @RequestParam int month) {
        return ResponseEntity.ok(categoryBudgetService.getCategoryBudgetProgress(automobileId, year, month));
    }
}
