import { forwardRef } from "react";

import { cn } from "@/lib/utils";

const variants = {
  primary:
    "bg-emerald-500 text-white shadow-lg shadow-emerald-200 hover:bg-emerald-600 focus-visible:ring-2 focus-visible:ring-emerald-500/60",
  secondary:
    "bg-white text-slate-900 border border-slate-200 hover:border-emerald-200 hover:text-emerald-600 focus-visible:ring-2 focus-visible:ring-emerald-500/30",
  ghost:
    "bg-transparent text-slate-700 hover:text-emerald-600 hover:bg-emerald-50 focus-visible:ring-2 focus-visible:ring-emerald-500/30",
};

const sizes = {
  sm: "text-sm px-3 py-1.5",
  md: "text-sm px-4 py-2",
  lg: "text-base px-5 py-3",
};

/**
 * Accessible button with GreenChain theming and small variant API.
 * @param {object} props
 * @param {"primary"|"secondary"|"ghost"} [props.variant="primary"]
 * @param {"sm"|"md"|"lg"} [props.size="md"]
 */
const Button = forwardRef(function Button(
  {
    as: Component = "button",
    className,
    variant = "primary",
    size = "md",
    children,
    type,
    ...props
  },
  ref,
) {
  const resolvedVariant = variants[variant] ?? variants.primary;
  const resolvedSize = sizes[size] ?? sizes.md;
  const buttonType =
    typeof Component === "string" && Component === "button"
      ? type ?? "button"
      : undefined;

  return (
    <Component
      ref={ref}
      type={buttonType}
      className={cn(
        "inline-flex items-center justify-center rounded-full font-medium transition-all duration-150 focus:outline-none focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50",
        resolvedVariant,
        resolvedSize,
        className,
      )}
      {...props}
    >
      {children}
    </Component>
  );
});

export default Button;

