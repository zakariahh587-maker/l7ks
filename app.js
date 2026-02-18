const http = require('http');
const fs = require('fs');
const path = require('path');

const PORT = 3000;

const server = http.createServer((req, res) => {
    // Enable CORS for the local admin page
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

    if (req.method === 'OPTIONS') {
        res.writeHead(204);
        res.end();
        return;
    }

    if (req.url === '/api/data' && req.method === 'GET') {
        try {
            const filePath = path.join(__dirname, 'data', 'products.js');
            const data = fs.readFileSync(filePath, 'utf8');
            // Extract JSON from "const L7K_DATA = {...};"
            const jsonStr = data.replace('const L7K_DATA = ', '').replace(/;$/, '');
            res.writeHead(200, { 'Content-Type': 'application/json' });
            res.end(jsonStr);
        } catch (err) {
            res.writeHead(500);
            res.end(JSON.stringify({ error: 'Failed to read data' }));
        }
        return;
    }

    if (req.url === '/api/save' && req.method === 'POST') {
        let body = '';
        req.on('data', chunk => { body += chunk.toString(); });
        req.on('end', () => {
            try {
                const data = JSON.parse(body);
                const filePath = path.join(__dirname, 'data', 'products.js');
                const fileContent = `const L7K_DATA = ${JSON.stringify(data, null, 4)};`;

                fs.writeFileSync(filePath, fileContent);
                console.log('✅ Inventory Saved Successfully!');

                res.writeHead(200, { 'Content-Type': 'application/json' });
                res.end(JSON.stringify({ success: true }));
            } catch (err) {
                console.error(err);
                res.writeHead(500);
                res.end(JSON.stringify({ error: 'Failed to save' }));
            }
        });
    } else {
        res.writeHead(404);
        res.end();
    }
});

server.listen(PORT, () => {
    console.log(`
    -------------------------------------------
    🚀 L7K ADMIN SERVER IS RUNNING
    -------------------------------------------
    
    1. Keep this window OPEN.
    2. Open "admin.html" in your browser.
    3. Add your items and click "PUBLISH CHANGES".
    
    The website will update AUTOMATICALLY.
    -------------------------------------------
    `);
});
