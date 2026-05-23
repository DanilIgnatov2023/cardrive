import React from 'react';
import { Button, Modal } from 'react-bootstrap';

const ConfirmDialog = ({ show, title = 'Подтвердите действие', message, confirmText = 'Подтвердить', cancelText = 'Отмена', variant = 'danger', onConfirm, onCancel }) => (
    <Modal show={show} onHide={onCancel} centered>
        <Modal.Header closeButton>
            <Modal.Title>{title}</Modal.Title>
        </Modal.Header>
        <Modal.Body>
            <p className="mb-0">{message}</p>
        </Modal.Body>
        <Modal.Footer>
            <Button variant="light" onClick={onCancel}>{cancelText}</Button>
            <Button variant={variant} onClick={onConfirm}>{confirmText}</Button>
        </Modal.Footer>
    </Modal>
);

export default ConfirmDialog;
