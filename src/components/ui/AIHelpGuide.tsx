'use client';

import { useState, useEffect } from 'react';
import { X, Sparkles, ArrowRight, CheckCircle } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from './button';

interface AIHelpGuideProps {
  featureKey: string; // Unique key for localStorage
  title?: string;
  steps?: { title: string; description: string }[];
  position?: 'top' | 'bottom' | 'left' | 'right' | 'center';
  className?: string;
  onDismiss?: () => void;
}

const defaultSteps = [
  {
    title: 'Type @ to Start',
    description: 'Begin typing @ in any AI-enabled field to activate intelligent suggestions.',
  },
  {
    title: 'Get Smart Suggestions',
    description: 'AI analyzes your input and suggests relevant data from Meta Learnings and past proposals.',
  },
  {
    title: 'Auto-Fill Fields',
    description: 'Select a suggestion to automatically fill the field with accurate data.',
  },
];

export function AIHelpGuide({
  featureKey,
  title = 'AI-Powered Input',
  steps = defaultSteps,
  position = 'bottom',
  className,
  onDismiss,
}: AIHelpGuideProps) {
  const [isVisible, setIsVisible] = useState(false);
  const [currentStep, setCurrentStep] = useState(0);

  const storageKey = `ai-help-guide-${featureKey}-dismissed`;

  useEffect(() => {
    // Check if user has already dismissed this guide
    const isDismissed = localStorage.getItem(storageKey);
    if (!isDismissed) {
      // Delay showing the guide slightly for better UX
      const timer = setTimeout(() => {
        setIsVisible(true);
      }, 500);
      return () => clearTimeout(timer);
    }
  }, [storageKey]);

  const handleDismiss = () => {
    localStorage.setItem(storageKey, 'true');
    setIsVisible(false);
    onDismiss?.();
  };

  const handleNext = () => {
    if (currentStep < steps.length - 1) {
      setCurrentStep(currentStep + 1);
    } else {
      handleDismiss();
    }
  };

  if (!isVisible) return null;

  const positionClasses = {
    top: 'bottom-full mb-3',
    bottom: 'top-full mt-3',
    left: 'right-full mr-3',
    right: 'left-full ml-3',
    center: 'fixed inset-0 flex items-center justify-center bg-black/50 z-50',
  };

  const content = (
    <div
      className={cn(
        'bg-white dark:bg-[#1A163C] rounded-xl shadow-2xl border border-gray-200 dark:border-[#3D3766] overflow-hidden',
        position === 'center' ? 'max-w-md w-full mx-4' : 'w-[320px]',
        position !== 'center' && 'absolute z-50',
        position !== 'center' && positionClasses[position],
        className
      )}
    >
      {/* Header */}
      <div className="bg-gradient-to-r from-[#5B50BD] to-[#7B6FD6] px-4 py-3 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="w-6 h-6 bg-white/20 rounded-lg flex items-center justify-center">
            <span className="text-white text-xs font-bold">AI</span>
          </div>
          <span className="text-white font-semibold text-sm">{title}</span>
        </div>
        <button
          onClick={handleDismiss}
          className="text-white/80 hover:text-white transition-colors"
        >
          <X className="w-4 h-4" />
        </button>
      </div>

      {/* Content */}
      <div className="p-4">
        {/* Step indicator */}
        <div className="flex gap-1.5 mb-4">
          {steps.map((_, index) => (
            <div
              key={index}
              className={cn(
                'h-1.5 flex-1 rounded-full transition-colors',
                index <= currentStep
                  ? 'bg-[#5B50BD] dark:bg-[#918AD3]'
                  : 'bg-gray-200 dark:bg-gray-700'
              )}
            />
          ))}
        </div>

        {/* Current step */}
        <div className="mb-4">
          <div className="flex items-center gap-2 mb-2">
            <div className="w-6 h-6 bg-[#EDE9F9] dark:bg-[#231E51] rounded-full flex items-center justify-center">
              <span className="text-[#5B50BD] dark:text-[#918AD3] text-xs font-bold">
                {currentStep + 1}
              </span>
            </div>
            <h3 className="font-semibold text-gray-900 dark:text-white text-sm">
              {steps[currentStep].title}
            </h3>
          </div>
          <p className="text-gray-600 dark:text-gray-400 text-sm leading-relaxed pl-8">
            {steps[currentStep].description}
          </p>
        </div>

        {/* Actions */}
        <div className="flex gap-2">
          <Button
            variant="ghost"
            size="sm"
            onClick={handleDismiss}
            className="flex-1 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
          >
            Skip
          </Button>
          <Button
            size="sm"
            onClick={handleNext}
            className="flex-1 bg-[#5B50BD] hover:bg-[#4A3FA6] text-white"
          >
            {currentStep < steps.length - 1 ? (
              <>
                Next
                <ArrowRight className="w-3 h-3 ml-1" />
              </>
            ) : (
              <>
                Got it
                <CheckCircle className="w-3 h-3 ml-1" />
              </>
            )}
          </Button>
        </div>
      </div>
    </div>
  );

  if (position === 'center') {
    return <div className={positionClasses.center}>{content}</div>;
  }

  return content;
}

// Hook to reset help guides (for testing)
export function useResetAIHelpGuides() {
  return () => {
    const keys = Object.keys(localStorage).filter(key =>
      key.startsWith('ai-help-guide-')
    );
    keys.forEach(key => localStorage.removeItem(key));
  };
}
