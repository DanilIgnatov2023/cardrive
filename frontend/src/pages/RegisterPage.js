import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

const RegisterPage = () => {
    const { register } = useAuth();
    const navigate = useNavigate();
    const [form, setForm] = useState({ name: '', email: '', password: '', confirmPassword: '' });
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

    const updateField = (field, value) => setForm(current => ({ ...current, [field]: value }));

    const handleSubmit = async (event) => {
        event.preventDefault();
        setError('');

        if (form.password.length < 3) {
            setError('Пароль должен быть минимум 3 символа');
            return;
        }
        if (form.password !== form.confirmPassword) {
            setError('Пароли не совпадают');
            return;
        }

        setLoading(true);
        const result = await register(form.email, form.password, form.name);
        if (result.success) {
            navigate('/login');
        } else {
            setError(result.error || 'Не удалось зарегистрироваться');
        }
        setLoading(false);
    };

    return (
        <div className="auth-screen">
            <div className="auth-pattern" />
            <div className="auth-card register">
                <div className="auth-hero">
                    <div className="auth-car">🛣️</div>
                    <span className="eyebrow">Новый аккаунт</span>
                    <h1>Создайте профиль</h1>
                    <p>После регистрации можно сразу добавить автомобиль, расход и бюджет на текущий месяц.</p>
                </div>

                <form onSubmit={handleSubmit} className="auth-form">
                    {error && <div className="form-alert error">{error}</div>}

                    <label className="input-with-icon">
                        <span>👤</span>
                        <input
                            type="text"
                            placeholder="Имя"
                            value={form.name}
                            onChange={(event) => updateField('name', event.target.value)}
                            required
                        />
                    </label>

                    <label className="input-with-icon">
                        <span>✉️</span>
                        <input
                            type="email"
                            placeholder="Email"
                            value={form.email}
                            onChange={(event) => updateField('email', event.target.value)}
                            required
                        />
                    </label>

                    <label className="input-with-icon">
                        <span>🔒</span>
                        <input
                            type="password"
                            placeholder="Пароль"
                            value={form.password}
                            onChange={(event) => updateField('password', event.target.value)}
                            required
                        />
                    </label>

                    <label className="input-with-icon">
                        <span>✅</span>
                        <input
                            type="password"
                            placeholder="Подтвердите пароль"
                            value={form.confirmPassword}
                            onChange={(event) => updateField('confirmPassword', event.target.value)}
                            required
                        />
                    </label>

                    <button className="gradient-button w-100" disabled={loading}>
                        {loading ? 'Создаём...' : 'Зарегистрироваться'}
                    </button>

                    <p className="auth-switch">
                        Уже есть аккаунт? <Link to="/login">Войти</Link>
                    </p>
                </form>
            </div>
        </div>
    );
};

export default RegisterPage;
