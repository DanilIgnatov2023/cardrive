import React, { useEffect, useMemo, useState } from 'react';
import { Button, Col, Form, Modal, Row, Table } from 'react-bootstrap';
import ConfirmDialog from '../components/ConfirmDialog';
import EmptyState from '../components/EmptyState';
import LoadingSpinner from '../components/LoadingSpinner';
import { useToast } from '../components/ToastNotifications';
import { automobileApi, expenseApi } from '../services/api';

const formatMoney = (value) => `${Number(value || 0).toLocaleString()} ₽`;
const todayIso = () => new Date().toISOString().slice(0, 10);
const monthStartIso = () => {
    const date = new Date();
    date.setDate(1);
    return date.toISOString().slice(0, 10);
};

const emptyForm = {
    date: todayIso(),
    amount: '',
    odometer: '',
    comment: '',
    categoryId: '',
    automobileId: '',
    fuelLiters: '',
    fuelPricePerLiter: ''
};

const ExpensesPage = () => {
    const { showToast } = useToast();
    const [loading, setLoading] = useState(true);
    const [expenses, setExpenses] = useState([]);
    const [automobiles, setAutomobiles] = useState([]);
    const [categories, setCategories] = useState([]);
    const [showModal, setShowModal] = useState(false);
    const [formData, setFormData] = useState(emptyForm);
    const [deleteTarget, setDeleteTarget] = useState(null);
    const [page, setPage] = useState(1);
    const [filters, setFilters] = useState({
        automobileId: '',
        categoryId: '',
        startDate: monthStartIso(),
        endDate: todayIso()
    });

    const pageSize = 8;

    const loadInitialData = async () => {
        setLoading(true);
        try {
            const [autosRes, categoriesRes] = await Promise.all([
                automobileApi.getAll(),
                expenseApi.getCategories()
            ]);
            const autos = Array.isArray(autosRes.data) ? autosRes.data : [];
            const cats = Array.isArray(categoriesRes.data) ? categoriesRes.data : [];
            setAutomobiles(autos);
            setCategories(cats);
            setFormData(current => ({
                ...current,
                automobileId: autos[0]?.id || '',
                categoryId: cats[0]?.id || ''
            }));
        } catch (error) {
            console.error(error);
            showToast('Не удалось загрузить справочники', 'danger', 'Ошибка');
        } finally {
            setLoading(false);
        }
    };

    const loadExpenses = async () => {
        try {
            const params = {
                startDate: filters.startDate,
                endDate: filters.endDate
            };
            if (filters.automobileId) params.automobileId = filters.automobileId;
            if (filters.categoryId) params.categoryId = filters.categoryId;
            const response = await expenseApi.getAll(params);
            setExpenses(Array.isArray(response.data) ? response.data : []);
            setPage(1);
        } catch (error) {
            console.error(error);
            showToast('Не удалось загрузить расходы', 'danger', 'Ошибка');
        }
    };

    useEffect(() => {
        loadInitialData();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    useEffect(() => {
        loadExpenses();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [filters]);

    const paginatedExpenses = useMemo(() => {
        const start = (page - 1) * pageSize;
        return expenses.slice(start, start + pageSize);
    }, [expenses, page]);

    const totalPages = Math.max(1, Math.ceil(expenses.length / pageSize));
    const totalAmount = useMemo(() => expenses.reduce((sum, expense) => sum + Number(expense.amount || 0), 0), [expenses]);
    const selectedCategory = categories.find(category => Number(category.id) === Number(formData.categoryId));
    const isFuel = selectedCategory?.name === 'Топливо';

    const updateForm = (field, value) => {
        setFormData(current => {
            const next = { ...current, [field]: value };
            if (field === 'categoryId') {
                const category = categories.find(item => Number(item.id) === Number(value));
                if (category?.name !== 'Топливо') {
                    next.fuelLiters = '';
                    next.fuelPricePerLiter = '';
                }
            }
            if (field === 'fuelLiters' && value && current.amount) {
                const liters = Number(value);
                const amount = Number(current.amount);
                if (liters > 0) next.fuelPricePerLiter = (amount / liters).toFixed(2);
            }
            if (field === 'amount' && value && current.fuelLiters) {
                const liters = Number(current.fuelLiters);
                const amount = Number(value);
                if (liters > 0) next.fuelPricePerLiter = (amount / liters).toFixed(2);
            }
            return next;
        });
    };

    const openModal = () => {
        setFormData({
            ...emptyForm,
            date: todayIso(),
            automobileId: automobiles[0]?.id || '',
            categoryId: categories[0]?.id || ''
        });
        setShowModal(true);
    };

    const handleSubmit = async (event) => {
        event.preventDefault();
        const payload = {
            date: formData.date,
            amount: Number(formData.amount),
            odometer: formData.odometer ? Number(formData.odometer) : null,
            comment: formData.comment,
            categoryId: Number(formData.categoryId),
            automobileId: Number(formData.automobileId),
            fuelLiters: isFuel && formData.fuelLiters ? Number(formData.fuelLiters) : null,
            fuelPricePerLiter: isFuel && formData.fuelPricePerLiter ? Number(formData.fuelPricePerLiter) : null
        };

        try {
            await expenseApi.create(payload);
            showToast('Расход добавлен');
            setShowModal(false);
            await loadExpenses();
        } catch (error) {
            console.error(error);
            showToast(error.response?.data?.message || 'Не удалось сохранить расход', 'danger', 'Ошибка');
        }
    };

    const handleDelete = async () => {
        if (!deleteTarget) return;
        try {
            await expenseApi.delete(deleteTarget.id);
            showToast('Расход удалён');
            setDeleteTarget(null);
            await loadExpenses();
        } catch (error) {
            console.error(error);
            showToast('Не удалось удалить расход', 'danger', 'Ошибка');
        }
    };

    if (loading) return <LoadingSpinner label="Загружаем расходы..." />;

    return (
        <div className="page-stack">
            <div className="page-header">
                <div>
                    <span className="eyebrow">Расходы</span>
                    <h1>Журнал расходов</h1>
                    <p>Фильтрация по датам, категориям и автомобилям. Для топлива можно указать литры и цену за литр.</p>
                </div>
                <Button className="gradient-button success" onClick={openModal}>+ Добавить расход</Button>
            </div>

            <section className="content-card filters-card">
                <Row className="g-3 align-items-end">
                    <Col md={3}>
                        <Form.Label>Дата от</Form.Label>
                        <Form.Control type="date" value={filters.startDate} onChange={(event) => setFilters({ ...filters, startDate: event.target.value })} />
                    </Col>
                    <Col md={3}>
                        <Form.Label>Дата до</Form.Label>
                        <Form.Control type="date" value={filters.endDate} onChange={(event) => setFilters({ ...filters, endDate: event.target.value })} />
                    </Col>
                    <Col md={3}>
                        <Form.Label>Автомобиль</Form.Label>
                        <Form.Select value={filters.automobileId} onChange={(event) => setFilters({ ...filters, automobileId: event.target.value })}>
                            <option value="">Все авто</option>
                            {automobiles.map(auto => <option key={auto.id} value={auto.id}>{auto.plateNumber} — {auto.brandName} {auto.modelName}</option>)}
                        </Form.Select>
                    </Col>
                    <Col md={3}>
                        <Form.Label>Категория</Form.Label>
                        <Form.Select value={filters.categoryId} onChange={(event) => setFilters({ ...filters, categoryId: event.target.value })}>
                            <option value="">Все категории</option>
                            {categories.map(category => <option key={category.id} value={category.id}>{category.icon || '•'} {category.name}</option>)}
                        </Form.Select>
                    </Col>
                </Row>
                <div className="filter-summary">
                    <span>Найдено: <strong>{expenses.length}</strong></span>
                    <span>Сумма: <strong>{formatMoney(totalAmount)}</strong></span>
                </div>
            </section>

            <section className="content-card table-card">
                {expenses.length === 0 ? (
                    <EmptyState icon="💳" title="Расходов нет" text="Измените фильтры или добавьте первую запись." action={<Button className="gradient-button success" onClick={openModal}>Добавить расход</Button>} />
                ) : (
                    <>
                        <Table responsive hover className="modern-table">
                            <thead>
                                <tr>
                                    <th>Дата</th>
                                    <th>Автомобиль</th>
                                    <th>Категория</th>
                                    <th>Пробег</th>
                                    <th>Топливо</th>
                                    <th className="text-end">Сумма</th>
                                    <th></th>
                                </tr>
                            </thead>
                            <tbody>
                                {paginatedExpenses.map(expense => (
                                    <tr key={expense.id}>
                                        <td>{expense.date}</td>
                                        <td><span className="plate-mini">{expense.automobilePlateNumber}</span></td>
                                        <td>{expense.categoryName}</td>
                                        <td>{expense.odometer ? `${Number(expense.odometer).toLocaleString()} км` : '—'}</td>
                                        <td>{expense.fuelLiters ? `${expense.fuelLiters} л · ${expense.fuelPricePerLiter || '—'} ₽/л` : '—'}</td>
                                        <td className={`text-end amount-cell ${Number(expense.amount) > 10000 ? 'large' : ''}`}>{formatMoney(expense.amount)}</td>
                                        <td className="text-end">
                                            <Button variant="outline-danger" size="sm" onClick={() => setDeleteTarget(expense)}>Удалить</Button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </Table>
                        <div className="pagination-row">
                            <Button variant="light" disabled={page === 1} onClick={() => setPage(page - 1)}>← Назад</Button>
                            <span>Страница {page} из {totalPages}</span>
                            <Button variant="light" disabled={page === totalPages} onClick={() => setPage(page + 1)}>Вперёд →</Button>
                        </div>
                    </>
                )}
            </section>

            <button className="floating-action success" onClick={openModal}>+</button>

            <Modal show={showModal} onHide={() => setShowModal(false)} centered size="lg">
                <Modal.Header closeButton>
                    <Modal.Title>Добавить расход</Modal.Title>
                </Modal.Header>
                <Form onSubmit={handleSubmit}>
                    <Modal.Body>
                        <Row>
                            <Col md={6}>
                                <Form.Group className="mb-3">
                                    <Form.Label>Автомобиль *</Form.Label>
                                    <Form.Select value={formData.automobileId} onChange={(event) => updateForm('automobileId', event.target.value)} required>
                                        {automobiles.map(auto => <option key={auto.id} value={auto.id}>{auto.plateNumber} — {auto.brandName} {auto.modelName}</option>)}
                                    </Form.Select>
                                </Form.Group>
                            </Col>
                            <Col md={6}>
                                <Form.Group className="mb-3">
                                    <Form.Label>Категория *</Form.Label>
                                    <Form.Select value={formData.categoryId} onChange={(event) => updateForm('categoryId', event.target.value)} required>
                                        {categories.map(category => <option key={category.id} value={category.id}>{category.icon || '•'} {category.name}</option>)}
                                    </Form.Select>
                                </Form.Group>
                            </Col>
                        </Row>

                        <Row>
                            <Col md={4}>
                                <Form.Group className="mb-3">
                                    <Form.Label>Дата *</Form.Label>
                                    <Form.Control type="date" value={formData.date} onChange={(event) => updateForm('date', event.target.value)} required />
                                </Form.Group>
                            </Col>
                            <Col md={4}>
                                <Form.Group className="mb-3">
                                    <Form.Label>Сумма, ₽ *</Form.Label>
                                    <Form.Control type="number" min="0" step="0.01" value={formData.amount} onChange={(event) => updateForm('amount', event.target.value)} required />
                                </Form.Group>
                            </Col>
                            <Col md={4}>
                                <Form.Group className="mb-3">
                                    <Form.Label>Пробег, км</Form.Label>
                                    <Form.Control type="number" min="0" value={formData.odometer} onChange={(event) => updateForm('odometer', event.target.value)} />
                                </Form.Group>
                            </Col>
                        </Row>

                        {isFuel && (
                            <Row className="fuel-panel">
                                <Col md={6}>
                                    <Form.Group className="mb-3">
                                        <Form.Label>Литры топлива</Form.Label>
                                        <Form.Control type="number" min="0" step="0.01" value={formData.fuelLiters} onChange={(event) => updateForm('fuelLiters', event.target.value)} placeholder="Например: 42.5" />
                                    </Form.Group>
                                </Col>
                                <Col md={6}>
                                    <Form.Group className="mb-3">
                                        <Form.Label>Цена за литр, ₽</Form.Label>
                                        <Form.Control type="number" min="0" step="0.01" value={formData.fuelPricePerLiter} onChange={(event) => updateForm('fuelPricePerLiter', event.target.value)} />
                                    </Form.Group>
                                </Col>
                            </Row>
                        )}

                        <Form.Group>
                            <Form.Label>Комментарий</Form.Label>
                            <Form.Control as="textarea" rows={3} value={formData.comment} onChange={(event) => updateForm('comment', event.target.value)} placeholder="Например: заправка до полного бака" />
                        </Form.Group>
                    </Modal.Body>
                    <Modal.Footer>
                        <Button variant="light" onClick={() => setShowModal(false)}>Отмена</Button>
                        <Button className="gradient-button success" type="submit">Сохранить</Button>
                    </Modal.Footer>
                </Form>
            </Modal>

            <ConfirmDialog
                show={Boolean(deleteTarget)}
                title="Удалить расход?"
                message={`Запись на сумму ${formatMoney(deleteTarget?.amount)} будет удалена.`}
                confirmText="Удалить"
                onConfirm={handleDelete}
                onCancel={() => setDeleteTarget(null)}
            />
        </div>
    );
};

export default ExpensesPage;
