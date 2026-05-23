package com.cardrive.repository;

import com.cardrive.model.entity.Expense;
import com.cardrive.model.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;

public interface ExpenseRepository extends JpaRepository<Expense, Long> {
    List<Expense> findByUserIdAndDateBetweenOrderByDateDesc(Long userId, LocalDate startDate, LocalDate endDate);

    List<Expense> findByUserIdAndAutomobileIdAndDateBetween(Long userId, Long automobileId, LocalDate startDate, LocalDate endDate);

    List<Expense> findByAutomobileIdOrderByDateDesc(Long automobileId);
    @Query("SELECT SUM(e.amount) FROM Expense e WHERE e.user.id = :userId AND e.automobile.id = :autoId AND e.date BETWEEN :startDate AND :endDate")
    Double getTotalExpenses(@Param("userId") Long userId, @Param("autoId") Long autoId,
                            @Param("startDate") LocalDate startDate, @Param("endDate") LocalDate endDate);

    @Query("SELECT COALESCE(SUM(e.amount), 0) FROM Expense e WHERE e.automobile.id = :automobileId " +
            "AND e.category.id = :categoryId " +
            "AND EXTRACT(YEAR FROM e.date) = :year " +
            "AND EXTRACT(MONTH FROM e.date) = :month")
    BigDecimal getSpentAmountByCategory(@Param("automobileId") Long automobileId,
                                         @Param("categoryId") Long categoryId,
                                         @Param("year") Integer year,
                                         @Param("month") Integer month);

    @Query("SELECT e FROM Expense e WHERE e.user.id = :userId AND e.automobile.id = :automobileId " +
            "AND e.category.name = :categoryName AND e.date BETWEEN :startDate AND :endDate " +
            "ORDER BY e.date ASC")
    List<Expense> findFuelExpenses(@Param("userId") Long userId,
                                   @Param("automobileId") Long automobileId,
                                   @Param("categoryName") String categoryName,
                                   @Param("startDate") LocalDate startDate,
                                   @Param("endDate") LocalDate endDate);
}
