import { motion, AnimatePresence } from "framer-motion";
import { IoMdClose } from "react-icons/io";

type Props = {
  message: string;
  visible: boolean;
  onClose?: () => void;
};

export default function ErrorMessage({ message, visible, onClose }: Props) {
  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          initial={{ y: 100, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: 100, opacity: 0 }}
          transition={{ type: "spring", stiffness: 300, damping: 25 }}
          className="fixed bottom-5 left-[70%] transform -translate-x-1/2 bg-slate-800 border-2 border-red-500 text-white px-6 py-3 rounded-lg shadow-lg z-50"
        >
          <div className="flex items-center justify-between gap-4">
            <span>{message}</span>
            {onClose && (
              <button onClick={onClose} className="text-white font-bold ml-4">
                <IoMdClose />
              </button>
            )}
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
