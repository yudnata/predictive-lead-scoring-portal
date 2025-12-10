import React, { useEffect, useState } from 'react';
import axiosClient from '../api/axiosClient';
import { useAIContext } from '../context/useAIContext';
import {
  FaChartLine,
  FaUserTie,
  FaMoneyBillWave,
  FaBullhorn,
  FaCheckCircle,
  FaLightbulb,
} from 'react-icons/fa';

const SegmentAnalysisPage = () => {
  const [stats, setStats] = useState([]);
  const [loading, setLoading] = useState(true);
  const { setSegmentAnalysisContext } = useAIContext();

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const response = await axiosClient.get('/leads/stats/segments');
        if (response.data.status === 'success') {
          setStats(response.data.data);
          setSegmentAnalysisContext(response.data.data);
        }
      } catch (error) {
        console.error('Failed to fetch segment stats:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
  }, [setSegmentAnalysisContext]);

  const getSegmentIcon = (name) => {
    if (name.includes('Stable')) return <FaUserTie className="w-6 h-6" />;
    if (name.includes('Senior')) return <FaMoneyBillWave className="w-6 h-6" />;
    return <FaBullhorn className="w-6 h-6" />;
  };

  const getSegmentColor = (name) => {
    if (name.includes('Stable')) return 'text-blue-500 bg-blue-100 dark:bg-blue-900/30';
    if (name.includes('Senior')) return 'text-green-500 bg-green-100 dark:bg-green-900/30';
    return 'text-purple-500 bg-purple-100 dark:bg-purple-900/30';
  };

  const segmentDetails = [
    {
      title: 'Stable Productive',
      icon: <FaUserTie />,
      color: 'blue',
      summary:
        'This segment consists of productive, mid-aged customers with stable financial behavior and moderate banking activity.',
      characteristics: [
        'Consistent account balance',
        'Stable financial habits',
        'Responsible loan usage (rarely takes loans)',
        'Often married and financially settled',
      ],
      opportunities: [
        'Suitable for long-term investment products',
        'Potential for cross-selling savings or insurance plans',
        'Good candidates for periodic deposit offers',
      ],
    },
    {
      title: 'High-Income Senior',
      icon: <FaMoneyBillWave />,
      color: 'green',
      summary:
        'This segment includes older customers with high financial capacity and strong savings potential.',
      characteristics: [
        'Highest average balance among all segments',
        'Older age group with stable income sources',
        'Rarely takes loans',
        'Typically financially independent and cautious',
      ],
      opportunities: [
        'Strong candidates for high-value deposit products',
        'Potential interest in wealth management and retirement plans',
        'Responsive to premium financial services',
      ],
    },
    {
      title: 'Responsive Young',
      icon: <FaBullhorn />,
      color: 'purple',
      summary:
        'This segment consists of younger customers who show high responsiveness to marketing campaigns.',
      characteristics: [
        'Youngest demographic among segments',
        'Very responsive during telemarketing interactions',
        'Moderate account balance',
        'Often has active housing loans, indicating growing financial needs',
      ],
      opportunities: [
        'Suitable for flexible saving products',
        'Good targets for entry-level investment plans',
        'Highly responsive to promotional and short-term campaigns',
      ],
    },
  ];

  return (
    <div className="animate-fade-in p-6">
      <header className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Segment Analysis</h1>
        <p className="text-gray-600 dark:text-gray-400 mt-2">
          Insights and strategic details for each customer segment.
        </p>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
        {loading ? (
          <div className="col-span-3 flex items-center justify-center h-32 text-gray-400">
            <div className="text-center">
              <div className="inline-block w-8 h-8 border-4 border-gray-300 dark:border-gray-400 border-t-blue-600 dark:border-t-white rounded-full animate-spin mb-2"></div>
              <p>Loading segments...</p>
            </div>
          </div>
        ) : (
          stats.map((stat) => (
            <div
              key={stat.lead_segment}
              className="bg-white dark:bg-[#1E1E1E] p-6 rounded-xl shadow-lg border-none dark:border-white/10 flex items-center justify-between transition-transform hover:scale-[1.02]"
            >
              <div>
                <p className="text-sm font-medium text-gray-500 dark:text-gray-400">
                  {stat.lead_segment}
                </p>
                <p className="text-3xl font-bold text-gray-900 dark:text-white mt-1">
                  {(parseFloat(stat.avg_score) * 100).toFixed(1)}%
                </p>
                <p className="text-xs text-gray-400 mt-1">{stat.lead_count} Leads</p>
              </div>
              <div className={`p-4 rounded-full ${getSegmentColor(stat.lead_segment)}`}>
                {getSegmentIcon(stat.lead_segment)}
              </div>
            </div>
          ))
        )}
      </div>

      <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">Segment Profiles</h2>
      <div className="grid grid-cols-1 gap-8">
        {segmentDetails.map((segment) => (
          <div
            key={segment.title}
            className="bg-white dark:bg-[#1E1E1E] rounded-xl shadow-lg border-none dark:border-white/10 overflow-hidden"
          >
            <div className={`p-6 border-b border-none dark:border-white/5 flex items-center gap-4`}>
              <div
                className={`p-3 rounded-lg bg-${segment.color}-100 dark:bg-${segment.color}-900/30 text-${segment.color}-600`}
              >
                <span className="text-xl">{segment.icon}</span>
              </div>
              <h3 className="text-xl font-bold text-gray-900 dark:text-white">{segment.title}</h3>
            </div>

            <div className="p-6">
              <div className="mb-6">
                <h4 className="text-sm font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-2">
                  Profile Summary
                </h4>
                <p className="text-gray-700 dark:text-gray-300 leading-relaxed">
                  {segment.summary}
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div>
                  <h4 className="flex items-center gap-2 text-sm font-bold text-gray-900 dark:text-white mb-3">
                    <FaCheckCircle className="text-green-500" /> Key Characteristics
                  </h4>
                  <ul className="space-y-2">
                    {segment.characteristics.map((char, idx) => (
                      <li
                        key={idx}
                        className="flex items-start gap-2 text-sm text-gray-600 dark:text-gray-400"
                      >
                        <span className="mt-1.5 w-1.5 h-1.5 rounded-full bg-gray-400 flex-shrink-0"></span>
                        {char}
                      </li>
                    ))}
                  </ul>
                </div>
                <div>
                  <h4 className="flex items-center gap-2 text-sm font-bold text-gray-900 dark:text-white mb-3">
                    <FaLightbulb className="text-yellow-500" /> Sales Opportunities
                  </h4>
                  <ul className="space-y-2">
                    {segment.opportunities.map((opp, idx) => (
                      <li
                        key={idx}
                        className="flex items-start gap-2 text-sm text-gray-600 dark:text-gray-400"
                      >
                        <span className="mt-1.5 w-1.5 h-1.5 rounded-full bg-gray-400 flex-shrink-0"></span>
                        {opp}
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default SegmentAnalysisPage;
