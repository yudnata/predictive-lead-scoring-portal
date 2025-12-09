const StatCard = ({ title, value, detail, valueColor = 'text-gray-900 dark:text-white', detailBg = '' }) => {
  return (
    <div className="flex flex-col justify-between h-32 p-5 transition-all rounded-lg shadow-lg bg-white dark:bg-[#1E1E1E]">
      <p className="text-sm font-medium tracking-wider text-gray-500 dark:text-white/80 uppercase">{title}</p>
      <div className="flex items-end justify-between">
        <h2 className={`text-4xl font-bold ${valueColor}`}>{value}</h2>
        {detail && (
          <span className={`px-2 py-0.5 text-xs font-bold rounded-md ${detailBg} text-white`}>
            {detail}
          </span>
        )}
      </div>
    </div>
  );
};

export default StatCard;
