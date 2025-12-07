import { useNavigate } from 'react-router-dom';
import { createPortal } from 'react-dom';

const UnauthorizedModal = () => {
  const navigate = useNavigate();

  return createPortal(
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm">
      <div className="bg-[#1E1E1E] border border-gray-700 p-8 rounded-2xl shadow-2xl max-w-md w-full text-center transform transition-all scale-100">
        <div className="flex justify-center mb-4">
          <div className="p-3 rounded-full bg-red-500/10">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="w-8 h-8 text-red-500"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"
              />
            </svg>
          </div>
        </div>

        <h2 className="mb-2 text-2xl font-bold text-white">Akses Ditolak</h2>
        <p className="mb-6 text-gray-400">
          Anda harus login terlebih dahulu untuk mengakses halaman dashboard ini.
        </p>

        <button
          onClick={() => navigate('/login')}
          className="w-full px-6 py-3 font-semibold text-white transition-all rounded-lg bg-brand hover:bg-brand-hover hover:shadow-lg"
        >
          Sign In Sekarang
        </button>
      </div>
    </div>,
    document.body
  );
};

export default UnauthorizedModal;
