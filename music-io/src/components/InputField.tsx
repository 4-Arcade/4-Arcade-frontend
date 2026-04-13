import { type InputHTMLAttributes } from "react";

interface InputFieldProps extends InputHTMLAttributes<HTMLInputElement> {
  label: string;
}

export default function InputField({
  label,
  className = "",
  ...props
}: InputFieldProps) {
  return (
    <div className={`flex flex-col gap-1.5 ${className}`}>
      <label className="text-text-secondary text-[13px] font-medium">
        {label}
      </label>
      <input
        className="bg-bg-input border border-border rounded-[12px] px-4 py-3 text-[14px] text-text-primary placeholder:text-text-tertiary outline-none focus:border-border-focus transition-colors"
        {...props}
      />
    </div>
  );
}
