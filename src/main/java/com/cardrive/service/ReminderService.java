package com.cardrive.service;

import com.cardrive.model.dto.CreateReminderRequest;
import com.cardrive.model.dto.ReminderDTO;
import com.cardrive.model.entity.*;
import com.cardrive.repository.AutomobileRepository;
import com.cardrive.repository.ReminderRepository;
import com.cardrive.repository.UserRepository;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.time.temporal.ChronoUnit;
import java.util.List;
import java.util.stream.Collectors;

@Service
public class ReminderService {

    private final ReminderRepository reminderRepository;
    private final UserRepository userRepository;
    private final AutomobileRepository automobileRepository;
    private final NotificationService notificationService;

    public ReminderService(ReminderRepository reminderRepository,
                           UserRepository userRepository,
                           AutomobileRepository automobileRepository,
                           NotificationService notificationService) {
        this.reminderRepository = reminderRepository;
        this.userRepository = userRepository;
        this.automobileRepository = automobileRepository;
        this.notificationService = notificationService;
    }

    private User getCurrentUser() {
        UserDetails userDetails = (UserDetails) SecurityContextHolder.getContext().getAuthentication().getPrincipal();
        return userRepository.findByEmail(userDetails.getUsername())
                .orElseThrow(() -> new RuntimeException("User not found"));
    }

    private ReminderDTO convertToDTO(Reminder reminder) {
        ReminderDTO dto = new ReminderDTO();
        dto.setId(reminder.getId());
        dto.setTitle(reminder.getTitle());
        dto.setDescription(reminder.getDescription());
        dto.setDueDate(reminder.getDueDate());
        dto.setType(reminder.getType().getDisplayName());
        dto.setTypeIcon(reminder.getType().getIcon());
        dto.setStatus(reminder.getStatus().getDisplayName());

        if (reminder.getAutomobile() != null) {
            dto.setAutomobileId(reminder.getAutomobile().getId());
            dto.setAutomobilePlateNumber(reminder.getAutomobile().getPlateNumber());
        }

        long daysLeft = ChronoUnit.DAYS.between(LocalDate.now(), reminder.getDueDate());
        dto.setDaysLeft((int) daysLeft);
        dto.setIsOverdue(daysLeft < 0 && reminder.getStatus() == ReminderStatus.PENDING);

        return dto;
    }

    public List<ReminderDTO> getUserReminders() {
        User currentUser = getCurrentUser();
        return reminderRepository
                .findByUserIdAndStatusOrderByDueDateAsc(currentUser.getId(), ReminderStatus.PENDING)
                .stream()
                .map(this::convertToDTO)
                .collect(Collectors.toList());
    }

    @Transactional
    public ReminderDTO createReminder(CreateReminderRequest request) {
        User currentUser = getCurrentUser();

        Reminder reminder = new Reminder();
        reminder.setTitle(request.getTitle());
        reminder.setDescription(request.getDescription());
        reminder.setDueDate(request.getDueDate());
        reminder.setType(ReminderType.valueOf(request.getType()));
        reminder.setStatus(ReminderStatus.PENDING);
        reminder.setUser(currentUser);

        if (request.getAutomobileId() != null) {
            Automobile automobile = automobileRepository.findById(request.getAutomobileId())
                    .orElseThrow(() -> new RuntimeException("Automobile not found"));
            reminder.setAutomobile(automobile);
        }

        Reminder savedReminder = reminderRepository.save(reminder);

        // НЕМЕДЛЕННАЯ ПРОВЕРКА - нужно ли отправить уведомление о напоминании
        checkAndSendReminderNotification(savedReminder);

        return convertToDTO(savedReminder);
    }

    @Transactional
    public ReminderDTO completeReminder(Long id) {
        Reminder reminder = reminderRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Reminder not found"));
        reminder.setStatus(ReminderStatus.COMPLETED);
        return convertToDTO(reminderRepository.save(reminder));
    }

    @Transactional
    public void deleteReminder(Long id) {
        reminderRepository.deleteById(id);
    }

    // НОВЫЙ МЕТОД - мгновенная проверка напоминания
    private void checkAndSendReminderNotification(Reminder reminder) {
        LocalDate today = LocalDate.now();
        LocalDate dueDate = reminder.getDueDate();
        LocalDate inThreeDays = today.plusDays(3);

        // Проверяем, что напоминание в статусе PENDING и дата в ближайшие 3 дня
        if (reminder.getStatus() == ReminderStatus.PENDING &&
                !dueDate.isBefore(today) &&
                !dueDate.isAfter(inThreeDays)) {

            long daysLeft = ChronoUnit.DAYS.between(today, dueDate);
            String daysMessage = daysLeft == 0 ? "сегодня" :
                    (daysLeft == 1 ? "завтра" :
                     "через " + daysLeft + " дня");

            notificationService.createNotificationIfNotExists(
                    reminder.getUser(),
                    "Скоро дедлайн: " + reminder.getTitle(),
                    "Напоминание \"" + reminder.getTitle() + "\" запланировано на " +
                            reminder.getDueDate() + " (" + daysMessage + ").",
                    NotificationType.REMINDER_DUE
            );
        }
    }
}