import { useState, useMemo } from 'react';
import { Award, ListOrdered } from 'lucide-react';

function renderScuolaLink(profiliScuole, id_scuola) {
  const scuola = profiliScuole?.[id_scuola];
  if (!scuola) return id_scuola;
  return <a href={`./scuola/${encodeURIComponent(id_scuola)}`} className="no-underline text-slate-700 hover:no-underline" style={{ color: 'inherit', textDecoration: 'none' }}>{`${scuola.nome} (${scuola.comune})`}</a>;
}

// ============================================================================
// COMPONENTE: ALBO D'ORO E MEDAGLIERE
// ============================================================================
export default function VistaAlboOro({ data }) {
  const { profiliScuole, risultati, elenco_province, elenco_anni } = data;
  const medagliati = useMemo(() => risultati.filter(r => r.posizione && r.posizione <= 3 && (r.gara==="Finale" || r.gara==="FinaleF")), [risultati]);

  const elenco_anni_recenti = elenco_anni.slice(-5).reverse();

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <div>
        <h2 className="text-2xl font-bold text-slate-800 mb-4 flex items-center gap-2" style={{ fontSize: '24px', fontWeight: 'bold', color: '#1e293b', marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px' }}><Award className="text-amber-500" color="#f59e0b" /> Albo d'Oro Recente</h2>
        <div className="flex flex-col md:flex-row gap-6" style={{ display: 'flex', flexWrap: 'wrap', gap: '24px' }}>
          <Podi elenco_anni={elenco_anni_recenti} medagliati={medagliati.filter(r => r.gara === "Finale" && r.posizione<=3)} profiliScuole={profiliScuole} titolo="Finale Mista" />
          <Podi elenco_anni={elenco_anni_recenti} medagliati={medagliati.filter(r => r.gara === "FinaleF" && r.posizione<=3)} profiliScuole={profiliScuole} titolo="Finale Femminile" />
        </div>
      </div>
      <Medagliere medagliati={medagliati} profiliScuole={profiliScuole}/>
    </div>
  );
};

function Podi({elenco_anni, medagliati, profiliScuole, titolo}) {  
  const podi_annuali = useMemo(() => {
    const mappa = {};
    for(const m of medagliati) {
      if (!elenco_anni.includes(String(m.anno))) continue;
      const anno = `${m.anno}`;
      if(!mappa[anno]) {
        mappa[anno] = { anno: m.anno, oro: null, argento: null, bronzo: null };
      }
      if (m.posizione === 1) mappa[anno].oro = m.id_scuola;
      else if (m.posizione === 2) mappa[anno].argento = m.id_scuola;
      else if (m.posizione === 3) mappa[anno].bronzo = m.id_scuola;
    }
    return Object.values(mappa).sort((a,b) => b.anno - a.anno);
  }, [medagliati]);

  // local wrapper using shared helper
  function renderScuola(id_scuola) {
    return renderScuolaLink(profiliScuole, id_scuola);
  }

  return (
    <div className="bg-white rounded-xl shadow-sm border border-slate-100 overflow-hidden flex-1" style={{ backgroundColor: 'white', borderRadius: '12px', border: '1px solid #f1f5f9', overflow: 'hidden', flex: 1, minWidth: '300px', maxWidth: '400px' }}>
      <h3 className="bg-slate-50 p-4 font-bold text-slate-800 text-center border-b border-slate-200" style={{ backgroundColor: '#f8fafc', padding: '16px', fontWeight: 'bold', color: '#1e293b', textAlign: 'center', borderBottom: '1px solid #e2e8f0', margin: 0 }}>{titolo}</h3>
      <div className="p-4 space-y-4" style={{ padding: '16px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
        {podi_annuali.map(podio => (
          <div key={podio.anno} className="border border-slate-100 rounded-lg p-3 hover:shadow-md transition-shadow" style={{ border: '1px solid #f1f5f9', borderRadius: '8px', padding: '12px' }}>
            <div className="text-center font-black text-slate-400 text-sm mb-2" style={{ textAlign: 'center', fontWeight: 900, color: '#94a3b8', fontSize: '14px', marginBottom: '8px' }}>
              {podio.anno}
            </div>
            <div className="flex items-center gap-2 mb-1" style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
              <span className="text-xl" style={{ fontSize: '20px' }}>🥇</span> 
              <span className="font-bold text-sm text-slate-700 truncate" style={{ fontWeight: 'bold', fontSize: '14px', color: '#334155', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                {renderScuola(podio.oro)}
              </span></div>
            <div className="flex items-center gap-2 mb-1" style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
              <span className="text-xl" style={{ fontSize: '20px' }}>🥈</span> 
              <span className="text-sm text-slate-600 truncate" style={{ fontSize: '14px', color: '#475569', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                {renderScuola(podio.argento)}
              </span></div>
            <div className="flex items-center gap-2" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <span className="text-xl" style={{ fontSize: '20px' }}>🥉</span> 
              <span className="text-sm text-slate-500 truncate" style={{ fontSize: '14px', color: '#64748b', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                {renderScuola(podio.bronzo)}
              </span></div>
          </div>
        ))}
      </div>
    </div>
  );
}

function Medagliere({medagliati, profiliScuole}) {
  const [filtroProvincia, setFiltroProvincia] = useState("");  
  const elenco_province = useMemo(() => {
    const province = new Set();
    for(const r of medagliati) {
      province.add(profiliScuole[r.id_scuola]?.provincia);
    }
    return Array.from(province).sort();
  }, [profiliScuole, medagliati]);
  const medagliati_filtrati = useMemo(() => medagliati.filter(r => (filtroProvincia === "" || profiliScuole[r.id_scuola]?.provincia === filtroProvincia)), [medagliati, profiliScuole, filtroProvincia]);
  const medaglie_per_scuola = useMemo(() => {
    const mappa = {};
    for(const m of medagliati_filtrati) {
      if(!mappa[m.id_scuola]) {
        mappa[m.id_scuola] = { id_scuola: m.id_scuola, oro: 0, argento: 0, bronzo: 0};
      }
      if (m.posizione === 1) mappa[m.id_scuola].oro += 1;
      else if (m.posizione === 2) mappa[m.id_scuola].argento += 1;
      else if (m.posizione === 3) mappa[m.id_scuola].bronzo += 1;
    }
    return Object
      .values(mappa)
      .filter(m => m.oro + m.argento + m.bronzo > 0)
      .sort((a, b) => {
        if (a.oro !== b.oro) return b.oro - a.oro;
        if (a.argento !== b.argento) return b.argento - a.argento;
        if (a.bronzo !== b.bronzo) return b.bronzo - a.bronzo;
        return a.id_scuola.localeCompare(b.id_scuola);
      });
  }, [medagliati_filtrati]);

  return <div className="bg-white rounded-xl shadow-sm border border-slate-100 overflow-hidden" style={{ display: 'inline-block', backgroundColor: 'white', borderRadius: '12px', border: '1px solid #f1f5f9', overflow: 'hidden', marginTop: '32px', textAlign: 'left' }}>
    <div className="bg-slate-50 p-4 border-b border-slate-200 flex flex-col sm:flex-row justify-between items-center gap-4" style={{ backgroundColor: '#f8fafc', padding: '16px', borderBottom: '1px solid #e2e8f0', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap' }}>
      <h2 className="text-xl font-bold text-slate-800 flex items-center gap-2" style={{ fontSize: '20px', fontWeight: 'bold', color: '#1e293b', margin: 0, display: 'flex', alignItems: 'center', gap: '8px' }}><ListOrdered className="text-blue-500" color="#3b82f6" /> 
        Medagliere Cumulativo
      </h2>
      <div className="flex items-center gap-2" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
        <label className="text-sm font-semibold text-slate-500" style={{ fontSize: '14px', fontWeight: 600, color: '#64748b' }}>Provincia:</label>
        <select value={filtroProvincia} onChange={e => setFiltroProvincia(e.target.value)} className="p-1.5 rounded-md border border-slate-300 text-sm bg-white" style={{ padding: '6px', borderRadius: '6px', border: '1px solid #cbd5e1', fontSize: '14px', backgroundColor: 'white' }}>
          <option key="" value="">Tutte</option>
          {elenco_province.map(p => <option key={p} value={p}>{p}</option>)}
        </select>
      </div>
    </div>
    
    <div className="overflow-x-auto" style={{ overflowX: 'auto' }}>
      <table className="text-left border-collapse text-sm" style={{ width: 'auto', textAlign: 'left', borderCollapse: 'collapse', fontSize: '14px' }}>
        <thead>
          <tr className="bg-white text-slate-500 uppercase tracking-wider border-b-2 border-slate-200" style={{ color: '#64748b', textTransform: 'uppercase', borderBottom: '2px solid #e2e8f0' }}>
            <th className="p-3 font-semibold text-center w-12" style={{ padding: '12px', fontWeight: 600, textAlign: 'center', width: '48px' }}>#</th>
            <th className="p-3 font-semibold" style={{ padding: '12px', fontWeight: 600, maxWidth: '300px', textAlign: 'left' }}>Scuola</th>
            <th className="p-3 font-semibold text-center" style={{ padding: '12px', fontWeight: 600, textAlign: 'center' }}>Prov</th>
            <th className="p-3 font-semibold text-center bg-amber-50 text-amber-700" style={{ padding: '12px', fontWeight: 600, textAlign: 'center', backgroundColor: '#fffbeb', color: '#b45309' }}>
              🥇 Oro
            </th>
            <th className="p-3 font-semibold text-center bg-slate-50 text-slate-700" style={{ padding: '12px', fontWeight: 600, textAlign: 'center', backgroundColor: '#f8fafc', color: '#334155' }}>
              🥈 Arg
            </th>
            <th className="p-3 font-semibold text-center bg-orange-50 text-orange-800" style={{ padding: '12px', fontWeight: 600, textAlign: 'center', backgroundColor: '#fff7ed', color: '#9a3412' }}>
              🥉 Bro
            </th>
            <th className="p-3 font-semibold text-center text-blue-700 border-l border-slate-100" style={{ padding: '12px', fontWeight: 600, textAlign: 'center', color: '#1d4ed8', borderLeft: '1px solid #f1f5f9' }}>
              Totale
            </th>
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-100" style={{ borderTop: '1px solid #f1f5f9' }}>
          {medaglie_per_scuola.map((row, idx) => 
              <tr key={row.id_scuola} className="hover:bg-slate-50 transition-colors" style={{ borderBottom: '1px solid #f1f5f9' }}>
                <td className="p-3 text-center font-bold text-slate-400" style={{ padding: '12px', textAlign: 'center', fontWeight: 'bold', color: '#94a3b8' }}>
                  {idx + 1}
                </td>
                <td className="p-3 font-medium text-slate-700" style={{ padding: '12px', fontWeight: 500, color: '#334155', maxWidth: '300px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                  {renderScuolaLink(profiliScuole, row.id_scuola)}
                </td>
                <td className="p-3 text-center text-slate-500" style={{ padding: '12px', textAlign: 'center', color: '#64748b' }}>
                  {profiliScuole[row.id_scuola]?.provincia}
                </td>
                <td className="p-3 text-center font-bold text-amber-600 bg-amber-50/30" style={{ padding: '12px', textAlign: 'center', fontWeight: 'bold', color: '#d97706', backgroundColor: 'rgba(255, 251, 235, 0.5)' }}>
                  {row.oro || '-'}
                </td>
                <td className="p-3 text-center font-bold text-slate-500 bg-slate-50/50" style={{ padding: '12px', textAlign: 'center', fontWeight: 'bold', color: '#64748b', backgroundColor: 'rgba(248, 250, 252, 0.8)' }}>
                  {row.argento || '-'}
                </td>
                <td className="p-3 text-center font-bold text-orange-700 bg-orange-50/30" style={{ padding: '12px', textAlign: 'center', fontWeight: 'bold', color: '#c2410c', backgroundColor: 'rgba(255, 247, 237, 0.5)' }}>
                  {row.bronzo || '-'}
                </td>
                <td className="p-3 text-center font-black text-blue-600 border-l border-slate-100" style={{ padding: '12px', textAlign: 'center', fontWeight: 900, color: '#2563eb', borderLeft: '1px solid #f1f5f9' }}>
                  {( (row.oro || 0) + (row.argento || 0) + (row.bronzo || 0) ) || '-'}
                </td>
              </tr>
          )}
        </tbody>
      </table>
    </div>
  </div>
}