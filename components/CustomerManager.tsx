import React, { useState, useEffect } from 'react';
import { db } from '../services/dbService';
import { Customer, MembershipTier } from '../types';

const CustomerManager: React.FC = () => {
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [filter, setFilter] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    licensePlate: '',
    vehicleModel: '',
    phone: '',
    membershipTier: MembershipTier.BASIC
  });

  useEffect(() => {
    loadCustomers();
  }, []);

  const loadCustomers = () => {
    setCustomers(db.getCustomers().reverse());
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    db.addCustomer(formData);
    setIsModalOpen(false);
    setFormData({
        name: '',
        licensePlate: '',
        vehicleModel: '',
        phone: '',
        membershipTier: MembershipTier.BASIC
    });
    loadCustomers();
  };

  const filteredCustomers = customers.filter(c => 
    c.licensePlate.toLowerCase().includes(filter.toLowerCase()) ||
    c.name.toLowerCase().includes(filter.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <h2 className="text-2xl font-bold text-slate-800">Müşteri Veritabanı</h2>
        <button 
          onClick={() => setIsModalOpen(true)}
          className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg shadow-sm flex items-center gap-2"
        >
          <span>+</span> Müşteri Ekle
        </button>
      </div>

      <div className="bg-white rounded-xl shadow-sm overflow-hidden">
        <div className="p-4 border-b border-slate-100">
            <input
                type="text"
                placeholder="Plaka veya İsim ile Ara..."
                value={filter}
                onChange={(e) => setFilter(e.target.value)}
                className="w-full px-4 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
            />
        </div>
        
        <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
                <thead className="bg-slate-50 text-slate-600 font-medium">
                    <tr>
                        <th className="px-6 py-4">Plaka</th>
                        <th className="px-6 py-4">İsim</th>
                        <th className="px-6 py-4">Araç</th>
                        <th className="px-6 py-4">Üyelik</th>
                        <th className="px-6 py-4">Puan</th>
                        <th className="px-6 py-4">Telefon</th>
                    </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                    {filteredCustomers.length === 0 ? (
                         <tr><td colSpan={6} className="px-6 py-8 text-center text-slate-400">Müşteri bulunamadı</td></tr>
                    ) : (
                        filteredCustomers.map((c) => (
                            <tr key={c.id} className="hover:bg-slate-50 transition">
                                <td className="px-6 py-4 font-mono font-bold text-slate-700">{c.licensePlate}</td>
                                <td className="px-6 py-4 text-slate-900">{c.name}</td>
                                <td className="px-6 py-4 text-slate-500">{c.vehicleModel}</td>
                                <td className="px-6 py-4">
                                    <span className={`px-2 py-1 rounded-full text-xs font-bold
                                        ${c.membershipTier === 'VIP' ? 'bg-purple-100 text-purple-700' : 
                                          c.membershipTier === 'Premium' ? 'bg-amber-100 text-amber-700' : 'bg-slate-100 text-slate-600'}
                                    `}>
                                        {c.membershipTier}
                                    </span>
                                </td>
                                <td className="px-6 py-4 font-medium text-blue-600">{c.points}</td>
                                <td className="px-6 py-4 text-slate-500">{c.phone}</td>
                            </tr>
                        ))
                    )}
                </tbody>
            </table>
        </div>
      </div>

      {/* Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
            <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md p-6">
                <div className="flex justify-between items-center mb-4">
                    <h3 className="text-xl font-bold text-slate-800">Yeni Müşteri</h3>
                    <button onClick={() => setIsModalOpen(false)} className="text-slate-400 hover:text-slate-600">✕</button>
                </div>
                <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-slate-700 mb-1">Plaka</label>
                        <input required type="text" className="w-full border p-2 rounded uppercase" value={formData.licensePlate} onChange={e => setFormData({...formData, licensePlate: e.target.value.toUpperCase()})} />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-slate-700 mb-1">Ad Soyad</label>
                        <input required type="text" className="w-full border p-2 rounded" value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-slate-700 mb-1">Araç Modeli</label>
                            <input required type="text" className="w-full border p-2 rounded" value={formData.vehicleModel} onChange={e => setFormData({...formData, vehicleModel: e.target.value})} />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-slate-700 mb-1">Telefon</label>
                            <input required type="tel" className="w-full border p-2 rounded" value={formData.phone} onChange={e => setFormData({...formData, phone: e.target.value})} />
                        </div>
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-slate-700 mb-1">Üyelik Seviyesi</label>
                        <select className="w-full border p-2 rounded" value={formData.membershipTier} onChange={(e) => setFormData({...formData, membershipTier: e.target.value as MembershipTier})}>
                            <option value={MembershipTier.BASIC}>Standart</option>
                            <option value={MembershipTier.PREMIUM}>Premium (%10 İndirim)</option>
                            <option value={MembershipTier.VIP}>VIP (%20 İndirim)</option>
                        </select>
                    </div>
                    <button type="submit" className="w-full bg-blue-600 text-white py-3 rounded-lg font-bold hover:bg-blue-700 mt-4">Müşteriyi Kaydet</button>
                </form>
            </div>
        </div>
      )}
    </div>
  );
};

export default CustomerManager;