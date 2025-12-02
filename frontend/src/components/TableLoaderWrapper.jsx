import Spinner from './Spinner';

const TableLoaderWrapper = ({ loading, children }) => {
  return (
    <div className="relative min-h-[300px] w-full transition-all duration-300">
      <div
        className={`transition-opacity duration-300 ease-in-out ${
          loading ? 'opacity-40 pointer-events-none blur-[1px]' : 'opacity-100'
        }`}
      >
        {children}
      </div>

      {loading && (
        <div className="absolute inset-0 z-10 flex items-center justify-center">
          <Spinner
            size={10}
            fullScreen={false}
          />
        </div>
      )}
    </div>
  );
};

export default TableLoaderWrapper;
