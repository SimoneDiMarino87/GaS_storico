import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  base: '/GaS_storico/', // INSERISCI QUI IL NOME ESATTO DEL TUO REPOSITORY
})