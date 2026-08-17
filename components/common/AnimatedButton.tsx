import { motion, MotionProps } from "framer-motion";
import React from "react";

type AnimatedButtonProps = {
  /** Tailwind / custom classes for the button */
  className?: string;
  /** Button type – defaults to "button" */
  type?: "button" | "submit" | "reset";
  /** Optional click handler */
  onClick?: () => void;
  /** Children – button label or inner JSX */
  children: React.ReactNode;
} & MotionProps;

/**
 * Re‑usable button that encapsulates the common motion hover / tap animation
 * and the subtle sweep‑effect overlay used across the app.
 *
 * Any component that needs the same animated feel can import this and pass its
 * own `className` (or use the Tailwind constants from `app/constants/tailwind`).
 */
export default function AnimatedButton({
  className = "",
  type = "button",
  onClick,
  children,
  ...motionProps
}: AnimatedButtonProps) {
  return (
    <motion.button
      type={type}
      onClick={onClick}
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
      {...motionProps}
      className={className}
    >
      {/* Subtle sweep effect on hover */}
      <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full group-hover/btn:animate-[shimmer_1s_infinite] pointer-events-none"></div>
      {children}
    </motion.button>
  );
}
