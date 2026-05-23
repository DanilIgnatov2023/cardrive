package com.cardrive.service;

import com.cardrive.model.entity.*;
import com.cardrive.repository.CategoryBudgetRepository;
import com.cardrive.repository.ExpenseRepository;
import com.cardrive.repository.MonthlyBudgetRepository;
import com.cardrive.repository.ReminderRepository;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;

@Component
public class NotificationScheduler {

    private final MonthlyBudgetRepository monthlyBudgetRepository;
    private final CategoryBudgetRepository categoryBudgetRepository;
    private final ExpenseRepository expenseRepository;
    private final ReminderRepository reminderRepository;
    private final NotificationService notificationService;

    public NotificationScheduler(MonthlyBudgetRepository monthlyBudgetRepository,
                                 CategoryBudgetRepository categoryBudgetRepository,
                                 ExpenseRepository expenseRepository,
                                 ReminderRepository reminderRepository,
                                 NotificationService notificationService) {
        this.monthlyBudgetRepository = monthlyBudgetRepository;
        this.categoryBudgetRepository = categoryBudgetRepository;
        this.expenseRepository = expenseRepository;
        this.reminderRepository = reminderRepository;
        this.notificationService = notificationService;
    }

    @Scheduled(cron = "0 0 8 * * *")
    public void checkSmartNotifications() {
        checkMonthlyBudgets();
        checkCategoryBudgets();
        checkUpcomingReminders();
    }

    private void checkMonthlyBudgets() {
        LocalDate now = LocalDate.now();
        List<MonthlyBudget> budgets = monthlyBudgetRepository.findAll();
        for (MonthlyBudget budget : budgets) {
            if (!budget.getYear().equals(now.getYear()) || !budget.getMonth().equals(now.getMonthValue())) {
                continue;
            }
            BigDecimal spent = monthlyBudgetRepository.getSpentAmount(
                    budget.getAutomobile().getId(), budget.getYear(), budget.getMonth());
            if (spent == null) {
                spent = BigDecimal.ZERO;
            }
            if (spent.compareTo(budget.getLimitAmount()) > 0) {
                notificationService.createNotificationIfNotExists(
                        budget.getAutomobile().getUser(),
                        "Превышен общий бюджет",
                        "Автомобиль " + budget.getAutomobile().getPlateNumber() + ": потрачено " + spent +
                                " ₽ при лимите " + budget.getLimitAmount() + " ₽.",
                        NotificationType.BUDGET_EXCEEDED
                );
            }
        }
    }

    private void checkCategoryBudgets() {
        LocalDate now = LocalDate.now();
        List<CategoryBudget> budgets = categoryBudgetRepository.findAll();
        for (CategoryBudget budget : budgets) {
            if (!budget.getYear().equals(now.getYear()) || !budget.getMonth().equals(now.getMonthValue())) {
                continue;
            }
            if (budget.getLimitAmount() == null || budget.getLimitAmount().compareTo(BigDecimal.ZERO) <= 0) {
                continue;
            }
            BigDecimal spent = expenseRepository.getSpentAmountByCategory(
                    budget.getAutomobile().getId(), budget.getCategory().getId(), budget.getYear(), budget.getMonth());
            if (spent == null) {
                spent = BigDecimal.ZERO;
            }
            BigDecimal eightyPercent = budget.getLimitAmount().multiply(BigDecimal.valueOf(0.8));
            if (spent.compareTo(eightyPercent) >= 0) {
                notificationService.createNotificationIfNotExists(
                        budget.getAutomobile().getUser(),
                        "Лимит категории близок",
                        budget.getCategory().getName() + " по авто " + budget.getAutomobile().getPlateNumber() +
                                ": потрачено " + spent + " ₽ из " + budget.getLimitAmount() + " ₽.",
                        NotificationType.CATEGORY_LIMIT
                );
            }
        }
    }

    private void checkUpcomingReminders() {
        LocalDate today = LocalDate.now();
        LocalDate inThreeDays = today.plusDays(3);
        List<Reminder> reminders = reminderRepository.findByStatusAndDueDateBetween(
                ReminderStatus.PENDING, today, inThreeDays);
        for (Reminder reminder : reminders) {
            notificationService.createNotificationIfNotExists(
                    reminder.getUser(),
                    "Скоро дедлайн: " + reminder.getTitle(),
                    "Напоминание запланировано на " + reminder.getDueDate() + ".",
                    NotificationType.REMINDER_DUE
            );
        }
    }
}
