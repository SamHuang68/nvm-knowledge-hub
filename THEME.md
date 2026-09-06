# NVM Knowledge Hub — Dual Theme

The site supports two visual themes controlled by `html[data-theme]` and persisted in `localStorage` under the key `nvm-hub-theme`.

## Themes

| Token | Light Paper (default) | Dark Cyan |
| --- | --- | --- |
| Canvas | `#F3F7F8` | `#08090A` |
| Surface | `#FFFFFF` | `#101216` |
| Elevated | `#EEF2F4` | `#181B20` |
| Text primary | `#061925` | `#F3F4F6` |
| Text secondary | `#3D5566` | `#C5CBD5` |
| Text muted | `#6B7F8C` | `#7E8795` |
| Accent | `#0E8F96` | `#00E5FF` |
| Accent warn (copper) | `#B08A5B` / `#C4A574` | same |

Light Paper is the default on first paint. `prefers-color-scheme` is intentionally ignored so the experience is consistent until the user opts into Dark Cyan.

## Files

- `theme.css` — canonical token contract (`--canvas`, `--surface`, `--accent`, `--accent-warn`, fixed `--scrim-deep` for hero overlays)
- `theme.js` — early head script; sets `data-theme`, exposes `window.HubTheme`, wires `.theme-toggle` / `#themeToggle`
- Legacy aliases in `styles.css`, `hub.css`, and `site-shell.css` map `--cyan`, `--hub-cyan`, `--paper`, `--ink`, and `--navy-*` to theme tokens

## Usage

Every HTML page loads, in order:

1. `theme.js` (blocking, before paint)
2. `theme.css`
3. Site stylesheets

Header controls include a moon/sun theme toggle beside the language switch. Toggle state syncs across pages via `localStorage`.

```js
window.HubTheme.get();    // "light" | "dark"
window.HubTheme.set("dark");
window.HubTheme.toggle();
```

## Copper demotion

Historical copper (`#B08A5B` / `#C4A574`) is reserved for `--accent-warn` only (warnings, vendor contrast, evidence callouts). Primary UI chrome, headings, buttons, and stats use `--accent`.

Hero and media scrims keep fixed navy values (`--scrim-deep`) so photography and gradient overlays stay legible in both themes.
