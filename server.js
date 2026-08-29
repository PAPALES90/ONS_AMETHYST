const express = require('express');
const app = express();
const path = require('path');

app.use(express.json());
app.use(express.static(__dirname)); 

// GLOBAL PİYASA VE SUNUCU HAFIZASI
let piyasa = { price: 5.00, history: Array(30).fill(5.00), state: 'STABLE', high: 5.00, low: 5.00, vol: 15420 };
let trollEvent = null; // Jumpscare ve şakalar için tetikleyici
let kartSahipleri = ["PAPALES90"]; // Sayfa yenilense de isimler burada tutulur

// Fiyat herkese aynı gitsin diye sadece sunucuda tek bir döngüde hesaplanır
setInterval(() => {
    if (piyasa.state === 'PUMP') piyasa.price += (Math.random() * 0.4) + 0.1;
    else if (piyasa.state === 'DUMP') piyasa.price -= (Math.random() * 0.4) + 0.1;
    else if (piyasa.state === 'AUTO') piyasa.price += (Math.random() - 0.5) * 0.15;

    if (piyasa.price < 0.1) piyasa.price = 0.1;
    if (piyasa.price > piyasa.high) piyasa.high = piyasa.price.toFixed(2);
    if (piyasa.price < piyasa.low) piyasa.low = piyasa.price.toFixed(2);

    piyasa.history.push(piyasa.price);
    piyasa.history.shift();
    piyasa.vol += Math.floor(Math.random() * 50);
}, 2000);

// Sitedeki herkes bu veriyi çeker
app.get('/api/price', (req, res) => {
    res.json({ ...piyasa, troll: trollEvent, kartlar: kartSahipleri });
    trollEvent = null; // Troll olayı bir kere çalıştıktan sonra herkeste susması için sıfırlanır
});

// Admin Paneli İşlemleri
app.post('/api/admin', (req, res) => {
    const { password, action, isim } = req.body;
    
    // Şifre kontrolü
    if (password !== "asvbnajknsgfkasgsf123" && password !== "asvbnakjknsgfkasgsf123" && password !== "asvbnajknsgfaksgsf123") {
        return res.status(401).json({ message: "Hatalı şifre!" });
    }

    // Piyasa Yönlendirmeleri
    if (['PUMP', 'DUMP', 'AUTO', 'RESET'].includes(action)) {
        piyasa.state = action;
        if (action === 'RESET') { piyasa.price = 5.00; piyasa.state = 'STABLE'; }
        return res.json({ message: "Piyasa yönü değiştirildi!" });
    }
    
    // Kalıcı Kart Ekleme
    if (action === 'KART_EKLE') {
        if (isim && !kartSahipleri.includes(isim)) {
            kartSahipleri.push(isim);
            return res.json({ message: `${isim} eklendi!` });
        }
        return res.json({ message: "Zaten ekli veya geçersiz isim." });
    }

    // TROLL Butonları
    if (action.startsWith('TROLL_')) {
        trollEvent = action;
        return res.json({ message: "Troll saldırısı tüm oyunculara gönderildi! 😈" });
    }

    res.json({ message: "İşlem algılanamadı." });
});

app.listen(3000, () => console.log('Borsa SMP Sunucusu 3000 portunda aktif!'));
