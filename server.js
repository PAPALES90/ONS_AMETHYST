const express = require('express');
const cors = require('cors');
const path = require('path');
const app = express();

app.use(cors());
app.use(express.static(__dirname));

let currentPrice = 5.00;
let priceHistory = Array(30).fill(5.00);
let state = "STABLE"; // STABLE, PUMP, DUMP

// Her 3 saniyede bir piyasa hareketini hesapla
setInterval(() => {
    if (state === "STABLE") {
        if (Math.random() < 0.05) {
            state = "PUMP";
        } else {
            currentPrice += (Math.random() - 0.48) * 0.1;
        }
    } 
    else if (state === "PUMP") {
        currentPrice += Math.random() * 4.5;
        if (currentPrice >= 55) {
            state = "DUMP";
        }
    } 
    else if (state === "DUMP") {
        currentPrice -= Math.random() * 7.0;
        if (currentPrice <= 5.00) {
            currentPrice = 5.00;
            state = "STABLE";
        }
    }

    currentPrice = Number(Math.max(2.00, currentPrice).toFixed(2));

    priceHistory.shift();
    priceHistory.push(currentPrice);
}, 3000);

// Ana Sayfa (Siteye girildiğinde index.html açılır)
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'index.html'));
});

// Veri Çekme Endpoint'i
app.get('/api/price', (req, res) => {
    res.json({
        price: currentPrice,
        history: priceHistory,
        state: state
    });
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Sunucu ${PORT} portunda aktif!`));
