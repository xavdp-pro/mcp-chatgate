#!/usr/bin/env node

/**
 * MCP Chatgate - Exploitation des échanges ChatGPT via l'extension Browser Control
 *
 * Vocabulaire optimisé pour l'agent : préfixe chatgpt_ pour toutes les actions ChatGPT.
 * Bridge requis : cd chrome-extension-browser-control/websocket-bridge && node start-bridge.js
 */

import { Server } from '@modelcontextprotocol/sdk/server/index.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import {
  CallToolRequestSchema,
  ListToolsRequestSchema,
  ListPromptsRequestSchema,
  GetPromptRequestSchema,
  ErrorCode,
  McpError,
} from '@modelcontextprotocol/sdk/types.js';
import WebSocket from 'ws';
import { execSync } from 'child_process';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const WS_URL = process.env.BROWSER_WS_URL || 'ws://localhost:8765/';
let ws = null;

function resolvePath(rawPath, cwd = process.cwd()) {
  return path.resolve(cwd, rawPath);
}

function connect() {
  if (ws && ws.readyState === WebSocket.OPEN) return Promise.resolve();
  return new Promise((resolve, reject) => {
    ws = new WebSocket(WS_URL);
    ws.on('open', () => {
      process.stderr.write('[Chatgate] Connecté au bridge\n');
      resolve();
    });
    ws.on('error', () => reject(new Error('Bridge non démarré')));
    ws.on('close', () => { ws = null; });
  });
}

function sendToExtension(cmd) {
  return new Promise(async (resolve, reject) => {
    try {
      await connect();
      const id = Date.now();
      const handler = (data) => {
        ws.off('message', handler);
        try {
          const msg = JSON.parse(data.toString());
          if (msg.id === id || msg.id === cmd.id) {
            if (msg.success === false) reject(new Error(msg.error));
            else resolve(msg.result);
          }
        } catch (e) { reject(e); }
      };
      ws.on('message', handler);
      ws.send(JSON.stringify({ ...cmd, id }));
      setTimeout(() => {
        ws.off('message', handler);
        reject(new Error('Timeout'));
      }, 15000);
    } catch (e) { reject(e); }
  });
}

const server = new Server(
  { name: 'chatgate', version: '2.1.0' },
  { capabilities: { tools: {}, prompts: {} } }
);

server.setRequestHandler(ListToolsRequestSchema, async () => ({
  tools: [
    { name: 'chatgpt_send', description: 'Envoie un message à ChatGPT.', inputSchema: { type: 'object', properties: { message: { type: 'string' } }, required: ['message'] } },
    { name: 'chatgpt_read', description: 'Récupère la conversation.', inputSchema: { type: 'object' } },
    { name: 'chatgpt_model', description: 'Sélectionne 5.2 ou 4.5.', inputSchema: { type: 'object', properties: { model: { type: 'string', enum: ['5.2', '4.5'] } }, required: ['model'] } },
    { name: 'run_bash', description: 'Exécute une commande bash.', inputSchema: { type: 'object', properties: { command: { type: 'string' }, cwd: { type: 'string' } }, required: ['command'] } },
    { name: 'fs_read', description: 'Lit un fichier.', inputSchema: { type: 'object', properties: { path: { type: 'string' } }, required: ['path'] } },
    { name: 'fs_write', description: 'Écrit un fichier.', inputSchema: { type: 'object', properties: { path: { type: 'string' }, content: { type: 'string' } }, required: ['path', 'content'] } },
    { name: 'docker_run', description: 'Lance un conteneur.', inputSchema: { type: 'object', properties: { image: { type: 'string' } }, required: ['image'] } },
  ]
}));

const transport = new StdioServerTransport();
await server.connect(transport);
process.stderr.write('[Chatgate] MCP prêt\n');
