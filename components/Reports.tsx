import React, { useState, useEffect } from 'react';
import { db } from '../services/dbService';
import { analyzeBusinessPerformance } from '../services/geminiService';
import { Transaction, Customer } from '../types';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

const Reports: React.FC = () => {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [aiAnalysis, setAiAnalysis] = useState<string | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);

  useEffect(() => {
    setTransactions(db.getTransactions());
    setCustomers(db.getCustomers());
  }, []);

  // Prepare Chart Data (Last 7 Days)
  const getChartData = () => {
    const days = 7;
    const data = [];
    for (let i = days - 1; i >= 0; i--) {
        const d = new Date();
        d.setDate(d.getDate() - i);
        const dateStr = d.toISOString().split('T')[0];
        const amount = transactions
            .filter(t => t.timestamp.startsWith(dateStr))
            .reduce((sum, t) => sum + t.finalAmount, 0);
        data.push({ name: d.toLocaleDateString('tr-TR', { weekday: 'short' }), amount });
    }
    return data;
  };

  const handleAiAnalysis = async () => {
    setIsAnalyzing(true);
    const result = await analyzeBusinessPerformance(transactions, customers);
    setAiAnalysis(result);
    setIsAnalyzing(false);
  };

  return (
    <div className="space-y-8">
      <h2 className="text-2xl font-bold text-slate-800">Analiz ve Raporlar</h2>

      {/* Chart Section */}
      <div className="bg-white p-6 rounded-xl shadow-sm h-80">
        <h3 className="text-lg font-bold mb-4 text-slate-700">Gelir (Son 7 Gün)</h3>
        <ResponsiveContainer width="100%" height="100%">
            <BarChart data={getChartData()}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} />
                <XAxis dataKey="name" axisLine={false} tickLine={false} />
                <YAxis axisLine={false} tickLine={false} prefix="₺" />
                <Tooltip cursor={{fill: '#f1f5f9'}} formatter={(value) => [`${value} ₺`, 'Gelir']} />
                <Bar dataKey="amount" fill="#3b82f6" radius={[4, 4, 0, 0]} />
            </BarChart>
        </ResponsiveContainer>
      </div>

      {/* AI Section */}
      <div className="bg-gradient-to-br from-slate-800 to-slate-900 rounded-xl shadow-lg p-6 sm:p-8 text-white">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4">
            <div>
                <h3 className="text-2xl font-bold flex items-center gap-2">
                    <span>✨</span> Yapay Zeka İş Danışmanı
                </h3>
                <p className="text-slate-400 text-sm mt-1">Gemini 2.5 Flash ile güçlendirilmiştir</p>
            </div>
            <button 
                onClick={handleAiAnalysis}
                disabled={isAnalyzing}
                className="bg-blue-500 hover:bg-blue-400 text-white px-6 py-3 rounded-lg font-bold shadow-lg transition disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
            >
                {isAnalyzing ? (
                    <>
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                      Analiz Ediliyor...
                    </>
                ) : (
                    'İçgörü Oluştur'
                )}
            </button>
        </div>

        <div className="bg-white/10 rounded-xl p-6 min-h-[150px] backdrop-blur-sm">
            {aiAnalysis ? (
                <div className="prose prose-invert max-w-none whitespace-pre-line">
                    {aiAnalysis}
                </div>
            ) : (
                <div className="flex flex-col items-center justify-center h-full text-slate-400 space-y-2">
                    <span className="text-4xl">🤖</span>
                    <p>Gelir trendlerini analiz etmek ve ipuçları almak için "İçgörü Oluştur"a tıklayın.</p>
                </div>
            )}
        </div>
      </div>
    </div>
  );
};

export default Reports;