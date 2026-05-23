import React from 'react';

const EmptyState = ({ icon = '🗂️', title = 'Пока пусто', text = 'Добавьте первую запись, чтобы увидеть данные здесь.', action }) => (
    <div className="empty-state">
        <div className="empty-state-icon">{icon}</div>
        <h3>{title}</h3>
        <p>{text}</p>
        {action && <div className="mt-3">{action}</div>}
    </div>
);

export default EmptyState;
