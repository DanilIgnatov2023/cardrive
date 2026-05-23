import React from 'react';

const LoadingSpinner = ({ label = 'Загрузка данных...' }) => (
    <div className="loading-state">
        <div className="loading-spinner" aria-hidden="true" />
        <p>{label}</p>
    </div>
);

export default LoadingSpinner;
