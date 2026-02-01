#!/usr/bin/env node

/**
 * Simule l'extension pour tester le serveur MCP
 */

import WebSocket from 'ws';

const ws = new WebSocket('ws://localhost:8765/?source=ext');

ws.on('open', () => {
  console.log('Connecté au serveur MCP (extension mock)');
});

ws.on('message', (data) => {
  const cmd = JSON.parse(data.toString());
  const result = { mock: true, action: cmd.action };
  if (cmd.action === 'getTitle') result.title = 'Test Page';
  ws.send(JSON.stringify({ id: cmd.id, success: true, result }));
});

ws.on('error', (err) => {
  console.error('Erreur:', err.message);
  process.exit(1);
});
