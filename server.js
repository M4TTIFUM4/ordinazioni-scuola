// ========================================
// SERVER ORDINAZIONI SCUOLA - VERSIONE COMPLETA
// ========================================

const express = require('express');
const fs = require('fs');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3000;
const ORDERS_FILE = 'orders.json';

// ========================================
// CONFIGURAZIONE PRODOTTI E PREZZI
// ========================================

const PRODOTTI = {
  felpe: [
    {
      id: 'felpa-blu-bianca',
      nome: 'Felpa Blu con Scritta Bianca',
      colore: 'blu',
      scritta: 'bianca',
      prezzo: 25.00,
      immagine: '/images/felpa-blu-bianca.png',
      taglie: ['S', 'M', 'L', 'XL', 'XXL']
    },
    {
      id: 'felpa-grigia-nera',
      nome: 'Felpa Bianca con Scritta Nera',
      colore: 'grigia',
      scritta: 'nera',
      prezzo: 25.00,
      immagine: '/images/felpa-bianca-nera.png',
      taglie: ['S', 'M', 'L', 'XL', 'XXL']
    },
    {
      id: 'felpa-grigia-blu',
      nome: 'Felpa Grigia con Scritta Blu',
      colore: 'grigia',
      scritta: 'blu',
      prezzo: 25.00,
      immagine: '/images/felpa-grigia-blu.png',
      taglie: ['S', 'M', 'L', 'XL', 'XXL']
    }
  ],
  magliette: [
    {
      id: 'maglietta-meccanico',
      nome: 'Maglietta Meccanico',
      indirizzo: 'Meccanico',
      prezzo: 15.00,
      immagine: '/images/maglietta-meccanico.png',
      taglie: ['S', 'M', 'L', 'XL', 'XXL']
    },
    {
      id: 'maglietta-informatica',
      nome: 'Maglietta Informatica',
      indirizzo: 'Informatica',
      prezzo: 15.00,
      immagine: '/images/maglietta-informatico.png',
      taglie: ['S', 'M', 'L', 'XL', 'XXL']
    },
    {
      id: 'maglietta-elettronico',
      nome: 'Maglietta Elettronico',
      indirizzo: 'Elettronico',
      prezzo: 15.00,
      immagine: '/images/maglietta-elettronico.png',
      taglie: ['S', 'M', 'L', 'XL', 'XXL']
    },
    {
      id: 'maglietta-chimico',
      nome: 'Maglietta Chimico',
      indirizzo: 'Chimico',
      prezzo: 15.00,
      immagine: '/images/maglietta-chimico.png',
      taglie: ['S', 'M', 'L', 'XL', 'XXL']
    }
  ],
  accessori: [
    {
      id: 'borraccia',
      nome: 'Borraccia Scuola',
      descrizione: 'Borraccia termica personalizzata',
      prezzo: 10.00,
      immagine: '/images/borraccia.png',
      taglie: ['Unica']
    },
    {
      id: 'cavatappi',
      nome: 'Cavatappi Scuola',
      descrizione: 'Cavatappi personalizzato',
      prezzo: 5.00,
      immagine: '/images/cavatappi.png',
      taglie: ['Unica']
    }
  ]
};

// ========================================
// PASSWORD ADMIN - CAMBIA QUI!
// ========================================
const ADMIN_PASSWORD = 'admin123';

// ========================================
// MIDDLEWARE
// ========================================

app.use(express.json());
app.use(express.static('public'));

// ========================================
// FUNZIONI DATABASE JSON
// ========================================

function readOrders() {
    try {
        if (!fs.existsSync(ORDERS_FILE)) {
            return [];
        }
        const data = fs.readFileSync(ORDERS_FILE, 'utf8');
        return JSON.parse(data);
    } catch (error) {
        console.error('Errore lettura ordini:', error);
        return [];
    }
}

function saveOrders(orders) {
    try {
        fs.writeFileSync(ORDERS_FILE, JSON.stringify(orders, null, 2));
        return true;
    } catch (error) {
        console.error('Errore salvataggio ordini:', error);
        return false;
    }
}

// ========================================
// API PUBBLICA: OTTIENI CATALOGO PRODOTTI
// ========================================

app.get('/api/catalogo', (req, res) => {
    res.json(PRODOTTI);
});

// ========================================
// API PUBBLICA: CREA ORDINE
// ========================================

app.post('/api/orders', (req, res) => {
    const { nome, cognome, classe, prodottoId, taglia } = req.body;
    
    // Validazione
    if (!nome || !cognome || !classe || !prodottoId || !taglia) {
        return res.status(400).json({ 
            success: false, 
            message: 'Tutti i campi sono obbligatori' 
        });
    }
    
    // Trova prodotto
    let prodotto = null;
    let tipo = '';
    
    PRODOTTI.felpe.forEach(f => {
        if (f.id === prodottoId) {
            prodotto = f;
            tipo = 'felpa';
        }
    });
    
    PRODOTTI.magliette.forEach(m => {
        if (m.id === prodottoId) {
            prodotto = m;
            tipo = 'maglietta';
        }
    });
    
    PRODOTTI.accessori.forEach(a => {
        if (a.id === prodottoId) {
            prodotto = a;
            tipo = 'accessorio';
        }
    });
    
    if (!prodotto) {
        return res.status(400).json({ 
            success: false, 
            message: 'Prodotto non valido' 
        });
    }
    
    // Verifica taglia disponibile
    if (!prodotto.taglie.includes(taglia)) {
        return res.status(400).json({ 
            success: false, 
            message: 'Taglia non disponibile' 
        });
    }
    
    // Crea ordine
    const orders = readOrders();
    
    const newOrder = {
        id: Date.now(),
        nome: nome.trim(),
        cognome: cognome.trim(),
        classe: classe.trim(),
        tipo: tipo,
        prodotto: prodotto.nome,
        prodottoId: prodotto.id,
        taglia: taglia,
        prezzo: prodotto.prezzo,
        data: new Date().toISOString()
    };
    
    orders.push(newOrder);
    
    if (saveOrders(orders)) {
        res.json({ 
            success: true, 
            order: newOrder,
            totale: prodotto.prezzo
        });
    } else {
        res.status(500).json({ 
            success: false, 
            message: 'Errore nel salvataggio dell\'ordine' 
        });
    }
});

