import React, { useState } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import NotificationBell from './NotificationBell';

const navItems = [
    { to: '/dashboard', label: 'Панель', icon: '🏠' },
    { to: '/cars', label: 'Авто', icon: '🚗' },
    { to: '/expenses', label: 'Расходы', icon: '💳' },
    { to: '/analytics', label: 'Аналитика', icon: '📈' },
    { to: '/budget', label: 'Бюджет', icon: '🎯' },
    { to: '/reminders', label: 'Напоминания', icon: '⏰' }
];

const Layout = ({ children }) => {
    const { user, logout } = useAuth();
    const navigate = useNavigate();
    const [mobileOpen, setMobileOpen] = useState(false);

    const initials = (user?.name || user?.email || 'U')
        .split(' ')
        .map(part => part[0])
        .join('')
        .slice(0, 2)
        .toUpperCase();

    const handleLogout = async () => {
        await logout();
        navigate('/login');
    };

    const nav = (className = '') => (
        <nav className={className}>
            {navItems.map(item => (
                <NavLink
                    key={item.to}
                    to={item.to}
                    className={({ isActive }) => `app-nav-link ${isActive ? 'active' : ''}`}
                    onClick={() => setMobileOpen(false)}
                >
                    <span>{item.icon}</span>
                    <span>{item.label}</span>
                </NavLink>
            ))}
        </nav>
    );

    return (
        <div className="app-shell">
            <aside className="sidebar d-none d-lg-flex">
                <div className="brand-mark">
                    <span className="brand-icon">🚘</span>
                    <span>CarDrive</span>
                </div>
                {nav('sidebar-nav')}
                <div className="sidebar-footer">
                    <strong>Car Expense Tracker</strong>
                </div>
            </aside>

            <div className="app-main">
                <header className="topbar">
                    <div className="d-flex align-items-center gap-3">
                        <button className="icon-button d-lg-none" onClick={() => setMobileOpen(!mobileOpen)} aria-label="Меню">☰</button>
                        <div className="brand-mark compact d-lg-none">
                            <span className="brand-icon">🚘</span>
                            <span>CarDrive</span>
                        </div>
                        <div className="topbar-title d-none d-md-block">
                            <strong>Управление расходами автомобиля</strong>
                            
                        </div>
                    </div>

                    <div className="topbar-actions">
                        <NotificationBell />
                        <div className="profile-chip">
                            <div className="avatar">{initials}</div>
                            <div className="profile-text d-none d-md-block">
                                <strong>{user?.name || 'Пользователь'}</strong>
                                <span style={{ marginTop: '8px', display: 'block' }}>{user?.email}</span>
                            </div>
                        </div>
                        <button className="btn btn-outline-danger btn-sm rounded-pill" onClick={handleLogout}>Выйти</button>
                    </div>
                </header>

                {mobileOpen && (
                    <div className="mobile-menu d-lg-none">
                        {nav('mobile-nav')}
                    </div>
                )}

                <main className="content-area">
                    {children}
                </main>

                <footer className="app-footer">
                    <span>CarDrive © 2026</span>
                    
                </footer>
            </div>
        </div>
    );
};

export default Layout;
