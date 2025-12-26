'use client';

import { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import {
  X,
  ChevronRight,
  ChevronLeft,
  LayoutDashboard,
  FileText,
  MessageSquare,
  Calculator,
  BookOpen,
  Check,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { BoltLogoIcon } from '@/components/ui/BoltLogo';

interface OnboardingStep {
  id: string;
  title: string;
  description: string;
  icon: React.ReactNode;
  highlight?: string; // CSS selector to highlight
}

const onboardingSteps: OnboardingStep[] = [
  {
    id: 'welcome',
    title: 'Welcome to BoltInsight',
    description:
      'Your AI-powered research proposal platform. Let us show you around to get you started quickly.',
    icon: <BoltLogoIcon className="w-8 h-8" variant="dark" />,
  },
  {
    id: 'dashboard',
    title: 'Dashboard Overview',
    description:
      'Your dashboard shows recent proposals, notifications, and quick actions. Customize it by dragging widgets or using the settings button.',
    icon: <LayoutDashboard className="w-8 h-8" />,
  },
  {
    id: 'new-proposal',
    title: 'Create New Proposals',
    description:
      'Start creating proposals using our AI-powered chat interface. Simply describe your research needs and our AI will help structure your proposal.',
    icon: <FileText className="w-8 h-8" />,
  },
  {
    id: 'editor-modes',
    title: 'Multiple Editor Modes',
    description:
      'Switch between Chat Mode for AI-assisted creation and Document Editor for structured input, formatting, and export.',
    icon: <MessageSquare className="w-8 h-8" />,
  },
  {
    id: 'tools',
    title: 'Research Tools',
    description:
      'Access powerful tools like Sample Size Calculators, Demographic Distribution analysis, and Feasibility Checks to ensure your research is statistically sound.',
    icon: <Calculator className="w-8 h-8" />,
  },
  {
    id: 'library',
    title: 'Resource Library',
    description:
      'Explore templates, methodologies, and best practices in our library. Use these resources to enhance your proposals with proven research frameworks.',
    icon: <BookOpen className="w-8 h-8" />,
  },
];

interface OnboardingTourProps {
  isOpen: boolean;
  onComplete: () => void;
  onSkip: () => void;
}

export function OnboardingTour({ isOpen, onComplete, onSkip }: OnboardingTourProps) {
  const [currentStep, setCurrentStep] = useState(0);
  const [isAnimating, setIsAnimating] = useState(false);

  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    }
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isOpen]);

  const handleNext = () => {
    if (currentStep < onboardingSteps.length - 1) {
      setIsAnimating(true);
      setTimeout(() => {
        setCurrentStep((prev) => prev + 1);
        setIsAnimating(false);
      }, 150);
    } else {
      onComplete();
    }
  };

  const handlePrev = () => {
    if (currentStep > 0) {
      setIsAnimating(true);
      setTimeout(() => {
        setCurrentStep((prev) => prev - 1);
        setIsAnimating(false);
      }, 150);
    }
  };

  const handleStepClick = (index: number) => {
    setIsAnimating(true);
    setTimeout(() => {
      setCurrentStep(index);
      setIsAnimating(false);
    }, 150);
  };

  if (!isOpen) return null;

  const step = onboardingSteps[currentStep];
  const isLastStep = currentStep === onboardingSteps.length - 1;

  const modalContent = (
    <div className="fixed inset-0 z-[300] flex items-center justify-center">
      {/* Backdrop with subtle gradient */}
      <div className="fixed inset-0 bg-gradient-to-br from-[#5B50BD]/20 via-black/60 to-[#1ED6BB]/20 backdrop-blur-sm" />

      {/* Modal */}
      <div className="relative z-[301] w-full max-w-lg mx-4">
        <div className="bg-white dark:bg-[#1A163C] rounded-2xl shadow-2xl overflow-hidden">
          {/* Header with close button */}
          <div className="absolute top-4 right-4 z-10">
            <button
              onClick={onSkip}
              className="p-2 rounded-full bg-gray-100 dark:bg-[#231E51] hover:bg-gray-200 dark:hover:bg-[#3D3766] transition-colors"
              aria-label="Skip tour"
            >
              <X className="w-4 h-4 text-gray-500 dark:text-gray-400" />
            </button>
          </div>

          {/* Progress indicator */}
          <div className="flex gap-1.5 px-6 pt-6">
            {onboardingSteps.map((_, index) => (
              <button
                key={index}
                onClick={() => handleStepClick(index)}
                className={cn(
                  'h-1.5 flex-1 rounded-full transition-all duration-300',
                  index <= currentStep
                    ? 'bg-[#5B50BD] dark:bg-[#918AD3]'
                    : 'bg-gray-200 dark:bg-[#3D3766]'
                )}
                aria-label={`Go to step ${index + 1}`}
              />
            ))}
          </div>

          {/* Content */}
          <div className="p-8 pt-6">
            <div
              className={cn(
                'transition-all duration-150',
                isAnimating ? 'opacity-0 translate-x-4' : 'opacity-100 translate-x-0'
              )}
            >
              {/* Icon with gradient background */}
              <div className="mb-6 flex justify-center">
                <div className="p-4 rounded-2xl bg-gradient-to-br from-[#5B50BD] to-[#1ED6BB] text-white shadow-lg">
                  {step.icon}
                </div>
              </div>

              {/* Step counter */}
              <p className="text-sm text-[#5B50BD] dark:text-[#918AD3] font-medium text-center mb-2">
                Step {currentStep + 1} of {onboardingSteps.length}
              </p>

              {/* Title */}
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white text-center mb-4">
                {step.title}
              </h2>

              {/* Description */}
              <p className="text-gray-600 dark:text-gray-300 text-center leading-relaxed">
                {step.description}
              </p>
            </div>
          </div>

          {/* Footer */}
          <div className="px-8 pb-8 flex items-center justify-between">
            <Button
              variant="ghost"
              onClick={handlePrev}
              disabled={currentStep === 0}
              className={cn(
                'flex items-center gap-2',
                currentStep === 0 && 'invisible'
              )}
            >
              <ChevronLeft className="w-4 h-4" />
              Back
            </Button>

            <div className="flex gap-2">
              <Button variant="outline" onClick={onSkip}>
                Skip Tour
              </Button>
              <Button
                onClick={handleNext}
                className="bg-[#5B50BD] hover:bg-[#4A41A0] text-white flex items-center gap-2"
              >
                {isLastStep ? (
                  <>
                    Get Started
                    <Check className="w-4 h-4" />
                  </>
                ) : (
                  <>
                    Next
                    <ChevronRight className="w-4 h-4" />
                  </>
                )}
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  if (typeof document !== 'undefined') {
    return createPortal(modalContent, document.body);
  }

  return modalContent;
}
