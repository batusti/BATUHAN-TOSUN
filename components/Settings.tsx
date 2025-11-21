import React from 'react';
import { db } from '../services/dbService';

const Settings: React.FC = () => {
  const handleBackup = () => {
    const data = db.getBackupData();
    const blob = new Blob([data], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `sparklewash_yedek_${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const handleRestore = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (event) => {
        const content = event.target?.result as string;
        if (content) {
            if (db.restoreData(content)) {
                alert('Veriler başarıyla geri yüklendi! Sayfa yenileniyor...');
                window.location.reload();
            } else {
                alert('Geri yükleme başarısız. Geçersiz dosya formatı.');
            }
        }
    };
    reader.readAsText(file);
  };

  return (
    <div className="max-w-2xl mx-auto space-y-8">
       <h2 className="text-2xl font-bold text-slate-800">Ayarlar</h2>

       <div className="bg-white rounded-xl shadow-sm p-6">
            <h3 className="text-lg font-bold mb-4 text-slate-700 border-b pb-2">Veri Yönetimi</h3>
            <p className="text-sm text-slate-500 mb-6">
                Verileriniz şu anda tarayıcınızın yerel depolama alanında saklanmaktadır. 
                Veri kaybını önlemek için düzenli olarak yedek alın.
            </p>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="border border-slate-200 rounded-lg p-4 bg-slate-50">
                    <h4 className="font-bold text-slate-800 mb-2">Veriyi Yedekle</h4>
                    <p className="text-xs text-slate-500 mb-4">Tüm müşteri ve işlem verilerini içeren bir JSON dosyası indirin.</p>
                    <button onClick={handleBackup} className="bg-blue-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-blue-700 transition w-full">
                        Yedeği İndir
                    </button>
                </div>

                <div className="border border-slate-200 rounded-lg p-4 bg-slate-50">
                    <h4 className="font-bold text-slate-800 mb-2">Veriyi Geri Yükle</h4>
                    <p className="text-xs text-slate-500 mb-4">Daha önce kaydedilmiş bir JSON yedek dosyasını yükleyin.</p>
                    <label className="bg-slate-200 text-slate-700 px-4 py-2 rounded-lg text-sm font-medium hover:bg-slate-300 transition w-full cursor-pointer block text-center">
                        Dosya Seç
                        <input type="file" accept=".json" className="hidden" onChange={handleRestore} />
                    </label>
                </div>
            </div>
       </div>
       
       <div className="bg-white rounded-xl shadow-sm p-6">
            <h3 className="text-lg font-bold mb-4 text-slate-700 border-b pb-2">Hakkında</h3>
            <p className="text-sm text-slate-600">SparkleWash Yöneticisi v1.0.0</p>
            <p className="text-xs text-slate-400 mt-1">Tablet ve Masaüstü bilgisayarlarda optimum performans için tasarlanmıştır.</p>
       </div>
    </div>
  );
};

export default Settings;