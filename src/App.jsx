import React, { useState, useMemo } from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, ResponsiveContainer, Legend } from 'recharts';
import { Trophy, Medal, MapPin, ListOrdered, Award, Search, ChevronRight, BarChart } from 'lucide-react';

// ============================================================================
// IMPORT DATI REALI (Decommenta queste righe e cancella le costanti MOCK sotto)
// ============================================================================
 import profiliScuole from './data/profili_scuole.json';
 import elencoScuole from './data/elenco_scuole.json';
 import classificheAnnuali from './data/classifiche_annuali.json';
 import alboDati from './data/albo_medagliere.json';

// ============================================================================

const TUTTI_GLI_ANNI = Array.from({length: 2026 - 2004 + 1}, (_, i) => 2026 - i); 

// ============================================================================
// COMPONENTE TOOLTIP SICURO (Isolato per prevenire crash)
// ============================================================================
const CustomTooltip = ({ active, payload, label, categoriaGara }) => {
  if (active && payload && payload.length) {
    const hasData = payload.some(p => p.value !== null);
    if (!hasData) return null;

    // Estrazione sicura dei dati
    const semi = payload.find(p => p.dataKey === 'posizione_semi');
    const fin = payload.find(p => p.dataKey === 'posizione_fin' || p.dataKey === 'posizione');

    return (
      <div className="bg-white p-3 border border-slate-200 rounded-lg shadow-md">
        <p className="font-bold border-b border-slate-200 pb-1 mb-2 text-slate-800">Anno {label}</p>
        
        {semi && semi.value !== null && (
          <div className="mb-2">
            <p className="text-amber-600 font-bold m-0">Semifinale</p>
            <p className="text-sm m-0 text-slate-700">Posizione: <strong>{semi.value}°</strong></p>
            <p className="text-xs text-slate-500 m-0">Punti: {semi.payload?.punti_semi ?? '-'}</p>
          </div>
        )}

        {fin && fin.value !== null && (
          <div>
            <p className="text-blue-600 font-bold m-0">{categoriaGara === 'Completa' ? 'Finale Mista' : categoriaGara}</p>
            <p className="text-sm m-0 text-slate-700">Posizione: <strong>{fin.value}°</strong></p>
            <p className="text-xs text-slate-500 m-0">Punti: {fin.payload?.punti_fin ?? fin.payload?.punti ?? '-'}</p>
          </div>
        )}
      </div>
    );
  }
  return null;
};

