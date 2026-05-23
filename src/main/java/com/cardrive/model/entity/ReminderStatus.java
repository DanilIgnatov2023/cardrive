package com.cardrive.model.entity;

public enum ReminderStatus {
    PENDING("Ожидает"),
    COMPLETED("Выполнено"),
    DISMISSED("Пропущено");

    private final String displayName;

    ReminderStatus(String displayName) {
        this.displayName = displayName;
    }

    public String getDisplayName() { return displayName; }
}