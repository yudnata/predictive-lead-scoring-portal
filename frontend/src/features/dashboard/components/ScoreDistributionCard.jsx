const ScoreDistributionCard = ({ data }) => {
  if (!data || !Array.isArray(data)) {
    return (
      <div className="flex items-center justify-center h-full p-5 rounded-lg shadow-lg bg-dark-card ">
        <p className="text-sm text-gray-500">Data tidak tersedia</p>
      </div>
    );
  }

  let currentPercent = 0;
  const gradientParts = data.map((item) => {
    const value = parseInt(item.percentage.replace('%', '')) || 0;
    const start = currentPercent;
    const end = currentPercent + value;
    currentPercent = end;
    return `${item.color} ${start}% ${end}%`;
  });

  const backgroundStyle = data.length > 0 ? `conic-gradient(${gradientParts.join(', ')})` : '#333';

  return (
    <div className="flex flex-row items-center justify-between h-full p-5 rounded-lg shadow-lg bg-dark-card">
      <div className="flex flex-col justify-between w-1/2 h-full">
        <h3 className="mb-4 text-lg font-semibold text-white">Distribution Leads Score</h3>

        <ul className="space-y-2 text-sm">
          {data.map((item, index) => (
            <li
              key={index}
              className="flex items-center gap-3"
            >
              <span
                className="flex-shrink-0 w-3 h-3 rounded-full"
                style={{ backgroundColor: item.color }}
              ></span>
              <span className="flex-1 text-gray-400 truncate">{item.label}</span>
              <span className="font-bold text-white">{item.percentage}</span>
            </li>
          ))}
        </ul>
      </div>

      <div className="flex items-center justify-center w-1/2">
        <div
          className="relative w-32 h-32 rounded-full"
          style={{ background: backgroundStyle }}
        >
          <div className="absolute inset-0 w-16 h-16 m-auto rounded-full bg-dark-card"></div>
        </div>
      </div>
    </div>
  );
};

export default ScoreDistributionCard;
