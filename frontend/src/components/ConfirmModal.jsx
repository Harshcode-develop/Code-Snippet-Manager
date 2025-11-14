import React from 'react';

export const ConfirmModal = ({ isOpen, onClose, onConfirm, message }) => {
    if (!isOpen) {
        return null;
    }

    return (
        <div className="modal-overlay animate-fade-in">
            <div className="modal-content" style={{ maxWidth: '28rem' }}>
                <h3 style={{ marginTop: 0, color: 'var(--color-text)' }}>Confirm Action</h3>
                <p style={{ color: 'var(--color-text-muted)', margin: '1rem 0 2rem 0' }}>{message}</p>
                <div style={{ display: 'flex', gap: '1rem', justifyContent: 'flex-end' }}>
                    <button onClick={onClose} className="btn-secondary">
                        Cancel
                    </button>
                    <button onClick={onConfirm} className="btn-danger">
                        Delete
                    </button>
                </div>
            </div>
        </div>
    );
};
