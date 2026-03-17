// Bottom navigation: Back button, dot indicators, Next button
export default function WizardNav({ currentStep, totalSteps = 7, onBack, onNext, nextLabel, nextDisabled, onGoToStep }) {
  return (
    <div className="wizard-nav">
      <button
        className="wizard-nav-back"
        onClick={onBack}
        disabled={currentStep === 1}
      >
        ← Back
      </button>

      <div className="wizard-nav-dots">
        {Array.from({ length: totalSteps }, (_, i) => {
          const step = i + 1;
          const isActive = step === currentStep;
          const isDone = step < currentStep;
          return (
            <span
              key={step}
              className={`wizard-dot ${isActive ? 'active' : ''} ${isDone ? 'done' : ''}`}
              aria-label={`Go to step ${step}`}
              role="button"
              tabIndex={0}
              title={`Step ${step}`}
              onClick={() => onGoToStep?.(step)}
              onKeyDown={e => { if (e.key === 'Enter' || e.key === ' ') onGoToStep?.(step); }}
              style={{ cursor: 'pointer' }}
            />
          );
        })}
      </div>

      <button
        className="wizard-nav-next"
        onClick={onNext}
        disabled={nextDisabled}
      >
        {nextLabel || (currentStep === totalSteps ? 'Finish' : `Next →`)}
      </button>
    </div>
  );
}
