# Manzi Tours&Travels

A modern, mobile-responsive tour and travel website built with HTML and Tailwind CSS.

## Features

- **Automatic header and footer** – Loaded via JavaScript from `components/header.html` and `components/footer.html`
- **Mobile responsive** – Hamburger menu on small screens, fluid layout and typography
- **Tailwind CSS** – Styling via Tailwind (CDN) with custom fonts (Outfit, Fraunces)
- **Sections** – Hero, Destinations, Tours, About, Contact form

## Running locally

The header and footer are loaded with `fetch()`, which requires the site to be served over HTTP (not opened as `file://`).

**Option 1 – Node (npx)**  
From the project folder:
```bash
npx serve .
```
Then open `http://localhost:3000` (or the URL shown).

**Option 2 – Python 3**  
```bash
python3 -m http.server 8080
```
Then open `http://localhost:8080`.

**Option 3 – VS Code**  
Use the “Live Server” extension and “Open with Live Server” on `index.html`.

## Structure

```
ManziTours&Travels/
├── index.html           # Home page
├── destinations.html    # Destinations (safari, beach, cultural, mountain, city)
├── tours.html           # All tours (safari, coastal, heritage, highland, family, custom)
├── about.html           # About us (story, values)
├── contact.html         # Contact (form + address, email, hours)
├── components/
│   ├── header.html      # Shared header (injected automatically)
│   └── footer.html      # Shared footer (injected automatically)
├── js/
│   └── load-components.js   # Loads header and footer
└── README.md
```

## Adding more pages

1. Create a new HTML file (e.g. `tours.html`).
2. Include the same placeholders and script:
   - `<div id="header-placeholder">...</div>` at the top (or leave empty and let the script replace it).
   - `<div id="footer-placeholder">...</div>` before `</body>`.
   - `<script src="js/load-components.js"></script>` at the end of `<body>`.
3. Use the same Tailwind and font setup in `<head>`.

Header and footer will load automatically on every page that includes the script and placeholders.
