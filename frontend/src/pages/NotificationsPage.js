import React, { useEffect, useState } from 'react';
import { Button } from 'react-bootstrap';
import EmptyState from '../components/EmptyState';
import LoadingSpinner from '../components/LoadingSpinner';
import { useToast } from '../components/ToastNotifications';
import { notificationApi } from '../services/api';

const icons = {
    BUDGET_EXCEEDED: '💸',
    CATEGORY_LIMIT: '📊',
    REMINDER_DUE: '⏰'
};

const formatDateTime = (value) => {
    if (!value) return '—';
    return new Date(value).toLocaleString('ru-RU', { dateStyle: 'medium', timeStyle: 'short' });
};

const NotificationsPage = () => {
    const { showToast } = useToast();
    const [loading, setLoading] = useState(true);
    const [notifications, setNotifications] = useState([]);

    const loadNotifications = async () => {
        setLoading(true);
        try {
            const response = await notificationApi.getAll();
            setNotifications(Array.isArray(response.data) ? response.data : []);
        } catch (error) {
            console.error(error);
            showToast('Не удалось загрузить уведомления', 'danger', 'Ошибка');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        loadNotifications();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    const markAsRead = async (id) => {
        try {
            await notificationApi.markAsRead(id);
            await loadNotifications();
            window.dispatchEvent(new Event('notificationsUpdated'));
        } catch (error) {
            console.error(error);
            showToast('Не удалось отметить уведомление', 'danger', 'Ошибка');
        }
    };

    const markAllAsRead = async () => {
        try {
            await notificationApi.markAllAsRead();
            showToast('Все уведомления отмечены как прочитанные');
            await loadNotifications();
            window.dispatchEvent(new Event('notificationsUpdated'));
        } catch (error) {
            console.error(error);
            showToast('Не удалось отметить уведомления', 'danger', 'Ошибка');
        }
    };

    if (loading) return <LoadingSpinner label="Загружаем уведомления..." />;

    return (
        <div className="page-stack">
            <div className="page-header">
                <div>
                    <span className="eyebrow">Уведомления</span>
                    <h1>История уведомлений</h1>
                    <p>Автоматические сигналы о бюджете, категориях и ближайших напоминаниях.</p>
                </div>
                <Button className="soft-button" onClick={markAllAsRead} disabled={notifications.every(item => item.isRead)}>Отметить всё как прочитанное</Button>
            </div>

            <section className="content-card">
                {notifications.length === 0 ? (
                    <EmptyState icon="🔔" title="Уведомлений пока нет" text="Они появятся при превышении бюджета, приближении дедлайнов и достижении лимитов." />
                ) : (
                    <div className="notifications-list">
                        {notifications.map(item => (
                            <article className={`notification-item ${item.isRead ? '' : 'unread'}`} key={item.id}>
                                <div className="notification-main-icon">{icons[item.type] || '🔔'}</div>
                                <div className="notification-content">
                                    <div className="notification-title-row">
                                        <h2>{item.title}</h2>
                                        <span>{formatDateTime(item.createdAt)}</span>
                                    </div>
                                    <p>{item.message}</p>
                                    <small>{item.typeDisplayName || item.type}</small>
                                </div>
                                {!item.isRead && <Button variant="outline-primary" size="sm" onClick={() => markAsRead(item.id)}>Прочитано</Button>}
                            </article>
                        ))}
                    </div>
                )}
            </section>
        </div>
    );
};

export default NotificationsPage;
