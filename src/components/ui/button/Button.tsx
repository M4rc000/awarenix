// Button.tsx
import { ReactNode } from "react";

const sizeClasses = {
  xs: "px-2 py-1 text-xs",
  sm: "px-3 py-2 text-sm",
  md: "px-5 py-3.5 text-sm",
} as const;

const variantClasses = {
  primary:
    "bg-brand-500 text-white shadow-theme-xs hover:bg-brand-600 disabled:bg-brand-300",
  outline:
    "bg-white text-gray-700 ring-1 ring-inset ring-gray-300 hover:bg-gray-50 dark:bg-gray-800 dark:text-gray-400 dark:ring-gray-700 dark:hover:bg-white/[0.03] dark:hover:text-gray-300",
  danger:
    "bg-red-500 text-white shadow-theme-xs hover:bg-red-600 disabled:bg-red-300",
  warning:
    "bg-yellow-500 text-white shadow-theme-xs hover:bg-yellow-600 disabled:bg-yellow-300",
  info:
    "bg-cyan-500 text-white shadow-theme-xs hover:bg-cyan-600 disabled:bg-blue-300",
  success:
    "bg-green-500 text-white shadow-theme-xs hover:bg-green-600 disabled:bg-green-300",
} as const;

// derive the literal union type from the keys of variantClasses
type Variant = keyof typeof variantClasses;
type Size = keyof typeof sizeClasses;

interface ButtonProps {
  children: ReactNode;
  size?: Size;
  variant?: Variant;
  startIcon?: ReactNode;
  endIcon?: ReactNode;
  onClick?: () => void;
  disabled?: boolean;
  className?: string;
  type?:      "button" | "submit" | "reset";
}

const Button: React.FC<ButtonProps> = ({
  children,
  size = "md",
  variant = "primary",
  startIcon,
  endIcon,
  onClick,
  className = "",
  disabled = false,
  type      = "button",
}) => {
  return (
    <button
      type={type}              
      className={[
        "inline-flex items-center justify-center gap-2 rounded-lg transition",
        sizeClasses[size],
        variantClasses[variant],
        className,
        disabled ? "cursor-not-allowed opacity-50" : "",
      ]
        .filter(Boolean)
        .join(" ")}
      onClick={onClick}
      disabled={disabled}
    >
      {startIcon && <span className="flex items-center mr-1">{startIcon}</span>}
      {children}
      {endIcon && <span className="flex items-center ml-1">{endIcon}</span>}
    </button>
  );
};

export default Button;