# Akarinaru Studio — website

Static HTML/CSS/JS site (no build step), built from `BLUEPRINT.md`.

```
index.html
css/style.css
js/data.js    ← all content: gallery, services, prices, fate cards, contact, slots
js/stage.js   ← fits the 1600×900 stage to one screen (fluid scroll under 820px)
js/fx.js      ← layered sky, parallax, cursor light, spark trail, click bursts
js/music.js   ← Web Audio music + SFX (no audio files)
js/main.js    ← screens, navigation, page transition, fate card, start screen
assets/       ← garda.webp + emotes
```

## Preview locally
Open the folder with any static server (VS Code "Live Server", `npx serve`, `python -m http.server`).
Opening `index.html` directly also works, since no ES modules are used.

## Before publishing
- [ ] Replace the placeholder email & Instagram in `js/data.js` (`AK.contact`).
- [ ] Update `AK.slots` in `js/data.js` when the number of open slots changes.
- [ ] Check prices against Etsy (`AK.services`, `AK.shop`, `AK.fateCards`).
- [ ] Add `assets/og-image.jpg` (1200×630) for link previews, or remove the `og:image` tag.
- [ ] Confirm clients agree to their work (Garda & emotes) being shown publicly.

## Deploy (GitHub Pages)
Push this folder to a repo → Settings › Pages › Deploy from branch → `main` / root.
