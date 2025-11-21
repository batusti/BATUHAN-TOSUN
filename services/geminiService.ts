import { GoogleGenAI } from "@google/genai";
import { Transaction, Customer } from '../types';

const getAiClient = () => {
  // NOTE: In a real production app, you should proxy this through a backend 
  // or use a secure way to handle keys.
  const apiKey = process.env.API_KEY || ''; 
  if (!apiKey) {
      console.warn("No API Key found in environment");
      return null;
  }
  return new GoogleGenAI({ apiKey });
};

export const analyzeBusinessPerformance = async (
  transactions: Transaction[],
  customers: Customer[]
): Promise<string> => {
  const ai = getAiClient();
  if (!ai) return "API Anahtarı eksik. Lütfen process.env.API_KEY yapılandırmasını kontrol edin.";

  // Prepare a summary for the prompt to avoid hitting token limits with raw JSON
  const last30Transactions = transactions.slice(-30);
  const totalRevenue = transactions.reduce((acc, t) => acc + t.finalAmount, 0);
  const popularServices = new Map<string, number>();
  
  transactions.forEach(t => {
    t.items.forEach(i => {
      popularServices.set(i.name, (popularServices.get(i.name) || 0) + 1);
    });
  });

  // Find top service
  let topService = '';
  let topCount = 0;
  popularServices.forEach((count, name) => {
    if(count > topCount) {
        topCount = count;
        topService = name;
    }
  });

  const prompt = `
    Bir oto yıkama işletmesi için kıdemli bir iş danışmanı olarak hareket et.
    İşte güncel veriler:
    - Toplam Müşteri: ${customers.length}
    - Toplam Gelir (Tüm zamanlar): ${totalRevenue.toFixed(2)} TL
    - En Popüler Hizmet: ${topService}
    - Son 30 İşlem Örneği: ${JSON.stringify(last30Transactions.map(t => ({ date: t.timestamp, amount: t.finalAmount, services: t.items.map(i=>i.name) })))}
    
    Lütfen 3 maddelik kısa bir yönetici özeti hazırla (Türkçe yanıt ver):
    1. Gelir Trendi Analizi.
    2. Verilere dayalı Müşteri Sadakati önerisi.
    3. Performansı düşük hizmetler için satışları artıracak bir pazarlama fikri.
    
    Profesyonel ve uygulanabilir olmalı.
  `;

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: prompt,
    });
    return response.text || "Analiz oluşturulamadı.";
  } catch (error) {
    console.error("Gemini Analiz Hatası:", error);
    return "AI servisine bağlanırken hata oluştu. Lütfen API anahtarınızı kontrol edin.";
  }
};