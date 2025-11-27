import { forwardRef } from "react";

import { cn } from "@/lib/utils";

/**
 * Reusable input with label, helper, and error messaging.
 */
const Input = forwardRef(function Input(
  {
    id,
    label,
    helperText,
    error,
    className,
    type = "text",
    required,
    ...props
  },
  ref,
) {
  const helperId = helperText ? `${id}-helper` : undefined;
  const errorId = error ? `${id}-error` : undefined;

  return (
    <label className="flex flex-col gap-1.5 text-sm font-medium text-slate-700 dark:text-slate-200">
      {label}
      <input
        id={id}
        ref={ref}
        type={type}
        required={required}
        aria-invalid={Boolean(error)}
        aria-describedby={error ? errorId : helperId}
        className={cn(
          "w-full rounded-2xl border border-slate-200 bg-white px-4 py-2.5 text-slate-900 outline-none transition-all placeholder:text-slate-400 focus:border-emerald-400 focus:ring-2 focus:ring-emerald-200 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100",
          error && "border-rose-300 focus:border-rose-400 focus:ring-rose-100",
          className,
        )}
        {...props}
      />
      {helperText && !error && (
        <span id={helperId} className="text-xs font-normal text-slate-500">
          {helperText}
        </span>
      )}
      {error && (
        <span id={errorId} className="text-xs font-medium text-rose-500">
          {error}
        </span>
      )}
    </label>
  );
});

export default Input;

