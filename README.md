# MCP Chatgate - Exploitation des échanges ChatGPT

MCP serveur pour dialoguer avec ChatGPT et exploiter les échanges (messages, images, markdown).

## Outils

- `chatgpt_send`, `chatgpt_read`, `chatgpt_model`, `chatgpt_export`
- `run_bash`, `run_python`, `run_node`, `fs_*`, `docker_*`
- `create_workspace_dir`, `install_on_jaswinder_machine`

## Prérequis

- Extension Browser Control + bridge WebSocket (ws://localhost:8765)
- ChatGPT ouvert dans Chrome

## Installation

```bash
npm install
npm start
```

## Config Cursor

```json
{
  "mcpServers": {
    "chatgate": {
      "command": "node",
      "args": ["${workspaceFolder}/mcp-chatgate/src/index.js"]
    }
  }
}
```

Variable: `BROWSER_WS_URL` (défaut: ws://localhost:8765/)