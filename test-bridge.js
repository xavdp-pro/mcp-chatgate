#!/usr/bin/env node
const WebSocket = require('ws');
const ws = new WebSocket('ws://localhost:8765/');

ws.on('open', () => {
  console.log('Connecté au bridge');
  ws.send(JSON.stringify({ action: 'getTitle', id: 1 }));
});

ws.on('message', (data) => {
  const msg = JSON.parse(data.toString());
  console.log('Résultat:', JSON.stringify(msg, null, 2));
  ws.close();
});

ws.on('error', (err) => {
  console.error('Erreur:', err.message);
  process.exit(1);
});
