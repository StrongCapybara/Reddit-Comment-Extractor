interface ProgressStepsProps {
  currentStep: 1 | 2 | 3;
}

export function ProgressSteps({ currentStep }: ProgressStepsProps) {
  const steps = [
    { number: 1, label: "Setup Reddit App" },
    { number: 2, label: "Enter Credentials" },
    { number: 3, label: "Extract Comments" },
  ];

  return (
    <div className="mb-12">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center space-x-4">
          {steps.map((step, index) => (
            <div key={step.number} className="flex items-center">
              <div className="flex items-center space-x-2">
                <div 
                  className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-semibold ${
                    currentStep >= step.number
                      ? "bg-primary text-white"
                      : "bg-surface-variant text-slate-400"
                  }`}
                >
                  {step.number}
                </div>
                <span 
                  className={`text-sm font-medium ${
                    currentStep >= step.number
                      ? "text-slate-300"
                      : "text-slate-400"
                  }`}
                >
                  {step.label}
                </span>
              </div>
              {index < steps.length - 1 && (
                <div className="w-12 h-0.5 bg-surface-variant ml-4"></div>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
