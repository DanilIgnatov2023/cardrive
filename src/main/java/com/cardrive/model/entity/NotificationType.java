package com.cardrive.model.entity;

public enum NotificationType {
    BUDGET_EXCEEDED("Бюджет превышен"),
    CATEGORY_LIMIT("Лимит категории"),
    REMINDER_DUE("Скоро дедлайн"),
    COST_PER_KM_HIGH("Высокая стоимость 1 км");

    private final String displayName;

    NotificationType(String displayName) {
        this.displayName = displayName;
    }

    public String getDisplayName() { return displayName; }
}
