package com.cardrive.repository;

import com.cardrive.model.entity.Reminder;
import com.cardrive.model.entity.ReminderStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import java.time.LocalDate;
import java.util.List;

public interface ReminderRepository extends JpaRepository<Reminder, Long> {
    List<Reminder> findByUserIdAndStatusOrderByDueDateAsc(Long userId, ReminderStatus status);

    List<Reminder> findByUserIdAndDueDateBeforeAndStatus(Long userId, LocalDate date, ReminderStatus status);

    List<Reminder> findByUserIdAndAutomobileIdAndStatusOrderByDueDateAsc(Long userId, Long automobileId, ReminderStatus status);

    List<Reminder> findByStatusAndDueDateBetween(ReminderStatus status, LocalDate startDate, LocalDate endDate);
}
