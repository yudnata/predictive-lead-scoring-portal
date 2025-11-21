import React, { useEffect, useState } from 'react';
import { useOutletContext } from 'react-router-dom';
import axiosClient from '../api/axiosClient';
import StatCard from '../features/dashboard/components/StatCard';
import RankedListCard from '../features/dashboard/components/RankedListCard';
import ScoreDistributionCard from '../features/dashboard/components/ScoreDistributionCard';

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

  if (loading) return <div className="p-8 text-center text-white">Memuat Dashboard...</div>;
  if (!data)
    return <div className="p-8 text-center text-white">Gagal memuat data. Silakan refresh.</div>;

  return (
    <div>
      {/* HEADER */}
      <header className="mb-8">
        <h1 className="text-3xl font-bold text-white">
          Hello, {user?.full_name?.split(' ')[0] || 'User'}
        </h1>
        <p className="mt-1 text-gray-400">Berikut adalah ringkasan performa leads Anda.</p>
      </header>

      {/* ----------------------------------------------------- */}
      {/* BENTO GRID START */}
      {/* ----------------------------------------------------- */}

      <div className="grid grid-cols-1 gap-6 mb-6 md:grid-cols-2 lg:grid-cols-3">
        {/* Row 1 – Three main stat cards */}
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

        {/* Row 2 – Bento style */}
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

        {/* Tall box (row-span-2) */}
        <div className="col-span-1 row-span-2">
          <ScoreDistributionCard data={data.distributionLeadsScore} />
        </div>

        {/* Row 3 – Ranked lists */}
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

      {/* ----------------------------------------------------- */}
      {/* BOTTOM WIDE GRAPH */}
      {/* ----------------------------------------------------- */}

      <div className="p-6 mt-8 rounded-lg shadow-lg bg-dark-card">
        <h3 className="mb-2 text-lg font-semibold text-white">Conversion Rate Trend (30 Days)</h3>
        <p className="mb-6 text-sm text-gray-400">Grafik pergerakan rasio 'Deal' harian.</p>

        <div className="relative flex items-end h-64 pb-2 space-x-3 overflow-x-auto custom-scrollbar">
          {data.conversionRateTrend.length === 0 ? (
            <div className="flex items-center justify-center w-full h-full text-gray-600">
              Belum ada data tren historis.
            </div>
          ) : (
            data.conversionRateTrend.map((day, idx) => (
              <div
                key={idx}
                className="flex flex-col items-center group min-w-[40px] h-full justify-end"
              >
                <div
                  className="w-full bg-brand/40 hover:bg-brand transition-all rounded-t-sm relative group-hover:shadow-[0_0_10px_rgba(74,222,128,0.5)]"
                  style={{ height: `${Math.max(day.rate * 2, 5)}%`, maxHeight: '100%' }}
                >
                  <span className="absolute z-10 px-2 py-1 text-xs text-white transition-opacity transform -translate-x-1/2 bg-black border border-gray-700 rounded opacity-0 -top-10 left-1/2 group-hover:opacity-100 whitespace-nowrap">
                    {parseFloat(day.rate).toFixed(1)}%
                  </span>
                </div>
                <span className="text-[10px] text-gray-500 mt-2 rotate-45 origin-left truncate w-full text-center">
                  {new Date(day.date).toLocaleDateString('id-ID', {
                    day: '2-digit',
                    month: 'short',
                  })}
                </span>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};

export default DashboardPage;
