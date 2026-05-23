import React from 'react';

const ProgressBar = ({ percent = 0, isExceeded = false, limitAmount = 0, spentAmount = 0 }) => {
    const normalized = Math.min(Number(percent) || 0, 100);
    const barClass = isExceeded ? 'danger' : normalized >= 80 ? 'warning' : 'success';

    return (
        <div className="budget-progress">
            <div className="d-flex justify-content-between mb-2 text-muted small">
                <span>Потрачено: {Number(spentAmount || 0).toLocaleString()} ₽</span>
                <span>Лимит: {Number(limitAmount || 0).toLocaleString()} ₽</span>
            </div>
            <div className="progress-track">
                <div className={`progress-fill ${barClass}`} style={{ width: `${normalized}%` }}>
                    <span>{Number(percent || 0).toFixed(1)}%</span>
                </div>
            </div>
            {isExceeded && (
                <small className="text-danger mt-2 d-block">
                    ⚠️ Превышение бюджета на {Math.abs(Number(spentAmount || 0) - Number(limitAmount || 0)).toLocaleString()} ₽
                </small>
            )}
            {normalized >= 80 && !isExceeded && (
                <small className="text-warning mt-2 d-block">⚠️ Близко к лимиту</small>
            )}
        </div>
    );
};

export default ProgressBar;
