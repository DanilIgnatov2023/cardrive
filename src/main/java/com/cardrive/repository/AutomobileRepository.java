package com.cardrive.repository;

import com.cardrive.model.entity.Automobile;
import com.cardrive.model.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;

public interface AutomobileRepository extends JpaRepository<Automobile, Long> {
    List<Automobile> findByUser(User user);
    List<Automobile> findByUserId(Long userId);
}