// import { useState } from 'react';
// import { useNavigate } from 'react-router-dom';
// import ProgressIndicator from '../components/ProgressIndicator';

// const PROFILE_STEPS = [
//   "Describe your personality",
//   "What are your main interests?",
//   "What do you look for in a partner?"
// ];

// export default function ProfileForm() {
//   const [currentStep, setCurrentStep] = useState(0);
//   const [responses, setResponses] = useState(Array(PROFILE_STEPS.length).fill(''));
//   const navigate = useNavigate();

//   const handleNavigation = (direction) => {
//     if (direction === 'next' && currentStep < PROFILE_STEPS.length - 1) {
//       setCurrentStep(prev => prev + 1);
//     } else if (direction === 'prev') {
//       setCurrentStep(prev => Math.max(0, prev - 1));
//     } else {
//       navigate('/results');
//     }
//   };

//   return (
//     <div className="form-container">
//       <ProgressIndicator 
//         totalSteps={PROFILE_STEPS.length}
//         currentStep={currentStep}
//       />
      
//       <h3>{PROFILE_STEPS[currentStep]}</h3>
//       <textarea
//         value={responses[currentStep]}
//         onChange={(e) => {
//           const updatedResponses = [...responses];
//           updatedResponses[currentStep] = e.target.value;
//           setResponses(updatedResponses);
//         }}
//         rows={5}
//       />
      
//       <div className="navigation-buttons">
//         {currentStep > 0 && (
//           <button 
//             className="secondary"
//             onClick={() => handleNavigation('prev')}
//           >
//             Previous
//           </button>
//         )}
//         <button onClick={() => handleNavigation('next')}>
//           {currentStep === PROFILE_STEPS.length - 1 ? 'Submit' : 'Next'}
//         </button>
//       </div>
//     </div>
//   );
// }

import { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import ProgressIndicator from '../components/ProgressIndicator';

// Mock data storage
let mockAnswers = {};

// Mock API data
const stepsData = {
  1: {
    current_step: 1,
    total_steps: 3,
    current_step_title: "Basic Information",
    qna: [
      { qid: 0, question: "What is your age? (Please enter a number)", answer: "", placeholder: "25", required: true },
      { qid: 1, question: "What is your preferred gender for a match?", answer: "", placeholder: "Male/Female/Non-binary", required: true },
      { qid: 2, question: "What is your acceptable age difference range?", answer: "", placeholder: "±3 years", required: true }
    ]
  },
  2: {
    current_step: 2,
    total_steps: 3,
    current_step_title: "Personality & Compatibility",
    qna: [
      { qid: 3, question: "How would you describe your personality?", answer: "", placeholder: "Outgoing and thoughtful", required: true },
      { qid: 4, question: "What is your role in relationships?", answer: "", placeholder: "Listener/Caregiver/Equal Partner", required: true },
      { qid: 5, question: "What do you value most in a relationship?", answer: "", placeholder: "Trust/Communication/Shared Values", required: true },
      { qid: 6, question: "Should your partner share similar personality traits?", answer: "", placeholder: "Yes/No/Somewhat", required: true },
      { qid: 7, question: "What is your MBTI type?", answer: "", placeholder: "INFP", required: false },
      { qid: 8, question: "Preferred partner MBTI type?", answer: "", placeholder: "ENFJ/Any", required: false },
      { qid: 9, question: "What is your zodiac sign?", answer: "", placeholder: "Leo", required: false },
      { qid: 10, question: "Preferred partner zodiac sign?", answer: "", placeholder: "Aquarius/Any", required: false }
    ]
  },
  3: {
    current_step: 3,
    total_steps: 3,
    current_step_title: "Interests & Activities",
    qna: [
      { qid: 11, question: "What type of people do you want to meet at the event?", answer: "", placeholder: "Creative/Adventurous/Intellectual", required: true },
      { qid: 12, question: "What's your ideal date activity?", answer: "", placeholder: "Dinner/Museum/Outdoor Adventure", required: true },
      { qid: 13, question: "What hobbies would you share with a partner?", answer: "", placeholder: "Hiking/Cooking/Gaming", required: true },
      { qid: 14, question: "Which Valentine's event interests you most?", answer: "", placeholder: "Cocktail Party/Workshop/Speed Dating", required: true },
      { qid: 15, question: "What aspect matters most in partner compatibility?", answer: "", placeholder: "Values/Hobbies/Communication Style", required: true }
    ]
  }
};

// Mock API functions
const mockGetStepData = async (step) => {
  await new Promise(resolve => setTimeout(resolve, 300));
  return stepsData[step] || stepsData[1];
};

const mockSaveStepData = async (answers) => {
  await new Promise(resolve => setTimeout(resolve, 200));
  mockAnswers = { ...mockAnswers, ...answers };
};

export default function ProfileForm() {
  const [searchParams] = useSearchParams();
  const [formData, setFormData] = useState(null);
  const [answers, setAnswers] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const currentStep = parseInt(searchParams.get('step')) || 1;

  useEffect(() => {
    const loadStepData = async () => {
      try {
        setLoading(true);
        const data = await mockGetStepData(currentStep);
        
        const stepAnswers = data.qna.reduce((acc, item) => {
          acc[item.qid] = mockAnswers[item.qid] || item.answer;
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
  }, [currentStep]);

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
      await mockSaveStepData(answers);
      const newStep = direction === 'next' ? currentStep + 1 : currentStep - 1;
      
      if (newStep >= 1 && newStep <= formData.total_steps) {
        navigate(`/profile?step=${newStep}`);
      }
    } catch (err) {
      setError('Failed to save progress');
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