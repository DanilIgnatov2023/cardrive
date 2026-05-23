import React, { useEffect, useState } from 'react';
import { Button, Col, Form, Modal, Row } from 'react-bootstrap';
import ConfirmDialog from '../components/ConfirmDialog';
import EmptyState from '../components/EmptyState';
import LoadingSpinner from '../components/LoadingSpinner';
import { useToast } from '../components/ToastNotifications';
import { automobileApi, reminderApi } from '../services/api';

const reminderTypes = [
    { value: 'INSURANCE', label: 'Страховка', icon: '🛡️' },
    { value: 'TAX', label: 'Налог', icon: '📜' },
    { value: 'MAINTENANCE', label: 'ТО', icon: '🔧' },
    { value: 'TIRE_CHANGE', label: 'Замена шин', icon: '🛞' },
    { value: 'INSPECTION', label: 'Техосмотр', icon: '🔍' },
    { value: 'CUSTOM', label: 'Другое', icon: '📌' }
];

const todayIso = () => new Date().toISOString().slice(0, 10);
const emptyForm = { title: '', description: '', dueDate: todayIso(), type: 'MAINTENANCE', automobileId: '', amount: '' };

const statusClass = (reminder) => {
    if (reminder.isOverdue) return 'danger';
    if (Number(reminder.daysLeft) <= 3) return 'warning';
    return 'success';
};

const statusLabel = (reminder) => {
    if (reminder.isOverdue) return `Просрочено на ${Math.abs(reminder.daysLeft)} дн.`;
    if (Number(reminder.daysLeft) === 0) return 'Сегодня';
    return `Осталось ${reminder.daysLeft} дн.`;
};

