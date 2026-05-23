import React, { useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { notificationApi } from '../services/api';

const notificationIcons = {
    BUDGET_EXCEEDED: '💸',
    CATEGORY_LIMIT: '📊',
    REMINDER_DUE: '⏰'
};

const NotificationBell = () => {
    const [open, setOpen] = useState(false);
    const [count, setCount] = useState(0);
    const [items, setItems] = useState([]);
    const wrapperRef = useRef(null);

    const loadNotifications = async () => {
        try {
            const [countRes, listRes] = await Promise.all([
                notificationApi.getUnreadCount(),
                notificationApi.getAll()
            ]);
            setCount(countRes.data?.count || 0);
            setItems(Array.isArray(listRes.data) ? listRes.data.slice(0, 5) : []);
        } catch (error) {
            console.error('Не удалось загрузить уведомления', error);
        }
    };

    useEffect(() => {
        loadNotifications();
        const timer = setInterval(loadNotifications, 60000);

        const refreshNotifications = () => loadNotifications();
        window.addEventListener('notificationsUpdated', refreshNotifications);

        return () => {
            clearInterval(timer);
            window.removeEventListener('notificationsUpdated', refreshNotifications);
        };
    }, []);

    useEffect(() => {
        const handleClickOutside = (event) => {
            if (wrapperRef.current && !wrapperRef.current.contains(event.target)) {
                setOpen(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const markAsRead = async (event, id) => {
        event.preventDefault();
        event.stopPropagation();
        await notificationApi.markAsRead(id);
        await loadNotifications();
        window.dispatchEvent(new Event('notificationsUpdated'));
    };

    return (
        <div className="notification-bell" ref={wrapperRef}>
            <button className="icon-button" onClick={() => setOpen(!open)} aria-label="Уведомления">
                🔔
                {count > 0 && <span className="notification-count">{count > 99 ? '99+' : count}</span>}
            </button>

            {open && (
                <div className="notification-menu">
                    <div className="notification-menu-header">
                        <strong>Уведомления</strong>
                        <Link to="/notifications" onClick={() => setOpen(false)}>Все</Link>
                    </div>

                    {items.length === 0 ? (
                        <div className="notification-empty">Нет уведомлений</div>
                    ) : (
                        items.map(item => (
                            <Link
                                to="/notifications"
                                key={item.id}
                                className={`notification-preview ${item.isRead ? '' : 'unread'}`}
                                onClick={() => setOpen(false)}
                            >
                                <span className="notification-preview-icon">{notificationIcons[item.type] || '🔔'}</span>
                                <span className="notification-preview-body">
                                    <strong>{item.title}</strong>
                                    <small>{item.message}</small>
                                </span>
                                {!item.isRead && (
                                    <button className="read-dot" title="Отметить прочитанным" onClick={(event) => markAsRead(event, item.id)} />
                                )}
                            </Link>
                        ))
                    )}
                </div>
            )}
        </div>
    );
};

export default NotificationBell;
