"use client";

import { useState } from "react";
import { Eye, EyeOff } from "lucide-react";
import { cn } from "@faden/utils";
import { TextInput } from "@/components/ui/form-field";

interface PasswordInputProps extends Omit<React.InputHTMLAttributes<HTMLInputElement>, "type"> {
  className?: string;
}

export function PasswordInput({ className, ...props }: PasswordInputProps) {
  const [visible, setVisible] = useState(false);

  return (
    <div className={cn("relative", className)}>
      <TextInput
        {...props}
        type={visible ? "text" : "password"}
        className="pr-11"
      />
      <button
        type="button"
        onClick={() => setVisible((v) => !v)}
        className="absolute right-3 top-1/2 -translate-y-1/2 rounded-full p-1 text-foreground-muted transition-colors hover:text-gold focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gold"
        aria-label={visible ? "Hide password" : "Show password"}
      >
        {visible ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
      </button>
    </div>
  );
}
