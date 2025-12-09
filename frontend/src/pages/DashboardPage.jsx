import React, { useEffect, useState } from 'react';
import { useOutletContext } from 'react-router-dom';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
} from 'recharts';
import axiosClient from '../api/axiosClient';
import StatCard from '../features/dashboard/components/StatCard';
import RankedListCard from '../features/dashboard/components/RankedListCard';
import ScoreDistributionCard from '../features/dashboard/components/ScoreDistributionCard';

const USE_DUMMY_DATA = false;

const generateDummyData = () => {
  const data = [];
  const today = new Date();
  for (let i = 29; i >= 0; i--) {
    const date = new Date(today);
    date.setDate(today.getDate() - i);
    data.push({
      date: date.toISOString().split('T')[0],
      rate: Math.floor(Math.random() * (40 - 20 + 1)) + 20,
      rejectRate: Math.floor(Math.random() * (30 - 10 + 1)) + 10,
    });
  }
  return data;
};

const CustomBarTooltip = ({ active, payload, label }) => {
  if (active && payload && payload.length) {
    return (
      <div className="p-3 border border-gray-700 rounded-lg shadow-xl bg-gray-900/95 backdrop-blur">
        <p className="mb-2 text-xs text-gray-400">{label}</p>
        <div className="space-y-1">
          <p className="text-sm font-bold text-[#4ade80]">Conversion Rate: {payload[0].value}%</p>
          {payload[1] && (
            <p className="text-sm font-bold text-[#ef4444]">Reject Rate: {payload[1].value}%</p>
          )}
        </div>
      </div>
    );
  }
  return null;
};

