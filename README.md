**Statistica GaS — Dashboard Storico**

Progetto frontend leggero costruito con React + Vite che visualizza lo storico e le classifiche nazionali delle scuole partecipanti ai tornei GaS.

Contenuto principale:
- Interfaccia single-page in `src/App.jsx` con tre viste: Storico Scuola, Classifiche Annuali e Albo d'Oro.
- Dati inclusi (JSON) in `src/data/` e `public/data/` per sviluppo e deploy statico.

Quick start (sviluppo)

1. Installa dipendenze:

```
npm install
```

2. Avvia il server di sviluppo (HMR):

```
npm run dev
```

Build e deploy

- Build produzione: `npm run build`
- Anteprima build: `npm run preview`
- Deploy su GitHub Pages: `npm run deploy` (usa `gh-pages` - la `base` è impostata in `vite.config.js` su `/GaS_storico/`)

Script utili (da `package.json`):
- `dev` — avvia Vite in modalità sviluppo
- `build` — crea la build di produzione
- `preview` — serve la build statica localmente
- `lint` — esegue ESLint
- `deploy` — pubblica la cartella `dist` su GitHub Pages

Dati inclusi

- `src/data/elenco_scuole.json` — elenco delle scuole (id, metadata)
- `src/data/profili_scuole.json` — profili con storico gare per ogni scuola
- `src/data/classifiche_annuali.json` — classifiche per anno e categoria
- `src/data/albo_medagliere.json` — medagliere e albo d'oro

Note per sviluppatori

- Il componente principale è `src/App.jsx`. I dati vengono importati come JSON statici per semplicità.
- In `vite.config.js` la proprietà `base` è impostata a `/GaS_storico/`: aggiornarla se il repository cambia nome o il sito viene servito da un path diverso.
- UI basata su Tailwind (config presente) e Recharts per i grafici.
