import React, { useEffect } from 'react';
import '../styles/successmodal.css';

const SuccessModal = ({ isOpen, onClose, data = {} }) => {
  useEffect(() => {
    if (isOpen) {
      const timer = setTimeout(() => {
        onClose();
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div className="success-modal-overlay" onClick={onClose}>
      <div className="success-modal-content" onClick={(e) => e.stopPropagation()}>
        <div className="success-icon-wrapper">
          <div className="success-icon">✓</div>
        </div>
        
        <h2 className="success-modal-title">Application Submitted!</h2>
        
        <p className="success-modal-text">
          Your application has been successfully submitted to the ship.
        </p>
        
        {data.id && (
          <div className="success-modal-details">
            <p><strong>Application ID:</strong> {data.id}</p>
            <p><strong>Status:</strong> {data.status || 'Pending Review'}</p>
          </div>
        )}
        
        <p className="success-modal-footer">
          You'll be redirected to your applications in a moment...
        </p>
        
        <button onClick={onClose} className="success-modal-button">
          Close & Continue
        </button>
      </div>
    </div>
  );
};

export default SuccessModal;