const DashboardPage = () => {
  const { user } = useOutletContext();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  const getScoreColor = (score) => {
    if (score > 70) return 'text-[#66BB6A]';
    if (score > 30) return 'text-[#FFCA28]';
    if (score > 0) return 'text-[#EF5350]';
    return 'text-gray-900 dark:text-white';
  };

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        const response = await axiosClient.get('/dashboard');
        setData(response.data.data);
      } catch (error) {
        console.error('Error fetching dashboard data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, []);

  if (loading)
    return (
      <div className="p-8 text-center text-gray-900 dark:text-white">Loading Dashboard...</div>
    );
  if (!data)
    return (
      <div className="p-8 text-center text-gray-900 dark:text-white">
        Failed to load data. Please refresh.
      </div>
    );

  const trendSource = USE_DUMMY_DATA ? generateDummyData() : data.conversionRateTrend;

  const chartTrendData = trendSource.map((item) => ({
    ...item,
    formattedDate: new Date(item.date).toLocaleDateString('id-ID', {
      day: '2-digit',
      month: 'short',
    }),
    rate: parseFloat(item.rate),
    rejectRate: parseFloat(item.rejectRate || 0),
  }));

  return (
    <div>
      <header className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
          Hello, {user?.full_name?.split(' ')[0] || 'User'}
        </h1>
        <p className="mt-1 text-gray-600 dark:text-gray-400">
          Here is a summary of your leads performance.
        </p>
      </header>

      <div className="grid grid-cols-1 gap-2 mb-2 md:grid-cols-2 lg:grid-cols-3">
        <div
          className="col-span-1 animate-fade-in-up"
          style={{ animationDelay: '0ms' }}
        >
          <StatCard
            title="Total Leads"
            value={data.totalLeads}
            valueColor="text-gray-900 dark:text-white"
          />
        </div>
        <div
          className="col-span-1 animate-fade-in-up"
          style={{ animationDelay: '100ms' }}
        >
          <StatCard
            title="Avg Leads Score"
            value={`${data.averageLeadsScore}%`}
            detail="Based on AI/ML"
            detailBg="bg-blue-900"
            valueColor={getScoreColor(data.averageLeadsScore)}
          />
        </div>
        <div
          className="col-span-1 animate-fade-in-up"
          style={{ animationDelay: '200ms' }}
        >
          <StatCard
            title="Conversion Rate"
            value={`${parseFloat(data.conversionRate).toFixed(1)}%`}
            detail="Percentage of won leads"
            detailBg="bg-green-900"
            valueColor="text-gray-900 dark:text-white"
          />
        </div>

        <div
          className="col-span-1 animate-fade-in-up"
          style={{ animationDelay: '300ms' }}
        >
          <StatCard
            title="Reject Rate"
            value={`${parseFloat(data.rejectRate || 0).toFixed(1)}%`}
            detail="Percentage of lost leads"
            detailBg="bg-red-900"
            valueColor="text-gray-900 dark:text-white"
          />
        </div>
        <div
          className="col-span-1 animate-fade-in-up"
          style={{ animationDelay: '400ms' }}
        >
          <StatCard
            title="Active Campaign"
            value={data.activeCampaigns}
            detail="Currently Active"
            detailBg="bg-gray-600"
            valueColor="text-gray-900 dark:text-white"
          />
        </div>

        <div
          className="col-span-1 row-span-2 animate-fade-in-up"
          style={{ animationDelay: '500ms' }}
        >
          <ScoreDistributionCard data={data.distributionLeadsScore} />
        </div>

        <div
          className="col-span-1 animate-fade-in-up"
          style={{ animationDelay: '600ms' }}
        >
          <RankedListCard
            title="Top Highest Leads Score"
            items={data.topHighestLeadsScore}
            isScore={true}
          />
        </div>
        <div
          className="col-span-1 animate-fade-in-up"
          style={{ animationDelay: '700ms' }}
        >
          <RankedListCard
            title="Top Campaign by Conversion"
            items={data.topCampaignByConversion}
          />
        </div>
      </div>

      <div
        className="p-6 mt-0 rounded-lg shadow-lg bg-white dark:bg-dark-card border border-gray-200 dark:border-white/5 animate-fade-in-up"
        style={{ animationDelay: '800ms' }}
      >
        <h3 className="mb-2 text-lg font-semibold text-gray-900 dark:text-white/80">
          Conversion Rate Trend (30 Days)
        </h3>
        <p className="mb-6 text-sm text-gray-600 dark:text-gray-400">
          Daily 'Deal' and 'Reject' ratio trend chart.
        </p>

        <div className="w-full h-72">
          {chartTrendData.length === 0 ? (
            <div className="flex items-center justify-center w-full h-full text-gray-600">
              No historical trend data yet.
            </div>
          ) : (
            <ResponsiveContainer
              width="100%"
              height="100%"
            >
              <LineChart
                data={chartTrendData}
                margin={{ top: 10, right: 10, left: -20, bottom: 0 }}
              >
                <CartesianGrid
                  strokeDasharray="3 3"
                  vertical={false}
                  stroke="#333"
                />
                <XAxis
                  dataKey="formattedDate"
                  tick={{ fill: '#9CA3AF', fontSize: 10 }}
                  axisLine={false}
                  tickLine={false}
                  interval="preserveStartEnd"
                  minTickGap={15}
                />
                <YAxis
                  tick={{ fill: '#9CA3AF', fontSize: 10 }}
                  axisLine={false}
                  tickLine={false}
                />
                <Tooltip
                  content={<CustomBarTooltip />}
                  cursor={{ stroke: '#ffffff10', strokeWidth: 2 }}
                />
                <Line
                  type="monotone"
                  dataKey="rate"
                  name="Conversion Rate"
                  stroke="#4ade80"
                  strokeWidth={2}
                  dot={{ r: 3, fill: '#4ade80', strokeWidth: 0 }}
                  activeDot={{ r: 6, fill: '#4ade80', stroke: '#fff', strokeWidth: 2 }}
                />
                <Line
                  type="monotone"
                  dataKey="rejectRate"
                  name="Reject Rate"
                  stroke="#ef4444"
                  strokeWidth={2}
                  dot={{ r: 3, fill: '#ef4444', strokeWidth: 0 }}
                  activeDot={{ r: 6, fill: '#ef4444', stroke: '#fff', strokeWidth: 2 }}
                />
              </LineChart>
            </ResponsiveContainer>
          )}
        </div>
      </div>
    </div>
  );
};

export default DashboardPage;
