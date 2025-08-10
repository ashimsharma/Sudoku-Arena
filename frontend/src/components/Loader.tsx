import { motion } from "framer-motion";

export default function Loader() {
  const dots = [0, 1, 2];

  return (
    <div className="flex justify-center items-center min-h-[150px]">
      {dots.map((dot, index) => (
        <motion.span
          key={index}
          className="bg-red-500 rounded-full w-5 h-5 mx-1"
          animate={{
            scale: [1, 1.5, 1],
            opacity: [0.6, 1, 0.6],
          }}
          transition={{
            duration: 1.2,
            repeat: Infinity,
            delay: index * 0.3,
            ease: "easeInOut",
          }}
        />
      ))}
    </div>
  );
}
