const express = require('express');
const sqlite3 = require('sqlite3').verbose();
const path = require('path');

const app = express();
const db = new sqlite3.Database('./axiom.db');

app.use(express.json());
app.use(express.static('public'));

// Search endpoint
app.post('/api/search', (req, res) => {
    const { query } = req.body;
    db.all("SELECT *, 'formula' as type FROM formulas WHERE formula LIKE ? OR category LIKE ?", 
        [`%${query}%`, `%${query}%`], (err, formulas) => {
        res.json({ results: formulas });
    });
});

// Get formula by ID
app.get('/api/formula/:id', (req, res) => {
    db.get("SELECT * FROM formulas WHERE id = ?", [req.params.id], (err, row) => {
        res.json(row);
    });
});

// Get logarithm
app.get('/api/log/:number', (req, res) => {
    const num = parseFloat(req.params.number);
    db.get("SELECT * FROM logarithms WHERE number = ?", [num], (err, row) => {
        if (row) {
            res.json(row);
        } else {
            db.get("SELECT * FROM logarithms ORDER BY ABS(number - ?) LIMIT 1", [num], (err, closest) => {
                res.json(closest || { error: 'Not found' });
            });
        }
    });
});

// Get trig value
app.get('/api/trig/:angle', (req, res) => {
    const angle = parseFloat(req.params.angle);
    db.get("SELECT * FROM trigonometry WHERE angle = ?", [angle], (err, row) => {
        if (row) {
            res.json(row);
        } else {
            db.get("SELECT * FROM trigonometry ORDER BY ABS(angle - ?) LIMIT 1", [angle], (err, closest) => {
                res.json(closest || { error: 'Not found' });
            });
        }
    });
});

// Get square root
app.get('/api/sqrt/:number', (req, res) => {
    const num = parseInt(req.params.number);
    db.get("SELECT * FROM square_roots WHERE number = ?", [num], (err, row) => {
        res.json(row || { error: 'Not found' });
    });
});

// Get reciprocal
app.get('/api/reciprocal/:number', (req, res) => {
    const num = parseInt(req.params.number);
    db.get("SELECT * FROM reciprocals WHERE number = ?", [num], (err, row) => {
        res.json(row || { error: 'Not found' });
    });
});

// Get constant
app.get('/api/constant/:name', (req, res) => {
    db.get("SELECT * FROM constants WHERE name LIKE ? OR symbol LIKE ?", 
        [`%${req.params.name}%`, `%${req.params.name}%`], (err, row) => {
        res.json(row || { error: 'Not found' });
    });
});

// Get all logs
app.get('/api/all/logs', (req, res) => {
    db.all("SELECT * FROM logarithms LIMIT 100", (err, rows) => {
        res.json(rows);
    });
});

// Get all trig
app.get('/api/all/trig', (req, res) => {
    db.all("SELECT * FROM trigonometry LIMIT 100", (err, rows) => {
        res.json(rows);
    });
});

// Get all roots
app.get('/api/all/roots', (req, res) => {
    db.all("SELECT * FROM square_roots LIMIT 100", (err, rows) => {
        res.json(rows);
    });
});

// Get all reciprocals
app.get('/api/all/recips', (req, res) => {
    db.all("SELECT * FROM reciprocals LIMIT 100", (err, rows) => {
        res.json(rows);
    });
});

// Get all constants
app.get('/api/all/consts', (req, res) => {
    db.all("SELECT * FROM constants", (err, rows) => {
        res.json(rows);
    });
});

// Get all formulas
app.get('/api/all/formulas', (req, res) => {
    db.all("SELECT id, formula, category FROM formulas", (err, rows) => {
        res.json(rows);
    });
});

// Get stats
app.get('/api/stats', (req, res) => {
    db.get(`SELECT 
        (SELECT COUNT(*) FROM logarithms) as logs,
        (SELECT COUNT(*) FROM trigonometry) as trig,
        (SELECT COUNT(*) FROM square_roots) as roots,
        (SELECT COUNT(*) FROM reciprocals) as recips,
        (SELECT COUNT(*) FROM constants) as consts,
        (SELECT COUNT(*) FROM formulas) as formulas
    `, (err, row) => {
        res.json(row);
    });
});

app.listen(3000, () => {
    console.log('\n' + '='.repeat(50));
    console.log('🚀 AXIOM SERVER RUNNING');
    console.log('='.repeat(50));
    console.log('📱 http://localhost:3000');
    console.log('📊 3,142+ entries loaded');
    console.log('='.repeat(50));
});