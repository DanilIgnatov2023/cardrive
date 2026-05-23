import React from 'react';
import { Button } from 'react-bootstrap';
import { useNavigate } from 'react-router-dom';

const BackButton = ({ label = '← Назад' }) => {
    const navigate = useNavigate();

    return (
        <Button
            variant="light"
            className="soft-button mb-3"
            onClick={() => navigate(-1)}
        >
            {label}
        </Button>
    );
};

export default BackButton;
