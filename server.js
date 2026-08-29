const express = require('express');
const cors = require('cors');
const path = require('path');
const fs = require('fs');
const app = express();

app.use(cors());
app.use(express.json());
app.use(express.static(__dirname));

const DATA_FILE = path.join(__dirname, 'veri.json');
const ADMIN_PASSWORD = "asvbnajknsgfkasgsf123"; // Belirlediğin Yönetici Şifresi

let data = {
    currentPrice: 5.00,
    priceHistory: Array(30).fill(5.00),
    high24: 5.00,
    low24: 5.00,
    volume: 14250
};

if (fs.existsSync(DATA_FILE)) {
    try {
        data = JSON.parse(fs.readFileSync(DATA_FILE, 'utf8'));
    } catch (e) {
        console.error("Veri okuma hatası, varsayılanla başlanıyor.");
    }
}

let state = "STABLE"; 
let manualOverride = false; // Manuel müdahale var mı?
let trend = 0; 

setInterval(() => {
    if (!manualOverride) {
        if (Math.random() < 0.15) trend = (Math.random() - 0.5) * 2;

        let volatility = (Math.random() - 0.5) * 0.4;
        let change = (trend * 0.3) + volatility;
        
        data.currentPrice += change;
        data.currentPrice = Number(Math.max(1.00, data.currentPrice).toFixed(2));

        if (change > 0.3) state = "PUMP";
        else if (change < -0.3) state = "DUMP";
        else state = "STABLE";
    } else {
        // Manuel mod hareketleri
        if (state === "PUMP") {
            data.currentPrice += Number((Math.random() * 0.8 + 0.2).toFixed(2));
        } else if (state === "DUMP") {
            data.currentPrice -= Number((Math.random() * 0.8 + 0.2).toFixed(2));
            data.currentPrice = Math.max(1.00, data.currentPrice);
        }
    }

    if (data.currentPrice > data.high24) data.high24 = data.currentPrice;
    if (data.currentPrice < data.low24) data.low24 = data.currentPrice;
    data.volume += Math.floor(Math.random() * 85); 

    data.priceHistory.shift();
    data.priceHistory.push(data.currentPrice);

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

// Admin Müdahale API'si
app.post('/api/admin', (req, res) => {
    const { password, action } = req.body;
    
    if (password !== ADMIN_PASSWORD) {
        return res.status, res.json({ success: false, message: "Hatalı Şifre!" });
    }

    if (action === "PUMP") {
        manualOverride = true;
        state = "PUMP";
    } else if (action === "DUMP") {
        manualOverride = true;
        state = "DUMP";
    } else if (action === "AUTO") {
        manualOverride = false;
        state = "STABLE";
    } else if (action === "RESET") {
        data.currentPrice = 5.00;
        manualOverride = false;
        state = "STABLE";
    }

    res.json({ success: true, message: `İşlem Başarılı: ${action}` });
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Sunucu aktif: ${PORT}`));
