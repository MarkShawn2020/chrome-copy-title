# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Chrome extension (Manifest V3) that copies page title/URL in various formats with keyboard shortcut support.

## Commands

```bash
pnpm dev      # Dev build with HMR (loads extension from dist/)
pnpm build    # Production build (tsc && vite build)
```

## Architecture

- **Build**: Vite + @crxjs/vite-plugin (handles manifest, HMR for extensions)
- **UI**: React 19 + Tailwind CSS
- **Storage**: chrome.storage.local with typed wrapper (`src/storage.ts`)

### Key Files

- `src/storage.ts` - Format definitions, settings storage, formatText() util
- `src/background/index.ts` - Service worker handling keyboard shortcut (Cmd+Shift+K / Ctrl+Shift+K)
- `src/popup/Popup.tsx` - Main popup UI component
- `manifest.json` - Extension manifest (permissions, commands, icons)

### Data Flow

1. User selects format in popup → saved to chrome.storage.local
2. Keyboard shortcut triggers background worker → reads settings → executes clipboard script in active tab → shows notification
