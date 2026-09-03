import React from 'react';
import { Check } from 'lucide-react';

interface StepIndicatorProps {
  currentStep: number;
  totalSteps: number;
  onSelectStep?: (step: number) => void;
}

const steps = [
  { step: 1, label: 'Vị trí' },
  { step: 2, label: 'Phân loại' },
  { step: 3, label: 'Đánh giá' },
  { step: 4, label: 'Ảnh & Nộp' },
];

export const StepIndicator: React.FC<StepIndicatorProps> = ({
  currentStep,
  onSelectStep,
}) => {
  const progressPercent = ((currentStep - 1) / (steps.length - 1)) * 100;

  return (
    <div className="step-indicator-container">
      <div className="step-indicator-bar">
        {/* Đường nối tiến trình */}
        <div className="step-connector">
          <div
            className="step-connector-progress"
            style={{ width: `${progressPercent}%` }}
          />
        </div>

        {/* Các nút tròn từng bước */}
        {steps.map((item) => {
          const isCompleted = currentStep > item.step;
          const isActive = currentStep === item.step;

          return (
            <div
              key={item.step}
              className={`step-item ${isActive ? 'active' : ''} ${
                isCompleted ? 'completed' : ''
              }`}
              onClick={() => {
                // Chỉ cho phép click quay lại các bước đã hoàn thành
                if (isCompleted && onSelectStep) {
                  onSelectStep(item.step);
                }
              }}
            >
              <div className="step-bubble">
                {isCompleted ? <Check size={16} strokeWidth={3} /> : item.step}
              </div>
              <span className="step-label">{item.label}</span>
            </div>
          );
        })}
      </div>
    </div>
  );
};
