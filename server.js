const express = require('express');
const cors = require('cors');
const path = require('path');
const app = express();

app.use(cors());
app.use(express.static(__dirname));

let currentPrice = 5.00;
let priceHistory = Array(30).fill(5.00);
let state = "STABLE"; 

// Her 2 saniyede bir piyasayı zorunlu olarak hareket ettirir
setInterval(() => {
    const chance = Math.random();

    if (state === "STABLE") {
        if (chance < 0.15) {
            state = "PUMP";
        } else if (chance < 0.25) {
            state = "DUMP";
        } else {
            // Küçük rastgele dalgalanmalar (+-0.20 arası)
            currentPrice += (Math.random() - 0.5) * 0.4;
        }
    } 
    else if (state === "PUMP") {
        currentPrice += Math.random() * 2.5 + 0.5;
        if (currentPrice >= 35.00 || Math.random() < 0.2) {
            state = "DUMP";
        }
    } 
    else if (state === "DUMP") {
        currentPrice -= Math.random() * 3.0 + 0.5;
        if (currentPrice <= 5.00) {
            currentPrice = 5.00;
            state = "STABLE";
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
