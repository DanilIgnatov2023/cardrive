import React, { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { Bar } from 'react-chartjs-2';
import { BarElement, CategoryScale, Chart as ChartJS, Legend, LinearScale, Tooltip } from 'chart.js';
import EmptyState from '../components/EmptyState';
import LoadingSpinner from '../components/LoadingSpinner';
import ProgressBar from '../components/ProgressBar';
import { useAuth } from '../contexts/AuthContext';
import { analyticsApi, automobileApi, budgetApi, expenseApi, reminderApi } from '../services/api';

ChartJS.register(CategoryScale, LinearScale, BarElement, Tooltip, Legend);

const formatMoney = (value) => `${Number(value || 0).toLocaleString()} ₽`;
const todayIso = () => new Date().toISOString().slice(0, 10);
const monthStartIso = () => {
    const date = new Date();
    date.setDate(1);
    return date.toISOString().slice(0, 10);
};

const DashboardPage = () => {
    const { user } = useAuth();
    const [loading, setLoading] = useState(true);
    const [cars, setCars] = useState([]);
    const [expenses, setExpenses] = useState([]);
    const [reminders, setReminders] = useState([]);
    const [summary, setSummary] = useState(null);
    const [budget, setBudget] = useState(null);
    const [monthly, setMonthly] = useState([]);

    useEffect(() => {
        const loadDashboard = async () => {
            try {
                const carsRes = await automobileApi.getAll();
                const loadedCars = Array.isArray(carsRes.data) ? carsRes.data : [];
                setCars(loadedCars);

                const [expensesRes, remindersRes] = await Promise.all([
                    expenseApi.getAll({ startDate: monthStartIso(), endDate: todayIso() }),
                    reminderApi.getAll()
                ]);

                setExpenses(Array.isArray(expensesRes.data) ? expensesRes.data : []);
                setReminders(Array.isArray(remindersRes.data) ? remindersRes.data.slice(0, 5) : []);

                if (loadedCars.length > 0) {
                    const autoId = loadedCars[0].id;
                    const [summaryRes, monthlyRes, budgetRes] = await Promise.allSettled([
                        analyticsApi.getSummary(autoId, monthStartIso(), todayIso()),
                        analyticsApi.getMonthlyStats(autoId, 6),
                        budgetApi.getCurrentBudget(autoId)
                    ]);

                    if (summaryRes.status === 'fulfilled') setSummary(summaryRes.value.data);
                    if (monthlyRes.status === 'fulfilled') setMonthly(monthlyRes.value.data || []);
                    if (budgetRes.status === 'fulfilled' && budgetRes.value.data) setBudget(budgetRes.value.data);
                }
            } catch (error) {
                console.error('Dashboard load error', error);
            } finally {
                setLoading(false);
            }
        };

        loadDashboard();
    }, []);

    const monthlyTotal = useMemo(() => expenses.reduce((sum, expense) => sum + Number(expense.amount || 0), 0), [expenses]);

    const chartData = {
        labels: monthly.map(item => `${item.month} ${item.year}`),
        datasets: [{
            label: 'Расходы',
            data: monthly.map(item => Number(item.amount || 0)),
            backgroundColor: 'rgba(37, 99, 235, 0.82)',
            borderRadius: 12
        }]
    };

    const chartOptions = {
        responsive: true,
        maintainAspectRatio: false,
        plugins: { legend: { display: false } },
        scales: {
            x: { grid: { display: false } },
            y: { beginAtZero: true, ticks: { callback: value => `${value / 1000}k` } }
        }
    };

    if (loading) return <LoadingSpinner label="Собираем дашборд..." />;

    return (
        <div className="page-stack">
            <section className="hero-card dashboard-hero">
                <div>
                    <span className="eyebrow">Панель управления</span>
                    <h1>Привет, {user?.name || 'водитель'}!</h1>
                    <p>Здесь собрана сводка по автопарку: расходы месяца, стоимость километра, бюджет и ближайшие дела.</p>
                </div>
                <div className="hero-actions">
                    <Link to="/expenses" className="gradient-button">+ Добавить расход</Link>
                    <Link to="/reminders" className="soft-button">Создать напоминание</Link>
                </div>
            </section>

            <section className="stats-grid">
                <div className="stat-card">
                    <span className="stat-icon blue">🚗</span>
                    <p>Автомобили</p>
                    <strong>{cars.length}</strong>
                </div>
                <div className="stat-card">
                    <span className="stat-icon green">💳</span>
                    <p>Расходы за месяц</p>
                    <strong>{formatMoney(monthlyTotal)}</strong>
                </div>
                <div className="stat-card">
                    <span className="stat-icon orange">🛣️</span>
                    <p>Стоимость 1 км</p>
                    <strong>{Number(summary?.costPerKm || 0).toFixed(2)} ₽</strong>
                </div>
                <div className="stat-card">
                    <span className="stat-icon purple">🎯</span>
                    <p>Бюджет</p>
                    <strong>{budget ? `${Number(budget.progressPercent || 0).toFixed(0)}%` : 'не задан'}</strong>
                </div>
            </section>

            <section className="dashboard-grid">
                <div className="content-card chart-card">
                    <div className="card-heading">
                        <div>
                            <span className="eyebrow">6 месяцев</span>
                            <h2>Динамика расходов</h2>
                        </div>
                        <Link to="/analytics">Подробнее</Link>
                    </div>
                    <div className="chart-box mini">
                        {monthly.length > 0 ? <Bar data={chartData} options={chartOptions} /> : <EmptyState icon="📈" title="Нет графика" text="Добавьте расходы, чтобы увидеть динамику." />}
                    </div>
                </div>

                <div className="content-card">
                    <div className="card-heading">
                        <div>
                            <span className="eyebrow">Бюджет</span>
                            <h2>Прогресс месяца</h2>
                        </div>
                        <Link to="/budget">Настроить</Link>
                    </div>
                    {budget ? (
                        <ProgressBar
                            percent={budget.progressPercent || 0}
                            isExceeded={budget.isExceeded}
                            limitAmount={budget.limitAmount}
                            spentAmount={budget.spentAmount}
                        />
                    ) : (
                        <EmptyState icon="🎯" title="Бюджет не задан" text="Установите лимит на месяц, чтобы отслеживать превышение." />
                    )}
                </div>

                <div className="content-card">
                    <div className="card-heading">
                        <div>
                            <span className="eyebrow">Последние операции</span>
                            <h2>Расходы</h2>
                        </div>
                        <Link to="/expenses">Все расходы</Link>
                    </div>
                    {expenses.length === 0 ? (
                        <EmptyState icon="💳" title="Нет расходов" text="Первый расход появится здесь." />
                    ) : (
                        <div className="activity-list">
                            {expenses.slice(0, 5).map(expense => (
                                <div className="activity-row" key={expense.id}>
                                    <span className="activity-icon">{expense.categoryName === 'Топливо' ? '⛽' : '💳'}</span>
                                    <div>
                                        <strong>{expense.categoryName}</strong>
                                        <small>{expense.date} · {expense.automobilePlateNumber}</small>
                                    </div>
                                    <b>{formatMoney(expense.amount)}</b>
                                </div>
                            ))}
                        </div>
                    )}
                </div>

                <div className="content-card">
                    <div className="card-heading">
                        <div>
                            <span className="eyebrow">Скоро</span>
                            <h2>Напоминания</h2>
                        </div>
                        <Link to="/reminders">Открыть</Link>
                    </div>
                    {reminders.length === 0 ? (
                        <EmptyState icon="⏰" title="Нет напоминаний" text="Создайте напоминание о ТО, страховке или налоге." />
                    ) : (
                        <div className="activity-list">
                            {reminders.map(reminder => (
                                <div className="activity-row reminder" key={reminder.id}>
                                    <span className="activity-icon">{reminder.typeIcon || '⏰'}</span>
                                    <div>
                                        <strong>{reminder.title}</strong>
                                        <small>{reminder.dueDate} · {reminder.daysLeft >= 0 ? `осталось ${reminder.daysLeft} дн.` : 'просрочено'}</small>
                                    </div>
                                    <span className={`status-pill ${reminder.isOverdue ? 'danger' : reminder.daysLeft <= 3 ? 'warning' : 'success'}`}>
                                        {reminder.isOverdue ? 'Просрочено' : 'Активно'}
                                    </span>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </section>
        </div>
    );
};

export default DashboardPage;
