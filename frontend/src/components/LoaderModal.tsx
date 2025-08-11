import { motion } from "framer-motion";

const LoaderModal = ({ text }: { text: string }) => {
  return (
    <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50">
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.25 }}
        className="bg-gray-900/90 p-8 rounded-2xl shadow-2xl flex flex-col items-center gap-5 border border-gray-700"
      >
        {/* Spinner */}
        <div className="relative flex items-center justify-center">
          <div className="w-14 h-14 border-4 border-gray-600 rounded-full animate-spin border-t-red-500"></div>
        </div>

        {/* Text */}
        <motion.p
          initial={{ opacity: 0.6 }}
          animate={{ opacity: 1 }}
          transition={{ repeat: Infinity, duration: 1.2, repeatType: "reverse" }}
          className="text-lg font-medium text-white tracking-wide"
        >
          {text}
        </motion.p>
      </motion.div>
    </div>
  );
};

export default LoaderModal;
