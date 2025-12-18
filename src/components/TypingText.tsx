import { motion } from "framer-motion";

interface TypingTextProps {
  text: string;
  className?: string;
  delay?: number;
}

export const TypingText = ({ text, className = "", delay = 0 }: TypingTextProps) => {
  const characters = text.split("");

  return (
    <motion.span
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ delay }}
      className={className}
    >
      {characters.map((char, index) => (
        <motion.span
          key={index}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{
            delay: delay + index * 0.03,
            duration: 0.01,
          }}
        >
          {char}
        </motion.span>
      ))}
    </motion.span>
  );
};
