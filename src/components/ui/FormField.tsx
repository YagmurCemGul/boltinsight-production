'use client';

import { forwardRef, type ReactNode, type InputHTMLAttributes, type TextareaHTMLAttributes } from 'react';
import { cn } from '@/lib/utils';
import { Check, AlertCircle, Loader2 } from 'lucide-react';
import { Input, type InputProps } from './input';
import { Textarea, type TextareaProps } from './textarea';

interface FormFieldBaseProps {
  label?: string;
  helperText?: string;
  error?: string;
  success?: string | boolean;
  required?: boolean;
  loading?: boolean;
  characterCount?: { current: number; max: number };
}

type FormFieldInputProps = FormFieldBaseProps & InputProps & {
  as?: 'input';
};

type FormFieldTextareaProps = FormFieldBaseProps & TextareaProps & {
  as: 'textarea';
};

type FormFieldProps = FormFieldInputProps | FormFieldTextareaProps;

/**
 * FormField - Enhanced form input with labels, helper text, and validation states
 *
 * Usage:
 * <FormField
 *   label="Email"
 *   placeholder="Enter your email"
 *   error="Please enter a valid email"
 *   required
 * />
 *
 * <FormField
 *   as="textarea"
 *   label="Description"
 *   success="Looks good!"
 *   characterCount={{ current: 50, max: 200 }}
 * />
 */
export const FormField = forwardRef<HTMLInputElement | HTMLTextAreaElement, FormFieldProps>(
  (props, ref) => {
    const {
      label,
      helperText,
      error,
      success,
      required,
      loading,
      characterCount,
      className,
      as = 'input',
      ...inputProps
    } = props;

    const hasError = !!error;
    const hasSuccess = !!success && !hasError;
    const successMessage = typeof success === 'string' ? success : undefined;

    const stateClasses = cn(
      hasError && 'border-red-500 dark:border-red-400 focus:ring-red-500 dark:focus:ring-red-400',
      hasSuccess && 'border-emerald-500 dark:border-emerald-400 focus:ring-emerald-500 dark:focus:ring-emerald-400'
    );

    const inputElement = as === 'textarea' ? (
      <div className="relative">
        <Textarea
          ref={ref as React.Ref<HTMLTextAreaElement>}
          className={cn(stateClasses, className)}
          aria-invalid={hasError}
          aria-describedby={error ? `${inputProps.id}-error` : helperText ? `${inputProps.id}-helper` : undefined}
          {...(inputProps as TextareaProps)}
        />
        {loading && (
          <div className="absolute right-3 top-3">
            <Loader2 className="w-4 h-4 text-gray-400 animate-spin" />
          </div>
        )}
      </div>
    ) : (
      <div className="relative">
        <Input
          ref={ref as React.Ref<HTMLInputElement>}
          className={cn(
            stateClasses,
            (hasSuccess || hasError || loading) && 'pr-10',
            className
          )}
          aria-invalid={hasError}
          aria-describedby={error ? `${inputProps.id}-error` : helperText ? `${inputProps.id}-helper` : undefined}
          {...(inputProps as InputProps)}
        />
        {/* State icons */}
        <div className="absolute right-3 top-1/2 -translate-y-1/2">
          {loading && <Loader2 className="w-4 h-4 text-gray-400 animate-spin" />}
          {hasError && !loading && <AlertCircle className="w-4 h-4 text-red-500 dark:text-red-400" />}
          {hasSuccess && !loading && <Check className="w-4 h-4 text-emerald-500 dark:text-emerald-400" />}
        </div>
      </div>
    );

    return (
      <div className="space-y-1.5">
        {/* Label */}
        {label && (
          <label
            htmlFor={inputProps.id}
            className={cn(
              'block text-sm font-medium',
              'text-gray-700 dark:text-gray-200'
            )}
          >
            {label}
            {required && <span className="text-red-500 ml-1">*</span>}
          </label>
        )}

        {/* Input */}
        {inputElement}

        {/* Helper text, error, success, and character count */}
        <div className="flex items-center justify-between gap-2">
          <div className="flex-1">
            {error && (
              <p
                id={`${inputProps.id}-error`}
                className="text-sm text-red-600 dark:text-red-400 flex items-center gap-1"
                role="alert"
              >
                {error}
              </p>
            )}
            {successMessage && !error && (
              <p className="text-sm text-emerald-600 dark:text-emerald-400 flex items-center gap-1">
                {successMessage}
              </p>
            )}
            {helperText && !error && !successMessage && (
              <p
                id={`${inputProps.id}-helper`}
                className="text-sm text-gray-500 dark:text-gray-400"
              >
                {helperText}
              </p>
            )}
          </div>
          {characterCount && (
            <p
              className={cn(
                'text-xs',
                characterCount.current > characterCount.max
                  ? 'text-red-500 dark:text-red-400'
                  : 'text-gray-400 dark:text-gray-500'
              )}
            >
              {characterCount.current}/{characterCount.max}
            </p>
          )}
        </div>
      </div>
    );
  }
);

FormField.displayName = 'FormField';

/**
 * FormFieldGroup - Group multiple form fields with consistent spacing
 */
export function FormFieldGroup({
  children,
  className,
  ...props
}: { children: ReactNode } & React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div className={cn('space-y-4', className)} {...props}>
      {children}
    </div>
  );
}

/**
 * FormFieldRow - Horizontal layout for form fields
 */
export function FormFieldRow({
  children,
  className,
  ...props
}: { children: ReactNode } & React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div className={cn('grid grid-cols-2 gap-4', className)} {...props}>
      {children}
    </div>
  );
}
