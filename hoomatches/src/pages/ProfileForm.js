import { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import ProgressIndicator from '../components/ProgressIndicator';

// Mock data storage
let mockAnswers = {};

// Mock API functions
const fetchStepData = async (step, username) => {
  const requestOptions = {
    method: 'GET',
    redirect: 'follow'
  };

  const response = await fetch(`https://workers-hoomatches.kkmk.workers.dev/api/profile?step=${step}&username=${username}`, requestOptions);
  const result = await response.json();

  if (!result.success) {
    throw new Error('Failed to fetch step data');
  }

  return result.data;
};

const mockSaveStepData = async (answers) => {
  await new Promise(resolve => setTimeout(resolve, 200));
  mockAnswers = { ...mockAnswers, ...answers };
};

const postStepData = async (username, answers) => {
  const raw = JSON.stringify({
    username,
    qna: Object.entries(answers).map(([qid, answer]) => ({ qid: parseInt(qid), answer }))
  });

  const requestOptions = {
    method: 'POST',
    body: raw,
    redirect: 'follow'
  };

  const response = await fetch("https://workers-hoomatches.kkmk.workers.dev/api/profile", requestOptions);
  const result = await response.json();

  if (!result.success) {
    throw new Error('Failed to save step data');
  }
};

const fetchMatchData = async (username) => {
  const requestOptions = {
    method: 'GET',
    redirect: 'follow'
  };

  const response = await fetch(`https://workers-hoomatches.kkmk.workers.dev/api/match?username=${username}`, requestOptions);
  const result = await response.json();

  if (!result.success) {
    throw new Error('Failed to fetch match data');
  }

  return result.contact;
};

export default function ProfileForm() {
  const [searchParams] = useSearchParams();
  const [formData, setFormData] = useState(null);
  const [answers, setAnswers] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const currentStep = parseInt(searchParams.get('step')) || 1;
  const username = searchParams.get('username') || 'defaultUser';

  useEffect(() => {
    const loadStepData = async () => {
      try {
        setLoading(true);
        const data = await fetchStepData(currentStep, username);

        const stepAnswers = data.qna.reduce((acc, item) => {
          acc[item.qid] = item.answer || '';
          return acc;
        }, {});

        setAnswers(prev => ({ ...prev, ...stepAnswers }));
        setFormData(data);
        setError('');
      } catch (err) {
        setError('Failed to load step data');
      } finally {
        setLoading(false);
      }
    };

    loadStepData();
  }, [currentStep, username]);

  const handleAnswerChange = (qid, value) => {
    setAnswers(prev => ({ ...prev, [qid]: value }));
  };

  const validateStep = () => {
    return formData.qna.every(question => {
      if (!question.required) return true;
      const answer = answers[question.qid];
      return answer && answer.toString().trim().length > 0;
    });
  };

  const handleNavigation = async (direction) => {
    if (!validateStep()) {
      setError('Please complete all required fields');
      return;
    }

    try {
      await postStepData(username, answers);

      if (direction === 'next' && currentStep === formData.total_steps) {
        navigate(`/results?username=${username}`);
        return;
      }

      const newStep = direction === 'next' ? currentStep + 1 : currentStep - 1;

      if (newStep >= 1 && newStep <= formData.total_steps) {
        navigate(`/profile?step=${newStep}&username=${username}`);
      }
    } catch (err) {
      setError('Failed to save progress or fetch match data');
    }
  };

  if (loading) return <div className="loading">Loading step {currentStep}...</div>;
  if (error) return <div className="error">{error}</div>;

  return (
    <div className="form-container">
      <ProgressIndicator 
        currentStep={currentStep}
        totalSteps={formData.total_steps}
        title={formData.current_step_title}
      />

      <div className="qna-section">
        {formData.qna.map((item) => (
          <div key={item.qid} className="question-card">
            <h3>{item.question}{item.required && <span className="required-star">*</span>}</h3>
            <input
              type="text"
              value={answers[item.qid] || ''}
              onChange={(e) => handleAnswerChange(item.qid, e.target.value)}
              placeholder={item.placeholder}
              className="form-input"
            />
          </div>
        ))}
      </div>

      <div className="navigation-buttons">
        {currentStep > 1 && (
          <button 
            className="nav-button secondary"
            onClick={() => handleNavigation('prev')}
          >
            Previous
          </button>
        )}
        <button 
          className="nav-button primary"
          onClick={() => handleNavigation('next')}
        >
          {currentStep === formData.total_steps ? 'Complete Profile' : 'Next'}
        </button>
      </div>
    </div>
  );
}