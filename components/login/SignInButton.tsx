import { motion } from "framer-motion";
import { ArrowRight } from "lucide-react";
import { BTN_PRIMARY } from "../../app/constants/tailwind";

type Props = {
  children: React.ReactNode;
  className?: string;
};

export default function SignInButton({ children, className }: Props) {
  return (
    <motion.button
      type="submit"
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
      className={`${className ?? BTN_PRIMARY} group/btn`}
    >
      {/* Subtle sweep effect on hover */}
      <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full group-hover/btn:animate-[shimmer_1s_infinite] pointer-events-none"></div>
      {children}
    </motion.button>
  );
}