const RemindersPage = () => {
    const { showToast } = useToast();
    const [loading, setLoading] = useState(true);
    const [reminders, setReminders] = useState([]);
    const [automobiles, setAutomobiles] = useState([]);
    const [showModal, setShowModal] = useState(false);
    const [formData, setFormData] = useState(emptyForm);
    const [deleteTarget, setDeleteTarget] = useState(null);

    const loadData = async () => {
        setLoading(true);
        try {
            const [remindersRes, autosRes] = await Promise.all([
                reminderApi.getAll(),
                automobileApi.getAll()
            ]);
            setReminders(Array.isArray(remindersRes.data) ? remindersRes.data : []);
            setAutomobiles(Array.isArray(autosRes.data) ? autosRes.data : []);
        } catch (error) {
            console.error(error);
            showToast('Не удалось загрузить напоминания', 'danger', 'Ошибка');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        loadData();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    const openModal = () => {
        setFormData(emptyForm);
        setShowModal(true);
    };

    const updateField = (field, value) => setFormData(current => ({ ...current, [field]: value }));

    const handleSubmit = async (event) => {
        event.preventDefault();
        try {
            await reminderApi.create({
                title: formData.title,
                description: formData.description,
                dueDate: formData.dueDate,
                type: formData.type,
                automobileId: formData.automobileId ? Number(formData.automobileId) : null,
                amount: formData.amount ? Number(formData.amount) : null
            });
            showToast('Напоминание создано');
            setShowModal(false);
            await loadData();
        } catch (error) {
            console.error(error);
            showToast('Не удалось создать напоминание', 'danger', 'Ошибка');
        }
    };

    const handleComplete = async (id) => {
        try {
            await reminderApi.complete(id);
            showToast('Напоминание выполнено');
            await loadData();
        } catch (error) {
            console.error(error);
            showToast('Не удалось выполнить напоминание', 'danger', 'Ошибка');
        }
    };

    const handleDelete = async () => {
        if (!deleteTarget) return;
        try {
            await reminderApi.delete(deleteTarget.id);
            showToast('Напоминание удалено');
            setDeleteTarget(null);
            await loadData();
        } catch (error) {
            console.error(error);
            showToast('Не удалось удалить напоминание', 'danger', 'Ошибка');
        }
    };

    if (loading) return <LoadingSpinner label="Загружаем напоминания..." />;

    return (
        <div className="page-stack">
            <div className="page-header">
                <div>
                    <span className="eyebrow">Напоминания</span>
                    <h1>Сервисные события</h1>
                    <p>Следите за ОСАГО, налогом, ТО, техосмотром и сезонной заменой шин.</p>
                </div>
                <Button className="gradient-button" onClick={openModal}>+ Создать</Button>
            </div>

            {reminders.length === 0 ? (
                <EmptyState icon="⏰" title="Напоминаний нет" text="Создайте первое напоминание, и система дополнительно покажет уведомление за 3 дня до дедлайна." action={<Button className="gradient-button" onClick={openModal}>Создать напоминание</Button>} />
            ) : (
                <div className="reminders-grid">
                    {reminders.map(reminder => (
                        <article className={`reminder-card ${statusClass(reminder)}`} key={reminder.id}>
                            <div className="reminder-top">
                                <span className="reminder-icon">{reminder.typeIcon || '⏰'}</span>
                                <span className={`status-pill ${statusClass(reminder)}`}>{statusLabel(reminder)}</span>
                            </div>
                            <h2>{reminder.title}</h2>
                            {reminder.description && <p>{reminder.description}</p>}
                            <div className="reminder-meta">
                                <span>📅 {reminder.dueDate}</span>
                                {reminder.automobilePlateNumber && <span>🚗 {reminder.automobilePlateNumber}</span>}
                            </div>
                            <div className="card-actions">
                                <Button variant="success" onClick={() => handleComplete(reminder.id)}>Выполнено</Button>
                                <Button variant="outline-danger" onClick={() => setDeleteTarget(reminder)}>Удалить</Button>
                            </div>
                        </article>
                    ))}
                </div>
            )}

            <button className="floating-action" onClick={openModal}>+</button>

            <Modal show={showModal} onHide={() => setShowModal(false)} centered size="lg">
                <Modal.Header closeButton>
                    <Modal.Title>Создать напоминание</Modal.Title>
                </Modal.Header>
                <Form onSubmit={handleSubmit}>
                    <Modal.Body>
                        <Row>
                            <Col md={6}>
                                <Form.Group className="mb-3">
                                    <Form.Label>Тип</Form.Label>
                                    <Form.Select value={formData.type} onChange={(event) => updateField('type', event.target.value)}>
                                        {reminderTypes.map(type => <option key={type.value} value={type.value}>{type.icon} {type.label}</option>)}
                                    </Form.Select>
                                </Form.Group>
                            </Col>
                            <Col md={6}>
                                <Form.Group className="mb-3">
                                    <Form.Label>Автомобиль</Form.Label>
                                    <Form.Select value={formData.automobileId} onChange={(event) => updateField('automobileId', event.target.value)}>
                                        <option value="">Все автомобили</option>
                                        {automobiles.map(auto => <option key={auto.id} value={auto.id}>{auto.plateNumber} — {auto.brandName} {auto.modelName}</option>)}
                                    </Form.Select>
                                </Form.Group>
                            </Col>
                        </Row>

                        <Form.Group className="mb-3">
                            <Form.Label>Название *</Form.Label>
                            <Form.Control value={formData.title} onChange={(event) => updateField('title', event.target.value)} placeholder="Например: заменить масло" required />
                        </Form.Group>

                        <Row>
                            <Col md={6}>
                                <Form.Group className="mb-3">
                                    <Form.Label>Дата *</Form.Label>
                                    <Form.Control type="date" value={formData.dueDate} onChange={(event) => updateField('dueDate', event.target.value)} required />
                                </Form.Group>
                            </Col>
                            <Col md={6}>
                                <Form.Group className="mb-3">
                                    <Form.Label>Планируемая сумма, ₽</Form.Label>
                                    <Form.Control type="number" min="0" step="0.01" value={formData.amount} onChange={(event) => updateField('amount', event.target.value)} />
                                </Form.Group>
                            </Col>
                        </Row>

                        <Form.Group>
                            <Form.Label>Описание</Form.Label>
                            <Form.Control as="textarea" rows={3} value={formData.description} onChange={(event) => updateField('description', event.target.value)} placeholder="Комментарий, адрес сервиса, детали" />
                        </Form.Group>
                    </Modal.Body>
                    <Modal.Footer>
                        <Button variant="light" onClick={() => setShowModal(false)}>Отмена</Button>
                        <Button className="gradient-button" type="submit">Создать</Button>
                    </Modal.Footer>
                </Form>
            </Modal>

            <ConfirmDialog
                show={Boolean(deleteTarget)}
                title="Удалить напоминание?"
                message={`Напоминание «${deleteTarget?.title || ''}» будет удалено.`}
                confirmText="Удалить"
                onConfirm={handleDelete}
                onCancel={() => setDeleteTarget(null)}
            />
        </div>
    );
};

export default RemindersPage;