// ========================================
// API ADMIN: LOGIN
// ========================================

app.post('/api/admin/login', (req, res) => {
    const { password } = req.body;
    
    if (!password) {
        return res.status(400).json({ 
            success: false, 
            message: 'Password richiesta' 
        });
    }
    
    if (password === ADMIN_PASSWORD) {
        const token = Buffer.from(`admin:${Date.now()}`).toString('base64');
        res.json({ 
            success: true, 
            token: token 
        });
    } else {
        res.status(401).json({ 
            success: false, 
            message: 'Password errata' 
        });
    }
});

// ========================================
// MIDDLEWARE AUTENTICAZIONE ADMIN
// ========================================

function checkAdminAuth(req, res, next) {
    const token = req.headers['authorization'];
    
    if (!token) {
        return res.status(401).json({ 
            success: false, 
            message: 'Non autenticato' 
        });
    }
    
    try {
        const decoded = Buffer.from(token.replace('Bearer ', ''), 'base64').toString();
        if (decoded.startsWith('admin:')) {
            next();
        } else {
            throw new Error('Token non valido');
        }
    } catch (error) {
        return res.status(401).json({ 
            success: false, 
            message: 'Token non valido' 
        });
    }
}

// ========================================
// API ADMIN: OTTIENI ORDINI
// ========================================

app.get('/api/orders', checkAdminAuth, (req, res) => {
    const orders = readOrders();
    res.json(orders);
});

// ========================================
// API ADMIN: STATISTICHE
// ========================================

app.get('/api/admin/stats', checkAdminAuth, (req, res) => {
    const orders = readOrders();
    
    const stats = {
        totaleOrdini: orders.length,
        totaleFelpe: orders.filter(o => o.tipo === 'felpa').length,
        totaleMagliette: orders.filter(o => o.tipo === 'maglietta').length,
        incassoTotale: orders.reduce((sum, o) => sum + o.prezzo, 0).toFixed(2),
        perProdotto: {}
    };
    
    // Conta per prodotto
    orders.forEach(order => {
        if (!stats.perProdotto[order.prodotto]) {
            stats.perProdotto[order.prodotto] = {
                quantita: 0,
                incasso: 0
            };
        }
        stats.perProdotto[order.prodotto].quantita++;
        stats.perProdotto[order.prodotto].incasso += order.prezzo;
    });
    
    res.json(stats);
});

// ========================================
// API ADMIN: ELIMINA ORDINE
// ========================================

app.delete('/api/orders/:id', checkAdminAuth, (req, res) => {
    const orderId = parseInt(req.params.id);
    let orders = readOrders();
    
    const filteredOrders = orders.filter(order => order.id !== orderId);
    
    if (filteredOrders.length === orders.length) {
        return res.status(404).json({ 
            success: false, 
            message: 'Ordine non trovato' 
        });
    }
    
    if (saveOrders(filteredOrders)) {
        res.json({ success: true });
    } else {
        res.status(500).json({ 
            success: false, 
            message: 'Errore nell\'eliminazione' 
        });
    }
});

// ========================================
// API ADMIN: ESPORTA CSV
// ========================================

app.get('/api/export/csv', checkAdminAuth, (req, res) => {
    const orders = readOrders();
    
    let csv = 'ID,Nome,Cognome,Classe,Tipo,Prodotto,Taglia,Prezzo,Data\n';
    
    orders.forEach(order => {
        const data = new Date(order.data).toLocaleString('it-IT');
        csv += `${order.id},"${order.nome}","${order.cognome}","${order.classe}","${order.tipo}","${order.prodotto}","${order.taglia}",${order.prezzo},"${data}"\n`;
    });
    
    res.setHeader('Content-Type', 'text/csv; charset=utf-8');
    res.setHeader('Content-Disposition', 'attachment; filename=ordinazioni.csv');
    res.send(csv);
});

// ========================================
// AVVIO SERVER
// ========================================

app.listen(PORT, '0.0.0.0', () => {
    console.log(`\n🚀 Server avviato con successo!`);
    console.log(`📍 URL: http://localhost:${PORT}`);
    console.log(`🔐 Password admin: ${ADMIN_PASSWORD}`);
    console.log(`\n💰 PREZZI CONFIGURATI:`);
    console.log(`   Felpe: €${PRODOTTI.felpe[0].prezzo}`);
    console.log(`   Magliette: €${PRODOTTI.magliette[0].prezzo}`);
    console.log('\n');
});