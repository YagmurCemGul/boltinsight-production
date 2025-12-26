'use client';

import { useState, useEffect, useMemo } from 'react';
import { Bot, Sparkles, Brain, FileSearch, Lightbulb } from 'lucide-react';
import { cn } from '@/lib/utils';

interface AITypingIndicatorProps {
  isVisible: boolean;
  estimatedTime?: number; // in seconds
  stage?: 'analyzing' | 'thinking' | 'generating' | 'reviewing';
  className?: string;
}

const stageConfig = {
  analyzing: {
    icon: FileSearch,
    label: 'Analyzing your input',
    messages: [
      'Reading your message...',
      'Understanding context...',
      'Gathering relevant information...',
    ],
    color: 'text-blue-500',
    bgColor: 'bg-blue-50 dark:bg-blue-900/20',
  },
  thinking: {
    icon: Brain,
    label: 'Processing information',
    messages: [
      'Processing your request...',
      'Considering different approaches...',
      'Formulating response...',
    ],
    color: 'text-purple-500',
    bgColor: 'bg-purple-50 dark:bg-purple-900/20',
  },
  generating: {
    icon: Sparkles,
    label: 'Generating response',
    messages: [
      'Crafting a helpful response...',
      'Adding relevant details...',
      'Structuring the information...',
    ],
    color: 'text-[#5B50BD]',
    bgColor: 'bg-[#EDE9F9] dark:bg-[#231E51]',
  },
  reviewing: {
    icon: Lightbulb,
    label: 'Finalizing suggestions',
    messages: [
      'Reviewing for accuracy...',
      'Final touches...',
      'Almost ready...',
    ],
    color: 'text-amber-500',
    bgColor: 'bg-amber-50 dark:bg-amber-900/20',
  },
};

export function AITypingIndicator({
  isVisible,
  estimatedTime = 5,
  stage = 'thinking',
  className,
}: AITypingIndicatorProps) {
  const [currentStage, setCurrentStage] = useState<keyof typeof stageConfig>(stage);
  const [progress, setProgress] = useState(0);
  const [typedText, setTypedText] = useState('');
  const [currentMessageIndex, setCurrentMessageIndex] = useState(0);
  const [showCursor, setShowCursor] = useState(true);

  // Get current message to type
  const currentMessage = useMemo(() => {
    const messages = stageConfig[currentStage].messages;
    return messages[currentMessageIndex % messages.length];
  }, [currentStage, currentMessageIndex]);

  // Cursor blink effect
  useEffect(() => {
    if (!isVisible) return;

    const cursorInterval = setInterval(() => {
      setShowCursor(prev => !prev);
    }, 530);

    return () => clearInterval(cursorInterval);
  }, [isVisible]);

  // Typewriter effect with natural timing
  useEffect(() => {
    if (!isVisible) {
      setTypedText('');
      return;
    }

    let charIndex = 0;
    const message = currentMessage;

    const typeChar = () => {
      if (charIndex < message.length) {
        setTypedText(message.slice(0, charIndex + 1));
        charIndex++;

        // Natural typing speed variation - slower for effect
        const baseDelay = 60;
        const variation = Math.random() * 40;
        const pauseAtPunctuation = ['.', ',', '!', '?'].includes(message[charIndex - 1]) ? 200 : 0;

        setTimeout(typeChar, baseDelay + variation + pauseAtPunctuation);
      } else {
        // Pause at end then move to next message
        setTimeout(() => {
          setTypedText('');
          setCurrentMessageIndex(prev => prev + 1);
        }, 1500);
      }
    };

    // Start typing after a brief pause
    const startTimeout = setTimeout(typeChar, 300);

    return () => clearTimeout(startTimeout);
  }, [isVisible, currentMessage, currentMessageIndex]);

  // Progress through stages automatically
  useEffect(() => {
    if (!isVisible) {
      setProgress(0);
      setCurrentStage('analyzing');
      setCurrentMessageIndex(0);
      return;
    }

    const stages: (keyof typeof stageConfig)[] = ['analyzing', 'thinking', 'generating', 'reviewing'];

    const timer = setInterval(() => {
      setProgress((prev) => {
        const increment = 100 / (estimatedTime * 20); // Slower progress
        const newProgress = Math.min(prev + increment, 95);

        // Update stage based on progress
        const stageIndex = Math.min(Math.floor(newProgress / 25), 3);
        const newStage = stages[stageIndex];
        if (newStage !== currentStage) {
          setCurrentStage(newStage);
          setTypedText('');
          setCurrentMessageIndex(0);
        }

        return newProgress;
      });
    }, 50);

    return () => clearInterval(timer);
  }, [isVisible, estimatedTime, currentStage]);

  if (!isVisible) return null;

  const config = stageConfig[currentStage];
  const StageIcon = config.icon;

  return (
    <div className={cn('flex items-start gap-3 animate-in fade-in-0 slide-in-from-bottom-2 duration-500', className)}>
      <div className="flex h-8 w-8 items-center justify-center rounded-full bg-[#EDE9F9] dark:bg-[#231E51] animate-pulse">
        <Bot className="h-5 w-5 text-[#5B50BD] dark:text-[#918AD3]" />
      </div>

      <div className="flex-1 max-w-md">
        <div className={cn(
          'rounded-lg px-4 py-3 transition-all duration-500 ease-out',
          config.bgColor
        )}>
          {/* Stage indicator with smooth icon */}
          <div className="flex items-center gap-2 mb-3">
            <div className="relative">
              <StageIcon className={cn('h-4 w-4', config.color)} />
              <div className={cn(
                'absolute inset-0 rounded-full animate-ping opacity-30',
                config.color.replace('text-', 'bg-')
              )} />
            </div>
            <span className={cn('text-sm font-medium transition-colors duration-300', config.color)}>
              {config.label}
            </span>
          </div>

          {/* Typewriter text */}
          <div className="min-h-[24px] mb-3">
            <span className="text-sm text-gray-600 dark:text-gray-300">
              {typedText}
              <span className={cn(
                'inline-block w-0.5 h-4 ml-0.5 align-middle bg-gray-500 dark:bg-gray-400 transition-opacity duration-100',
                showCursor ? 'opacity-100' : 'opacity-0'
              )} />
            </span>
          </div>

          {/* Smooth progress bar */}
          <div className="relative h-1 bg-gray-200/50 dark:bg-gray-600/50 rounded-full overflow-hidden">
            <div
              className="absolute inset-y-0 left-0 bg-gradient-to-r from-[#5B50BD] via-[#918AD3] to-[#1ED6BB] rounded-full transition-all duration-300 ease-out"
              style={{ width: `${progress}%` }}
            />
            {/* Smooth shimmer effect */}
            <div
              className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent"
              style={{
                animation: 'shimmer 2s ease-in-out infinite',
              }}
            />
          </div>
        </div>

        {/* Stage dots with smooth transitions */}
        <div className="flex items-center justify-center gap-1.5 mt-3">
          {Object.keys(stageConfig).map((key, index) => {
            const stageKeys = Object.keys(stageConfig);
            const currentIndex = stageKeys.indexOf(currentStage);
            const isActive = index === currentIndex;
            const isCompleted = index < currentIndex;

            return (
              <div
                key={key}
                className={cn(
                  'rounded-full transition-all duration-500 ease-out',
                  isActive ? 'w-6 h-2 bg-gradient-to-r from-[#5B50BD] to-[#918AD3]' : 'w-2 h-2',
                  isCompleted ? 'bg-[#1ED6BB]' : !isActive && 'bg-gray-300 dark:bg-gray-600'
                )}
              />
            );
          })}
        </div>
      </div>

      <style jsx>{`
        @keyframes shimmer {
          0% {
            transform: translateX(-100%);
          }
          100% {
            transform: translateX(100%);
          }
        }
      `}</style>
    </div>
  );
}

