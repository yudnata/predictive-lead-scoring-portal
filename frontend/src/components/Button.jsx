const variants = {
  primary: 'bg-brand hover:bg-brand-hover text-white',
  secondary: 'bg-gray-700 hover:bg-gray-600 text-white',
  danger: 'bg-status-danger hover:bg-red-700 text-white',
  outline: 'border border-gray-600 text-gray-300 hover:bg-dark-hover',
};

const Button = ({ children, variant = 'primary', className = '', ...props }) => {
  return (
    <button 
      className={`px-4 py-2 rounded-lg font-semibold transition-all disabled:opacity-50 ${variants[variant]} ${className}`}
      {...props}
    >
      {children}
    </button>
  );
};

export default Button;