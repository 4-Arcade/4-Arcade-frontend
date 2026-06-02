import { type ButtonHTMLAttributes, type ReactNode } from "react";

type ButtonVariant = "primary" | "secondary" | "ghost" | "large";

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
  children: ReactNode;
}

const variantStyles: Record<ButtonVariant, string> = {
  primary:
    "bg-blue-600 text-white font-semibold text-[15px] px-6 py-3 rounded-[12px] hover:bg-blue-700 transition-colors",
  secondary:
    "bg-blue-50 text-blue-600 font-semibold text-[15px] px-6 py-3 rounded-[12px] border border-blue-200 hover:bg-blue-100 transition-colors",
  ghost:
    "text-text-secondary font-medium text-[15px] px-6 py-3 rounded-[12px] hover:bg-bg-input transition-colors",
  large:
    "bg-blue-600 text-white font-bold text-[17px] px-8 py-4 rounded-[16px] hover:bg-blue-700 transition-colors",
};

export default function Button({
  variant = "primary",
  children,
  className = "",
  ...props
}: ButtonProps) {
  return (
    <button
      className={`inline-flex items-center justify-center gap-2 cursor-pointer ${variantStyles[variant]} ${className}`}
      {...props}
    >
      {children}
    </button>
  );
}
