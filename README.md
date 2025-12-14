# Lovpen Copy Title

Chrome extension to copy page title and URL in multiple formats with keyboard shortcuts.

## Features

- **Multiple formats**: URL only, title only, title + URL, Markdown link, or custom template
- **Keyboard shortcuts**: `Cmd+K` (title + URL), `Cmd+Shift+K` (Markdown) on Mac
- **Custom templates**: Define your own format using `{title}` and `{url}` placeholders
- **One-click copy**: Click any format in the popup to copy instantly

## Installation

### From Source

```bash
pnpm install
pnpm build
```

1. Open `chrome://extensions/`
2. Enable "Developer mode"
3. Click "Load unpacked" and select the `dist/` folder

### Development

```bash
pnpm dev
```

Load the extension from `dist/` folder. Changes hot-reload automatically.

## Keyboard Shortcuts

| Shortcut | Mac | Action |
|----------|-----|--------|
| `Ctrl+K` | `Cmd+K` | Copy title + URL |
| `Ctrl+Shift+K` | `Cmd+Shift+K` | Copy as Markdown |

Customize shortcuts at `chrome://extensions/shortcuts`

## Custom Format

Use placeholders in your template:
- `{title}` - Page title
- `{url}` - Page URL

Example: `{title} | {url}` produces `Page Title | https://example.com`

## Tech Stack

- React 19 + TypeScript
- Vite + @crxjs/vite-plugin
- Tailwind CSS
- Chrome Manifest V3

## License

MIT
