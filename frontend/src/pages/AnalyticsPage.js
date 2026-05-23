import React, { useEffect, useMemo, useState } from 'react';
import { Col, Form, Row, Table } from 'react-bootstrap';
import { Bar, Line, Pie } from 'react-chartjs-2';
import {
    ArcElement,
    BarElement,
    CategoryScale,
    Chart as ChartJS,
    Legend,
    LineElement,
    LinearScale,
    PointElement,
    Tooltip
} from 'chart.js';
import EmptyState from '../components/EmptyState';
import LoadingSpinner from '../components/LoadingSpinner';
import { analyticsApi, automobileApi, budgetApi } from '../services/api';

ChartJS.register(CategoryScale, LinearScale, BarElement, ArcElement, LineElement, PointElement, Tooltip, Legend);

const formatMoney = (value) => `${Number(value || 0).toLocaleString()} ₽`;
const formatNumber = (value, digits = 1) => Number(value || 0).toFixed(digits);
const isoDate = (date) => date.toISOString().slice(0, 10);

const makeRange = (period) => {
    const end = new Date();
    const start = new Date();
    if (period === 'month') start.setMonth(end.getMonth() - 1);
    if (period === 'quarter') start.setMonth(end.getMonth() - 3);
    if (period === 'year') start.setFullYear(end.getFullYear() - 1);
    return { startDate: isoDate(start), endDate: isoDate(end) };
};

