package com.cardrive.repository;

import com.cardrive.model.entity.MonthlyBudget;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import java.math.BigDecimal;
import java.util.Optional;

public interface MonthlyBudgetRepository extends JpaRepository<MonthlyBudget, Long> {
    Optional<MonthlyBudget> findByAutomobileIdAndYearAndMonth(Long automobileId, Integer year, Integer month);

    @Query("SELECT SUM(e.amount) FROM Expense e WHERE e.automobile.id = :automobileId " +
            "AND EXTRACT(YEAR FROM e.date) = :year " +
            "AND EXTRACT(MONTH FROM e.date) = :month")
    BigDecimal getSpentAmount(@Param("automobileId") Long automobileId,
                              @Param("year") Integer year,
                              @Param("month") Integer month);
}