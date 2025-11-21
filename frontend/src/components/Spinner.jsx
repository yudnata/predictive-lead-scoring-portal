const Spinner = ({ size = 12 }) => {
  return (
    <div className="flex items-center justify-center min-h-screen bg-dark-bg">
      <div
        className="border-4 border-gray-700 rounded-full border-t-white animate-spin"
        style={{ width: `${size * 4}px`, height: `${size * 4}px` }}
      />
    </div>
  );
};

export default Spinner;
