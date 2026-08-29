const express = require('express');
const cors = require('cors');
const path = require('path');
const fs = require('fs');
const app = express();

app.use(cors());
app.use(express.static(__dirname));

const DATA_FILE = path.join(__dirname, 'veri.json');

// Varsayılan veriler
let data = {
    currentPrice: 5.00,
    priceHistory: Array(30).fill(5.00),
    high24: 5.00,
    low24: 5.00,
    volume: 14250
};

// Sunucu yeniden başlarsa eski verileri kurtar
if (fs.existsSync(DATA_FILE)) {
    try {
        data = JSON.parse(fs.readFileSync(DATA_FILE, 'utf8'));
    } catch (e) {
        console.error("Veri okuma hatası, varsayılanla başlanıyor.");
    }
}

let state = "STABLE"; 
let trend = 0; 

setInterval(() => {
    // Trend ve dalgalanma hesaplamaları
    if (Math.random() < 0.15) trend = (Math.random() - 0.5) * 2;

    let volatility = (Math.random() - 0.5) * 0.4;
    let change = (trend * 0.3) + volatility;
    
    data.currentPrice += change;
    data.currentPrice = Number(Math.max(1.00, data.currentPrice).toFixed(2));

    if (change > 0.3) state = "PUMP";
    else if (change < -0.3) state = "DUMP";
    else state = "STABLE";

    if (data.currentPrice > data.high24) data.high24 = data.currentPrice;
    if (data.currentPrice < data.low24) data.low24 = data.currentPrice;
    data.volume += Math.floor(Math.random() * 85); 

    data.priceHistory.shift();
    data.priceHistory.push(data.currentPrice);

    // Her 2 saniyede bir veriyi dosyaya yaz (Sunucu kapansa da veri uçmaz)
    fs.writeFileSync(DATA_FILE, JSON.stringify(data));
}, 2000);

app.get('/', (req, res) => res.sendFile(path.join(__dirname, 'index.html')));

app.get('/api/price', (req, res) => {
    res.json({
        price: data.currentPrice,
        history: data.priceHistory,
        state: state,
        stats: { high: data.high24.toFixed(2), low: data.low24.toFixed(2), vol: data.volume }
    });
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Sunucu aktif: ${PORT}`));
