import { motion, AnimatePresence } from "framer-motion";
import { IoMdClose } from "react-icons/io";
import ReactDOM from "react-dom";

type Props = {
	message: string;
	visible: boolean;
	onClose?: () => void;
};

export default function ErrorMessage({ message, visible, onClose }: Props) {
	return (
		<AnimatePresence>
			{visible && (
				<FixedHUD
					message={message}
					visible={visible}
					onClose={onClose}
				/>
			)}
		</AnimatePresence>
	);
}

function FixedHUD({ message, visible, onClose }: Props) {
	return ReactDOM.createPortal(
		<motion.div
			initial={{ y: 100, opacity: 0 }}
			animate={{ y: 0, opacity: 1 }}
			exit={{ y: 100, opacity: 0 }}
			transition={{ type: "spring", stiffness: 300, damping: 25 }}
			className="fixed bottom-10 left-[85%] transform -translate-x-1/2 bg-slate-800 border-2 p-2 border-red-500 text-white rounded-lg shadow-lg z-50"
		>
			<div className="flex gap-4">
				<span className="flex items-center">{message}</span>
				{onClose && (
					<div className="flex items-start justify-end ml-auto">
						<button
							onClick={onClose}
							className="p-1 rounded-full hover:bg-gray-700 transition"
						>
							<IoMdClose />
						</button>
					</div>
				)}
			</div>
		</motion.div>,
		document.body
	);
}
