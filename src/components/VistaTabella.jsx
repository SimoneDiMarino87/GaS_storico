import { useState, useMemo } from 'react';

export default function VistaTabella({ data }) {
    const { profiliScuole, risultati, elenco_province, elenco_anni } = data;
    const [ garaSel, setGaraSel] = useState("Finale");
    const [ provinciaSel, setProvinciaSel ] = useState("");

    const garaSelezionata = garaSel === "Finale,Semifinale"
        ? (r => r.gara === "Finale" || r.categoria === "Semifinale")
        : garaSel 
            ? (r => r.gara === garaSel) 
            : () => true;

    const risultatiFiltrati = useMemo(() => risultati.filter(r => garaSelezionata(r) && (provinciaSel==="" || profiliScuole[r.id_scuola]?.provincia === provinciaSel)), [risultati, garaSel, provinciaSel]);
    const risultatiScuole = useMemo(() => {
        const mappa = {};
        risultatiFiltrati.forEach(r => {
            if (!mappa[r.id_scuola]) {
                mappa[r.id_scuola] = { id_scuola: r.id_scuola, mappa_anni: {}};
            }
            if (!mappa[r.id_scuola].mappa_anni[r.anno]) {
                mappa[r.id_scuola].mappa_anni[r.anno] = [];
            }
            mappa[r.id_scuola].mappa_anni[r.anno].push(r);
        });
        return Object.entries(mappa).sort().map(([id_scuola, value]) => value);
    }, [risultatiFiltrati]);

    return (
        <div className="bg-white rounded-xl shadow-sm border border-slate-100 overflow-hidden animate-in fade-in duration-500" style={{ backgroundColor: 'white', borderRadius: '12px', border: '1px solid #f1f5f9', overflow: 'hidden' }}>
        <div className="flex flex-col sm:flex-row gap-4 justify-between items-center bg-white p-4 rounded-xl shadow-sm border border-slate-100" style={{ display: 'flex', justifyContent: 'space-between', backgroundColor: 'white', padding: '16px', borderRadius: '12px', border: '1px solid #f1f5f9' }}>
            <div className="flex gap-4 w-full sm:w-auto" style={{ display: 'flex', gap: '16px' }}>
            <div className="flex flex-col w-1/2 sm:w-auto" style={{ display: 'flex', flexDirection: 'column' }}>
                <label className="text-xs font-semibold text-slate-500 uppercase mb-1" style={{ fontSize: '12px', fontWeight: 600, color: '#64748b', textTransform: 'uppercase', marginBottom: '4px' }}>
                    Categoria
                </label>
                <select value={garaSel} onChange={e => setGaraSel(e.target.value)} className="p-2 rounded-lg border border-slate-300 bg-slate-50" style={{ padding: '8px', borderRadius: '8px', border: '1px solid #cbd5e1', backgroundColor: '#f8fafc' }}>
                <option value="Finale">Finale Mista</option>
                <option value="FinaleF">Finale Femminile</option>
                <option value="Semifinale">Semifinale</option>
                <option value="Finale,Semifinale">Finale e Semifinale</option>
                </select>
            </div>
            <div className="flex flex-col w-1/2 sm:w-auto" style={{ display: 'flex', flexDirection: 'column' }}>
                <label className="text-xs font-semibold text-slate-500 uppercase mb-1" style={{ fontSize: '12px', fontWeight: 600, color: '#64748b', textTransform: 'uppercase', marginBottom: '4px' }}>
                    Provincia
                </label>
                <select value={provinciaSel} onChange={e => setProvinciaSel(e.target.value)} className="p-2 rounded-lg border border-slate-300 bg-slate-50" style={{ padding: '8px', borderRadius: '8px', border: '1px solid #cbd5e1', backgroundColor: '#f8fafc' }}>
                <option value="">Tutte</option>
                {elenco_province.map(prov => <option key={prov} value={prov}>{prov}</option>)}
                </select>
            </div>
            </div>
        </div>

        <div className="overflow-x-auto" style={{ overflowX: 'auto' }}>
            <table className="w-full text-left border-collapse" style={{ width: '100%', textAlign: 'left', borderCollapse: 'collapse' }}>
            <thead>
                <tr className="bg-slate-50 text-slate-500 text-sm uppercase tracking-wide border-b border-slate-200" style={{ backgroundColor: '#f8fafc', color: '#64748b', fontSize: '14px', textTransform: 'uppercase', borderBottom: '1px solid #e2e8f0' }}>
                <th className="p-4 font-semibold" style={{ padding: '16px', fontWeight: 600 }}>
                    Scuola
                </th>
                { elenco_anni.map(anno => (
                    <th key={anno} className="p-4 font-semibold text-center" style={{ padding: '16px', fontWeight: 600, textAlign: 'center' }}>
                    {anno}
                    </th>
                )) }
                </tr>
            </thead>
            <tbody className="divide-y divide-slate-100" style={{ borderTop: '1px solid #f1f5f9' }}>
                {risultatiScuole.map(row => (
                <tr 
                    key={row.id_scuola}
                    className="hover:bg-slate-50 cursor-pointer transition-colors"
                >
                    <td className="p-4" style={{ padding: '16px' }}>
                    {profiliScuole[row.id_scuola]?.nome || row.id_scuola}
                    &nbsp;({profiliScuole[row.id_scuola]?.comune || '???'})
                    </td>
                    {elenco_anni.map(anno => <td>
                        {(row.mappa_anni[anno] || []).map(r => (
                            <div key={r.gara} className="text-xs text-center" style={{ fontSize: '12px', textAlign: 'center', color: (r.categoria === 'Semifinale' ? '#3b82f6' : '#ee0505') }}>
                                {r.posizione}°
                            </div>
                        ))}
                    </td>)}
                </tr>
                ))}
            </tbody>
            </table>
        </div>
        </div>
    )
}