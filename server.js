const express = require('express');
const path = require('path');
const app = express();

app.use(express.json());
// HTML, CSS ve ikonların klasörden düzgün okunması için statik dosya izni:
app.use(express.static(__dirname)); 

let piyasa = { price: 5.00, history: Array(30).fill(5.00), state: 'STABLE', high: 5.00, low: 5.00, vol: 15420 };
let trollEvent = null; 
let kartSahipleri = ["PAPALES90"]; 

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

app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'index.html'));
});

app.get('/api/price', (req, res) => {
    res.json({ ...piyasa, troll: trollEvent, kartlar: kartSahipleri });
    trollEvent = null; 
});

app.post('/api/admin', (req, res) => {
    const { password, action, isim } = req.body;
    
    if (password !== "asvbnajknsgfkasgsf123" && password !== "asvbnakjknsgfkasgsf123" && password !== "asvbnajknsgfaksgsf123") {
        return res.status(401).json({ message: "Hatalı şifre!" });
    }

    if (['PUMP', 'DUMP', 'AUTO', 'RESET'].includes(action)) {
        piyasa.state = action;
        if (action === 'RESET') { piyasa.price = 5.00; piyasa.state = 'STABLE'; }
        return res.json({ message: "Piyasa yönü değiştirildi!" });
    }
    
    if (action === 'KART_EKLE') {
        if (isim && !kartSahipleri.includes(isim)) {
            kartSahipleri.push(isim);
            return res.json({ message: `${isim} eklendi!` });
        }
        return res.json({ message: "Zaten ekli veya geçersiz isim." });
    }

    if (action.startsWith('TROLL_')) {
        trollEvent = action;
        return res.json({ message: "Troll saldırısı tüm oyunculara gönderildi! 😈" });
    }

    res.json({ message: "Bilinmeyen işlem." });
});

app.listen(3000, () => console.log('Borsa sistemi 3000 portunda aktif! (http://localhost:3000 adresine girin)'));
