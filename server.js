const express = require('express');
const path = require('path');
const app = express();

app.use(express.json());
app.use(express.static(__dirname)); 

// Piyasa ve Limit Hafızası
let piyasa = { 
    price: 5.00, 
    history: Array(30).fill(5.00), 
    state: 'STABLE', 
    high: 5.00, 
    low: 5.00, 
    vol: 15420,
    maxLimit: 35.00, // Varsayılan En Yüksek
    minLimit: 0.10   // Varsayılan En Düşük
};
let kartSahipleri = ["PAPALES90"]; 

// Yapay Zeka ve Piyasa Döngüsü
setInterval(() => {
    if (piyasa.state === 'PUMP') piyasa.price += (Math.random() * 0.4) + 0.1;
    else if (piyasa.state === 'DUMP') piyasa.price -= (Math.random() * 0.4) + 0.1;
    else if (piyasa.state === 'AUTO') piyasa.price += (Math.random() - 0.5) * 0.15;

    // LİMİT KONTROLÜ (Yapay Zeka burada sınırları korur)
    if (piyasa.price > piyasa.maxLimit) piyasa.price = piyasa.maxLimit;
    if (piyasa.price < piyasa.minLimit) piyasa.price = piyasa.minLimit;

    if (piyasa.price > piyasa.high) piyasa.high = piyasa.price.toFixed(2);
    if (piyasa.price < piyasa.low) piyasa.low = piyasa.price.toFixed(2);

    piyasa.history.push(piyasa.price);
    piyasa.history.shift();
    piyasa.vol += Math.floor(Math.random() * 50);
}, 2000);

app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'index.html'));
});

// Veri Dağıtımı
app.get('/api/price', (req, res) => {
    res.json({ ...piyasa, kartlar: kartSahipleri });
});

// Admin Paneli İstekleri
app.post('/api/admin', (req, res) => {
    const { password, action, isim, max, min } = req.body;
    
    if (!["asvbnajknsgfkasgsf123", "asvbnakjknsgfkasgsf123", "asvbnajknsgfaksgsf123"].includes(password)) {
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
        return res.json({ message: "Zaten ekli." });
    }

    // Limit Değiştirme Komutu
    if (action === 'LIMIT_AYARLA') {
        if (max !== undefined) piyasa.maxLimit = parseFloat(max);
        if (min !== undefined) piyasa.minLimit = parseFloat(min);
        
        // Fiyat şu an limitin dışındaysa hemen limite eşitle
        if (piyasa.price > piyasa.maxLimit) piyasa.price = piyasa.maxLimit;
        if (piyasa.price < piyasa.minLimit) piyasa.price = piyasa.minLimit;
        
        return res.json({ message: "Sınırlar tüm oyuncular için güncellendi!" });
    }

    res.json({ message: "Bilinmeyen işlem." });
});

app.listen(3000, () => console.log('Sistem 3000 portunda süper pürüzsüz çalışıyor!'));
