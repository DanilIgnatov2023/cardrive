package com.cardrive.repository;

import com.cardrive.model.entity.Notification;
import com.cardrive.model.entity.NotificationType;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;

public interface NotificationRepository extends JpaRepository<Notification, Long> {
    List<Notification> findByUserIdOrderByCreatedAtDesc(Long userId);
    List<Notification> findByUserIdAndIsReadFalseOrderByCreatedAtDesc(Long userId);
    Long countByUserIdAndIsReadFalse(Long userId);
    boolean existsByUserIdAndTypeAndTitleAndMessage(Long userId, NotificationType type, String title, String message);
}
