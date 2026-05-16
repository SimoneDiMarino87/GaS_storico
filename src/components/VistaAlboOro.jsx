import { useState, useMemo } from 'react';
import { Award, ListOrdered } from 'lucide-react';

// ============================================================================
// COMPONENTE: ALBO D'ORO E MEDAGLIERE
// ============================================================================
export default function VistaAlboOro({ data }) {
  const { alboDati } = data;
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

