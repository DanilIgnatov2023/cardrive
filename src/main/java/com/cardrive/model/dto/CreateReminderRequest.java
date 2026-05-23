package com.cardrive.model.dto;

import java.time.LocalDate;
import java.math.BigDecimal;

public class CreateReminderRequest {
    private String title;
    private String description;
    private LocalDate dueDate;
    private String type;
    private Long automobileId;
    private BigDecimal amount;

    // Геттеры и сеттеры
    public String getTitle() { return title; }
    public void setTitle(String title) { this.title = title; }
    public String getDescription() { return description; }
    public void setDescription(String description) { this.description = description; }
    public LocalDate getDueDate() { return dueDate; }
    public void setDueDate(LocalDate dueDate) { this.dueDate = dueDate; }
    public String getType() { return type; }
    public void setType(String type) { this.type = type; }
    public Long getAutomobileId() { return automobileId; }
    public void setAutomobileId(Long automobileId) { this.automobileId = automobileId; }
    public BigDecimal getAmount() { return amount; }
    public void setAmount(BigDecimal amount) { this.amount = amount; }
}