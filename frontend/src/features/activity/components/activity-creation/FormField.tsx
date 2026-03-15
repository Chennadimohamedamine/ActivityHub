import React from 'react';

interface FormFieldProps {
  label: string;
  icon: React.ReactNode;
  error?: string;
  children: React.ReactNode;
}

export const FormField = ({ label, icon, error, children }: FormFieldProps) => (
  <div className="w-full flex flex-col">
    <label className="text-sm font-semibold text-white flex items-center gap-2 mb-2">
      <span className="text-orange-500">{icon}</span>
      {label}
    </label>

    {children}

    {/* reserved space for the errors place */}
    <div className="h-5 mt-1">
      {error && (
        <p className="text-red-400 text-xs font-medium animate-in fade-in slide-in-from-top-1">
          {error}
        </p>
      )}
    </div>
  </div>
);
