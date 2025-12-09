const Spinner = ({ size = 12, fullScreen = true }) => {
  return (
    <div
      className={`flex items-center justify-center ${
        fullScreen ? 'min-h-screen bg-white dark:bg-[#121212] transition-colors duration-300' : 'w-full h-full'
      }`}
    >
      <div
        className="border-4 border-gray-300 dark:border-gray-700 rounded-full border-t-blue-600 dark:border-t-white animate-spin transition-colors duration-300"
        style={{ width: `${size * 4}px`, height: `${size * 4}px` }}
      />
    </div>
  );
};

export default Spinner;
