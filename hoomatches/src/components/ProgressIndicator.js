export default function ProgressIndicator({ totalSteps, currentStep }) {
    const progressWidth = ((currentStep + 1) / totalSteps) * 100;
  
    return (
      <div className="progress-wrapper">
        <div className="progress-bar">
          <div 
            className="progress-fill"
            style={{ width: `${progressWidth}%` }}
          ></div>
        </div>
        <span className="progress-text">
          Step {currentStep + 1} of {totalSteps}
        </span>
      </div>
    );
  }