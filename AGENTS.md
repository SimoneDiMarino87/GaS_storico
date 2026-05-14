# AGENTS.md — Instructions for AI agents

Purpose

This document provides operational guidance for AI agents that need to read, modify, or test the `GaS_storico` project.
Make sure to update this file if you make changes to the project structure or development workflow.


Data structure

Below are the expected JSON schemas for files under `src/data/`. Agents should preserve these shapes when editing or generating sample data.

- `elenco_scuole.json` — array of school descriptors

  Example item:

  {
    "id_scuola": "SCUOLA123",
    "nome": "Istituto Comprensivo Example",
    "comune": "Comune",
    "provincia": "PV"
  }

- `profili_scuole.json` — object mapping `id_scuola` -> profile

  Example:

  {
    "SCUOLA123": {
      "id_scuola": "SCUOLA123",
      "nome": "Istituto Comprensivo Example",
      "comune": "Comune",
      "provincia": "PV",
      "storia": [
        {
          "anno": 2024,
          "categoria": "Semifinale" | "Finale Mista" | "Finale Femminile",
          "posizione": 5,
          "punti": 42,
          "gara_dettaglio": "Torneo Regionale - Girone B"
        }
      ]
    }
  }

- `classifiche_annuali.json` — object mapping anno -> categoria -> array of ranking rows

  Example:

  {
    "2026": {
      "Finale Mista": [
        {
          "posizione": 1,
          "id_scuola": "SCUOLA123",
          "Punti": 120,
          "Gara": "Girone A"
        }
      ]
    }
  }

- `albo_medagliere.json` — object containing arrays and medagliere

  Example:

  {
    "mista": [ { "anno": 2026, "oro": "SCUOLA123", "argento": "SCUOLA456", "bronzo": "SCUOLA789" } ],
    "femminile": [ /* similar */ ],
    "medagliere": [
      {
        "id_scuola": "SCUOLA123",
        "nome": "Istituto Example",
        "comune": "Comune",
        "provincia": "PV",
        "oro": 3,
        "argento": 1,
        "bronzo": 2,
        "oro_f": 1,
        "argento_f": 0,
        "bronzo_f": 0
      }
    ]
  }

Notes

- Fields shown as optional (like `oro_f`) may be absent; code should default to 0 when missing.
- Agents must validate numeric fields (`posizione`, `punti`, `Punti`, medal counts) are numbers or coerce safely.
- Strings used as identifiers (`id_scuola`) must remain consistent across all JSON files.

Technologies

This project uses the following technologies and notable libraries (see `package.json` for exact versions):

- React — UI library for building the SPA (`react`, `react-dom`).
- Vite — fast development server and build tool.
- Tailwind CSS — utility-first CSS framework (project contains Tailwind config and PostCSS setup).
- Recharts — charting library used for historical trend visualizations.
- lucide-react — icon set used across the UI.
- ESLint — linting configuration and rules for code quality.
- PostCSS / Autoprefixer — CSS processing pipeline.
- gh-pages — optional helper for deploying `dist` to GitHub Pages.

When updating or upgrading dependencies, ensure compatibility with React 18+ conventions and Vite plugin versions.
