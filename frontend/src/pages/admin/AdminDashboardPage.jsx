import React, { useState, useEffect } from 'react';
import axios from 'axios';
import Sidebar from '../../layouts/Sidebar'; 

const API_BASE_URL = 'http://localhost:5000/api/v1/auth';

const dashboardData = {
  totalLeads: '45.555',
  avgLeadScore: '77%',
  conversionRate: '50%',
  reboundRate: '10%',
  activeCampaigns: 10,
  topLeads: [
    { name: 'Gede Yudhi Adinata', score: '99%' },
    { name: 'Gede Bagus Wiswaprayadnya', score: '92%' },
    { name: 'Dewa Ayu Putri Paramita', score: '89%' },
    { name: 'Aditya Gimas Tangkas', score: '88%' },
    { name: 'Raihan Dharma Nugroho', score: '84%' },
  ],
  topCampaigns: [
    { name: 'KPR Merdeka 2025', rate: '76%' },
    { name: 'KTR Kilat 2024', rate: '67%' },
    { name: 'Kampanye 3', rate: '55%' },
  ],
  scoreDistribution: [
    { label: 'Skor Tinggi', percentage: '32%', color: 'bg-green-500' },
    { label: 'Skor Sedang', percentage: '48%', color: 'bg-yellow-500' },
    { label: 'Skor Rendah', percentage: '20%', color: 'bg-red-500' },
  ]
};

const StatCard = ({ title, value, detail, valueColor = 'text-white', detailBg = '' }) => (
  <div className="flex flex-col justify-between h-32 p-5 rounded-lg shadow-lg bg-dark-card">
    <p className="text-sm text-gray-400">{title}</p>
    <div className="flex items-end justify-between">
      <h2 className={`text-4xl font-bold ${valueColor}`}>{value}</h2>
      {detail && (
        <span className={`px-2 py-0.5 text-xs font-semibold rounded-full ${detailBg} text-white`}>
          {detail}
        </span>
      )}
    </div>
  </div>
);

const RankedListCard = ({ title, items, isScore = false }) => (
    <div className="flex flex-col h-full p-5 rounded-lg shadow-lg bg-dark-card">
        <h3 className="mb-4 text-lg font-semibold">{title}</h3>
        <ul className="flex-grow space-y-3">
            {items.map((item, index) => (
                <li key={index} className="flex items-center justify-between text-sm">
                    <div className="flex items-center space-x-2">
                        <span className="w-4 font-bold text-gray-400">{index + 1}.</span>
                        <span>{isScore ? item.name : item.name}</span>
                    </div>
                    <span className={`font-bold ${isScore ? 'text-green-400' : 'text-orange-400'}`}>
                        {isScore ? item.score : item.rate}
                    </span>
                </li>
            ))}
        </ul>
        {isScore && <button className="self-start mt-4 text-sm text-orange-500 hover:underline">View All</button>}
    </div>
);


const AdminDashboardPage = () => {
  const [userProfile, setUserProfile] = useState(null);
  const [loadingProfile, setLoadingProfile] = useState(true);

  useEffect(() => {
    const fetchProfile = async () => {
      const token = localStorage.getItem('authToken');
      if (!token) {
        setLoadingProfile(false);
        return;
      }

      try {
        const response = await axios.get(`${API_BASE_URL}/me`, {
          headers: {
            Authorization: `Bearer ${token}`, 
          },
        });
        
        setUserProfile(response.data.data);
      } catch (error) {
        console.error("Gagal mengambil profil user:", error);
      } finally {
        setLoadingProfile(false);
      }
    };

    fetchProfile();
  }, []); 

  if (loadingProfile) {
      return (
          <div className="flex items-center justify-center min-h-screen text-white bg-black">
              <p>Memuat profil pengguna...</p>
          </div>
      );
  }

  return (
    <div className="min-h-screen bg-dark-bg">
      <Sidebar user={userProfile} /> 
      
      <main className="overflow-y-auto ">
        <header className="mb-8">
          <h1 className="text-3xl font-bold text-white">Home</h1>
        </header>
        
        {/* Row Top Cards */}
        <div className="grid grid-cols-4 gap-6 mb-8">
          <StatCard title="Total Leads" value={dashboardData.totalLeads} valueColor="text-white" />
          <StatCard title="Average Leads Score" value={dashboardData.avgLeadScore} detail="77%" detailBg="bg-green-600" valueColor="text-white" />
          <StatCard title="Conversion Rate" value={dashboardData.conversionRate} valueColor="text-white" />
          <StatCard title="Rebound Rate" value={dashboardData.reboundRate} detail="10%" detailBg="bg-red-600" valueColor="text-white" />
        </div>

        {/* Row Middle Content */}
        <div className="grid grid-cols-12 gap-6 mb-8 h-96">
            
            {/* Active Campaign & Distribution */}
            <div className="col-span-4 space-y-6">
                <StatCard 
                    title="Active Campaign" 
                    value={dashboardData.activeCampaigns} 
                    valueColor="text-white"
                />
                
                {/* Distribution Chart Placeholder */}
                <div className="h-full p-5 rounded-lg shadow-lg bg-dark-card">
                    <h3 className="mb-4 text-lg font-semibold text-white">Distribution Leads Score</h3>
                    <ul className="mt-4 space-y-1 text-sm">
                        {dashboardData.scoreDistribution.map(item => (
                            <li key={item.label} className="flex justify-between text-gray-400">
                                <div className="flex items-center space-x-2">
                                    <span className={`w-2 h-2 rounded-full ${item.color}`}></span>
                                    <span>{item.label}</span>
                                </div>
                                <span className="font-semibold text-white">{item.percentage}</span>
                            </li>
                        ))}
                    </ul>
                </div>
            </div>

            {/* Top Highest Leads Score */}
            <div className="col-span-4">
                <RankedListCard 
                    title="Top Highest Leads Score" 
                    items={dashboardData.topLeads} 
                    isScore={true}
                />
            </div>

            {/* Top Campaign by Conversion */}
            <div className="col-span-4">
                <RankedListCard 
                    title="Top Campaign by Conversion" 
                    items={dashboardData.topCampaigns.map(c => ({ name: c.name, rate: c.rate }))}
                />
            </div>
        </div>
        
        {/* Row Bottom */}
        <div className="p-5 mt-5 mb-8 rounded-lg shadow-lg bg-dark-card">
            <h3 className="mb-4 text-lg font-semibold text-white">Conversion Rate Trend</h3>
            <p className="mb-2 text-sm text-gray-400">
                · Define: Grafik garis (line chart) yang menunjukkan pergerakan Conversion Rate dari waktu ke waktu (misal: per hari atau per minggu).
            </p>
            <p className="text-sm text-gray-400">
                · Sumber Data: tb_lead_status. Kelompokkan (GROUP BY) berdasarkan changed_at (dijadikan harian/mingguan). Hitung rasio status_id = Deal terhadap total status yang berubah pada periode tersebut.
            </p>
            <div className="flex items-center justify-center h-64 mt-4 text-gray-500 bg-gray-800 rounded">
                [Placeholder for Conversion Rate Line Chart]
            </div>
        </div>

      </main>
    </div>
  );
};

export default AdminDashboardPage;