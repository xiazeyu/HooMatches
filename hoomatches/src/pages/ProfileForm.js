import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import ProgressIndicator from '../components/ProgressIndicator';

const PROFILE_STEPS = [
  "Describe your personality",
  "What are your main interests?",
  "What do you look for in a partner?"
];

export default function ProfileForm() {
  const [currentStep, setCurrentStep] = useState(0);
  const [responses, setResponses] = useState(Array(PROFILE_STEPS.length).fill(''));
  const navigate = useNavigate();

  const handleNavigation = (direction) => {
    if (direction === 'next' && currentStep < PROFILE_STEPS.length - 1) {
      setCurrentStep(prev => prev + 1);
    } else if (direction === 'prev') {
      setCurrentStep(prev => Math.max(0, prev - 1));
    } else {
      navigate('/results');
    }
  };

  return (
    <div className="form-container">
      <ProgressIndicator 
        totalSteps={PROFILE_STEPS.length}
        currentStep={currentStep}
      />
      
      <h3>{PROFILE_STEPS[currentStep]}</h3>
      <textarea
        value={responses[currentStep]}
        onChange={(e) => {
          const updatedResponses = [...responses];
          updatedResponses[currentStep] = e.target.value;
          setResponses(updatedResponses);
        }}
        rows={5}
      />
      
      <div className="navigation-buttons">
        {currentStep > 0 && (
          <button 
            className="secondary"
            onClick={() => handleNavigation('prev')}
          >
            Previous
          </button>
        )}
        <button onClick={() => handleNavigation('next')}>
          {currentStep === PROFILE_STEPS.length - 1 ? 'Submit' : 'Next'}
        </button>
      </div>
    </div>
  );
}