import axios from 'axios';

const api = axios.create({
    baseURL: 'http://localhost:8080/api',
    withCredentials: true,
    headers: {
        'Content-Type': 'application/json'
    }
});

api.interceptors.response.use(
    response => response,
    error => {
        console.error('API Error:', error.response?.status, error.response?.data);

        if (error.response?.status === 401) {
            if (window.location.pathname !== '/login' && window.location.pathname !== '/register') {
                window.location.href = '/login';
            }
        }

        return Promise.reject(error);
    }
);

export const automobileApi = {
    getAll: () => api.get('/automobiles'),
    create: (data) => api.post('/automobiles', data),
    update: (id, data) => api.put(`/automobiles/${id}`, data),
    delete: (id) => api.delete(`/automobiles/${id}`)
};

export const authApi = {
    register: (email, password, name) =>
        api.post('/register', { email, password, name }),
    login: (email, password) =>
        api.post('/login', `email=${encodeURIComponent(email)}&password=${encodeURIComponent(password)}`, {
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded'
            }
        }),
    logout: () => api.post('/logout'),
    checkAuth: () => api.get('/user/check')
};

export const expenseApi = {
    getAll: (params) => api.get('/expenses', { params }),
    getCategories: () => api.get('/expenses/categories'),
    create: (data) => api.post('/expenses', data),
    delete: (id) => api.delete(`/expenses/${id}`)
};

export const analyticsApi = {
    getSummary: (automobileId, startDate, endDate) =>
        api.get('/analytics/summary', { params: { automobileId, startDate, endDate } }),
    getCategoryStats: (automobileId, startDate, endDate) =>
        api.get('/analytics/by-category', { params: { automobileId, startDate, endDate } }),
    getMonthlyStats: (automobileId, months) =>
        api.get('/analytics/monthly', { params: { automobileId, months } }),
    getFuelConsumption: (automobileId, months) =>
        api.get('/analytics/fuel-consumption', { params: { automobileId, months } }),
    compare: (startDate, endDate) => api.get('/analytics/compare', { params: { startDate, endDate } })
};

export const budgetApi = {
    setBudget: (data) => api.post('/budgets', data),
    getCurrentBudget: (automobileId) => api.get('/budgets/current', { params: { automobileId } }),
    getBudgetForMonth: (automobileId, year, month) =>
        api.get('/budgets', { params: { automobileId, year, month } }),
    setCategoryBudget: (data) => api.post('/budgets/category', data),
    getCategoryBudgets: (automobileId, year, month) =>
        api.get('/budgets/category', { params: { automobileId, year, month } }),
    getCategoryProgress: (automobileId, year, month) =>
        api.get('/budgets/category/progress', { params: { automobileId, year, month } })
};

export const reminderApi = {
    getAll: () => api.get('/reminders'),
    create: (data) => api.post('/reminders', data),
    complete: (id) => api.put(`/reminders/${id}/complete`),
    delete: (id) => api.delete(`/reminders/${id}`)
};

export const notificationApi = {
    getAll: () => api.get('/notifications'),
    getUnread: () => api.get('/notifications/unread'),
    getUnreadCount: () => api.get('/notifications/unread/count'),
    markAsRead: (id) => api.put(`/notifications/${id}/read`),
    markAllAsRead: () => api.put('/notifications/read-all')
};

export default api;
