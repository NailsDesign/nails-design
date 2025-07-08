import React from "react";

const steps = [
  { id: 1, name: "Services" },
  { id: 2, name: "Date & Time" },
  { id: 3, name: "Confirmation" },
];

export default function BookingProgressBar({ currentStep, onStepClick }) {
  return (
    <div className="flex justify-between items-center px-4 py-6 relative w-full max-w-xl mx-auto">
      {steps.map((step, index) => {
        // Only allow clicking/hovering for steps before the current step
        const isClickable = onStepClick && step.id < currentStep;
        return (
          <div key={step.id} className="flex-1 flex flex-col items-center relative">
            {/* Left connecting line (not for first step) */}
            {index !== 0 && (
              <div
                className={`absolute left-0 top-4 h-1 w-1/2 ${
                  currentStep > step.id - 1
                    ? "bg-[#b87333]"
                    : "bg-[#e8dcc0]"
                }`}
                style={{ zIndex: 0 }}
              />
            )}

            {/* Step circle (clickable if isClickable) */}
            <div
              className={`z-10 w-8 h-8 rounded-full flex items-center justify-center text-sm font-semibold border-2 transition-colors duration-150 ${
                currentStep === step.id
                  ? "bg-[#d4af37] text-[#2d1b0e] border-[#d4af37]"
                  : currentStep > step.id
                  ? "bg-[#b87333] text-white border-[#b87333]"
                  : "bg-[#e8dcc0] text-[#8b7d6b] border-[#e8dcc0]"
              } ${isClickable ? 'cursor-pointer hover:ring-2 hover:ring-[#d4af37]' : ''}`}
              onClick={isClickable ? () => onStepClick(step.id) : undefined}
              tabIndex={isClickable ? 0 : undefined}
              role={isClickable ? 'button' : undefined}
              aria-label={`Go to ${step.name}`}
            >
              {currentStep > step.id ? (
                <svg
                  className="w-5 h-5"
                  viewBox="0 0 20 20"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  aria-hidden="true"
                >
                  <path d="M5 11l3 3 7-7" />
                </svg>
              ) : (
                step.id
              )}
            </div>

            {/* Right connecting line (not for last step) */}
            {index !== steps.length - 1 && (
              <div
                className={`absolute right-0 top-4 h-1 w-1/2 ${
                  currentStep > step.id
                    ? "bg-[#b87333]"
                    : "bg-[#e8dcc0]"
                }`}
                style={{ zIndex: 0 }}
              />
            )}

            {/* Label (clickable if isClickable) */}
            <span
              className={`mt-2 text-sm text-center text-[#2d1b0e] ${isClickable ? 'cursor-pointer hover:underline' : ''}`}
              onClick={isClickable ? () => onStepClick(step.id) : undefined}
              tabIndex={isClickable ? 0 : undefined}
              role={isClickable ? 'button' : undefined}
              aria-label={`Go to ${step.name}`}
            >
              {step.name}
            </span>
          </div>
        );
      })}
    </div>
  );
} 