// ============================================================================
// COMPONENTE: STORICO SCUOLA
// ============================================================================
const VistaStoricoScuola = ({ scuolaSelezionata, setScuolaSelezionata }) => {
  const [categoriaGara, setCategoriaGara] = useState("Completa"); 
  
  const profiliSicuri = profiliScuole || {};
  const elencoSicuro = Array.isArray(elencoScuole) ? elencoScuole : [];
  const profilo = profiliSicuri[scuolaSelezionata];

  const anniCrescenti = useMemo(() => [...TUTTI_GLI_ANNI].reverse(), []);
  
  const storiaFiltrata = useMemo(() => {
    if (!profilo || !Array.isArray(profilo.storia)) return [];
    const storiaScuola = profilo.storia;
    
    return anniCrescenti.map(anno => {
      if (categoriaGara === "Completa") {
        const gareSemi = storiaScuola.filter(r => r.anno === anno && r.categoria === "Semifinale");
        const gareFin = storiaScuola.filter(r => r.anno === anno && r.categoria === "Finale Mista");
        const bestSemi = gareSemi.length > 0 ? gareSemi.reduce((p, c) => (p.posizione < c.posizione) ? p : c) : null;
        const bestFin = gareFin.length > 0 ? gareFin.reduce((p, c) => (p.posizione < c.posizione) ? p : c) : null;
        return { anno, posizione_semi: bestSemi?.posizione || null, punti_semi: bestSemi?.punti || null, dettaglio_semi: bestSemi?.gara_dettaglio || null, posizione_fin: bestFin?.posizione || null, punti_fin: bestFin?.punti || null, dettaglio_fin: bestFin?.gara_dettaglio || null };
      } else {
        const gareAnno = storiaScuola.filter(r => r.anno === anno && r.categoria === categoriaGara);
        if (gareAnno.length > 0) return { ...gareAnno.reduce((p, c) => (p.posizione < c.posizione) ? p : c) };
        return { anno, posizione: null, punti: null, gara_dettaglio: null };
      }
    });
  }, [profilo, categoriaGara, anniCrescenti]);

  const stats = useMemo(() => {
    let oro = 0, argento = 0, bronzo = 0;
    
    if (!profilo) {
      return { partecipazioni: 0, sottotitolo: '-', migliore: "-", medaglie: { oro, argento, bronzo } };
    }

    if (categoriaGara === "Completa") {
      const presenzeSemi = storiaFiltrata.filter(d => d.posizione_semi !== null).length;
      const presenzeFin = storiaFiltrata.filter(d => d.posizione_fin !== null).length;
      const miglioriFin = storiaFiltrata.filter(d => d.posizione_fin !== null).map(d => d.posizione_fin);
      miglioriFin.forEach(p => { if (p===1) oro++; else if (p===2) argento++; else if (p===3) bronzo++; });
      return { partecipazioni: `${presenzeFin}`, sottotitolo: `Finali su ${presenzeSemi} Semifinali`, migliore: miglioriFin.length > 0 ? Math.min(...miglioriFin) : "-", medaglie: { oro, argento, bronzo } };
    } else {
      const valide = storiaFiltrata.filter(d => d.posizione !== null);
      const posizioni = valide.map(d => d.posizione);
      posizioni.forEach(p => { if (p===1) oro++; else if (p===2) argento++; else if (p===3) bronzo++; });
      return { partecipazioni: valide.length, sottotitolo: categoriaGara === 'Finale Mista' ? 'Finali Miste' : categoriaGara === 'Finale Femminile' ? 'Finali Femminili' : 'Semifinali', migliore: posizioni.length > 0 ? Math.min(...posizioni) : "-", medaglie: { oro, argento, bronzo } };
    }
  }, [storiaFiltrata, categoriaGara, profilo]);

  if (elencoSicuro.length === 0) {
    return <div className="p-10 text-center text-slate-500 font-medium bg-white rounded-xl shadow-sm border border-slate-100">Attendere, caricamento dati in corso... (o file JSON vuoti)</div>;
  }

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <div className="flex flex-col sm:flex-row gap-4 justify-center items-center bg-white p-4 rounded-xl shadow-sm border border-slate-100" style={{ display: 'flex', gap: '16px', justifyContent: 'center', backgroundColor: 'white', padding: '16px', borderRadius: '12px', border: '1px solid #f1f5f9' }}>
        <div className="flex flex-col w-full sm:w-auto" style={{ display: 'flex', flexDirection: 'column' }}>
          <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1" style={{ fontSize: '12px', fontWeight: 600, color: '#64748b', textTransform: 'uppercase', marginBottom: '4px' }}>Cerca Scuola</label>
          <select value={scuolaSelezionata} onChange={e => setScuolaSelezionata(e.target.value)} className="p-2.5 rounded-lg border border-slate-300 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-slate-50 min-w-[250px] transition-all" style={{ padding: '10px', borderRadius: '8px', border: '1px solid #cbd5e1', backgroundColor: '#f8fafc', minWidth: '250px' }}>
            {elencoSicuro.map(s => <option key={s.id_scuola} value={s.id_scuola}>{s.id_scuola}</option>)}
          </select>
        </div>
        <div className="flex flex-col w-full sm:w-auto" style={{ display: 'flex', flexDirection: 'column' }}>
          <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1" style={{ fontSize: '12px', fontWeight: 600, color: '#64748b', textTransform: 'uppercase', marginBottom: '4px' }}>Tipo di Gara</label>
          <select value={categoriaGara} onChange={e => setCategoriaGara(e.target.value)} className="p-2.5 rounded-lg border border-slate-300 focus:ring-2 focus:ring-blue-500 bg-slate-50 min-w-[200px] transition-all" style={{ padding: '10px', borderRadius: '8px', border: '1px solid #cbd5e1', backgroundColor: '#f8fafc', minWidth: '200px' }}>
            <option value="Completa">Completo (Semi + Finale)</option>
            <option value="Finale Mista">Solo Finale Mista</option>
            <option value="Semifinale">Solo Semifinale</option>
            <option value="Finale Femminile">Solo Finale Femminile</option>
          </select>
        </div>
      </div>

      <div className="text-center" style={{ textAlign: 'center' }}>
        <h2 className="text-3xl font-bold text-slate-800 flex justify-center items-center gap-2" style={{ fontSize: '30px', fontWeight: 'bold', color: '#1e293b', display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '8px', margin: 0 }}>
          <Trophy className="text-amber-500" size={32} color="#f59e0b" /> {profilo.nome}
        </h2>
        <p className="text-slate-500 mt-2 flex justify-center items-center gap-1 font-medium" style={{ color: '#64748b', marginTop: '8px', display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '4px', fontWeight: 500 }}>
          <MapPin size={16} /> {profilo.comune} ({profilo.provincia})
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4" style={{ display: 'flex', justifyContent: 'center', flexWrap: 'wrap', gap: '16px' }}>
        <div className="bg-white rounded-xl shadow-sm border border-slate-100 p-6 flex flex-col items-center justify-center" style={{ backgroundColor: 'white', borderRadius: '12px', border: '1px solid #f1f5f9', padding: '24px', display: 'flex', flexDirection: 'column', alignItems: 'center', flex: '1 1 200px', minWidth: '200px' }}>
          <span className="text-4xl font-black text-slate-800" style={{ fontSize: '36px', fontWeight: 900, color: '#1e293b' }}>{stats.partecipazioni}</span>
          <span className="text-sm font-medium text-slate-500 mt-1" style={{ fontSize: '14px', fontWeight: 500, color: '#64748b', marginTop: '4px' }}>{stats.sottotitolo}</span>
        </div>
        {categoriaGara !== 'Semifinale' && (
          <div className="bg-white rounded-xl shadow-sm border border-slate-100 p-6 flex flex-col items-center justify-center" style={{ backgroundColor: 'white', borderRadius: '12px', border: '1px solid #f1f5f9', padding: '24px', display: 'flex', flexDirection: 'column', alignItems: 'center', flex: '1 1 250px', minWidth: '250px' }}>
             <div className="flex gap-4" style={{ display: 'flex', gap: '16px' }}>
               <div className="flex items-center text-amber-600 font-bold text-xl" style={{ display: 'flex', alignItems: 'center', color: '#d97706', fontWeight: 'bold', fontSize: '20px' }}><Medal size={24} className="fill-amber-400 mr-1" color="#d97706" fill="#fbbf24" style={{ marginRight: '4px' }}/>{stats.medaglie.oro}</div>
               <div className="flex items-center text-slate-600 font-bold text-xl" style={{ display: 'flex', alignItems: 'center', color: '#475569', fontWeight: 'bold', fontSize: '20px' }}><Medal size={24} className="fill-slate-300 mr-1" color="#475569" fill="#cbd5e1" style={{ marginRight: '4px' }}/>{stats.medaglie.argento}</div>
               <div className="flex items-center text-amber-800 font-bold text-xl" style={{ display: 'flex', alignItems: 'center', color: '#92400e', fontWeight: 'bold', fontSize: '20px' }}><Medal size={24} className="fill-amber-600 mr-1" color="#92400e" fill="#d97706" style={{ marginRight: '4px' }}/>{stats.medaglie.bronzo}</div>
             </div>
             <span className="text-sm font-medium text-slate-500 mt-2" style={{ fontSize: '14px', fontWeight: 500, color: '#64748b', marginTop: '8px' }}>Podi Nazionali</span>
          </div>
        )}
        <div className="bg-white rounded-xl shadow-sm border border-slate-100 p-6 flex flex-col items-center justify-center" style={{ backgroundColor: 'white', borderRadius: '12px', border: '1px solid #f1f5f9', padding: '24px', display: 'flex', flexDirection: 'column', alignItems: 'center', flex: '1 1 200px', minWidth: '200px' }}>
          <div className="flex items-center gap-1" style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
            {stats.migliore !== "-" && <Medal className="text-blue-500" size={28} color="#3b82f6" />}
            <span className="text-4xl font-black text-slate-800" style={{ fontSize: '36px', fontWeight: 900, color: '#1e293b' }}>{stats.migliore}{stats.migliore !== "-" ? '°' : ''}</span>
          </div>
          <span className="text-sm font-medium text-slate-500 mt-1" style={{ fontSize: '14px', fontWeight: 500, color: '#64748b', marginTop: '4px' }}>Miglior Posizione</span>
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-slate-100 p-6" style={{ backgroundColor: 'white', borderRadius: '12px', border: '1px solid #f1f5f9', padding: '24px', height: '450px', marginTop: '32px' }}>
        <h3 className="text-lg font-bold text-slate-800 mb-4 text-center" style={{ fontSize: '18px', fontWeight: 'bold', color: '#1e293b', marginBottom: '16px', textAlign: 'center' }}>Andamento Storico</h3>
        <div style={{ width: '100%', height: 'calc(100% - 40px)' }}>
          <ResponsiveContainer width="100%" height="100%" minHeight={350}>
            <LineChart data={storiaFiltrata} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" opacity={0.3} vertical={false} />
              <XAxis dataKey="anno" tick={{fill: '#64748b'}} tickMargin={10} />
              <YAxis reversed domain={[1, 'dataMax']} allowDecimals={false} tick={{fill: '#64748b'}} />
              
              {/* Custom Tooltip protetto */}
              <RechartsTooltip content={<CustomTooltip categoriaGara={categoriaGara} />} />
              
              {categoriaGara === "Completa" && <Legend verticalAlign="top" height={36}/>}
              
              {/* Rimosso l'uso di Fragment per massima compatibilità con Recharts */}
              {categoriaGara === "Completa" && <Line name="Posizione Semifinale" type="monotone" dataKey="posizione_semi" stroke="#f59e0b" strokeWidth={2} strokeDasharray="4 4" connectNulls={false} activeDot={{ r: 6 }} />}
              {categoriaGara === "Completa" && <Line name="Posizione Finale" type="monotone" dataKey="posizione_fin" stroke="#3b82f6" strokeWidth={3} connectNulls={false} activeDot={{ r: 8 }} />}
              
              {categoriaGara !== "Completa" && <Line name="Posizione" type="monotone" dataKey="posizione" stroke="#3b82f6" strokeWidth={3} connectNulls={false} activeDot={{ r: 8 }} />}
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-slate-100 overflow-hidden mt-8" style={{ backgroundColor: 'white', borderRadius: '12px', border: '1px solid #f1f5f9', overflow: 'hidden', marginTop: '32px' }}>
        <h3 className="bg-slate-50 p-4 font-bold text-slate-800 border-b border-slate-200" style={{ backgroundColor: '#f8fafc', padding: '16px', fontWeight: 'bold', color: '#1e293b', borderBottom: '1px solid #e2e8f0', margin: 0 }}>Dettaglio Risultati</h3>
        <div className="overflow-x-auto" style={{ overflowX: 'auto' }}>
          <table className="w-full text-left border-collapse text-sm" style={{ width: '100%', textAlign: 'left', borderCollapse: 'collapse', fontSize: '14px' }}>
            <thead>
              <tr className="bg-white text-slate-500 uppercase tracking-wider border-b-2 border-slate-200" style={{ borderBottom: '2px solid #e2e8f0', color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                <th className="p-4 font-semibold w-24" style={{ padding: '16px', fontWeight: 600, width: '96px' }}>Anno</th>
                {categoriaGara === "Completa" ? (
                  <>
                    <th className="p-4 font-semibold" style={{ padding: '16px', fontWeight: 600 }}>Gara Semifinale</th>
                    <th className="p-4 font-semibold text-center" style={{ padding: '16px', fontWeight: 600, textAlign: 'center' }}>Pos. Semi</th>
                    <th className="p-4 font-semibold" style={{ padding: '16px', fontWeight: 600 }}>Gara Finale</th>
                    <th className="p-4 font-semibold text-center" style={{ padding: '16px', fontWeight: 600, textAlign: 'center' }}>Pos. Finale</th>
                  </>
                ) : (
                  <>
                    <th className="p-4 font-semibold" style={{ padding: '16px', fontWeight: 600 }}>Gara Specifica</th>
                    <th className="p-4 font-semibold text-center" style={{ padding: '16px', fontWeight: 600, textAlign: 'center' }}>Posizione</th>
                    <th className="p-4 font-semibold text-right" style={{ padding: '16px', fontWeight: 600, textAlign: 'right' }}>Punti</th>
                  </>
                )}
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100" style={{ borderTop: '1px solid #f1f5f9' }}>
              {storiaFiltrata
                .filter(d => categoriaGara === "Completa" ? (d.posizione_semi !== null || d.posizione_fin !== null) : d.posizione !== null)
                .map((d) => (
                <tr key={d.anno} className="hover:bg-slate-50 transition-colors" style={{ borderBottom: '1px solid #f1f5f9' }}>
                  <td className="p-4 font-bold text-slate-700" style={{ padding: '16px', fontWeight: 'bold', color: '#334155' }}>{d.anno}</td>
                  {categoriaGara === "Completa" ? (
                    <>
                      <td className="p-4 text-slate-600" style={{ padding: '16px', color: '#475569' }}>{d.dettaglio_semi || "-"}</td>
                      <td className="p-4 text-center text-amber-600 font-bold" style={{ padding: '16px', textAlign: 'center', color: '#d97706', fontWeight: 'bold' }}>{d.posizione_semi ? `${d.posizione_semi}°` : "-"}</td>
                      <td className="p-4 text-slate-600" style={{ padding: '16px', color: '#475569' }}>{d.dettaglio_fin || "-"}</td>
                      <td className="p-4 text-center text-blue-600 font-bold" style={{ padding: '16px', textAlign: 'center', color: '#2563eb', fontWeight: 'bold' }}>{d.posizione_fin ? `${d.posizione_fin}°` : "-"}</td>
                    </>
                  ) : (
                    <>
                      <td className="p-4 text-slate-600" style={{ padding: '16px', color: '#475569' }}>{d.gara_dettaglio}</td>
                      <td className="p-4 text-center font-bold text-blue-600" style={{ padding: '16px', textAlign: 'center', fontWeight: 'bold', color: '#2563eb' }}>{d.posizione}°</td>
                      <td className="p-4 text-right font-mono" style={{ padding: '16px', textAlign: 'right', fontFamily: 'monospace' }}>{d.punti}</td>
                    </>
                  )}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

// ============================================================================
// COMPONENTE: CLASSIFICHE ANNUALI
// ============================================================================
const VistaClassifiche = ({ goToSchool }) => {
  const [annoSel, setAnnoSel] = useState("2026");
  const [catSel, setCatSel] = useState("Finale Mista");

  const datiAnno = (classificheAnnuali || {})[annoSel] || {};
  const classifica = datiAnno[catSel] || [];

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <div className="flex flex-col sm:flex-row gap-4 justify-between items-center bg-white p-4 rounded-xl shadow-sm border border-slate-100" style={{ display: 'flex', justifyContent: 'space-between', backgroundColor: 'white', padding: '16px', borderRadius: '12px', border: '1px solid #f1f5f9' }}>
        <div className="flex gap-4 w-full sm:w-auto" style={{ display: 'flex', gap: '16px' }}>
          <div className="flex flex-col w-1/2 sm:w-auto" style={{ display: 'flex', flexDirection: 'column' }}>
            <label className="text-xs font-semibold text-slate-500 uppercase mb-1" style={{ fontSize: '12px', fontWeight: 600, color: '#64748b', textTransform: 'uppercase', marginBottom: '4px' }}>Anno</label>
            <select value={annoSel} onChange={e => setAnnoSel(e.target.value)} className="p-2 rounded-lg border border-slate-300 bg-slate-50" style={{ padding: '8px', borderRadius: '8px', border: '1px solid #cbd5e1', backgroundColor: '#f8fafc' }}>
              {TUTTI_GLI_ANNI.map(a => <option key={a} value={a}>{a}</option>)}
            </select>
          </div>
          <div className="flex flex-col w-1/2 sm:w-auto" style={{ display: 'flex', flexDirection: 'column' }}>
            <label className="text-xs font-semibold text-slate-500 uppercase mb-1" style={{ fontSize: '12px', fontWeight: 600, color: '#64748b', textTransform: 'uppercase', marginBottom: '4px' }}>Categoria</label>
            <select value={catSel} onChange={e => setCatSel(e.target.value)} className="p-2 rounded-lg border border-slate-300 bg-slate-50" style={{ padding: '8px', borderRadius: '8px', border: '1px solid #cbd5e1', backgroundColor: '#f8fafc' }}>
              <option value="Finale Mista">Finale Mista</option>
              <option value="Finale Femminile">Finale Femminile</option>
              <option value="Semifinale">Semifinali</option>
            </select>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-slate-100 overflow-hidden" style={{ backgroundColor: 'white', borderRadius: '12px', border: '1px solid #f1f5f9', overflow: 'hidden', marginTop: '24px' }}>
        {classifica.length === 0 ? (
          <div className="p-10 text-center text-slate-500" style={{ padding: '40px', textAlign: 'center', color: '#64748b' }}>Nessuna classifica disponibile per i filtri selezionati.</div>
        ) : (
          <div className="overflow-x-auto" style={{ overflowX: 'auto' }}>
            <table className="w-full text-left border-collapse" style={{ width: '100%', textAlign: 'left', borderCollapse: 'collapse' }}>
              <thead>
                <tr className="bg-slate-50 text-slate-500 text-sm uppercase tracking-wide border-b border-slate-200" style={{ backgroundColor: '#f8fafc', color: '#64748b', fontSize: '14px', textTransform: 'uppercase', borderBottom: '1px solid #e2e8f0' }}>
                  <th className="p-4 font-semibold w-20 text-center" style={{ padding: '16px', fontWeight: 600, textAlign: 'center' }}>Pos.</th>
                  <th className="p-4 font-semibold" style={{ padding: '16px', fontWeight: 600 }}>Scuola</th>
                  {catSel === 'Semifinale' && <th className="p-4 font-semibold text-center" style={{ padding: '16px', fontWeight: 600, textAlign: 'center' }}>Girone</th>}
                  <th className="p-4 font-semibold text-right" style={{ padding: '16px', fontWeight: 600, textAlign: 'right' }}>Punti</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100" style={{ borderTop: '1px solid #f1f5f9' }}>
                {classifica.map((row, idx) => (
                  <tr 
                    key={idx} 
                    onClick={() => goToSchool(row.id_scuola)}
                    className="hover:bg-blue-50 cursor-pointer transition-colors group"
                    title="Clicca per vedere lo storico della scuola"
                    style={{ cursor: 'pointer', borderBottom: '1px solid #f1f5f9' }}
                  >
                    <td className="p-4 text-center font-bold text-slate-700" style={{ padding: '16px', textAlign: 'center', fontWeight: 'bold', color: '#334155' }}>
                      {row.posizione === 1 ? '🥇' : row.posizione === 2 ? '🥈' : row.posizione === 3 ? '🥉' : `${row.posizione}°`}
                    </td>
                    <td className="p-4 font-medium text-blue-700 flex items-center justify-between" style={{ padding: '16px', fontWeight: 500, color: '#1d4ed8', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      {row.id_scuola}
                      <ChevronRight size={16} className="text-blue-300 opacity-50" color="#93c5fd" />
                    </td>
                    {catSel === 'Semifinale' && <td className="p-4 text-center text-slate-500" style={{ padding: '16px', textAlign: 'center', color: '#64748b' }}>{row.Gara}</td>}
                    <td className="p-4 text-right font-mono font-bold text-slate-600" style={{ padding: '16px', textAlign: 'right', fontFamily: 'monospace', fontWeight: 'bold', color: '#475569' }}>{row.Punti}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

// ============================================================================
// COMPONENTE: ALBO D'ORO E MEDAGLIERE
// ============================================================================
const VistaAlboOro = () => {
  const [filtroProvincia, setFiltroProvincia] = useState("Tutte");
  const { mista = [], femminile = [], medagliere = [] } = alboDati || {};

  const provinceUniche = useMemo(() => {
    if (!Array.isArray(medagliere)) return ["Tutte"];
    const prov = medagliere.map(m => m.provincia).filter(Boolean);
    return ["Tutte", ...new Set(prov)].sort();
  }, [medagliere]);

  const medagliereOrdinato = useMemo(() => {
    if (!Array.isArray(medagliere)) return [];
    let filtrato = medagliere;
    if (filtroProvincia !== "Tutte") filtrato = medagliere.filter(m => m.provincia === filtroProvincia);
    
    // Creiamo una copia sicura dell'array per evitare errori di mutazione di stato in React
    return [...filtrato].sort((a, b) => {
      const oroA = (a.oro || 0) + (a.oro_f || 0); 
      const oroB = (b.oro || 0) + (b.oro_f || 0);
      if (oroA !== oroB) return oroB - oroA;
      
      const argA = (a.argento || 0) + (a.argento_f || 0); 
      const argB = (b.argento || 0) + (b.argento_f || 0);
      if (argA !== argB) return argB - argA;
      
      const broA = (a.bronzo || 0) + (a.bronzo_f || 0); 
      const broB = (b.bronzo || 0) + (b.bronzo_f || 0);
      return broB - broA;
    });
  }, [medagliere, filtroProvincia]);

  const renderPodi = (dati, titolo) => (
    <div className="bg-white rounded-xl shadow-sm border border-slate-100 overflow-hidden flex-1" style={{ backgroundColor: 'white', borderRadius: '12px', border: '1px solid #f1f5f9', overflow: 'hidden', flex: 1, minWidth: '300px' }}>
      <h3 className="bg-slate-50 p-4 font-bold text-slate-800 text-center border-b border-slate-200" style={{ backgroundColor: '#f8fafc', padding: '16px', fontWeight: 'bold', color: '#1e293b', textAlign: 'center', borderBottom: '1px solid #e2e8f0', margin: 0 }}>{titolo}</h3>
      <div className="p-4 space-y-4" style={{ padding: '16px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
        {dati.slice(0, 5).map((podio, idx) => ( 
          <div key={podio.anno || idx} className="border border-slate-100 rounded-lg p-3 hover:shadow-md transition-shadow" style={{ border: '1px solid #f1f5f9', borderRadius: '8px', padding: '12px' }}>
            <div className="text-center font-black text-slate-400 text-sm mb-2" style={{ textAlign: 'center', fontWeight: 900, color: '#94a3b8', fontSize: '14px', marginBottom: '8px' }}>{podio.anno}</div>
            <div className="flex items-center gap-2 mb-1" style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}><span className="text-xl" style={{ fontSize: '20px' }}>🥇</span> <span className="font-bold text-sm text-slate-700 truncate" style={{ fontWeight: 'bold', fontSize: '14px', color: '#334155', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{podio.oro}</span></div>
            <div className="flex items-center gap-2 mb-1" style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}><span className="text-xl" style={{ fontSize: '20px' }}>🥈</span> <span className="text-sm text-slate-600 truncate" style={{ fontSize: '14px', color: '#475569', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{podio.argento}</span></div>
            <div className="flex items-center gap-2" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}><span className="text-xl" style={{ fontSize: '20px' }}>🥉</span> <span className="text-sm text-slate-500 truncate" style={{ fontSize: '14px', color: '#64748b', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{podio.bronzo}</span></div>
          </div>
        ))}
      </div>
    </div>
  );

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <div>
        <h2 className="text-2xl font-bold text-slate-800 mb-4 flex items-center gap-2" style={{ fontSize: '24px', fontWeight: 'bold', color: '#1e293b', marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px' }}><Award className="text-amber-500" color="#f59e0b" /> Albo d'Oro Recente</h2>
        <div className="flex flex-col md:flex-row gap-6" style={{ display: 'flex', flexWrap: 'wrap', gap: '24px' }}>
          {renderPodi(mista, "Finale Mista")}
          {renderPodi(femminile, "Finale Femminile")}
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-slate-100 overflow-hidden" style={{ backgroundColor: 'white', borderRadius: '12px', border: '1px solid #f1f5f9', overflow: 'hidden', marginTop: '32px' }}>
        <div className="bg-slate-50 p-4 border-b border-slate-200 flex flex-col sm:flex-row justify-between items-center gap-4" style={{ backgroundColor: '#f8fafc', padding: '16px', borderBottom: '1px solid #e2e8f0', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap' }}>
          <h2 className="text-xl font-bold text-slate-800 flex items-center gap-2" style={{ fontSize: '20px', fontWeight: 'bold', color: '#1e293b', margin: 0, display: 'flex', alignItems: 'center', gap: '8px' }}><ListOrdered className="text-blue-500" color="#3b82f6" /> Medagliere Cumulativo</h2>
          <div className="flex items-center gap-2" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <label className="text-sm font-semibold text-slate-500" style={{ fontSize: '14px', fontWeight: 600, color: '#64748b' }}>Provincia:</label>
            <select value={filtroProvincia} onChange={e => setFiltroProvincia(e.target.value)} className="p-1.5 rounded-md border border-slate-300 text-sm bg-white" style={{ padding: '6px', borderRadius: '6px', border: '1px solid #cbd5e1', fontSize: '14px', backgroundColor: 'white' }}>
              {provinceUniche.map(p => <option key={p} value={p}>{p}</option>)}
            </select>
          </div>
        </div>
        
        <div className="overflow-x-auto" style={{ overflowX: 'auto' }}>
          <table className="w-full text-left border-collapse text-sm" style={{ width: '100%', textAlign: 'left', borderCollapse: 'collapse', fontSize: '14px' }}>
            <thead>
              <tr className="bg-white text-slate-500 uppercase tracking-wider border-b-2 border-slate-200" style={{ color: '#64748b', textTransform: 'uppercase', borderBottom: '2px solid #e2e8f0' }}>
                <th className="p-3 font-semibold text-center w-12" style={{ padding: '12px', fontWeight: 600, textAlign: 'center', width: '48px' }}>#</th>
                <th className="p-3 font-semibold" style={{ padding: '12px', fontWeight: 600 }}>Scuola</th>
                <th className="p-3 font-semibold text-center" style={{ padding: '12px', fontWeight: 600, textAlign: 'center' }}>Prov</th>
                <th className="p-3 font-semibold text-center bg-amber-50 text-amber-700" style={{ padding: '12px', fontWeight: 600, textAlign: 'center', backgroundColor: '#fffbeb', color: '#b45309' }}>🥇 Oro</th>
                <th className="p-3 font-semibold text-center bg-slate-50 text-slate-700" style={{ padding: '12px', fontWeight: 600, textAlign: 'center', backgroundColor: '#f8fafc', color: '#334155' }}>🥈 Arg</th>
                <th className="p-3 font-semibold text-center bg-orange-50 text-orange-800" style={{ padding: '12px', fontWeight: 600, textAlign: 'center', backgroundColor: '#fff7ed', color: '#9a3412' }}>🥉 Bro</th>
                <th className="p-3 font-semibold text-center text-blue-700 border-l border-slate-100" style={{ padding: '12px', fontWeight: 600, textAlign: 'center', color: '#1d4ed8', borderLeft: '1px solid #f1f5f9' }}>Totale</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100" style={{ borderTop: '1px solid #f1f5f9' }}>
              {medagliereOrdinato.map((row, idx) => {
                const totOro = (row.oro || 0) + (row.oro_f || 0);
                const totArg = (row.argento || 0) + (row.argento_f || 0);
                const totBro = (row.bronzo || 0) + (row.bronzo_f || 0);
                const totale = totOro + totArg + totBro;
                if(totale === 0) return null; 
                
                return (
                  <tr key={row.id_scuola || idx} className="hover:bg-slate-50 transition-colors" style={{ borderBottom: '1px solid #f1f5f9' }}>
                    <td className="p-3 text-center font-bold text-slate-400" style={{ padding: '12px', textAlign: 'center', fontWeight: 'bold', color: '#94a3b8' }}>{idx + 1}</td>
                    <td className="p-3 font-medium text-slate-700" style={{ padding: '12px', fontWeight: 500, color: '#334155' }}>{row.nome} <span className="text-xs text-slate-400 font-normal ml-1" style={{ fontSize: '12px', color: '#94a3b8', fontWeight: 'normal', marginLeft: '4px' }}>({row.comune})</span></td>
                    <td className="p-3 text-center text-slate-500" style={{ padding: '12px', textAlign: 'center', color: '#64748b' }}>{row.provincia}</td>
                    <td className="p-3 text-center font-bold text-amber-600 bg-amber-50/30" style={{ padding: '12px', textAlign: 'center', fontWeight: 'bold', color: '#d97706', backgroundColor: 'rgba(255, 251, 235, 0.5)' }}>{totOro > 0 ? totOro : '-'}</td>
                    <td className="p-3 text-center font-bold text-slate-500 bg-slate-50/50" style={{ padding: '12px', textAlign: 'center', fontWeight: 'bold', color: '#64748b', backgroundColor: 'rgba(248, 250, 252, 0.8)' }}>{totArg > 0 ? totArg : '-'}</td>
                    <td className="p-3 text-center font-bold text-orange-700 bg-orange-50/30" style={{ padding: '12px', textAlign: 'center', fontWeight: 'bold', color: '#c2410c', backgroundColor: 'rgba(255, 247, 237, 0.5)' }}>{totBro > 0 ? totBro : '-'}</td>
                    <td className="p-3 text-center font-black text-blue-600 border-l border-slate-100" style={{ padding: '12px', textAlign: 'center', fontWeight: 900, color: '#2563eb', borderLeft: '1px solid #f1f5f9' }}>{totale}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

// ============================================================================
// COMPONENTE PRINCIPALE: CONTENITORE E NAVIGAZIONE
// ============================================================================
export default function App() {
  const [activeTab, setActiveTab] = useState('scuola'); 
  
  const [scuolaSelezionata, setScuolaSelezionata] = useState(() => {
    const lista = Array.isArray(elencoScuole) ? elencoScuole : [];
    return lista.length > 0 ? lista[0].id_scuola : "";
  });

  const handleNavigaAScuola = (idScuola) => {
    setScuolaSelezionata(idScuola);
    setActiveTab('scuola');
    window.scrollTo({ top: 0, behavior: 'smooth' }); 
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-800 font-sans pb-20" style={{ minHeight: '100vh', backgroundColor: '#f8fafc', color: '#1e293b', fontFamily: 'sans-serif', paddingBottom: '80px' }}>
      <header className="bg-white border-b border-slate-200 shadow-sm sticky top-0 z-10" style={{ backgroundColor: 'white', borderBottom: '1px solid #e2e8f0', position: 'sticky', top: 0, zIndex: 10 }}>
        <div className="max-w-5xl mx-auto px-4" style={{ maxWidth: '1024px', margin: '0 auto', padding: '0 16px' }}>
          <div className="flex flex-col sm:flex-row justify-between items-center py-4 gap-4" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '16px 0', flexWrap: 'wrap', gap: '16px' }}>
            <h1 className="text-2xl font-black text-blue-700 flex items-center gap-2" style={{ fontSize: '24px', fontWeight: 900, color: '#1d4ed8', display: 'flex', alignItems: 'center', gap: '8px', margin: 0 }}>
              <BarChart className="text-blue-600" color="#2563eb" />
              Statistiche GaS
            </h1>
            
            <nav className="flex bg-slate-100 p-1 rounded-lg overflow-x-auto" style={{ display: 'flex', backgroundColor: '#f1f5f9', padding: '4px', borderRadius: '8px', overflowX: 'auto' }}>
              <button 
                onClick={() => setActiveTab('scuola')}
                className={`flex items-center gap-2 px-4 py-2 rounded-md text-sm font-medium transition-all whitespace-nowrap ${activeTab === 'scuola' ? 'bg-white text-blue-700 shadow-sm' : 'text-slate-600 hover:text-slate-900'}`}
                style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '8px 16px', borderRadius: '6px', fontSize: '14px', fontWeight: 500, whiteSpace: 'nowrap', border: 'none', cursor: 'pointer', backgroundColor: activeTab === 'scuola' ? 'white' : 'transparent', color: activeTab === 'scuola' ? '#1d4ed8' : '#475569', boxShadow: activeTab === 'scuola' ? '0 1px 2px 0 rgba(0, 0, 0, 0.05)' : 'none' }}
              >
                <Search size={16} /> Storico Squadra
              </button>
              <button 
                onClick={() => setActiveTab('classifiche')}
                className={`flex items-center gap-2 px-4 py-2 rounded-md text-sm font-medium transition-all whitespace-nowrap ${activeTab === 'classifiche' ? 'bg-white text-blue-700 shadow-sm' : 'text-slate-600 hover:text-slate-900'}`}
                style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '8px 16px', borderRadius: '6px', fontSize: '14px', fontWeight: 500, whiteSpace: 'nowrap', border: 'none', cursor: 'pointer', backgroundColor: activeTab === 'classifiche' ? 'white' : 'transparent', color: activeTab === 'classifiche' ? '#1d4ed8' : '#475569', boxShadow: activeTab === 'classifiche' ? '0 1px 2px 0 rgba(0, 0, 0, 0.05)' : 'none' }}
              >
                <ListOrdered size={16} /> Classifiche
              </button>
              <button 
                onClick={() => setActiveTab('albo')}
                className={`flex items-center gap-2 px-4 py-2 rounded-md text-sm font-medium transition-all whitespace-nowrap ${activeTab === 'albo' ? 'bg-white text-blue-700 shadow-sm' : 'text-slate-600 hover:text-slate-900'}`}
                style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '8px 16px', borderRadius: '6px', fontSize: '14px', fontWeight: 500, whiteSpace: 'nowrap', border: 'none', cursor: 'pointer', backgroundColor: activeTab === 'albo' ? 'white' : 'transparent', color: activeTab === 'albo' ? '#1d4ed8' : '#475569', boxShadow: activeTab === 'albo' ? '0 1px 2px 0 rgba(0, 0, 0, 0.05)' : 'none' }}
              >
                <Award size={16} /> Albo d'Oro
              </button>
            </nav>
          </div>
        </div>
      </header>

      <main className="max-w-5xl mx-auto px-4 py-8" style={{ maxWidth: '1024px', margin: '0 auto', padding: '32px 16px' }}>
        {activeTab === 'scuola' && <VistaStoricoScuola scuolaSelezionata={scuolaSelezionata} setScuolaSelezionata={setScuolaSelezionata} />}
        {activeTab === 'classifiche' && <VistaClassifiche goToSchool={handleNavigaAScuola} />}
        {activeTab === 'albo' && <VistaAlboOro />}
      </main>
    </div>
  );
}