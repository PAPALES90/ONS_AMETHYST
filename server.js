const express = require('express');
const path = require('path');
const app = express();

app.use(express.json());
app.use(express.static(__dirname)); 

// Piyasa ve Yapay Zeka Hafızası
let piyasa = { 
    price: 5.00, 
    history: Array(30).fill(5.00), 
    state: 'AUTO', 
    high: 5.00, 
    low: 5.00, 
    vol: 15420,
    maxLimit: 35.00, 
    minLimit: 0.10,
    aiMesaji: "Yapay Zeka piyasayı analiz etmeye başlıyor..."
};
let kartSahipleri = ["PAPALES90"]; 
let aiTrend = 0; // Yapay Zekanın piyasa eğilimi

// CANLI YAPAY ZEKA VE PİYASA DÖNGÜSÜ (Her 2 Saniyede Bir Karar Verir)
setInterval(() => {
    // Yapay Zeka her 2 saniyede bir %20 ihtimalle karar/trend değiştirir
    if (Math.random() > 0.8) {
        aiTrend = (Math.random() * 2) - 1; // -1 (Düşüş Trendi) ile +1 (Yükseliş Trendi) arası
    }

    if (piyasa.state === 'AUTO') {
        // YAPAY ZEKA KONTROLDEYKEN:
        if (piyasa.price >= piyasa.maxLimit - 1.5) {
            // Fiyat tavana yaklaşırsa AI satmaya başlar (Fiyatı ezer)
            piyasa.price -= (Math.random() * 0.4) + 0.1;
            piyasa.aiMesaji = "Tavan limite yaklaşıldı. YZ sert satış baskısı uyguluyor!";
        } else if (piyasa.price <= piyasa.minLimit + 1.5) {
            // Fiyat tabana yaklaşırsa AI toplamaya başlar (Fiyatı yükseltir)
            piyasa.price += (Math.random() * 0.4) + 0.1;
            piyasa.aiMesaji = "Fiyat dipte! YZ piyasayı topluyor (Alım Fırsatı).";
        } else {
            // Normal koşullarda trende göre hareket eder
            piyasa.price += (aiTrend * 0.3) + ((Math.random() - 0.5) * 0.1);
            
            if (aiTrend > 0.3) piyasa.aiMesaji = "YZ yükseliş (Bull) trendi öngörüyor. Hacim artıyor.";
            else if (aiTrend < -0.3) piyasa.aiMesaji = "YZ düşüş (Bear) trendi öngörüyor. Satışlar ağırlıklı.";
            else piyasa.aiMesaji = "Piyasa dengeli ve yatay seyrediyor. Beklemede kalın.";
        }
    } else if (piyasa.state === 'PUMP') {
        piyasa.price += (Math.random() * 0.5) + 0.2;
        piyasa.aiMesaji = "DİKKAT: Yönetici PUMP başlattı! Yapay zeka devre dışı bırakıldı.";
    } else if (piyasa.state === 'DUMP') {
        piyasa.price -= (Math.random() * 0.5) + 0.2;
        piyasa.aiMesaji = "DİKKAT: Yönetici DUMP başlattı! Yapay zeka devre dışı bırakıldı.";
    }

    // Kesin Sınır Kontrolü (Hata Payını Sıfırlar)
    if (piyasa.price > piyasa.maxLimit) piyasa.price = piyasa.maxLimit;
    if (piyasa.price < piyasa.minLimit) piyasa.price = piyasa.minLimit;

    if (piyasa.price > piyasa.high) piyasa.high = piyasa.price.toFixed(2);
    if (piyasa.price < piyasa.low) piyasa.low = piyasa.price.toFixed(2);

    piyasa.history.push(piyasa.price);
    piyasa.history.shift();
    piyasa.vol += Math.floor(Math.random() * 50);
}, 2000);

app.get('/', (req, res) => { res.sendFile(path.join(__dirname, 'index.html')); });
app.get('/api/price', (req, res) => { res.json({ ...piyasa, kartlar: kartSahipleri }); });

app.post('/api/admin', (req, res) => {
    const { password, action, isim, max, min } = req.body;
    
    if (!["asvbnajknsgfkasgsf123", "asvbnakjknsgfkasgsf123", "asvbnajknsgfaksgsf123"].includes(password)) {
        return res.status(401).json({ message: "Hatalı şifre!" });
    }

    if (['PUMP', 'DUMP', 'AUTO', 'RESET'].includes(action)) {
        piyasa.state = action;
        if (action === 'RESET') { piyasa.price = 5.00; piyasa.state = 'AUTO'; }
        return res.json({ message: "Piyasa yönü değiştirildi!" });
    }
    
    if (action === 'KART_EKLE') {
        if (isim && !kartSahipleri.includes(isim)) {
            kartSahipleri.push(isim);
            return res.json({ message: `${isim} eklendi!` });
        }
        return res.json({ message: "Zaten ekli." });
    }

    if (action === 'LIMIT_AYARLA') {
        if (max !== undefined) piyasa.maxLimit = parseFloat(max);
        if (min !== undefined) piyasa.minLimit = parseFloat(min);
        return res.json({ message: "Sınırlar tüm oyuncular için güncellendi!" });
    }
    res.json({ message: "Bilinmeyen işlem." });
});

app.listen(3000, () => console.log('Yapay Zeka Destekli Borsa Sistemi Aktif!'));
