import React, { useEffect, useState } from 'react';
import { useOutletContext } from 'react-router-dom';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from 'recharts';
import axiosClient from '../api/axiosClient';
import StatCard from '../features/dashboard/components/StatCard';
import RankedListCard from '../features/dashboard/components/RankedListCard';
import ScoreDistributionCard from '../features/dashboard/components/ScoreDistributionCard';

const CustomBarTooltip = ({ active, payload, label }) => {
  if (active && payload && payload.length) {
    return (
      <div className="p-3 border border-gray-700 rounded-lg shadow-xl bg-gray-900/95 backdrop-blur">
        <p className="mb-1 text-xs text-gray-400">{label}</p>
        <p className="text-sm font-bold text-brand">Rate: {payload[0].value}%</p>
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
    if (score >= 80) return 'text-[#66BB6A]';
    if (score >= 50) return 'text-[#FFCA28]';
    if (score > 0) return 'text-[#EF5350]';
    return 'text-white';
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

  if (loading) return <div className="p-8 text-center text-white">Loading Dashboard...</div>;
  if (!data)
    return <div className="p-8 text-center text-white">Failed to load data. Please refresh.</div>;

  const chartTrendData = data.conversionRateTrend.map((item) => ({
    ...item,
    formattedDate: new Date(item.date).toLocaleDateString('id-ID', {
      day: '2-digit',
      month: 'short',
    }),
    rate: parseFloat(item.rate),
  }));

  return (
    <div>
      <header className="mb-8">
        <h1 className="text-3xl font-bold text-white">
          Hello, {user?.full_name?.split(' ')[0] || 'User'}
        </h1>
        <p className="mt-1 text-gray-400">Here is a summary of your leads performance.</p>
      </header>

      <div className="grid grid-cols-1 gap-6 mb-6 md:grid-cols-2 lg:grid-cols-3">
        <div className="col-span-1">
          <StatCard
            title="Total Leads"
            value={data.totalLeads}
            valueColor="text-white"
          />
        </div>
        <div className="col-span-1">
          <StatCard
            title="Avg Leads Score"
            value={`${data.averageLeadsScore}%`}
            detail="Based on AI/ML"
            detailBg="bg-white/10"
            valueColor={getScoreColor(data.averageLeadsScore)}
          />
        </div>
        <div className="col-span-1">
          <StatCard
            title="Conversion Rate"
            value={`${parseFloat(data.conversionRate).toFixed(1)}%`}
            valueColor="text-white"
          />
        </div>

        <div className="col-span-1">
          <StatCard
            title="Rebound Rate"
            value={`${parseFloat(data.reboundRate).toFixed(1)}%`}
            detail="Inefficiency"
            detailBg="bg-red-900"
            valueColor="text-white"
          />
        </div>
        <div className="col-span-1">
          <StatCard
            title="Active Campaign"
            value={data.activeCampaigns}
            valueColor="text-white"
          />
        </div>

        <div className="col-span-1 row-span-2">
          <ScoreDistributionCard data={data.distributionLeadsScore} />
        </div>

        <div className="col-span-1">
          <RankedListCard
            title="Top Highest Leads Score"
            items={data.topHighestLeadsScore}
            isScore={true}
          />
        </div>
        <div className="col-span-1">
          <RankedListCard
            title="Top Campaign by Conversion"
            items={data.topCampaignByConversion}
          />
        </div>
      </div>

      <div className="p-6 mt-8 rounded-lg shadow-lg bg-dark-card">
        <h3 className="mb-2 text-lg font-semibold text-white">Conversion Rate Trend (30 Days)</h3>
        <p className="mb-6 text-sm text-gray-400">Daily 'Deal' ratio trend chart.</p>

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
              <BarChart
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
                  cursor={{ fill: '#ffffff10' }}
                />
                <Bar
                  dataKey="rate"
                  fill="#4ade80"
                  radius={[4, 4, 0, 0]}
                  maxBarSize={40}
                />
              </BarChart>
            </ResponsiveContainer>
          )}
        </div>
      </div>
    </div>
  );
};

export default DashboardPage;
