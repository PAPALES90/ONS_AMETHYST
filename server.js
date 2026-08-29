const express = require('express');
const cors = require('cors');
const path = require('path');
const app = express();

app.use(cors());
app.use(express.static(__dirname));

let currentPrice = 5.00;
let priceHistory = Array(30).fill(5.00);
let state = "STABLE"; // PUMP, DUMP, STABLE
let trend = 0; // Piyasanın anlık yönü (-1 düşüş, +1 yükseliş)

// Canlı İstatistik Verileri
let high24 = 5.00;
let low24 = 5.00;
let volume = 14250; // Başlangıç için sahte hacim

setInterval(() => {
    // %15 ihtimalle piyasanın genel yönü (trendi) değişir
    if (Math.random() < 0.15) {
        trend = (Math.random() - 0.5) * 2;
    }

    // Fiyat değişimi = Trendin etkisi + Rastgele piyasa gürültüsü
    let volatility = (Math.random() - 0.5) * 0.4;
    let change = (trend * 0.3) + volatility;
    
    currentPrice += change;

    // Fiyatın asla 1.00 demirin altına düşmemesini sağla
    currentPrice = Number(Math.max(1.00, currentPrice).toFixed(2));

    // Durum Belirleme (Arayüzdeki rozet için)
    if (change > 0.3) {
        state = "PUMP";
    } else if (change < -0.3) {
        state = "DUMP";
    } else {
        state = "STABLE";
    }

    // İstatistikleri Güncelle
    if (currentPrice > high24) high24 = currentPrice;
    if (currentPrice < low24) low24 = currentPrice;
    volume += Math.floor(Math.random() * 85); // Hacmi sürekli artır

    priceHistory.shift();
    priceHistory.push(currentPrice);
}, 2000);

app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'index.html'));
});

// Arayüze fiyatla birlikte istatistikleri de gönderiyoruz
app.get('/api/price', (req, res) => {
    res.json({
        price: currentPrice,
        history: priceHistory,
        state: state,
        stats: {
            high: high24.toFixed(2),
            low: low24.toFixed(2),
            vol: volume
        }
    });
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Sunucu aktif: ${PORT}`));
