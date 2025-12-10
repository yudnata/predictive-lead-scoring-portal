import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from 'recharts';

const CustomTooltip = ({ active, payload }) => {
  if (active && payload && payload.length) {
    const { name, value, color } = payload[0].payload;
    return (
      <div className="p-3 border border-gray-200 dark:border-gray-700 rounded shadow-xl bg-white dark:bg-[#1E1E1E] backdrop-blur-sm">
        <p className="text-sm font-semibold text-gray-900 dark:text-white">{name}</p>
        <p
          className="text-sm font-bold"
          style={{ color: color }}
        >
          {value}%
        </p>
      </div>
    );
  }
  return null;
};

const ScoreDistributionCard = ({ data }) => {
  if (!data || !Array.isArray(data)) {
    return (
      <div className="flex items-center justify-center h-full p-5 rounded-lg shadow-lg bg-white dark:bg-[#1E1E1E]">
        <p className="text-base text-gray-500">Data tidak tersedia</p>
      </div>
    );
  }

  const chartData = data.map((item) => ({
    name: item.label,
    value: parseFloat(item.percentage.replace('%', '')) || 0,
    color: item.color,
    displayPercentage: item.percentage,
  }));

  return (
    <div className="flex flex-col justify-center h-full p-6 rounded-lg shadow-lg bg-white dark:bg-[#1E1E1E]">
      <h3 className="mb-6 text-xl font-bold text-center text-gray-900 dark:text-white/80">
        Distribution Leads Score
      </h3>

      <div className="flex flex-col items-center justify-center flex-grow gap-4 lg:flex-row">
        <div className="flex items-center justify-center w-full h-64 lg:w-1/2">
          <ResponsiveContainer
            width="100%"
            height="100%"
          >
            <PieChart>
              <Pie
                data={chartData}
                cx="50%"
                cy="50%"
                innerRadius={65}
                outerRadius={95}
                paddingAngle={4}
                dataKey="value"
                stroke="none"
              >
                {chartData.map((entry, index) => (
                  <Cell
                    key={`cell-${index}`}
                    fill={entry.color}
                  />
                ))}
              </Pie>
              <Tooltip content={<CustomTooltip />} />
            </PieChart>
          </ResponsiveContainer>
        </div>

        <div className="flex flex-col justify-center w-full lg:w-1/2 lg:pl-4">
          <ul className="space-y-4">
            {chartData.map((item, index) => (
              <li
                key={index}
                className="flex items-center justify-between w-full gap-3"
              >
                <div className="flex items-center gap-3 overflow-hidden">
                  <span
                    className="flex-shrink-0 w-4 h-4 rounded-full"
                    style={{ backgroundColor: item.color }}
                  ></span>
                  <span className="text-base text-gray-600 dark:text-gray-300 truncate">
                    {item.name}
                  </span>
                </div>
                <span className="text-lg font-bold text-gray-900 dark:text-white">
                  {item.displayPercentage}
                </span>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
};

export default ScoreDistributionCard;
