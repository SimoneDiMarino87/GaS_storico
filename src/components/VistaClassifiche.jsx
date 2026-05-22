import { useState, useMemo } from 'react';
import { ChevronRight } from 'lucide-react';

// ============================================================================
// COMPONENTE: CLASSIFICHE ANNUALI
// ============================================================================
export default function VistaClassifiche({ data }) {
  const {profiliScuole, risultati, elenco_anni } = data;
  const [annoSel, setAnnoSel] = useState("2026");
  const [catSel, setCatSel] = useState("Finale Mista");

  const classifica = useMemo(() => risultati.filter(r => r.anno === annoSel && r.categoria === catSel).sort((a, b) => a.posizione - b.posizione), [risultati, annoSel, catSel]);

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <div className="flex flex-col sm:flex-row gap-4 justify-between items-center bg-white p-4 rounded-xl shadow-sm border border-slate-100" style={{ display: 'flex', justifyContent: 'space-between', backgroundColor: 'white', padding: '16px', borderRadius: '12px', border: '1px solid #f1f5f9' }}>
        <div className="flex gap-4 w-full sm:w-auto" style={{ display: 'flex', gap: '16px' }}>
          <div className="flex flex-col w-1/2 sm:w-auto" style={{ display: 'flex', flexDirection: 'column' }}>
            <label className="text-xs font-semibold text-slate-500 uppercase mb-1" style={{ fontSize: '12px', fontWeight: 600, color: '#64748b', textTransform: 'uppercase', marginBottom: '4px' }}>Anno</label>
            <select value={annoSel} onChange={e => setAnnoSel(e.target.value)} className="p-2 rounded-lg border border-slate-300 bg-slate-50" style={{ padding: '8px', borderRadius: '8px', border: '1px solid #cbd5e1', backgroundColor: '#f8fafc' }}>
              {elenco_anni.map(a => <option key={a} value={a}>{a}</option>)}
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
          <div className="p-10 text-center text-slate-500" style={{ padding: '40px', textAlign: 'center', color: '#64748b' }}>
            Nessuna classifica disponibile per i filtri selezionati.
          </div>
        ) : (
          <div className="overflow-x-auto" style={{ overflowX: 'auto' }}>
            <table className="w-full text-left border-collapse" style={{ width: '100%', textAlign: 'left', borderCollapse: 'collapse' }}>
              <thead>
                <tr className="bg-slate-50 text-slate-500 text-sm uppercase tracking-wide border-b border-slate-200" style={{ backgroundColor: '#f8fafc', color: '#64748b', fontSize: '14px', textTransform: 'uppercase', borderBottom: '1px solid #e2e8f0' }}>
                  <th className="p-2 font-semibold w-20 text-center" style={{ padding: '8px', fontWeight: 600, textAlign: 'center' }}>
                    Pos.
                  </th>
                  <th className="p-2 font-semibold" style={{ padding: '8px', fontWeight: 600 }}>
                    Scuola
                  </th>
                  {catSel === 'Semifinale' && <th className="p-2 font-semibold text-center" style={{ padding: '8px', fontWeight: 600, textAlign: 'center' }}>
                    Girone
                  </th>}
                  <th className="p-2 font-semibold text-right" style={{ padding: '8px', fontWeight: 600, textAlign: 'right' }}>
                    Punti
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100" style={{ borderTop: '1px solid #f1f5f9' }}>
                {classifica.map((row, idx) => (
                  <tr 
                    key={idx} 
                    className="hover:bg-blue-50 transition-colors group"
                    style={{ borderBottom: '1px solid #f1f5f9' }}
                  >
                    <td className="p-2 text-center font-bold text-slate-700" style={{ padding: '8px', textAlign: 'center', fontWeight: 'bold', color: '#334155' }}>
                      {row.posizione === 1 ? '🥇' : row.posizione === 2 ? '🥈' : row.posizione === 3 ? '🥉' : `${row.posizione}°`}
                    </td>
                    <td className="p-2 font-medium text-blue-700 flex items-center justify-between" style={{ padding: '8px', fontWeight: 500, color: '#1d4ed8', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      {(() => {
                        const id = row.id_scuola;
                        const pathParts = window.location.pathname.split('/').filter(Boolean);
                        const allowed = ['scuola', 'classifiche', 'albo', 'tabella'];
                        const last = pathParts[pathParts.length - 1];
                        if (allowed.includes(last)) pathParts.pop();
                        const basePath = '/' + pathParts.join('/');
                        const href = `./scuola/${encodeURIComponent(id)}`;
                        return (
                          <a href={href} className="text-slate-800 hover:underline" style={{ color: '#1d293b', textDecoration: 'none', display: 'flex', justifyContent: 'space-between', alignItems: 'center', width: '100%' }}>
                            <span>{`${profiliScuole[id]?.nome || '???'} (${profiliScuole[id]?.comune || '???'})`}</span>
                            <ChevronRight size={16} className="text-blue-300 opacity-50" color="#93c5fd" />
                          </a>
                        );
                      })()}
                    </td>
                    {catSel === 'Semifinale' && <td className="p-2 text-center text-slate-500" style={{ padding: '8px', textAlign: 'center', color: '#64748b' }}>
                      {{"SemiA":"A","SemiB":"B","SemiC":"C","SemiD":"D"}[row.gara] || row.gara}
                    </td>}
                    <td className="p-2 text-right font-mono font-bold text-slate-600" style={{ padding: '8px', textAlign: 'right', fontFamily: 'monospace', fontWeight: 'bold', color: '#475569' }}>
                      {row.punti}
                    </td>
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