// Simple typing indicator with smoother dots
export function SimpleTypingIndicator({ isVisible }: { isVisible: boolean }) {
  if (!isVisible) return null;

  return (
    <div className="flex items-start gap-3 animate-in fade-in-0 slide-in-from-bottom-2 duration-300">
      <div className="flex h-8 w-8 items-center justify-center rounded-full bg-[#EDE9F9] dark:bg-[#231E51]">
        <Bot className="h-5 w-5 text-[#5B50BD] dark:text-[#918AD3]" />
      </div>
      <div className="flex items-center gap-2 rounded-lg bg-gray-100 dark:bg-gray-700 px-4 py-3">
        <div className="flex gap-1.5">
          <span
            className="h-2 w-2 rounded-full bg-[#5B50BD] dark:bg-[#918AD3]"
            style={{
              animation: 'typingBounce 1.4s ease-in-out infinite',
              animationDelay: '0ms'
            }}
          />
          <span
            className="h-2 w-2 rounded-full bg-[#5B50BD] dark:bg-[#918AD3]"
            style={{
              animation: 'typingBounce 1.4s ease-in-out infinite',
              animationDelay: '200ms'
            }}
          />
          <span
            className="h-2 w-2 rounded-full bg-[#5B50BD] dark:bg-[#918AD3]"
            style={{
              animation: 'typingBounce 1.4s ease-in-out infinite',
              animationDelay: '400ms'
            }}
          />
        </div>
        <span className="text-sm text-gray-500 dark:text-gray-400">Thinking...</span>
      </div>

      <style jsx>{`
        @keyframes typingBounce {
          0%, 60%, 100% {
            transform: translateY(0);
            opacity: 0.4;
          }
          30% {
            transform: translateY(-6px);
            opacity: 1;
          }
        }
      `}</style>
    </div>
  );
}
