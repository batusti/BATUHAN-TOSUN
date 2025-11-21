import React, { useEffect, useState } from 'react';
import { db } from '../services/dbService';
import { DashboardStats } from '../types';

const StatCard: React.FC<{ title: string; value: string; icon: string; color: string }> = ({ title, value, icon, color }) => (
  <div className={`bg-white rounded-xl shadow-sm p-6 border-l-4 ${color}`}>
    <div className="flex justify-between items-start">
      <div>
        <p className="text-sm font-medium text-slate-500 uppercase tracking-wider">{title}</p>
        <h3 className="text-3xl font-bold text-slate-800 mt-2">{value}</h3>
      </div>
      <div className="p-3 bg-slate-50 rounded-full text-2xl">
        {icon}
      </div>
    </div>
  </div>
);

const Dashboard: React.FC = () => {
  const [stats, setStats] = useState<DashboardStats | null>(null);

  useEffect(() => {
    setStats(db.getDashboardStats());
  }, []);

  if (!stats) return <div>Yükleniyor...</div>;

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-slate-800">Mağaza Özeti</h2>
        <span className="text-sm text-slate-500">Bugün: {new Date().toLocaleDateString('tr-TR')}</span>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard 
          title="Günlük Gelir" 
          value={`${stats.dailyRevenue.toLocaleString()} ₺`} 
          icon="💰" 
          color="border-green-500" 
        />
        <StatCard 
          title="Yıkanan Araç (Bugün)" 
          value={stats.todaysWashes.toString()} 
          icon="🚗" 
          color="border-blue-500" 
        />
         <StatCard 
          title="Toplam Müşteri" 
          value={stats.totalCustomers.toString()} 
          icon="👥" 
          color="border-purple-500" 
        />
        <StatCard 
          title="Aylık Gelir" 
          value={`${stats.monthlyRevenue.toLocaleString()} ₺`} 
          icon="📅" 
          color="border-orange-500" 
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white p-6 rounded-xl shadow-sm">
            <h3 className="text-lg font-bold mb-4">Hızlı İşlemler</h3>
            <div className="grid grid-cols-2 gap-4">
                 <button className="p-4 bg-blue-50 hover:bg-blue-100 text-blue-700 rounded-lg font-medium transition text-center border border-blue-200">
                    Yeni Yıkama Başlat
                 </button>
                 <button className="p-4 bg-emerald-50 hover:bg-emerald-100 text-emerald-700 rounded-lg font-medium transition text-center border border-emerald-200">
                    Müşteri Ekle
                 </button>
            </div>
        </div>
        
        <div className="bg-gradient-to-r from-indigo-600 to-purple-700 p-6 rounded-xl shadow-md text-white">
            <h3 className="text-lg font-bold mb-2">Üyelik Hedefleri</h3>
            <p className="opacity-90 mb-4">Daha iyi sadakat için Standart üyeleri Premium'a yükseltmeye odaklanın.</p>
            <div className="w-full bg-white/20 rounded-full h-2 mb-1">
                <div className="bg-white h-2 rounded-full" style={{ width: '65%' }}></div>
            </div>
            <p className="text-xs opacity-75 text-right">Aylık hedefin %65'i</p>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;