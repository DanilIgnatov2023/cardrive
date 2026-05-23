package com.cardrive.model.entity;

public enum ReminderType {
    INSURANCE("Страховка", "🛡️"),
    TAX("Налог", "📜"),
    MAINTENANCE("ТО", "🔧"),
    TIRE_CHANGE("Замена шин", "🛞"),
    INSPECTION("Техосмотр", "🔍"),
    CUSTOM("Другое", "📌");

    private final String displayName;
    private final String icon;

    ReminderType(String displayName, String icon) {
        this.displayName = displayName;
        this.icon = icon;
    }

    public String getDisplayName() { return displayName; }
    public String getIcon() { return icon; }
}