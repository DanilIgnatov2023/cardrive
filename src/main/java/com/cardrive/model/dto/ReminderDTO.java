package com.cardrive.model.dto;

import java.time.LocalDate;

public class ReminderDTO {
    private Long id;
    private String title;
    private String description;
    private LocalDate dueDate;
    private String type;
    private String typeIcon;
    private String status;
    private Long automobileId;
    private String automobilePlateNumber;
    private Integer daysLeft;
    private Boolean isOverdue;

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }
    public String getTitle() { return title; }
    public void setTitle(String title) { this.title = title; }
    public String getDescription() { return description; }
    public void setDescription(String description) { this.description = description; }
    public LocalDate getDueDate() { return dueDate; }
    public void setDueDate(LocalDate dueDate) { this.dueDate = dueDate; }
    public String getType() { return type; }
    public void setType(String type) { this.type = type; }
    public String getTypeIcon() { return typeIcon; }
    public void setTypeIcon(String typeIcon) { this.typeIcon = typeIcon; }
    public String getStatus() { return status; }
    public void setStatus(String status) { this.status = status; }
    public Long getAutomobileId() { return automobileId; }
    public void setAutomobileId(Long automobileId) { this.automobileId = automobileId; }
    public String getAutomobilePlateNumber() { return automobilePlateNumber; }
    public void setAutomobilePlateNumber(String automobilePlateNumber) { this.automobilePlateNumber = automobilePlateNumber; }
    public Integer getDaysLeft() { return daysLeft; }
    public void setDaysLeft(Integer daysLeft) { this.daysLeft = daysLeft; }
    public Boolean getIsOverdue() { return isOverdue; }
    public void setIsOverdue(Boolean isOverdue) { this.isOverdue = isOverdue; }
}