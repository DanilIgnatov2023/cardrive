import React, { useEffect, useMemo, useState } from 'react';
import { Button, Col, Form, Row, Table } from 'react-bootstrap';
import { Doughnut } from 'react-chartjs-2';
import { ArcElement, Chart as ChartJS, Legend, Tooltip } from 'chart.js';
import EmptyState from '../components/EmptyState';
import LoadingSpinner from '../components/LoadingSpinner';
import ProgressBar from '../components/ProgressBar';
import { useToast } from '../components/ToastNotifications';
import { automobileApi, budgetApi } from '../services/api';

ChartJS.register(ArcElement, Tooltip, Legend);

const months = [
    { value: 1, name: 'Январь' }, { value: 2, name: 'Февраль' }, { value: 3, name: 'Март' },
    { value: 4, name: 'Апрель' }, { value: 5, name: 'Май' }, { value: 6, name: 'Июнь' },
    { value: 7, name: 'Июль' }, { value: 8, name: 'Август' }, { value: 9, name: 'Сентябрь' },
    { value: 10, name: 'Октябрь' }, { value: 11, name: 'Ноябрь' }, { value: 12, name: 'Декабрь' }
];

const formatMoney = (value) => `${Number(value || 0).toLocaleString()} ₽`;

const BudgetPage = () => {
    const { showToast } = useToast();
    const now = new Date();
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [automobiles, setAutomobiles] = useState([]);
    const [selectedAuto, setSelectedAuto] = useState('');
    const [selectedYear, setSelectedYear] = useState(now.getFullYear());
    const [selectedMonth, setSelectedMonth] = useState(now.getMonth() + 1);
    const [activeTab, setActiveTab] = useState('general');
    const [currentBudget, setCurrentBudget] = useState(null);
    const [limitAmount, setLimitAmount] = useState('');
    const [categoryProgress, setCategoryProgress] = useState([]);
    const [categoryInputs, setCategoryInputs] = useState({});

    useEffect(() => {
        const loadCars = async () => {
            try {
                const response = await automobileApi.getAll();
                const autos = Array.isArray(response.data) ? response.data : [];
                setAutomobiles(autos);
                if (autos.length > 0) setSelectedAuto(autos[0].id);
            } catch (error) {
                console.error(error);
                showToast('Не удалось загрузить автомобили', 'danger', 'Ошибка');
            } finally {
                setLoading(false);
            }
        };
        loadCars();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    const loadBudgetData = async () => {
        if (!selectedAuto) return;
        setLoading(true);
        try {
            const [budgetRes, progressRes] = await Promise.allSettled([
                budgetApi.getBudgetForMonth(selectedAuto, selectedYear, selectedMonth),
                budgetApi.getCategoryProgress(selectedAuto, selectedYear, selectedMonth)
            ]);

            if (budgetRes.status === 'fulfilled' && budgetRes.value.data) {
                setCurrentBudget(budgetRes.value.data);
                setLimitAmount(budgetRes.value.data.limitAmount || '');
            } else {
                setCurrentBudget(null);
                setLimitAmount('');
            }

            if (progressRes.status === 'fulfilled') {
                const progress = Array.isArray(progressRes.value.data) ? progressRes.value.data : [];
                setCategoryProgress(progress);
                const inputs = {};
                progress.forEach(item => {
                    inputs[item.categoryId] = item.limitAmount || 0;
                });
                setCategoryInputs(inputs);
            }
        } catch (error) {
            console.error(error);
            showToast('Не удалось загрузить бюджет', 'danger', 'Ошибка');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        loadBudgetData();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [selectedAuto, selectedYear, selectedMonth]);

    const saveGeneralBudget = async (event) => {
        event.preventDefault();
        setSaving(true);
        try {
            await budgetApi.setBudget({
                automobileId: Number(selectedAuto),
                year: Number(selectedYear),
                month: Number(selectedMonth),
                limitAmount: Number(limitAmount)
            });
            showToast('Общий бюджет сохранён');
            await loadBudgetData();
        } catch (error) {
            console.error(error);
            showToast('Не удалось сохранить бюджет', 'danger', 'Ошибка');
        } finally {
            setSaving(false);
        }
    };

    const saveCategoryBudgets = async () => {
        setSaving(true);
        try {
            await Promise.all(categoryProgress.map(item => budgetApi.setCategoryBudget({
                automobileId: Number(selectedAuto),
                categoryId: Number(item.categoryId),
                year: Number(selectedYear),
                month: Number(selectedMonth),
                limitAmount: Number(categoryInputs[item.categoryId] || 0)
            })));
            showToast('Лимиты категорий сохранены');
            await loadBudgetData();
        } catch (error) {
            console.error(error);
            showToast('Не удалось сохранить лимиты категорий', 'danger', 'Ошибка');
        } finally {
            setSaving(false);
        }
    };

    const chartItems = useMemo(
        () => categoryProgress.filter(item => Number(categoryInputs[item.categoryId] || 0) > 0),
        [categoryProgress, categoryInputs]
    );

    const doughnutData = {
        labels: chartItems.map(item => item.categoryName),
        datasets: [{
            data: chartItems.map(item => Number(categoryInputs[item.categoryId] || 0)),
            backgroundColor: chartItems.map(item => item.categoryColor || '#2563eb'),
            borderWidth: 4,
            borderColor: '#ffffff'
        }]
    };

    const chartOptions = { responsive: true, maintainAspectRatio: false, plugins: { legend: { position: 'bottom' } } };
    const isCurrentMonth = selectedYear === now.getFullYear() && selectedMonth === now.getMonth() + 1;

    if (loading && automobiles.length === 0) return <LoadingSpinner label="Загружаем бюджет..." />;

    return (
        <div className="page-stack">
            <div className="page-header">
                <div>
                    <span className="eyebrow">Бюджет</span>
                    <h1>Планирование расходов</h1>
                    <p>Общий месячный лимит и отдельные лимиты по категориям: топливо, ремонт, страховка и другие.</p>
                </div>
            </div>

            {automobiles.length === 0 ? (
                <EmptyState icon="🚗" title="Нет автомобилей" text="Сначала добавьте автомобиль, затем настройте бюджет." />
            ) : (
                <>
                    <section className="content-card filters-card">
                        <Row className="g-3 align-items-end">
                            <Col md={4}>
                                <Form.Label>Автомобиль</Form.Label>
                                <Form.Select value={selectedAuto} onChange={(event) => setSelectedAuto(event.target.value)} disabled={automobiles.length <= 1}>
                                    {automobiles.map(auto => <option key={auto.id} value={auto.id}>{auto.plateNumber} — {auto.brandName} {auto.modelName}</option>)}
                                </Form.Select>
                            </Col>
                            <Col md={4}>
                                <Form.Label>Год</Form.Label>
                                <Form.Control type="number" min="2020" max="2035" value={selectedYear} onChange={(event) => setSelectedYear(Number(event.target.value))} />
                            </Col>
                            <Col md={4}>
                                <Form.Label>Месяц</Form.Label>
                                <Form.Select value={selectedMonth} onChange={(event) => setSelectedMonth(Number(event.target.value))}>
                                    {months.map(month => <option key={month.value} value={month.value}>{month.name}</option>)}
                                </Form.Select>
                            </Col>
                        </Row>
                    </section>

                    <div className="tabs-row">
                        <button className={activeTab === 'general' ? 'active' : ''} onClick={() => setActiveTab('general')}>Общий бюджет</button>
                        <button className={activeTab === 'categories' ? 'active' : ''} onClick={() => setActiveTab('categories')}>Бюджет по категориям</button>
                    </div>

                    {activeTab === 'general' && (
                        <section className="budget-grid">
                            <div className="content-card">
                                <div className="card-heading">
                                    <div>
                                        <span className="eyebrow">Настройка</span>
                                        <h2>Общий лимит</h2>
                                    </div>
                                </div>
                                <Form onSubmit={saveGeneralBudget}>
                                    <Form.Group className="mb-3">
                                        <Form.Label>Лимит на месяц, ₽</Form.Label>
                                        <Form.Control type="number" min="0" step="100" value={limitAmount} onChange={(event) => setLimitAmount(event.target.value)} required />
                                    </Form.Group>
                                    <Button className="gradient-button" type="submit" disabled={saving}>{saving ? 'Сохранение...' : 'Сохранить бюджет'}</Button>
                                </Form>
                            </div>

                            <div className="content-card">
                                <div className="card-heading">
                                    <div>
                                        <span className="eyebrow">Прогресс {isCurrentMonth ? '· текущий месяц' : ''}</span>
                                        <h2>{months.find(month => month.value === selectedMonth)?.name} {selectedYear}</h2>
                                    </div>
                                </div>
                                {currentBudget ? (
                                    <>
                                        <ProgressBar
                                            percent={currentBudget.progressPercent || 0}
                                            isExceeded={currentBudget.isExceeded}
                                            limitAmount={currentBudget.limitAmount}
                                            spentAmount={currentBudget.spentAmount}
                                        />
                                        <div className={`budget-result ${currentBudget.isExceeded ? 'danger' : 'success'}`}>
                                            Остаток: <strong>{formatMoney(currentBudget.remainingAmount)}</strong>
                                        </div>
                                    </>
                                ) : (
                                    <EmptyState icon="🎯" title="Лимит не установлен" text="Укажите общий лимит слева." />
                                )}
                            </div>
                        </section>
                    )}

                    {activeTab === 'categories' && (
                        <section className="budget-grid categories">
                            <div className="content-card table-card wide">
                                <div className="card-heading">
                                    <div>
                                        <span className="eyebrow">Массовое сохранение</span>
                                        <h2>Лимиты по категориям</h2>
                                    </div>
                                    <Button className="gradient-button" disabled={saving} onClick={saveCategoryBudgets}>
                                        {saving ? 'Сохранение...' : 'Сохранить все лимиты'}
                                    </Button>
                                </div>
                                <Table responsive hover className="modern-table">
                                    <thead>
                                        <tr>
                                            <th>Категория</th>
                                            <th>Текущие расходы</th>
                                            <th>Лимит, ₽</th>
                                            <th>Прогресс</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {categoryProgress.map(item => {
                                            const limit = Number(categoryInputs[item.categoryId] || 0);
                                            const spent = Number(item.spentAmount || 0);
                                            const percent = limit > 0 ? Math.min((spent / limit) * 100, 100) : 0;
                                            const exceeded = limit > 0 && spent > limit;
                                            return (
                                                <tr key={item.categoryId}>
                                                    <td><span className="category-dot" style={{ backgroundColor: item.categoryColor || '#2563eb' }} /> {item.categoryIcon} {item.categoryName}</td>
                                                    <td>{formatMoney(spent)}</td>
                                                    <td>
                                                        <Form.Control
                                                            type="number"
                                                            min="0"
                                                            step="100"
                                                            value={categoryInputs[item.categoryId] ?? ''}
                                                            onChange={(event) => setCategoryInputs(current => ({ ...current, [item.categoryId]: event.target.value }))}
                                                        />
                                                    </td>
                                                    <td>
                                                        <div className="compact-progress">
                                                            <div className="compact-progress-track">
                                                                <div className={exceeded ? 'danger' : percent >= 80 ? 'warning' : 'success'} style={{ width: `${percent}%` }} />
                                                            </div>
                                                            <small>{limit > 0 ? `${percent.toFixed(0)}% · остаток ${formatMoney(limit - spent)}` : 'Лимит не задан'}</small>
                                                        </div>
                                                    </td>
                                                </tr>
                                            );
                                        })}
                                    </tbody>
                                </Table>
                            </div>

                            <div className="content-card chart-card">
                                <div className="card-heading"><h2>Распределение бюджета</h2></div>
                                <div className="chart-box">
                                    {chartItems.length > 0 ? <Doughnut data={doughnutData} options={chartOptions} /> : <EmptyState icon="🥧" title="Нет лимитов" text="Введите лимиты по категориям." />}
                                </div>
                            </div>
                        </section>
                    )}
                </>
            )}
        </div>
    );
};

export default BudgetPage;
