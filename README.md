# PoolHub 2026

Fantasy Sports Pool Hub — Home Run Derby & World Cup 2026.

## Project Structure

```
pool-hub/
├── public/
│   └── index.html
├── src/
│   ├── index.js
│   └── App.jsx       ← All data and UI lives here
└── package.json
```

## To update standings

1. Export the Google Sheet as `.xlsx`
2. Upload to Claude and ask it to update the data
3. Replace `src/App.jsx` with the new file
4. Commit and push — Vercel redeploys automatically

## Local development

```bash
npm install
npm start
```

## Deploy on Vercel

1. Push this repo to GitHub
2. Go to vercel.com → Add New Project → Select this repo
3. Click Deploy — done!
