const express = require('express');
const cors = require('cors');
const app = express();

app.use(cors());

let currentPrice = 5.00;
let priceHistory = Array(30).fill(5.00);

let state = "STABLE"; // STABLE, PUMP, DUMP

// Her 3 saniyede bir piyasayı güncelle
setInterval(() => {
    if (state === "STABLE") {
        // %5 ihtimalle yükseliş dalgası (PUMP) başlar
        if (Math.random() < 0.05) {
            state = "PUMP";
        } else {
            // Yavaş ve hafif dalgalanma
            currentPrice += (Math.random() - 0.48) * 0.1;
        }
    } 
    else if (state === "PUMP") {
        // Fiyat aniden fırlıyor (60 Demir seviyelerine doğru)
        currentPrice += Math.random() * 4.5;
        if (currentPrice >= 55) {
            state = "DUMP"; // Zirveye ulaştı, çöküş başlıyor
        }
    } 
    else if (state === "DUMP") {
        // Aniden sert çöküş
        currentPrice -= Math.random() * 7.0;
        if (currentPrice <= 5.00) {
            currentPrice = 5.00;
            state = "STABLE"; // Tekrar durağan döneme geç
        }
    }

    currentPrice = Number(Math.max(2.00, currentPrice).toFixed(2));

    // Geçmiş veriyi güncelle
    priceHistory.shift();
    priceHistory.push(currentPrice);

}, 3000);

// API Uç Noktası (Siteden veri çekmek için)
app.get('/api/price', (req, res) => {
    res.json({
        price: currentPrice,
        history: priceHistory,
        state: state
    });
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Sunucu ${PORT} portunda aktif!`));