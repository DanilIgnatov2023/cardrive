package com.cardrive.controller;

import com.cardrive.model.dto.CreateReminderRequest;
import com.cardrive.model.dto.ReminderDTO;
import com.cardrive.service.ReminderService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/reminders")
public class ReminderController {

    private final ReminderService reminderService;

    public ReminderController(ReminderService reminderService) {
        this.reminderService = reminderService;
    }

    @GetMapping
    public ResponseEntity<List<ReminderDTO>> getReminders() {
        return ResponseEntity.ok(reminderService.getUserReminders());
    }

    @PostMapping
    public ResponseEntity<ReminderDTO> createReminder(@RequestBody CreateReminderRequest request) {
        return ResponseEntity.ok(reminderService.createReminder(request));
    }

    @PutMapping("/{id}/complete")
    public ResponseEntity<ReminderDTO> completeReminder(@PathVariable Long id) {
        return ResponseEntity.ok(reminderService.completeReminder(id));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteReminder(@PathVariable Long id) {
        reminderService.deleteReminder(id);
        return ResponseEntity.noContent().build();
    }
}