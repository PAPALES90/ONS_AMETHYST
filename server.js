const express = require('express');
const app = express();

// Sunucunun JSON formatını okuyabilmesi için gerekli
app.use(express.json()); 
app.use(express.static('public')); // HTML/CSS dosyaların public klasöründeyse

// Geçici Veritabanı: Sunucu kapanana kadar kodları hafızada tutar
const cüzdanlar = {};

// 1. Skript'ten Gelen Veriyi Karşılama Kapısı (POST İstegi)
app.post('/api/minecraft/gonder', (req, res) => {
    const { oyuncu, kod, demir, ametist } = req.body;
    
    if (!oyuncu || !kod) {
        return res.status(400).json({ hata: "Eksik veri gönderildi" });
    }
    
    // Minecraft'tan gelen gerçek veriyi koda bağlayıp hafızaya alıyoruz
    cüzdanlar[kod] = { oyuncu, demir, ametist };
    console.log(`[API] Yeni cüzdan verisi ulaştı: ${oyuncu} -> ${kod}`);
    
    res.json({ durum: "basarili" });
});

// 2. Web Sitesinin Kodu Sorgulama Kapısı (GET İstegi)
app.get('/api/cuzdan/:kod', (req, res) => {
    const girilenKod = req.params.kod;
    const veri = cüzdanlar[girilenKod];
    
    if (veri) {
        res.json({ durum: "bulundu", veri: veri });
    } else {
        res.json({ durum: "hata", mesaj: "Kod bulunamadı veya geçersiz!" });
    }
});

// Portu dinle
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Borsa API ${PORT} portunda aktif!`));
