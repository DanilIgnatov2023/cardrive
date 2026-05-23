package com.cardrive.repository;

import com.cardrive.model.entity.CategoryBudget;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;
import java.util.Optional;

public interface CategoryBudgetRepository extends JpaRepository<CategoryBudget, Long> {
    List<CategoryBudget> findByAutomobileIdAndYearAndMonth(Long automobileId, Integer year, Integer month);
    Optional<CategoryBudget> findByAutomobileIdAndCategoryIdAndYearAndMonth(Long automobileId, Long categoryId, Integer year, Integer month);
}
