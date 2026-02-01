// ========================================
// SERVER ORDINAZIONI - CON POSTGRESQL
// DATI PERMANENTI - MAI PERSI!
// ========================================

const express = require('express');
const { Pool } = require('pg');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3000;

// ========================================
// CONNESSIONE POSTGRESQL
// ========================================

console.log('🔍 DATABASE_URL presente:', !!process.env.DATABASE_URL);
console.log('🔍 DATABASE_URL (primi 20 char):', process.env.DATABASE_URL ? process.env.DATABASE_URL.substring(0, 20) : 'NON IMPOSTATA');

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: process.env.DATABASE_URL ? { 
    rejectUnauthorized: false,
    require: true 
  } : false
});

// Test connessione
pool.query('SELECT NOW()', (err, res) => {
  if (err) {
    console.error('❌ Test connessione fallito:', err.message);
  } else {
    console.log('✅ Test connessione riuscito:', res.rows[0]);
  }
});

// Crea tabella se non esiste
async function initDatabase() {
  try {
    await pool.query(`
      CREATE TABLE IF NOT EXISTS ordini (
        id SERIAL PRIMARY KEY,
        nome VARCHAR(100) NOT NULL,
        cognome VARCHAR(100) NOT NULL,
        classe VARCHAR(50) NOT NULL,
        tipo VARCHAR(50) NOT NULL,
        prodotto VARCHAR(200) NOT NULL,
        prodotto_id VARCHAR(100) NOT NULL,
        taglia VARCHAR(10) NOT NULL,
        prezzo DECIMAL(10,2) NOT NULL,
        data_ordine TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);
    console.log('✅ Database PostgreSQL connesso e tabella creata!');
  } catch (error) {
    console.error('❌ Errore inizializzazione database:', error);
  }
}

initDatabase();

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
      prezzo: 26.00,
      immagine: '/images/felpa-blu-bianca.png',
      taglie: ['S', 'M', 'L', 'XL', 'XXL']
    },
    {
      id: 'felpa-grigia-nera',
      nome: 'Felpa Bianca con Scritta Nera',
      colore: 'grigia',
      scritta: 'nera',
      prezzo: 26.00,
      immagine: '/images/felpa-bianca-nera.png',
      taglie: ['S', 'M', 'L', 'XL', 'XXL']
    },
    {
      id: 'felpa-grigia-blu',
      nome: 'Felpa Grigia con Scritta Blu',
      colore: 'grigia',
      scritta: 'blu',
      prezzo: 26.00,
      immagine: '/images/felpa-grigia-blu.png',
      taglie: ['S', 'M', 'L', 'XL', 'XXL']
    },
    {
      id: 'felpa-nera-bianca',
      nome: 'Felpa Nera con Scritta Bianca',
      colore: 'nera',
      scritta: 'bianca',
      prezzo: 26.00,
      immagine: '/images/felpa-nera-bianca.png',
      taglie: ['S', 'M', 'L', 'XL', 'XXL']
    },
    {
      id: 'felpa-nera',
      nome: 'Felpa Nera',
      colore: 'nera',
      scritta: '',
      prezzo: 26.00,
      immagine: '/images/felpa-nera.png',
      taglie: ['S', 'M', 'L', 'XL', 'XXL']
    },
    {
      id: 'felpa-bianca',
      nome: 'Felpa Bianca',
      colore: 'bianca',
      scritta: '',
      prezzo: 26.00,
      immagine: '/images/felpa-bianca.png',
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
    },
    {
      id: 'maglietta-bianca',
      nome: 'Maglietta Bianca',
      indirizzo: '',
      colore: 'bianca',
      prezzo: 15.00,
      immagine: '/images/maglietta-bianca.png',
      taglie: ['S', 'M', 'L', 'XL', 'XXL']
    },
    {
      id: 'maglietta-nera',
      nome: 'Maglietta Nera',
      indirizzo: '',
      colore: 'nera',
      prezzo: 15.00,
      immagine: '/images/maglietta-nera.png',
      taglie: ['S', 'M', 'L', 'XL', 'XXL']
    }
  ],
  accessori: [
    {
      id: 'borraccia',
      nome: 'Borraccia Scuola',
      descrizione: 'Borraccia termica personalizzata',
      prezzo: 12.00,
      immagine: '/images/borraccia.png',
      taglie: ['Unica']
    },
    {
      id: 'cavatappi',
      nome: 'Cavatappi Scuola',
      descrizione: 'Cavatappi personalizzato',
      prezzo: 8.00,
      immagine: '/images/cavatappi.png',
      taglie: ['Unica']
    },
    {
      id: 'accendino',
      nome: 'Accendino Scuola',
      descrizione: 'Accendino personalizzato',
      prezzo: 10.00,
      video: '/images/accendino.mp4',
      immagine: '/images/accendino-thumb.png',
      taglie: ['Unica'],
      hasVideo: true
    }
  ]
};

// Password Admin
const ADMIN_PASSWORD = 'admin123';

// Middleware
app.use(express.json());
app.use(express.static('public'));

// ========================================
// API PUBBLICA: CATALOGO
// ========================================

app.get('/api/catalogo', (req, res) => {
    res.json(PRODOTTI);
});

// ========================================
// API PUBBLICA: CREA ORDINE
// ========================================

app.post('/api/orders', async (req, res) => {
    const { nome, cognome, classe, prodottoId, taglia } = req.body;
    
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
        if (f.id === prodottoId) { prodotto = f; tipo = 'felpa'; }
    });
    PRODOTTI.magliette.forEach(m => {
        if (m.id === prodottoId) { prodotto = m; tipo = 'maglietta'; }
    });
    PRODOTTI.accessori.forEach(a => {
        if (a.id === prodottoId) { prodotto = a; tipo = 'accessorio'; }
    });
    
    if (!prodotto) {
        return res.status(400).json({ 
            success: false, 
            message: 'Prodotto non valido' 
        });
    }
    
    if (!prodotto.taglie.includes(taglia)) {
        return res.status(400).json({ 
            success: false, 
            message: 'Taglia non disponibile' 
        });
    }
    
    try {
        // Salva in PostgreSQL
        const result = await pool.query(
            `INSERT INTO ordini (nome, cognome, classe, tipo, prodotto, prodotto_id, taglia, prezzo)
             VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
             RETURNING *`,
            [nome.trim(), cognome.trim(), classe.trim(), tipo, prodotto.nome, prodotto.id, taglia, prodotto.prezzo]
        );
        
        res.json({ 
            success: true, 
            order: result.rows[0],
            totale: prodotto.prezzo
        });
    } catch (error) {
        console.error('Errore salvataggio ordine:', error);
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
        res.json({ success: true, token: token });
    } else {
        res.status(401).json({ 
            success: false, 
            message: 'Password errata' 
        });
    }
});

// ========================================
// MIDDLEWARE AUTENTICAZIONE
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

app.get('/api/orders', checkAdminAuth, async (req, res) => {
    try {
        const result = await pool.query(
            'SELECT * FROM ordini ORDER BY data_ordine DESC'
        );
        res.json(result.rows);
    } catch (error) {
        console.error('Errore recupero ordini:', error);
        res.status(500).json({ error: 'Errore nel recupero ordini' });
    }
});

// ========================================
// API ADMIN: STATISTICHE
// ========================================

app.get('/api/admin/stats', checkAdminAuth, async (req, res) => {
    try {
        const result = await pool.query('SELECT * FROM ordini');
        const orders = result.rows;
        
        const stats = {
            totaleOrdini: orders.length,
            totaleFelpe: orders.filter(o => o.tipo === 'felpa').length,
            totaleMagliette: orders.filter(o => o.tipo === 'maglietta').length,
            incassoTotale: orders.reduce((sum, o) => sum + parseFloat(o.prezzo), 0).toFixed(2),
            perProdotto: {}
        };
        
        orders.forEach(order => {
            if (!stats.perProdotto[order.prodotto]) {
                stats.perProdotto[order.prodotto] = {
                    quantita: 0,
                    incasso: 0
                };
            }
            stats.perProdotto[order.prodotto].quantita++;
            stats.perProdotto[order.prodotto].incasso += parseFloat(order.prezzo);
        });
        
        res.json(stats);
    } catch (error) {
        console.error('Errore statistiche:', error);
        res.status(500).json({ error: 'Errore nel calcolo statistiche' });
    }
});

// ========================================
// API ADMIN: ELIMINA ORDINE
// ========================================

app.delete('/api/orders/:id', checkAdminAuth, async (req, res) => {
    const orderId = parseInt(req.params.id);
    
    try {
        const result = await pool.query(
            'DELETE FROM ordini WHERE id = $1 RETURNING *',
            [orderId]
        );
        
        if (result.rowCount > 0) {
            res.json({ success: true });
        } else {
            res.status(404).json({ 
                success: false, 
                message: 'Ordine non trovato' 
            });
        }
    } catch (error) {
        console.error('Errore eliminazione ordine:', error);
        res.status(500).json({ 
            success: false, 
            message: 'Errore nell\'eliminazione' 
        });
    }
});

// ========================================
// API ADMIN: ESPORTA CSV
// ========================================

app.get('/api/export/csv', checkAdminAuth, async (req, res) => {
    try {
        const result = await pool.query(
            'SELECT * FROM ordini ORDER BY data_ordine DESC'
        );
        const orders = result.rows;
        
        let csv = 'ID,Nome,Cognome,Classe,Tipo,Prodotto,Taglia,Prezzo,Data\n';
        
        orders.forEach(order => {
            const data = new Date(order.data_ordine).toLocaleString('it-IT');
            csv += `${order.id},"${order.nome}","${order.cognome}","${order.classe}","${order.tipo}","${order.prodotto}","${order.taglia}",${order.prezzo},"${data}"\n`;
        });
        
        res.setHeader('Content-Type', 'text/csv; charset=utf-8');
        res.setHeader('Content-Disposition', 'attachment; filename=ordinazioni.csv');
        res.send(csv);
    } catch (error) {
        console.error('Errore esportazione CSV:', error);
        res.status(500).send('Errore nell\'esportazione');
    }
});

// ========================================
// AVVIO SERVER
// ========================================

app.listen(PORT, '0.0.0.0', () => {
    console.log(`\n🚀 Server avviato con successo!`);
    console.log(`📍 URL: http://localhost:${PORT}`);
    console.log(`🗄️  Database: PostgreSQL (DATI PERMANENTI)`);
    console.log(`🔐 Password admin: ${ADMIN_PASSWORD}`);
    console.log(`\n💰 PREZZI CONFIGURATI:`);
    console.log(`   Felpe: €${PRODOTTI.felpe[0].prezzo}`);
    console.log(`   Magliette: €${PRODOTTI.magliette[0].prezzo}`);
    console.log('\n');
});