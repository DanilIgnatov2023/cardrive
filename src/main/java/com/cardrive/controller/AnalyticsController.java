package com.cardrive.controller;

import com.cardrive.model.dto.CategoryStatDTO;
import com.cardrive.model.dto.ComparisonDTO;
import com.cardrive.model.dto.MonthlyFuelConsumptionDTO;
import com.cardrive.model.dto.MonthlyStatDTO;
import com.cardrive.model.dto.SummaryDTO;
import com.cardrive.model.entity.User;
import com.cardrive.repository.UserRepository;
import com.cardrive.service.AnalyticsService;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import java.time.LocalDate;
import java.util.List;

@RestController
@RequestMapping("/api/analytics")
public class AnalyticsController {

    private final AnalyticsService analyticsService;
    private final UserRepository userRepository;

    public AnalyticsController(AnalyticsService analyticsService, UserRepository userRepository) {
        this.analyticsService = analyticsService;
        this.userRepository = userRepository;
    }

    private User getCurrentUser() {
        UserDetails userDetails = (UserDetails) SecurityContextHolder.getContext().getAuthentication().getPrincipal();
        return userRepository.findByEmail(userDetails.getUsername())
                .orElseThrow(() -> new RuntimeException("User not found"));
    }

    @GetMapping("/summary")
    public ResponseEntity<SummaryDTO> getSummary(
            @RequestParam Long automobileId,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate startDate,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate endDate) {
        return ResponseEntity.ok(analyticsService.getSummary(automobileId, startDate, endDate));
    }

    @GetMapping("/by-category")
    public ResponseEntity<List<CategoryStatDTO>> getCategoryStats(
            @RequestParam Long automobileId,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate startDate,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate endDate) {
        return ResponseEntity.ok(analyticsService.getCategoryStats(automobileId, startDate, endDate));
    }

    @GetMapping("/monthly")
    public ResponseEntity<List<MonthlyStatDTO>> getMonthlyStats(
            @RequestParam Long automobileId,
            @RequestParam(defaultValue = "6") int months) {
        return ResponseEntity.ok(analyticsService.getMonthlyStats(automobileId, months));
    }

    @GetMapping("/fuel-consumption")
    public ResponseEntity<List<MonthlyFuelConsumptionDTO>> getFuelConsumption(
            @RequestParam Long automobileId,
            @RequestParam(defaultValue = "6") int months) {
        return ResponseEntity.ok(analyticsService.getMonthlyFuelConsumption(automobileId, months));
    }

    @GetMapping("/compare")
    public ResponseEntity<List<ComparisonDTO>> compareAutomobiles(
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate startDate,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate endDate) {
        User currentUser = getCurrentUser();
        return ResponseEntity.ok(analyticsService.compareAutomobiles(currentUser.getId(), startDate, endDate));
    }
}
