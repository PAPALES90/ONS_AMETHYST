const express = require('express');
const path = require('path');
const app = express();

// Sunucunun JSON formatını okuyabilmesi için gerekli
app.use(express.json());

// SUNUCUYA HTML'İ NEREDE BULACAĞINI SÖYLÜYORUZ (Beyaz ekran hatasının çözümü)
app.use(express.static(__dirname)); 

// Ana sayfaya (kök dizine) girildiğinde doğrudan index.html'i göster
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'index.html'));
});

// ==========================================
// 1. BÖLÜM: PİYASA (BORSA) SİSTEMİ
// ==========================================
let currentPrice = 5.00;
let history = Array(30).fill(5.00);
let statHigh = 5.00;
let statLow = 5.00;
let statVol = 15400; 
let marketState = 'AUTO'; // Durumlar: PUMP, DUMP, AUTO, STABLE

// Piyasa Motoru (Her 2 saniyede bir fiyatı günceller)
setInterval(() => {
    let degisim = 0;
    if (marketState === 'AUTO') {
        // YZ Rastgele dalgalanma (-0.2 ile +0.2 arası)
        degisim = (Math.random() * 0.4) - 0.2;
    } else if (marketState === 'PUMP') {
        // Sürekli artış (+0.1 ile +0.5 arası)
        degisim = (Math.random() * 0.4) + 0.1;
    } else if (marketState === 'DUMP') {
        // Sürekli düşüş (-0.1 ile -0.5 arası)
        degisim = (Math.random() * -0.4) - 0.1;
    }

    if (marketState !== 'STABLE') {
        currentPrice += degisim;
        if (currentPrice < 0.1) currentPrice = 0.1; // Fiyat sıfırın altına düşmesin

        // İstatistikleri güncelle
        if (currentPrice > statHigh) statHigh = currentPrice;
        if (currentPrice < statLow) statLow = currentPrice;
        statVol += Math.floor(Math.random() * 50);

        // Geçmişe ekle, eskiyi sil (Grafik için)
        history.push(currentPrice);
        history.shift();
    }
}, 2000);

// Sitenin Fiyat Çekme API'si (Ön yüzdeki grafik buraya bağlanır)
app.get('/api/price', (req, res) => {
    res.json({
        price: currentPrice,
        history: history,
        stats: { high: statHigh.toFixed(2), low: statLow.toFixed(2), vol: statVol },
        state: marketState
    });
});

// Admin Paneli API'si (Sitedeki butonlar buraya sinyal yollar)
app.post('/api/admin', (req, res) => {
    const { password, action } = req.body;
    if (password === "asvbnajknsgfkasgsf123") {
        if (action === 'RESET') {
            currentPrice = 5.00;
            history = Array(30).fill(5.00);
            marketState = 'STABLE';
            return res.json({ message: "Piyasa 5.00 değerine sıfırlandı ve durduruldu!" });
        }
        marketState = action;
        res.json({ message: `Piyasa durumu ${action} olarak güncellendi!` });
    } else {
        res.status(401).json({ message: "Yetkisiz işlem! Şifre yanlış." });
    }
});


// ==========================================
// 2. BÖLÜM: MİNECRAFT CÜZDAN KÖPRÜSÜ
// ==========================================
const cuzdanlar = {}; // Geçici hafıza

// Aternos'taki Skript'in veri fırlatacağı kapı (POST İstegi)
app.post('/api/minecraft/gonder', (req, res) => {
    const { oyuncu, kod, demir, ametist } = req.body;
    
    if (!oyuncu || !kod) {
        return res.status(400).json({ hata: "Eksik veri gönderildi" });
    }
    
    // Minecraft'tan gelen gerçek veriyi koda bağlayıp hafızaya alıyoruz
    cuzdanlar[kod] = { oyuncu, demir, ametist };
    console.log(`[API] Yeni cüzdan verisi ulaştı: ${oyuncu} -> ${kod} (Demir: ${demir}, Ametist: ${ametist})`);
    
    res.json({ durum: "basarili" });
});

// Sitedeki "Hesabı Bağla" butonunun kodu sorguladığı kapı (GET İstegi)
app.get('/api/cuzdan/:kod', (req, res) => {
    const girilenKod = req.params.kod;
    const veri = cuzdanlar[girilenKod];
    
    if (veri) {
        res.json({ durum: "bulundu", veri: veri });
    } else {
        res.json({ durum: "hata", mesaj: "Kod bulunamadı veya geçersiz!" });
    }
});

// ==========================================
// SUNUCUYU BAŞLAT
// ==========================================
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`🚀 ONS_AMETHYST API ${PORT} portunda başarıyla çalışıyor!`);
});
