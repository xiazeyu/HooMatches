// src/components/ProgressIndicator.js
import React from 'react';

const ProgressIndicator = ({ currentStep, totalSteps, title }) => {
  const progressWidth = (currentStep / totalSteps) * 100;

  return (
    <div className="progress-indicator">
      <div className="progress-header">
        <h2>{title}</h2>
        <span className="step-count">Step {currentStep} of {totalSteps}</span>
      </div>
      <div className="progress-bar">
        <div 
          className="progress-fill" 
          style={{ width: `${progressWidth}%` }}
        ></div>
      </div>
    </div>
  );
};

export default ProgressIndicator;