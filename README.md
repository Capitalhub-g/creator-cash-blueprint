# Creator Cash Blueprint
**Versie:** 1.4 — Volledig geïntegreerd  
**Markt:** Verenigde Staten (Engels)  
**Laatste update:** April 2026

---

## 📦 Project overzicht
Professionele landingspagina voor de verkoop van 3 digitale PDF-gidsen over faceless content creation. Inclusief volledig werkend PDF download systeem met token-gebaseerde toegangsbeveiliging.

---

## 🗂️ Bestandsstructuur

```
creator-cash-blueprint/
├── creator-cash-blueprint.html   ← Standalone (dubbelklik om te openen)
├── index.html                    ← Hoofdpagina
├── index-standalone.html         ← Vorige standalone versie
├── style.css                     ← Alle stijlen
├── main.js                       ← Hoofd JavaScript
├── js/
│   └── downloads.js              ← Payment + download redirect systeem
├── download.html                 ← Download pagina (na betaling)
├── login.html                    ← Login / Register
├── privacy.html                  ← Privacy Policy
├── terms.html                    ← Terms of Service
├── refund.html                   ← Refund Policy
├── pdfs/
│   ├── Faceless_YouTube_Basic.pdf    ← PDF 1 (Basic $29)
│   ├── Faceless_YouTube_Medium.pdf   ← PDF 2 (Medium $65)
│   └── Faceless_YouTube_Premium.pdf  ← PDF 3 (Premium $95)
└── README.md
```

---

## 💰 Pakket → PDF toewijzing

| Pakket | Prijs | PDFs die klant ontvangt |
|--------|-------|------------------------|
| Basic | $29 | PDF 1 |
| Medium | $65 | PDF 1 + PDF 2 |
| Premium | $95 | PDF 1 + PDF 2 + PDF 3 |
| Bundle | $149 | PDF 1 + PDF 2 + PDF 3 |

---

## 🧪 Download systeem testen

### Test Basic pakket:
```
download.html?demo=basic
```

### Test Medium pakket:
```
download.html?demo=medium
```

### Test Premium pakket:
```
download.html?demo=premium
```

### Test Bundle:
```
download.html?demo=bundle
```

### Test Toegang geweigerd:
```
download.html
```
(zonder params = Access Denied pagina)

---

## 🔒 Beveiligingssysteem

Tokens worden gegenereerd na betaling:
- Formaat: `base64(pakket:timestamp:secret)`
- Verloopt na 30 dagen
- Pakket-specifiek (basic/medium/premium/bundle)
- URL: `download.html?token=XXX&pkg=basic`

**Voor productie:** Vervang token validatie door server-side verificatie.

---

## 🚀 Online zetten

### Netlify (60 seconden)
1. Ga naar **app.netlify.com/drop**
2. Sleep projectmap erheen
3. ✅ Direct live

### Custom domein
- Netlify: Site settings → Domain management
- Vercel: Project settings → Domains

---

## ✅ Lanceer checklist

- [x] Website ontwerp + YouTube thema
- [x] Volledig Engels
- [x] PDF 1 geïntegreerd (Basic)
- [x] PDF 2 geïntegreerd (Medium)
- [x] PDF 3 geïntegreerd (Premium)
- [x] Download pagina met pakket-specifieke PDFs
- [x] Token-gebaseerde toegangsbeveiliging
- [x] GitHub backup
- [ ] Stripe betalingen live koppelen
- [ ] PayPal betalingen live koppelen
- [ ] Eigen domein koppelen
- [ ] Lancering 🚀

---

## 📅 Versiehistorie

| Versie | Wijzigingen |
|--------|-------------|
| v1.0 | Initiële website |
| v1.1 | YouTube thema, streepjes verwijderd |
| v1.2 | Volledig Engels |
| v1.3 | PDF 1 & 2 ontvangen, GitHub backup |
| v1.4 | PDF 3 ontvangen, download systeem geïntegreerd |
