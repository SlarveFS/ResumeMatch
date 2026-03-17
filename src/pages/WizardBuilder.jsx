import { useState, useEffect, useCallback, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { loadResumeData, saveResumeData } from '../utils/storage';
import { DEFAULT_RESUME_DATA } from '../utils/templates';
import { calculateScore, wizardDataToStorageFormat } from '../utils/wizardScore';
import ScoreBar from '../components/wizard/ScoreBar';
import WizardNav from '../components/wizard/WizardNav';
import Step1Personal from '../components/wizard/steps/Step1Personal';
import Step2Experience from '../components/wizard/steps/Step2Experience';
import Step3Education from '../components/wizard/steps/Step3Education';
import Step4Skills from '../components/wizard/steps/Step4Skills';
import Step5Summary from '../components/wizard/steps/Step5Summary';
import Step6Sections from '../components/wizard/steps/Step6Sections';
import Step7Review from '../components/wizard/steps/Step7Review';
import './WizardBuilder.css';

const TOTAL_STEPS = 7;

const STEP_LABELS = [
  'Personal Details',
  'Experience',
  'Education',
  'Skills',
  'Summary',
  'Extra Sections',
  'Review',
];

const DEFAULT_SECTION_TITLES = {
  experience: 'Employment History',
  education: 'Education',
  skills: 'Areas of Expertise',
  summary: 'Professional Summary',
};

export default function WizardBuilder() {
  const navigate = useNavigate();
  const [currentStep, setCurrentStep] = useState(1);
  const [showErrors, setShowErrors] = useState(false);
  const [data, setData] = useState(() => {
    const saved = loadResumeData();
    return saved || { ...DEFAULT_RESUME_DATA };
  });

  // Section titles (renameable per-step)
  const [sectionTitles, setSectionTitles] = useState(() => {
    const saved = loadResumeData();
    return saved?.sectionTitles || { ...DEFAULT_SECTION_TITLES };
  });

  // Debounced auto-save — includes section titles
  const saveTimer = useRef(null);
  useEffect(() => {
    clearTimeout(saveTimer.current);
    saveTimer.current = setTimeout(() => {
      saveResumeData({ ...wizardDataToStorageFormat(data), sectionTitles });
    }, 1200);
    return () => clearTimeout(saveTimer.current);
  }, [data, sectionTitles]);

  const handleChange = useCallback((updates) => {
    setData(prev => ({ ...prev, ...updates }));
  }, []);

  const handleRename = useCallback((section, title) => {
    setSectionTitles(prev => ({ ...prev, [section]: title }));
  }, []);

  const score = calculateScore(data);

  const goBack = () => {
    if (currentStep === 1) {
      navigate('/builder');
    } else {
      setCurrentStep(s => s - 1);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  const validateStep1 = () => {
    const pi = data.personalInfo || {};
    const emailOk = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test((pi.email || '').trim());
    return pi.firstName?.trim() && pi.lastName?.trim() && pi.jobTarget?.trim() && pi.email?.trim() && emailOk;
  };

  const goNext = () => {
    // Validate required fields on step 1 before advancing
    if (currentStep === 1 && !validateStep1()) {
      setShowErrors(true);
      return;
    }
    setShowErrors(false);
    if (currentStep === TOTAL_STEPS) {
      saveResumeData({ ...wizardDataToStorageFormat(data), sectionTitles });
      navigate('/builder/edit');
    } else {
      setCurrentStep(s => s + 1);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  const goToStep = (step) => {
    setCurrentStep(step);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const getNextLabel = () => {
    if (currentStep === TOTAL_STEPS) return 'Finish & Open Editor →';
    return `Next: ${STEP_LABELS[currentStep]} →`;
  };

  const renderStep = () => {
    switch (currentStep) {
      case 1:
        return <Step1Personal data={data} onChange={handleChange} showErrors={showErrors} />;
      case 2:
        return (
          <Step2Experience
            data={data}
            onChange={handleChange}
            sectionTitles={sectionTitles}
            onRename={handleRename}
          />
        );
      case 3:
        return (
          <Step3Education
            data={data}
            onChange={handleChange}
            sectionTitles={sectionTitles}
            onRename={handleRename}
          />
        );
      case 4:
        return (
          <Step4Skills
            data={data}
            onChange={handleChange}
            sectionTitles={sectionTitles}
            onRename={handleRename}
          />
        );
      case 5:
        return (
          <Step5Summary
            data={data}
            onChange={handleChange}
            sectionTitles={sectionTitles}
            onRename={handleRename}
          />
        );
      case 6:
        return <Step6Sections data={data} onChange={handleChange} />;
      case 7:
        return (
          <Step7Review
            data={data}
            onGoToStep={goToStep}
          />
        );
      default:
        return null;
    }
  };

  return (
    <div className="wizard-page">
      {/* Score bar — always visible at top */}
      <ScoreBar score={score} data={data} />

      {/* Step indicator breadcrumb */}
      <div className="wizard-breadcrumb">
        <span className="wizard-breadcrumb-step">
          Step {currentStep} of {TOTAL_STEPS}
        </span>
        <span className="wizard-breadcrumb-label">{STEP_LABELS[currentStep - 1]}</span>
        <button
          className="wizard-expert-link"
          onClick={() => {
            saveResumeData({ ...wizardDataToStorageFormat(data), sectionTitles });
            navigate('/builder/edit');
          }}
        >
          Switch to Expert Mode →
        </button>
      </div>

      {/* Step content */}
      <div className="wizard-content">
        {renderStep()}
      </div>

      {/* Bottom navigation */}
      <WizardNav
        currentStep={currentStep}
        totalSteps={TOTAL_STEPS}
        onBack={goBack}
        onNext={goNext}
        nextLabel={getNextLabel()}
        onGoToStep={goToStep}
      />
    </div>
  );
}
