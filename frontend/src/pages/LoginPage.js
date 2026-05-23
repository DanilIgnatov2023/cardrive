import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

const LoginPage = () => {
    const { login } = useAuth();
    const navigate = useNavigate();
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

    const handleSubmit = async (event) => {
        event.preventDefault();
        setLoading(true);
        setError('');

        const result = await login(email, password);
        if (result.success) {
            navigate('/dashboard');
        } else {
            setError(result.error || 'Не удалось войти');
        }
        setLoading(false);
    };

    return (
        <div className="auth-screen">
            <div className="auth-pattern" />
            <div className="auth-card">
                <div className="auth-hero">
                    <div className="auth-car">🚘</div>
                    <span className="eyebrow">CarDrive</span>
                    <h1>Добро пожаловать</h1>
                    <p>Войдите, чтобы управлять автомобилями, расходами, бюджетами и напоминаниями в одном месте.</p>
                </div>

                <form onSubmit={handleSubmit} className="auth-form">
                    {error && <div className="form-alert error">{error}</div>}

                    <label className="input-with-icon">
                        <span>✉️</span>
                        <input
                            type="email"
                            placeholder="Email"
                            value={email}
                            onChange={(event) => setEmail(event.target.value)}
                            required
                        />
                    </label>

                    <label className="input-with-icon">
                        <span>🔒</span>
                        <input
                            type="password"
                            placeholder="Пароль"
                            value={password}
                            onChange={(event) => setPassword(event.target.value)}
                            required
                        />
                    </label>

                    <button className="gradient-button w-100" disabled={loading}>
                        {loading ? 'Входим...' : 'Войти'}
                    </button>

                    <p className="auth-switch">
                        Нет аккаунта? <Link to="/register">Создать аккаунт</Link>
                    </p>
                </form>
            </div>
        </div>
    );
};

export default LoginPage;
