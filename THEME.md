# NVM Knowledge Hub — Dual Theme

The site supports two visual themes controlled by `html[data-theme]` and persisted in `localStorage` under the key `nvm-hub-theme`.

## Themes

| Token | Light Paper (default) | Dark Cyan |
| --- | --- | --- |
| Canvas | `#F3F7F8` | `#08090A` |
| Surface | `#FFFFFF` | `#101216` |
| Elevated | `#EEF2F4` | `#181B20` |
| Text primary | `#061925` | `#F3F4F6` |
| Text secondary | `#3D5566` → **`#243B4A`** | `#C5CBD5` |
| Text muted | `#6B7F8C` → **`#3F5563`** | `#7E8795` |
| Text meta / eyebrows | **`#4A6270`** | — |
| Links (light) | **`#0A7279`** | — |
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

## Layout polish

Shared layout tokens (in `theme.css`):

| Token | Value | Use |
| --- | --- | --- |
| `--layout-side` | `clamp(12px, 2vw, 28px)` | Page horizontal inset / safe edge |
| `--layout-rail-chapter` | `clamp(40px, 3.5vw, 56px)` | `.chapter-rail` width (immersive deep pages) |
| `--layout-rail-studio` | `clamp(88px, 7vw, 108px)` | Hub / lens left module rail column |

`site-shell.css` applies edge-to-edge stages (100% width + `--layout-side` padding) and compact studio rails. On viewports ≥1025px, rail secondary labels (`.hub-rail-sub`, `.lens-sub`) hide to keep the left column narrow; mobile keeps the existing horizontal top-rail behavior at ≤1024px.

## Radius & frosted glass

Shared corner tokens (in `theme.css` on `html`):

| Token | Value | Typical use |
| --- | --- | --- |
| `--radius-sm` | `4px` | Chips, badges, compact controls |
| `--radius-md` | `8px` | Buttons, rail nodes, table wrappers |
| `--radius-lg` | `12px` | Cards, panels, evidence ladders |
| `--radius-xl` | `16px` | Deck stages, large floating panels |
| `--radius-pill` | `9999px` | Pills, circular toggles, filter chips |

Frosted surfaces use theme-scoped glass tokens — light instrument translucency, not heavy consumer blur:

| Token | Role |
| --- | --- |
| `--glass-bg` | Floating panels, left rails, modal shells |
| `--glass-bg-strong` | Sticky headers, sticky toolbars |
| `--glass-blur` | `10px` (light) / `12px` (dark) backdrop blur |
| `--glass-saturate` | Subtle saturation lift on frosted chrome |
| `--glass-border` | Hairline edge on glass shells |
| `--glass-shadow` | Soft elevation under rails and panels |

Applied on sticky header, left module rails, search overlay, evidence toolbars, and primary cards. Technical SVG/diagram geometry inside architecture canvases is intentionally left square; `data-language` and theme toggle behavior are unchanged.
