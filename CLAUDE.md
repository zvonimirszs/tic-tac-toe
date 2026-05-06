# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Running the Game

Python is not installed on this machine. Use Node.js (v22 available):

```bash
npx serve . -p 8080
```

Open `http://localhost:8080` in the browser. The game **must** be served over HTTP — `game.js` fetches `config.json` via `fetch()` and will fail if opened as a local `file://` URL.

## Configuration

Edit `config.json` to set defaults before the server starts:

| Field | Default | Constraint |
|-------|---------|------------|
| `boardSize` | 3 | 2–15 |
| `winLength` | 3 | 2–boardSize |
| `playerX` | "Igrač X" | display name |
| `playerO` | "Igrač O" | display name |

Players can also change all settings at runtime via the in-page config panel without restarting the server.

## Architecture

Pure client-side app — no backend, no build step, no bundler.

- **`index.html`** — all markup; board, scoreboard, controls, and config panel
- **`game.js`** — all logic and state; no external libraries
- **`style.css`** — dark-theme styling; responsive cell sizing via CSS Grid

### State model (`game.js`)
Global variables drive the entire UI: `config`, `board` (2D array), `currentPlayer`, `gameOver`, `scores`.

### Key functions
- `loadConfig()` — fetches `config.json`, merges with defaults via spread, then calls `initBoard()`
- `initBoard()` — resets board and game state, calls `renderBoard()`
- `renderBoard()` — tears down and rebuilds the entire grid DOM; cell size (48–80 px) and font size scale with `boardSize`
- `checkWin(row, col)` — scans 4 directions bi-directionally from the last-placed mark; returns winning cell coordinates or `null`
- `applyNewConfig()` — validates and applies UI panel inputs, resets scores, reinitializes board
