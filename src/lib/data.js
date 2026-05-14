// ============================================================================
// IMPORT DATI REALI
// ============================================================================

import _profiliScuole from '../data/profili_scuole.json';
import _elencoScuole from '../data/elenco_scuole.json';
import _classificheAnnuali from '../data/classifiche_annuali.json';
import _alboDati from '../data/albo_medagliere.json';

export const profiliScuole = _profiliScuole
export const elencoScuole = _elencoScuole
export const classificheAnnuali = _classificheAnnuali
export const alboDati = _alboDati

export const TUTTI_GLI_ANNI = Array.from({length: 2026 - 2004 + 1}, (_, i) => 2026 - i); 
