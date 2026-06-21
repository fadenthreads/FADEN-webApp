"use client";

import { cn } from "@faden/utils";

interface FormFieldProps {
  label: string;
  hint?: string;
  children: React.ReactNode;
  className?: string;
}

export function FormField({ label, hint, children, className }: FormFieldProps) {
  return (
    <div className={cn("space-y-1", className)}>
      <label className="faden-label">{label}</label>
      {children}
      {hint && <p className="faden-hint">{hint}</p>}
    </div>
  );
}

export function TextInput(props: React.InputHTMLAttributes<HTMLInputElement>) {
  return <input className="faden-field" {...props} />;
}

export function TextArea(props: React.TextareaHTMLAttributes<HTMLTextAreaElement>) {
  return <textarea className="faden-field min-h-[100px] resize-y" {...props} />;
}

export function SelectInput({
  options,
  ...props
}: React.SelectHTMLAttributes<HTMLSelectElement> & { options: { value: string; label: string }[] }) {
  return (
    <select className="faden-field" {...props}>
      {options.map((o, index) => (
        <option key={`${o.value}-${o.label}-${index}`} value={o.value}>
          {o.label}
        </option>
      ))}
    </select>
  );
}