const AnalyticsPage = () => {
    const [loading, setLoading] = useState(true);
    const [automobiles, setAutomobiles] = useState([]);
    const [selectedAuto, setSelectedAuto] = useState('');
    const [activeTab, setActiveTab] = useState('general');
    const [period, setPeriod] = useState('month');
    const [dates, setDates] = useState(makeRange('month'));
    const [fuelMonths, setFuelMonths] = useState(6);
    const [summary, setSummary] = useState(null);
    const [categoryStats, setCategoryStats] = useState([]);
    const [monthlyStats, setMonthlyStats] = useState([]);
    const [fuelData, setFuelData] = useState([]);
    const [comparison, setComparison] = useState([]);
    const [categoryProgress, setCategoryProgress] = useState([]);

    useEffect(() => {
        const loadAutomobiles = async () => {
            try {
                const response = await automobileApi.getAll();
                const autos = Array.isArray(response.data) ? response.data : [];
                setAutomobiles(autos);
                if (autos.length > 0) setSelectedAuto(autos[0].id);
            } catch (error) {
                console.error(error);
            } finally {
                setLoading(false);
            }
        };
        loadAutomobiles();
    }, []);

    useEffect(() => {
        setDates(makeRange(period));
    }, [period]);

    useEffect(() => {
        const loadAnalytics = async () => {
            if (!selectedAuto) return;
            setLoading(true);
            try {
                const endDate = new Date(dates.endDate);
                const year = endDate.getFullYear();
                const month = endDate.getMonth() + 1;
                const [summaryRes, categoryRes, monthlyRes, fuelRes, compareRes, progressRes] = await Promise.allSettled([
                    analyticsApi.getSummary(selectedAuto, dates.startDate, dates.endDate),
                    analyticsApi.getCategoryStats(selectedAuto, dates.startDate, dates.endDate),
                    analyticsApi.getMonthlyStats(selectedAuto, period === 'year' ? 12 : 6),
                    analyticsApi.getFuelConsumption(selectedAuto, fuelMonths),
                    analyticsApi.compare(dates.startDate, dates.endDate),
                    budgetApi.getCategoryProgress(selectedAuto, year, month)
                ]);

                if (summaryRes.status === 'fulfilled') setSummary(summaryRes.value.data);
                if (categoryRes.status === 'fulfilled') setCategoryStats(categoryRes.value.data || []);
                if (monthlyRes.status === 'fulfilled') setMonthlyStats(monthlyRes.value.data || []);
                if (fuelRes.status === 'fulfilled') setFuelData(fuelRes.value.data || []);
                if (compareRes.status === 'fulfilled') setComparison(compareRes.value.data || []);
                if (progressRes.status === 'fulfilled') setCategoryProgress(progressRes.value.data || []);
            } catch (error) {
                console.error(error);
            } finally {
                setLoading(false);
            }
        };
        loadAnalytics();
    }, [selectedAuto, dates.startDate, dates.endDate, period, fuelMonths]);

    const progressMap = useMemo(() => {
        const map = new Map();
        categoryProgress.forEach(item => map.set(Number(item.categoryId), item));
        return map;
    }, [categoryProgress]);

    const chartOptions = {
        responsive: true,
        maintainAspectRatio: false,
        plugins: { legend: { position: 'bottom' } },
        scales: { y: { beginAtZero: true } }
    };

    const expenseBarData = {
        labels: monthlyStats.map(item => `${item.month} ${item.year}`),
        datasets: [{
            label: 'Расходы, ₽',
            data: monthlyStats.map(item => Number(item.amount || 0)),
            backgroundColor: 'rgba(37, 99, 235, .82)',
            borderRadius: 12
        }]
    };

    const categoryPieData = {
        labels: categoryStats.map(item => item.categoryName),
        datasets: [{
            data: categoryStats.map(item => Number(item.totalAmount || 0)),
            backgroundColor: categoryStats.map(item => item.categoryColor || '#2563eb'),
            borderWidth: 3,
            borderColor: '#ffffff'
        }]
    };

    const fuelLineData = {
        labels: fuelData.map(item => `${item.month} ${item.year}`),
        datasets: [{
            label: 'л/100 км',
            data: fuelData.map(item => Number(item.consumptionPer100Km || 0)),
            borderColor: 'rgba(16, 185, 129, .95)',
            backgroundColor: 'rgba(16, 185, 129, .12)',
            tension: 0.35,
            pointRadius: 5,
            fill: true
        }]
    };

    if (loading && automobiles.length === 0) return <LoadingSpinner label="Готовим аналитику..." />;

    return (
        <div className="page-stack">
            <div className="page-header">
                <div>
                    <span className="eyebrow">Аналитика</span>
                    <h1>Расходы и эффективность</h1>
                    <p>Общая аналитика, топливо, сравнение автомобилей и контроль остатков по категориям.</p>
                </div>
            </div>

            <section className="content-card filters-card">
                <Row className="g-3 align-items-end">
                    <Col lg={3}>
                        <Form.Label>Автомобиль</Form.Label>
                        <Form.Select value={selectedAuto} onChange={(event) => setSelectedAuto(event.target.value)}>
                            {automobiles.map(auto => <option key={auto.id} value={auto.id}>{auto.plateNumber} — {auto.brandName} {auto.modelName}</option>)}
                        </Form.Select>
                    </Col>
                    <Col lg={3}>
                        <Form.Label>Период</Form.Label>
                        <div className="segmented-control">
                            <button className={period === 'month' ? 'active' : ''} onClick={() => setPeriod('month')}>Месяц</button>
                            <button className={period === 'quarter' ? 'active' : ''} onClick={() => setPeriod('quarter')}>Квартал</button>
                            <button className={period === 'year' ? 'active' : ''} onClick={() => setPeriod('year')}>Год</button>
                        </div>
                    </Col>
                    <Col lg={3}>
                        <Form.Label>Дата от</Form.Label>
                        <Form.Control type="date" value={dates.startDate} onChange={(event) => setDates(current => ({ ...current, startDate: event.target.value }))} />
                    </Col>
                    <Col lg={3}>
                        <Form.Label>Дата до</Form.Label>
                        <Form.Control type="date" value={dates.endDate} onChange={(event) => setDates(current => ({ ...current, endDate: event.target.value }))} />
                    </Col>
                </Row>
            </section>

            <div className="tabs-row">
                <button className={activeTab === 'general' ? 'active' : ''} onClick={() => setActiveTab('general')}>Общая аналитика</button>
                <button className={activeTab === 'fuel' ? 'active' : ''} onClick={() => setActiveTab('fuel')}>Топливо</button>
                <button className={activeTab === 'compare' ? 'active' : ''} onClick={() => setActiveTab('compare')}>Сравнение авто</button>
            </div>

            {activeTab === 'general' && (
                <>
                    <section className="stats-grid">
                        <div className="stat-card">
                            <span className="stat-icon blue">💸</span>
                            <p>Общие расходы</p>
                            <strong>{formatMoney(summary?.totalExpenses)}</strong>
                        </div>
                        <div className="stat-card">
                            <span className="stat-icon green">🛣️</span>
                            <p>Стоимость 1 км</p>
                            <strong>{formatNumber(summary?.costPerKm, 2)} ₽</strong>
                        </div>
                        <div className="stat-card">
                            <span className="stat-icon orange">📍</span>
                            <p>Пробег</p>
                            <strong>{Number(summary?.totalDistance || 0).toLocaleString()} км</strong>
                        </div>
                    </section>

                    <section className="analytics-grid">
                        <div className="content-card chart-card wide">
                            <div className="card-heading"><h2>Динамика расходов</h2></div>
                            <div className="chart-box">{monthlyStats.length ? <Bar data={expenseBarData} options={chartOptions} /> : <EmptyState icon="📈" title="Нет данных" text="Добавьте расходы." />}</div>
                        </div>
                        <div className="content-card chart-card">
                            <div className="card-heading"><h2>Расходы по категориям</h2></div>
                            <div className="chart-box">{categoryStats.length ? <Pie data={categoryPieData} options={chartOptions} /> : <EmptyState icon="🥧" title="Нет данных" text="Категории появятся после расходов." />}</div>
                        </div>
                    </section>

                    <section className="content-card table-card">
                        <div className="card-heading">
                            <h2>Детализация по категориям</h2>
                            <span className="muted-note">Остаток считается по бюджету месяца, выбранного в дате окончания.</span>
                        </div>
                        <Table responsive hover className="modern-table">
                            <thead>
                                <tr>
                                    <th>Категория</th>
                                    <th>Сумма</th>
                                    <th>Доля</th>
                                    <th>Записей</th>
                                    <th>Остаток бюджета</th>
                                </tr>
                            </thead>
                            <tbody>
                                {categoryStats.map(category => {
                                    const progress = progressMap.get(Number(category.categoryId));
                                    const remaining = Number(progress?.remainingAmount || 0);
                                    return (
                                        <tr key={category.categoryId || category.categoryName}>
                                            <td><span className="category-dot" style={{ backgroundColor: category.categoryColor || '#2563eb' }} /> {category.categoryIcon} {category.categoryName}</td>
                                            <td>{formatMoney(category.totalAmount)}</td>
                                            <td>{formatNumber(category.percentage, 1)}%</td>
                                            <td>{category.expenseCount}</td>
                                            <td>
                                                {progress?.limitAmount > 0 ? (
                                                    <span className={`budget-left ${remaining < 0 ? 'negative' : 'positive'}`}>{formatMoney(remaining)}</span>
                                                ) : (
                                                    <span className="text-muted">Лимит не задан</span>
                                                )}
                                            </td>
                                        </tr>
                                    );
                                })}
                            </tbody>
                        </Table>
                    </section>
                </>
            )}

            {activeTab === 'fuel' && (
                <section className="content-card chart-card">
                    <div className="card-heading">
                        <div>
                            <span className="eyebrow">Топливные чеки</span>
                            <h2>Расход топлива (л/100 км)</h2>
                        </div>
                        <div className="segmented-control small">
                            <button className={fuelMonths === 6 ? 'active' : ''} onClick={() => setFuelMonths(6)}>6 месяцев</button>
                            <button className={fuelMonths === 12 ? 'active' : ''} onClick={() => setFuelMonths(12)}>12 месяцев</button>
                        </div>
                    </div>
                    <div className="chart-box tall">
                        {fuelData.length ? <Line data={fuelLineData} options={chartOptions} /> : <EmptyState icon="⛽" title="Нет топливных данных" text="Укажите литры в топливных расходах." />}
                    </div>
                    <div className="fuel-cards">
                        {fuelData.map(item => (
                            <div className="fuel-card" key={`${item.month}-${item.year}`}>
                                <span>{item.month} {item.year}</span>
                                <strong>{formatNumber(item.consumptionPer100Km, 1)} л/100 км</strong>
                                <small>{Number(item.fuelLiters || 0).toLocaleString()} л · {Number(item.distanceKm || 0).toLocaleString()} км</small>
                            </div>
                        ))}
                    </div>
                </section>
            )}

            {activeTab === 'compare' && (
                <section className="content-card table-card">
                    <div className="card-heading"><h2>Сравнение автомобилей</h2></div>
                    {comparison.length === 0 ? (
                        <EmptyState icon="🚗" title="Недостаточно данных" text="Добавьте расходы по нескольким автомобилям." />
                    ) : (
                        <Table responsive hover className="modern-table">
                            <thead>
                                <tr>
                                    <th>Автомобиль</th>
                                    <th>Год</th>
                                    <th>Расходы</th>
                                    <th>Пробег</th>
                                    <th>₽/км</th>
                                    <th>Записей</th>
                                </tr>
                            </thead>
                            <tbody>
                                {comparison.map(item => (
                                    <tr key={item.automobileId}>
                                        <td><span className="plate-mini">{item.plateNumber}</span> {item.brandName} {item.modelName}</td>
                                        <td>{item.year || '—'}</td>
                                        <td>{formatMoney(item.totalExpenses)}</td>
                                        <td>{Number(item.totalDistance || 0).toLocaleString()} км</td>
                                        <td><strong>{formatNumber(item.costPerKm, 2)} ₽</strong></td>
                                        <td>{item.expenseCount}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </Table>
                    )}
                </section>
            )}
        </div>
    );
};

export default AnalyticsPage;
