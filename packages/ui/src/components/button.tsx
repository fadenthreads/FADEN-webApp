"use client";

import * as React from "react";
import { Slot } from "@radix-ui/react-slot";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@faden/utils";

const buttonVariants = cva(
  "inline-flex items-center justify-center whitespace-nowrap text-sm font-medium tracking-wide transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-navy focus-visible:ring-offset-2 focus-visible:ring-offset-background disabled:pointer-events-none disabled:opacity-50",
  {
    variants: {
      variant: {
        default: "bg-gold text-navy hover:bg-gold-light hover:shadow-gold",
        outline:
          "border border-navy/25 bg-transparent text-navy hover:border-navy hover:bg-accent-50",
        ghost: "hover:bg-accent-50 text-foreground",
        link: "text-navy underline-offset-4 hover:text-gold hover:underline",
        luxury:
          "border border-gold/50 bg-gold text-navy hover:bg-gold-light hover:shadow-gold uppercase tracking-widest shadow-md",
        "luxury-outline":
          "border border-navy/30 bg-transparent text-navy hover:border-navy hover:bg-accent-50 uppercase tracking-widest",
      },
      size: {
        default: "h-11 px-8 py-3.5",
        sm: "h-9 px-4 text-xs",
        lg: "h-12 px-10 text-sm",
        icon: "h-10 w-10",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
);

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean;
}

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, asChild = false, ...props }, ref) => {
    const Comp = asChild ? Slot : "button";
    return (
      <Comp className={cn(buttonVariants({ variant, size, className }))} ref={ref} {...props} />
    );
  }
);
Button.displayName = "Button";

export { buttonVariants };
