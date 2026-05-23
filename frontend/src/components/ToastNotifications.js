import React, { createContext, useCallback, useContext, useMemo, useState } from 'react';
import { Toast, ToastContainer } from 'react-bootstrap';

const ToastContext = createContext({ showToast: () => {} });

export const useToast = () => useContext(ToastContext);

export const ToastProvider = ({ children }) => {
    const [toasts, setToasts] = useState([]);

    const showToast = useCallback((message, variant = 'success', title = 'Готово') => {
        const id = Date.now() + Math.random();
        setToasts(current => [...current, { id, message, variant, title }]);
    }, []);

    const removeToast = useCallback((id) => {
        setToasts(current => current.filter(toast => toast.id !== id));
    }, []);

    const value = useMemo(() => ({ showToast }), [showToast]);

    return (
        <ToastContext.Provider value={value}>
            {children}
            <ToastContainer position="top-end" className="toast-layer p-3">
                {toasts.map(toast => (
                    <Toast
                        key={toast.id}
                        bg={toast.variant}
                        delay={3200}
                        autohide
                        onClose={() => removeToast(toast.id)}
                    >
                        <Toast.Header>
                            <strong className="me-auto">{toast.title}</strong>
                        </Toast.Header>
                        <Toast.Body className={toast.variant === 'light' ? '' : 'text-white'}>{toast.message}</Toast.Body>
                    </Toast>
                ))}
            </ToastContainer>
        </ToastContext.Provider>
    );
};

export default ToastProvider;
