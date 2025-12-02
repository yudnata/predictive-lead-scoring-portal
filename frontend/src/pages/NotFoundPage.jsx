import Lottie from 'lottie-react';
import notFoundAnimation from '../assets/lottie/404.json';

const NotFoundPage = () => {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen px-4 text-white bg-dark-bg">
      <div className="w-full max-w-lg">
        <Lottie animationData={notFoundAnimation} loop={true} />
      </div>
      <div className="text-center">
        <h2 className="mb-2 text-3xl font-semibold">Page Not Found</h2>
        <p className="mb-6 text-gray-400">
          The page you are looking for is temporarily unavailable.
        </p>
        <button
          onClick={() => window.history.back()}
          className="px-6 py-2 text-black transition bg-white rounded-lg shadow hover:bg-gray-200"
        >
          Back
        </button>
      </div>
    </div>
  );
};

export default NotFoundPage;
