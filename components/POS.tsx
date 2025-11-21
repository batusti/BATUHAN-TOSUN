import React, { useState } from 'react';
import { db } from '../services/dbService';
import { Customer, ServiceItem, Transaction } from '../types';

const POS: React.FC = () => {
  const [plateSearch, setPlateSearch] = useState('');
  const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(null);
  const [selectedServices, setSelectedServices] = useState<ServiceItem[]>([]);
  const [redeemPoints, setRedeemPoints] = useState(0);
  const [lastTransaction, setLastTransaction] = useState<Transaction | null>(null);

  const allServices = db.getServices();

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    const customer = db.findCustomerByPlate(plateSearch);
    if (customer) {
        setSelectedCustomer(customer);
        setPlateSearch('');
    } else {
        alert('Müşteri bulunamadı. Lütfen önce kayıt yapın.');
    }
  };

  const toggleService = (service: ServiceItem) => {
    if (selectedServices.find(s => s.id === service.id)) {
        setSelectedServices(selectedServices.filter(s => s.id !== service.id));
    } else {
        setSelectedServices([...selectedServices, service]);
    }
  };

  // Calculations
  const subtotal = selectedServices.reduce((sum, s) => sum + s.price, 0);
  const membershipDiscount = selectedCustomer?.membershipTier === 'VIP' ? 0.2 : selectedCustomer?.membershipTier === 'Premium' ? 0.1 : 0;
  const discountAmount = subtotal * membershipDiscount;
  const pointsDiscountValue = (redeemPoints / 100) * 50; // 100 pts = 50 TL
  const total = Math.max(0, subtotal - discountAmount - pointsDiscountValue);

  const handleCheckout = () => {
    if (!selectedCustomer) return;
    const transaction = db.createTransaction(selectedCustomer, selectedServices, redeemPoints);
    setLastTransaction(transaction);
    // Reset
    setSelectedCustomer(null);
    setSelectedServices([]);
    setRedeemPoints(0);
  };

  if (lastTransaction) {
    return (
        <div className="max-w-lg mx-auto bg-white p-8 rounded-xl shadow-lg border border-slate-200 text-center">
            <div className="w-16 h-16 bg-green-100 text-green-600 rounded-full flex items-center justify-center text-3xl mx-auto mb-4">✓</div>
            <h2 className="text-2xl font-bold text-slate-800 mb-2">Ödeme Başarılı!</h2>
            <p className="text-slate-500 mb-6">İşlem ID: #{lastTransaction.id.slice(0,8)}</p>
            
            <div className="bg-slate-50 p-4 rounded-lg text-left space-y-2 mb-6 text-sm">
                <div className="flex justify-between"><span>Müşteri:</span> <span className="font-medium">{lastTransaction.customerName}</span></div>
                <div className="flex justify-between"><span>Ödenen Tutar:</span> <span className="font-bold text-lg">{lastTransaction.finalAmount.toFixed(2)} ₺</span></div>
                <div className="flex justify-between text-green-600"><span>Kazanılan Puan:</span> <span>+{Math.floor(lastTransaction.finalAmount / 10)}</span></div>
            </div>

            <button 
                onClick={() => setLastTransaction(null)}
                className="w-full bg-blue-600 text-white py-3 rounded-lg font-bold hover:bg-blue-700"
            >
                Sonraki Müşteri
            </button>
        </div>
    );
  }

  return (
    <div className="flex flex-col lg:flex-row gap-6 h-[calc(100vh-140px)]">
      {/* Left: Service Selection */}
      <div className="flex-1 bg-white rounded-xl shadow-sm p-6 overflow-y-auto">
        <h2 className="text-xl font-bold mb-6 text-slate-800">Hizmet Seçimi</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {allServices.map(service => (
                <div 
                    key={service.id}
                    onClick={() => toggleService(service)}
                    className={`cursor-pointer p-4 rounded-xl border-2 transition-all ${
                        selectedServices.find(s => s.id === service.id) 
                        ? 'border-blue-500 bg-blue-50' 
                        : 'border-slate-100 hover:border-blue-200'
                    }`}
                >
                    <div className="flex justify-between items-center mb-2">
                        <h3 className="font-bold text-slate-800">{service.name}</h3>
                        <span className="font-bold text-blue-600">{service.price} ₺</span>
                    </div>
                    <span className="text-xs text-slate-400 uppercase tracking-wide">{service.category}</span>
                </div>
            ))}
        </div>
      </div>

      {/* Right: Customer & Checkout */}
      <div className="w-full lg:w-96 bg-slate-900 text-white rounded-xl shadow-xl p-6 flex flex-col">
        <h2 className="text-xl font-bold mb-4">İşlem Detayları</h2>
        
        {/* Customer Search */}
        {!selectedCustomer ? (
            <div className="mb-6">
                <label className="block text-xs text-slate-400 mb-1">Müşteri Bul</label>
                <form onSubmit={handleSearch} className="flex gap-2">
                    <input 
                        type="text" 
                        placeholder="PLAKA..." 
                        className="flex-1 bg-slate-800 border border-slate-700 rounded px-3 py-2 text-white placeholder-slate-500 uppercase"
                        value={plateSearch}
                        onChange={e => setPlateSearch(e.target.value.toUpperCase())}
                    />
                    <button type="submit" className="bg-blue-600 px-4 rounded font-bold">Git</button>
                </form>
            </div>
        ) : (
            <div className="mb-6 bg-slate-800 p-4 rounded-lg border border-slate-700 relative">
                <button onClick={() => setSelectedCustomer(null)} className="absolute top-2 right-2 text-slate-500 hover:text-white">✕</button>
                <h3 className="font-bold text-lg">{selectedCustomer.name}</h3>
                <p className="text-sm text-slate-400 mb-2">{selectedCustomer.vehicleModel} • <span className="font-mono bg-slate-900 px-1 rounded">{selectedCustomer.licensePlate}</span></p>
                
                <div className="flex items-center gap-2 text-xs">
                    <span className={`px-2 py-0.5 rounded-full ${
                        selectedCustomer.membershipTier === 'VIP' ? 'bg-purple-500' : 
                        selectedCustomer.membershipTier === 'Premium' ? 'bg-amber-500' : 'bg-slate-600'
                    }`}>
                        {selectedCustomer.membershipTier}
                    </span>
                    <span className="text-blue-400 font-bold">{selectedCustomer.points} puan</span>
                </div>
            </div>
        )}

        {/* Summary */}
        <div className="flex-1 space-y-2 overflow-y-auto mb-4 text-sm">
            {selectedServices.map(s => (
                <div key={s.id} className="flex justify-between py-2 border-b border-slate-800">
                    <span>{s.name}</span>
                    <span>{s.price.toFixed(2)} ₺</span>
                </div>
            ))}
            {selectedServices.length === 0 && <p className="text-slate-500 italic text-center py-4">Hizmet seçilmedi</p>}
        </div>

        {/* Totals */}
        <div className="space-y-3 border-t border-slate-700 pt-4">
            <div className="flex justify-between text-slate-400">
                <span>Ara Toplam</span>
                <span>{subtotal.toFixed(2)} ₺</span>
            </div>
            {selectedCustomer && membershipDiscount > 0 && (
                 <div className="flex justify-between text-amber-400">
                    <span>{selectedCustomer.membershipTier} İndirimi</span>
                    <span>-{discountAmount.toFixed(2)} ₺</span>
                </div>
            )}
            {selectedCustomer && selectedCustomer.points >= 100 && (
                 <div className="flex justify-between items-center text-blue-400">
                    <span>Puan Kullan (100p = 50₺)</span>
                    <select 
                        className="bg-slate-800 border border-slate-700 rounded text-xs p-1"
                        value={redeemPoints}
                        onChange={(e) => setRedeemPoints(Number(e.target.value))}
                    >
                        <option value={0}>Yok</option>
                        {[...Array(Math.floor(selectedCustomer.points / 100))].map((_, i) => (
                            <option key={i} value={(i + 1) * 100}>{(i + 1) * 100} p (-{((i + 1) * 50).toFixed(0)}₺)</option>
                        ))}
                    </select>
                </div>
            )}
            <div className="flex justify-between text-2xl font-bold pt-2 border-t border-slate-700">
                <span>Toplam</span>
                <span>{total.toFixed(2)} ₺</span>
            </div>
        </div>

        <button 
            onClick={handleCheckout}
            disabled={!selectedCustomer || selectedServices.length === 0}
            className="w-full mt-6 bg-green-500 hover:bg-green-600 disabled:bg-slate-700 disabled:text-slate-500 text-white py-4 rounded-xl font-bold text-lg shadow-lg transition-all"
        >
            Ödemeyi Tamamla
        </button>
      </div>
    </div>
  );
};

export default POS;