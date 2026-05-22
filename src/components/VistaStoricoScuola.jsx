import { useState, useMemo, useEffect } from 'react';
import { Trophy, Medal, MapPin, Award, ChevronRight } from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, ResponsiveContainer, Legend } from 'recharts';

// ============================================================================
// COMPONENTE: STORICO SCUOLA
// ============================================================================
export default function VistaStoricoScuola({ data }) {
  // no local state for selected school; derive it from the current path
  const [, setTick] = useState(0); // used to force re-render on popstate
  const { profiliScuole, elenco_anni, risultati } = data;
  const [categoriaGara, setCategoriaGara] = useState("Completa"); 
  
  const profiliSicuri = profiliScuole || {};
  const elencoSicuro = Object.values(profiliSicuri).map(p => ({ id_scuola: p.id, nome: p.nome, comune: p.comune }));

  function getSchoolFromPath() {
    try {
      const path = window.location.pathname || '';
      const match = path.match(/\/scuola\/(.+)$/);
      if (match && match[1]) {
        const decoded = decodeURIComponent(match[1]);
        if (profiliScuole && profiliScuole[decoded]) return decoded;
      }
    } catch (e) {}
    return null;
  }

  const scuolaSelezionata = getSchoolFromPath();
  const profilo = profiliSicuri[scuolaSelezionata];

  function setSchool(id) {
    try {
      const pathname = window.location.pathname || '';
      const base = pathname.replace(/\/scuola\/.+$/, '');
      const newPath = id ? `${base.replace(/\/$/, '')}/scuola/${encodeURIComponent(id)}` : base || '/';
      const newUrl = newPath + window.location.search + window.location.hash;
      window.history.replaceState({}, '', newUrl);
      setTick(t => t + 1);
    } catch (e) {}
  }

  const anniCrescenti = elenco_anni.sort((a, b) => a - b);
  
  const risultati_scuola = useMemo(() => risultati.filter(r => r.id_scuola === scuolaSelezionata), [risultati, scuolaSelezionata]);

  const storiaFiltrata = useMemo(() => anniCrescenti.map(anno => {
      if (categoriaGara === "Completa") {
        const gareSemi = risultati_scuola.filter(r => r.anno === anno && r.categoria === "Semifinale");
        const gareFin = risultati_scuola.filter(r => r.anno === anno && r.categoria === "Finale Mista");
        const bestSemi = gareSemi.length > 0 ? gareSemi.reduce((p, c) => (p.posizione < c.posizione) ? p : c) : null;
        const bestFin = gareFin.length > 0 ? gareFin.reduce((p, c) => (p.posizione < c.posizione) ? p : c) : null;
        return { anno, posizione_semi: bestSemi?.posizione || null, punti_semi: bestSemi?.punti || null, dettaglio_semi: bestSemi?.gara_dettaglio || null, posizione_fin: bestFin?.posizione || null, punti_fin: bestFin?.punti || null, dettaglio_fin: bestFin?.gara_dettaglio || null };
      } else {
        const gareAnno = risultati_scuola.filter(r => r.anno === anno && r.categoria === categoriaGara);
        if (gareAnno.length > 0) return { ...gareAnno.reduce((p, c) => (p.posizione < c.posizione) ? p : c) };
        return { anno, posizione: null, punti: null, gara_dettaglio: null };
      }
  }), [profilo, categoriaGara, anniCrescenti]);

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
    return <div className="p-10 text-center text-slate-500 font-medium bg-white rounded-xl shadow-sm border border-slate-100">
      Attendere, caricamento dati in corso... (o file JSON vuoti)
    </div>;
  }

  // initialize selected school from URL or fallback to first available
  // force update on browser navigation so `scuolaSelezionata` is recalculated
  useEffect(() => {
    function onPop() { setTick(t => t + 1); }
    window.addEventListener('popstate', onPop);
    return () => window.removeEventListener('popstate', onPop);
  }, []);

  return (
    <div className="space-y-8 animate-in fade-in duration-500">

      <Filtri scuolaSelezionata={scuolaSelezionata} onChangeScuola={setSchool} categoriaGara={categoriaGara} setCategoriaGara={setCategoriaGara} elencoSicuro={elencoSicuro} />

      {profilo ? (
        <>
          <div className="text-center" style={{ textAlign: 'center' }}>
            <h2 className="text-3xl font-bold text-slate-800 flex justify-center items-center gap-2" style={{ fontSize: '30px', fontWeight: 'bold', color: '#1e293b', display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '8px', margin: 0 }}>
              <Trophy className="text-amber-500" size={32} color="#f59e0b" /> {profilo.nome}
            </h2>
            <p className="text-slate-500 mt-2 flex justify-center items-center gap-1 font-medium" style={{ color: '#64748b', marginTop: '8px', display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '4px', fontWeight: 500 }}>
              <MapPin size={16} /> {profilo.comune} ({profilo.provincia})
            </p>
          </div>

          <Podi stats={stats} categoriaGara={categoriaGara} />

          <Andamento storiaFiltrata={storiaFiltrata} categoriaGara={categoriaGara} />

          <div className="bg-white rounded-xl shadow-sm border border-slate-100 overflow-hidden mt-8" style={{ backgroundColor: 'white', borderRadius: '12px', border: '1px solid #f1f5f9', overflow: 'hidden', marginTop: '32px' }}>
            <h3 className="bg-slate-50 p-4 font-bold text-slate-800 border-b border-slate-200" style={{ backgroundColor: '#f8fafc', padding: '16px', fontWeight: 'bold', color: '#1e293b', borderBottom: '1px solid #e2e8f0', margin: 0 }}>Dettaglio Risultati</h3>
            <div className="overflow-x-auto" style={{ overflowX: 'auto' }}>
              <table className="w-full text-left border-collapse text-sm" style={{ width: '100%', textAlign: 'left', borderCollapse: 'collapse', fontSize: '14px' }}>
            <thead>
              <tr className="bg-white text-slate-500 uppercase tracking-wider border-b-2 border-slate-200" style={{ borderBottom: '2px solid #e2e8f0', color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                <th className="p-4 font-semibold w-24" style={{ padding: '16px', fontWeight: 600, width: '96px' }}>Anno</th>
                {categoriaGara === "Completa" ? (
                  <>
                    <th className="p-4 font-semibold" style={{ padding: '16px', fontWeight: 600 }}>
                      Gara Semifinale
                    </th>
                    <th className="p-4 font-semibold text-center" style={{ padding: '16px', fontWeight: 600, textAlign: 'center' }}>
                      Pos. Semi
                    </th>
                    <th className="p-4 font-semibold" style={{ padding: '16px', fontWeight: 600 }}>
                      Gara Finale
                    </th>
                    <th className="p-4 font-semibold text-center" style={{ padding: '16px', fontWeight: 600, textAlign: 'center' }}>
                      Pos. Finale
                    </th>
                  </>
                ) : (
                  <>
                    <th className="p-4 font-semibold" style={{ padding: '16px', fontWeight: 600 }}>
                      Gara Specifica
                    </th>
                    <th className="p-4 font-semibold text-center" style={{ padding: '16px', fontWeight: 600, textAlign: 'center' }}>
                      Posizione
                    </th>
                    <th className="p-4 font-semibold text-right" style={{ padding: '16px', fontWeight: 600, textAlign: 'right' }}>
                      Punti
                    </th>
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
                      <td className="p-4 text-slate-600" style={{ padding: '16px', color: '#475569' }}>
                        {d.dettaglio_semi || "-"}
                      </td>
                      <td className="p-4 text-center text-amber-600 font-bold" style={{ padding: '16px', textAlign: 'center', color: '#d97706', fontWeight: 'bold' }}>
                        {d.posizione_semi ? `${d.posizione_semi}°` : "-"}
                      </td>
                      <td className="p-4 text-slate-600" style={{ padding: '16px', color: '#475569' }}>
                        {d.dettaglio_fin || "-"}
                      </td>
                      <td className="p-4 text-center text-blue-600 font-bold" style={{ padding: '16px', textAlign: 'center', color: '#2563eb', fontWeight: 'bold' }}>
                        {d.posizione_fin ? `${d.posizione_fin}°` : "-"}
                      </td>
                    </>
                  ) : (
                    <>
                      <td className="p-4 text-slate-600" style={{ padding: '16px', color: '#475569' }}>
                        {d.gara}
                      </td>
                      <td className="p-4 text-center font-bold text-blue-600" style={{ padding: '16px', textAlign: 'center', fontWeight: 'bold', color: '#2563eb' }}>
                        {d.posizione}°
                      </td>
                      <td className="p-4 text-right font-mono" style={{ padding: '16px', textAlign: 'right', fontFamily: 'monospace' }}>
                        {d.punti}
                      </td>
                    </>
                  )}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
        </>
      ) : null}
    </div>
  );
};

// ============================================================================
// COMPONENTE TOOLTIP SICURO (Isolato per prevenire crash)
// ============================================================================
function CustomTooltip({ active, payload, label, categoriaGara }) {
  const hasData = payload && payload.some(p => p.value !== null);
  if (!active || !payload || payload.length === 0 || !hasData) return null;

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

function Filtri({scuolaSelezionata, onChangeScuola, categoriaGara, setCategoriaGara, elencoSicuro}) {
  return <div className="flex flex-col sm:flex-row gap-4 justify-center items-center bg-white p-4 rounded-xl shadow-sm border border-slate-100" style={{ display: 'flex', gap: '16px', justifyContent: 'center', backgroundColor: 'white', padding: '16px', borderRadius: '12px', border: '1px solid #f1f5f9' }}>
    <div className="flex flex-col w-full sm:w-auto" style={{ display: 'flex', flexDirection: 'column' }}>
      <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1" style={{ fontSize: '12px', fontWeight: 600, color: '#64748b', textTransform: 'uppercase', marginBottom: '4px' }}>Cerca Scuola</label>
      <select value={scuolaSelezionata || ''} onChange={e => onChangeScuola(e.target.value || null)} className="p-2.5 rounded-lg border border-slate-300 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-slate-50 min-w-[250px] transition-all" style={{ padding: '10px', borderRadius: '8px', border: '1px solid #cbd5e1', backgroundColor: '#f8fafc', minWidth: '250px' }}>
        <option value="">Seleziona scuola</option>
        {elencoSicuro.map(s => <option key={s.id_scuola} value={s.id_scuola}>{s.nome} ({s.comune})</option>)}
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
}

function Podi({stats, categoriaGara}) {
  return <div className="grid grid-cols-1 md:grid-cols-3 gap-4" style={{ display: 'flex', justifyContent: 'center', flexWrap: 'wrap', gap: '16px' }}>
    <div className="bg-white rounded-xl shadow-sm border border-slate-100 p-6 flex flex-col items-center justify-center" style={{ backgroundColor: 'white', borderRadius: '12px', border: '1px solid #f1f5f9', padding: '24px', display: 'flex', flexDirection: 'column', alignItems: 'center', flex: '1 1 200px', minWidth: '200px' }}>
      <span className="text-4xl font-black text-slate-800" style={{ fontSize: '36px', fontWeight: 900, color: '#1e293b' }}>
        {stats.partecipazioni}
      </span>
      <span className="text-sm font-medium text-slate-500 mt-1" style={{ fontSize: '14px', fontWeight: 500, color: '#64748b', marginTop: '4px' }}>
        {stats.sottotitolo}
      </span>
    </div>
    {categoriaGara !== 'Semifinale' && (
      <div className="bg-white rounded-xl shadow-sm border border-slate-100 p-6 flex flex-col items-center justify-center" style={{ backgroundColor: 'white', borderRadius: '12px', border: '1px solid #f1f5f9', padding: '24px', display: 'flex', flexDirection: 'column', alignItems: 'center', flex: '1 1 250px', minWidth: '250px' }}>
          <div className="flex gap-4" style={{ display: 'flex', gap: '16px' }}>
            <div className="flex items-center text-amber-600 font-bold text-xl" style={{ display: 'flex', alignItems: 'center', color: '#d97706', fontWeight: 'bold', fontSize: '20px' }}><Medal size={24} className="fill-amber-400 mr-1" color="#d97706" fill="#fbbf24" style={{ marginRight: '4px' }}/>
            {stats.medaglie.oro}
            </div>
            <div className="flex items-center text-slate-600 font-bold text-xl" style={{ display: 'flex', alignItems: 'center', color: '#475569', fontWeight: 'bold', fontSize: '20px' }}><Medal size={24} className="fill-slate-300 mr-1" color="#475569" fill="#cbd5e1" style={{ marginRight: '4px' }}/>
            {stats.medaglie.argento}
            </div>
            <div className="flex items-center text-amber-800 font-bold text-xl" style={{ display: 'flex', alignItems: 'center', color: '#92400e', fontWeight: 'bold', fontSize: '20px' }}><Medal size={24} className="fill-amber-600 mr-1" color="#92400e" fill="#d97706" style={{ marginRight: '4px' }}/>
            {stats.medaglie.bronzo}
            </div>
          </div>
          <span className="text-sm font-medium text-slate-500 mt-2" style={{ fontSize: '14px', fontWeight: 500, color: '#64748b', marginTop: '8px' }}>Podi Nazionali</span>
      </div>
    )}
    <div className="bg-white rounded-xl shadow-sm border border-slate-100 p-6 flex flex-col items-center justify-center" style={{ backgroundColor: 'white', borderRadius: '12px', border: '1px solid #f1f5f9', padding: '24px', display: 'flex', flexDirection: 'column', alignItems: 'center', flex: '1 1 200px', minWidth: '200px' }}>
      <div className="flex items-center gap-1" style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
        {stats.migliore !== "-" && <Medal className="text-blue-500" size={28} color="#3b82f6" />}
        <span className="text-4xl font-black text-slate-800" style={{ fontSize: '36px', fontWeight: 900, color: '#1e293b' }}>
          {stats.migliore}{stats.migliore !== "-" ? '°' : ''}
        </span>
      </div>
      <span className="text-sm font-medium text-slate-500 mt-1" style={{ fontSize: '14px', fontWeight: 500, color: '#64748b', marginTop: '4px' }}>
        Miglior Posizione
      </span>
    </div>
  </div>
}

function Andamento({storiaFiltrata, categoriaGara}) {
  return <div className="bg-white rounded-xl shadow-sm border border-slate-100 p-6" style={{ backgroundColor: 'white', borderRadius: '12px', border: '1px solid #f1f5f9', padding: '24px', height: '450px', marginTop: '32px' }}>
    <h3 className="text-lg font-bold text-slate-800 mb-4 text-center" style={{ fontSize: '18px', fontWeight: 'bold', color: '#1e293b', marginBottom: '16px', textAlign: 'center' }}>
      Andamento Storico
    </h3>
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
}
