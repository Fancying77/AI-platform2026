import { Check } from 'lucide-react';

interface Step {
  id: number;
  label: string;
}

interface StepIndicatorProps {
  steps: Step[];
  currentStep: number;
  onStepClick?: (step: number) => void;
}

export default function StepIndicator({ steps, currentStep, onStepClick }: StepIndicatorProps) {
  return (
    <div className="flex items-center justify-center mb-4">
      {steps.map((step, index) => (
        <div key={step.id} className="flex items-center">
          {/* Step Circle */}
          <button
            onClick={() => onStepClick && step.id <= currentStep && onStepClick(step.id)}
            disabled={step.id > currentStep}
            className="flex flex-col items-center"
          >
            <div
              className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-medium transition-all ${
                step.id < currentStep
                  ? 'bg-primary text-white'
                  : step.id === currentStep
                  ? 'bg-primary text-white ring-2 ring-primary/20'
                  : 'bg-gray-200 text-text-tertiary'
              } ${step.id <= currentStep ? 'cursor-pointer hover:ring-2 hover:ring-primary/20' : 'cursor-not-allowed'}`}
            >
              {step.id < currentStep ? <Check size={12} /> : step.id}
            </div>
            <span
              className={`mt-1 text-xs whitespace-nowrap ${
                step.id === currentStep
                  ? 'text-primary font-medium'
                  : step.id < currentStep
                  ? 'text-text-primary'
                  : 'text-text-tertiary'
              }`}
            >
              {step.label}
            </span>
          </button>

          {/* Connector Line */}
          {index < steps.length - 1 && (
            <div className="w-16 mx-3 relative">
              <div className="h-0.5 bg-gray-200 absolute top-3 left-0 right-0 -translate-y-1/2" />
              <div
                className="h-0.5 bg-primary absolute top-3 left-0 -translate-y-1/2 transition-all duration-300"
                style={{ width: step.id < currentStep ? '100%' : '0%' }}
              />
            </div>
          )}
        </div>
      ))}
    </div>
  );
}
