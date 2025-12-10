import { useUploadProgress } from '../context/useUploadProgress';

const UploadProgressToast = () => {
  const { progress, isVisible, dismiss } = useUploadProgress();

  if (!isVisible) return null;

  const progressPercent =
    progress.total > 0 ? Math.round((progress.saved / progress.total) * 100) : 0;

  return (
    <div className="fixed bottom-6 right-6 z-[9999] animate-slideUp">
      <style>
        {`
          @keyframes slideUp {
            from { opacity: 0; transform: translateY(10px); }
            to { opacity: 1; transform: translateY(0); }
          }
          .animate-slideUp {
            animation: slideUp 0.3s cubic-bezier(0.16, 1, 0.3, 1) forwards;
          }
        `}
      </style>

      <div className="w-80 bg-white dark:bg-[#1A1A1A] rounded-lg shadow-[0_4px_20px_-2px_rgba(0,0,0,0.1)] dark:shadow-[0_4px_20px_-4px_rgba(0,0,0,0.4)] border border-gray-200 dark:border-neutral-800 p-4">
        <div className="flex items-start justify-between mb-3">
          <div className="flex items-center gap-3">
            {progress.status === 'processing' || progress.status === 'pending' ? (
              <div className="w-4 h-4 border-2 border-indigo-600/30 border-t-indigo-600 dark:border-indigo-400/30 dark:border-t-indigo-400 rounded-full animate-spin" />
            ) : progress.status === 'complete' ? (
              <svg
                className="w-4 h-4 text-emerald-600 dark:text-emerald-500"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M5 13l4 4L19 7"
                />
              </svg>
            ) : (
              <svg
                className="w-4 h-4 text-red-600 dark:text-red-500"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
            )}
            <div>
              <h4 className="text-sm font-semibold text-gray-900 dark:text-gray-100">
                {progress.status === 'complete'
                  ? 'Import Completed'
                  : progress.status === 'error'
                  ? 'Import Failed'
                  : 'Importing Leads...'}
              </h4>
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
                {progress.status === 'error'
                  ? 'Please check the file and try again'
                  : progress.status === 'complete'
                  ? `${progress.saved.toLocaleString()} leads successfully added`
                  : 'Processing CSV file in background'}
              </p>
            </div>
          </div>

          <button
            onClick={dismiss}
            className="text-gray-400 hover:text-gray-600 dark:text-gray-500 dark:hover:text-gray-300 transition-colors p-1"
          >
            <svg
              className="w-4 h-4"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={1.5}
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          </button>
        </div>
        {progress.status !== 'error' && (
          <div className="space-y-1.5">
            <div className="flex justify-between text-xs">
              <span className="text-gray-500 dark:text-gray-400 font-medium font-mono">
                {progress.saved.toLocaleString()}{' '}
                <span className="text-gray-300 dark:text-gray-600">/</span>{' '}
                {progress.total > 0 ? progress.total.toLocaleString() : '--'}
              </span>
              <span className="text-gray-700 dark:text-gray-300 font-medium">
                {progressPercent}%
              </span>
            </div>
            <div className="w-full h-1.5 bg-gray-100 dark:bg-neutral-800 rounded-full overflow-hidden">
              <div
                className={`h-full transition-all duration-500 ease-out rounded-full ${
                  progress.status === 'complete'
                    ? 'bg-emerald-500 dark:bg-emerald-600'
                    : 'bg-indigo-600 dark:bg-indigo-500'
                }`}
                style={{ width: `${progressPercent}%` }}
              />
            </div>
          </div>
        )}
        {progress.status === 'error' && progress.error && (
          <div className="mt-2 p-2 bg-red-50 dark:bg-red-900/10 rounded border border-red-100 dark:border-red-900/20">
            <p className="text-xs text-red-600 dark:text-red-400 leading-relaxed">
              {progress.error}
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default UploadProgressToast;
