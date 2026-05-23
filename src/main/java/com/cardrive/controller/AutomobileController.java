package com.cardrive.controller;

import com.cardrive.model.dto.AutomobileDTO;
import com.cardrive.model.dto.CreateAutomobileRequest;
import com.cardrive.service.AutomobileService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/automobiles")
public class AutomobileController {

    private final AutomobileService automobileService;

    public AutomobileController(AutomobileService automobileService) {
        this.automobileService = automobileService;
    }

    @GetMapping
    public ResponseEntity<List<AutomobileDTO>> getUserAutomobiles() {
        return ResponseEntity.ok(automobileService.getUserAutomobiles());
    }

    @PostMapping
    public ResponseEntity<AutomobileDTO> createAutomobile(@RequestBody CreateAutomobileRequest request) {
        return ResponseEntity.ok(automobileService.createAutomobile(request));
    }

    @PutMapping("/{id}")
    public ResponseEntity<AutomobileDTO> updateAutomobile(@PathVariable Long id,
                                                          @RequestBody CreateAutomobileRequest request) {
        return ResponseEntity.ok(automobileService.updateAutomobile(id, request));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteAutomobile(@PathVariable Long id) {
        automobileService.deleteAutomobile(id);
        return ResponseEntity.noContent().build();
    }
}