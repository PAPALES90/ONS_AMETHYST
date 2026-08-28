const express = require('express');
const cors = require('cors');
const path = require('path');
const app = express();

app.use(cors());
app.use(express.static(__dirname));

let currentPrice = 5.00;
let priceHistory = Array(30).fill(5.00);
let state = "STABLE"; // STABLE, PUMP, DUMP
let stableTimer = 0;  // 2 dakikalık (120 saniye) bekleme sayacı

setInterval(() => {
    if (state === "STABLE") {
        stableTimer += 2; // Her döngü 2 saniye

        // 2 dakika (120 saniye) dolmadıysa sadece küçük dalgalanma yap
        if (stableTimer < 120) {
            currentPrice += (Math.random() - 0.5) * 0.2;
        } else {
            // 2 dakika dolduktan sonra %20 şansla yükseliş başlat
            if (Math.random() < 0.20) {
                state = "PUMP";
            } else {
                currentPrice += (Math.random() - 0.5) * 0.2;
            }
        }
    } 
    else if (state === "PUMP") {
        currentPrice += Math.random() * 4.0 + 1.0; // Aniden fırla
        if (currentPrice >= 30.00) {
            state = "DUMP"; // Tepeden aniden çöküşe geç
        }
    } 
    else if (state === "DUMP") {
        currentPrice -= Math.random() * 5.0 + 2.0; // Sert çöküş
        if (currentPrice <= 5.00) {
            currentPrice = 5.00;
            state = "STABLE";
            stableTimer = 0; // 2 dakikalık sayacı sıfırla
        }
    }

    currentPrice = Number(Math.max(1.50, currentPrice).toFixed(2));

    priceHistory.shift();
    priceHistory.push(currentPrice);
}, 2000);

app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'index.html'));
});

app.get('/api/price', (req, res) => {
    res.json({
        price: currentPrice,
        history: priceHistory,
        state: state
    });
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Sunucu aktif: ${PORT}`));
