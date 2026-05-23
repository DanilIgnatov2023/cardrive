import React, { useEffect, useMemo, useState } from 'react';
import { Button, Col, Form, Modal, Row } from 'react-bootstrap';
import ConfirmDialog from '../components/ConfirmDialog';
import EmptyState from '../components/EmptyState';
import LoadingSpinner from '../components/LoadingSpinner';
import { useToast } from '../components/ToastNotifications';
import { automobileApi } from '../services/api';

const brands = [
    { id: 1, name: 'Toyota', models: [{ id: 1, name: 'Camry' }, { id: 2, name: 'Corolla' }] },
    { id: 2, name: 'BMW', models: [{ id: 3, name: 'X5' }] },
    { id: 3, name: 'Mercedes-Benz', models: [{ id: 4, name: 'E-Class' }] },
    { id: 4, name: 'Volkswagen', models: [{ id: 5, name: 'Golf' }] }
];

const emptyForm = {
    plateNumber: '',
    year: new Date().getFullYear(),
    vinCode: '',
    startOdometer: 0,
    brandId: 1,
    modelId: 1,
    comment: ''
};

const CarsPage = () => {
    const { showToast } = useToast();
    const [cars, setCars] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showModal, setShowModal] = useState(false);
    const [editingCar, setEditingCar] = useState(null);
    const [formData, setFormData] = useState(emptyForm);
    const [confirmDelete, setConfirmDelete] = useState(null);

    const selectedBrand = useMemo(
        () => brands.find(brand => brand.id === Number(formData.brandId)) || brands[0],
        [formData.brandId]
    );

    const loadCars = async () => {
        setLoading(true);
        try {
            const response = await automobileApi.getAll();
            setCars(Array.isArray(response.data) ? response.data : []);
        } catch (error) {
            console.error(error);
            showToast('Не удалось загрузить автомобили', 'danger', 'Ошибка');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        loadCars();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    const resetForm = () => {
        setFormData(emptyForm);
        setEditingCar(null);
    };

    const openCreateModal = () => {
        resetForm();
        setShowModal(true);
    };

    const openEditModal = (car) => {
        setEditingCar(car);
        setFormData({
            plateNumber: car.plateNumber || '',
            year: car.year || new Date().getFullYear(),
            vinCode: car.vinCode || '',
            startOdometer: car.startOdometer || 0,
            brandId: car.brandId || 1,
            modelId: car.modelId || 1,
            comment: car.comment || ''
        });
        setShowModal(true);
    };

    const updateField = (field, value) => {
        setFormData(current => {
            const next = { ...current, [field]: value };
            if (field === 'brandId') {
                const brand = brands.find(item => item.id === Number(value)) || brands[0];
                next.modelId = brand.models[0].id;
            }
            return next;
        });
    };

    const handleSubmit = async (event) => {
        event.preventDefault();
        const payload = {
            ...formData,
            year: Number(formData.year),
            startOdometer: Number(formData.startOdometer),
            brandId: Number(formData.brandId),
            modelId: Number(formData.modelId)
        };

        try {
            if (editingCar) {
                await automobileApi.update(editingCar.id, payload);
                showToast('Автомобиль обновлён');
            } else {
                await automobileApi.create(payload);
                showToast('Автомобиль добавлен');
            }
            setShowModal(false);
            resetForm();
            await loadCars();
        } catch (error) {
            console.error(error);
            showToast(error.response?.data?.message || 'Не удалось сохранить автомобиль', 'danger', 'Ошибка');
        }
    };

    const handleDelete = async () => {
        if (!confirmDelete) return;
        try {
            await automobileApi.delete(confirmDelete.id);
            showToast('Автомобиль удалён');
            setConfirmDelete(null);
            await loadCars();
        } catch (error) {
            console.error(error);
            showToast('Не удалось удалить автомобиль', 'danger', 'Ошибка');
        }
    };

    if (loading) return <LoadingSpinner label="Загружаем автомобили..." />;

    return (
        <div className="page-stack">
            <div className="page-header">
                <div>
                    <span className="eyebrow">Автопарк</span>
                    <h1>Мои автомобили</h1>
                    <p>Карточки авто с пробегом, госномером и быстрыми действиями.</p>
                </div>
                <Button className="gradient-button" onClick={openCreateModal}>+ Добавить авто</Button>
            </div>

            {cars.length === 0 ? (
                <EmptyState
                    icon="🚗"
                    title="Автомобилей пока нет"
                    text="Добавьте первый автомобиль, чтобы начать вести расходы."
                    action={<Button className="gradient-button" onClick={openCreateModal}>Добавить автомобиль</Button>}
                />
            ) : (
                <div className="cars-grid">
                    {cars.map(car => (
                        <article className="car-card" key={car.id}>
                            <div className="car-card-top">
                                <div className="car-illustration">🚘</div>
                                <span className="plate-number">{car.plateNumber}</span>
                            </div>
                            <h2>{car.brandName || 'Марка'} {car.modelName || ''}</h2>
                            <div className="car-meta-grid">
                                <div>
                                    <span>Год</span>
                                    <strong>{car.year || '—'}</strong>
                                </div>
                                <div>
                                    <span>Пробег</span>
                                    <strong>{Number(car.startOdometer || 0).toLocaleString()} км</strong>
                                </div>
                            </div>
                            {car.comment && <p className="car-comment">{car.comment}</p>}
                            <div className="card-actions">
                                <Button variant="light" onClick={() => openEditModal(car)}>Изменить</Button>
                                <Button variant="outline-danger" onClick={() => setConfirmDelete(car)}>Удалить</Button>
                            </div>
                        </article>
                    ))}
                </div>
            )}

            <button className="floating-action" onClick={openCreateModal}>+</button>

            <Modal show={showModal} onHide={() => setShowModal(false)} centered size="lg">
                <Modal.Header closeButton>
                    <Modal.Title>{editingCar ? 'Редактировать автомобиль' : 'Добавить автомобиль'}</Modal.Title>
                </Modal.Header>
                <Form onSubmit={handleSubmit}>
                    <Modal.Body>
                        <Row>
                            <Col md={6}>
                                <Form.Group className="mb-3">
                                    <Form.Label>Госномер *</Form.Label>
                                    <Form.Control
                                        value={formData.plateNumber}
                                        onChange={(event) => updateField('plateNumber', event.target.value.toUpperCase())}
                                        placeholder="A123BC77"
                                        required
                                    />
                                </Form.Group>
                            </Col>
                            <Col md={6}>
                                <Form.Group className="mb-3">
                                    <Form.Label>Год выпуска *</Form.Label>
                                    <Form.Control
                                        type="number"
                                        value={formData.year}
                                        min="1900"
                                        max={new Date().getFullYear() + 1}
                                        onChange={(event) => updateField('year', event.target.value)}
                                        required
                                    />
                                </Form.Group>
                            </Col>
                        </Row>

                        <Row>
                            <Col md={6}>
                                <Form.Group className="mb-3">
                                    <Form.Label>Марка</Form.Label>
                                    <Form.Select value={formData.brandId} onChange={(event) => updateField('brandId', Number(event.target.value))}>
                                        {brands.map(brand => <option key={brand.id} value={brand.id}>{brand.name}</option>)}
                                    </Form.Select>
                                </Form.Group>
                            </Col>
                            <Col md={6}>
                                <Form.Group className="mb-3">
                                    <Form.Label>Модель</Form.Label>
                                    <Form.Select value={formData.modelId} onChange={(event) => updateField('modelId', Number(event.target.value))}>
                                        {selectedBrand.models.map(model => <option key={model.id} value={model.id}>{model.name}</option>)}
                                    </Form.Select>
                                </Form.Group>
                            </Col>
                        </Row>

                        <Row>
                            <Col md={6}>
                                <Form.Group className="mb-3">
                                    <Form.Label>Начальный пробег, км *</Form.Label>
                                    <Form.Control
                                        type="number"
                                        min="0"
                                        value={formData.startOdometer}
                                        onChange={(event) => updateField('startOdometer', event.target.value)}
                                        required
                                    />
                                </Form.Group>
                            </Col>
                            <Col md={6}>
                                <Form.Group className="mb-3">
                                    <Form.Label>VIN</Form.Label>
                                    <Form.Control
                                        value={formData.vinCode}
                                        onChange={(event) => updateField('vinCode', event.target.value.toUpperCase())}
                                        placeholder="Опционально"
                                    />
                                </Form.Group>
                            </Col>
                        </Row>

                        <Form.Group>
                            <Form.Label>Комментарий</Form.Label>
                            <Form.Control
                                as="textarea"
                                rows={3}
                                value={formData.comment}
                                onChange={(event) => updateField('comment', event.target.value)}
                                placeholder="Например: основной семейный автомобиль"
                            />
                        </Form.Group>
                    </Modal.Body>
                    <Modal.Footer>
                        <Button variant="light" onClick={() => setShowModal(false)}>Отмена</Button>
                        <Button className="gradient-button" type="submit">{editingCar ? 'Сохранить' : 'Добавить'}</Button>
                    </Modal.Footer>
                </Form>
            </Modal>

            <ConfirmDialog
                show={Boolean(confirmDelete)}
                title="Удалить автомобиль?"
                message={`Автомобиль ${confirmDelete?.plateNumber || ''} будет удалён. Это действие нельзя отменить.`}
                confirmText="Удалить"
                onConfirm={handleDelete}
                onCancel={() => setConfirmDelete(null)}
            />
        </div>
    );
};

export default CarsPage;
