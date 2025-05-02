const LoaderModal = ({ text }: {text: string}) => {
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-gray-800 p-6 rounded-2xl shadow-xl flex flex-col items-center gap-4">
        <div className="loader border-t-4 border-red-500 rounded-full w-12 h-12 animate-spin" />
        <p className="text-lg font-medium text-white">{text}</p>
      </div>
    </div>
  );
};

export default LoaderModal;
