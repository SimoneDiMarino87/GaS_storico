import { useState, useMemo } from 'react';

export const ROW_HEIGHT = 30;

export default function VistaTabella({ data }) {
    const { profiliScuole, risultati, elenco_province, elenco_anni } = data;
    const [ garaSel, setGaraSel] = useState("Finale");
    const [ provinciaSel, setProvinciaSel ] = useState("");

    const filtroGara = {   
        "Finale,Semifinale": (r => r.gara === "Finale" || r.categoria === "Semifinale"),
        "Finale": (r => r.gara === "Finale"),
        "FinaleF": (r => r.gara === "FinaleF"),
        "Semifinale": (r => r.categoria === "Semifinale") 
    }[garaSel] || (() => true);

    const elenca_gare = garaSel === "Finale,Semifinale" 
        ? (lista) => [lista.filter(r => r.gara === "Finale")[0], lista.filter(r => r.categoria === "Semifinale")[0]] 
        : (lista) => [lista[0]];

    const display_results = garaSel === "Finale,Semifinale"
        ? (lista, anno) => {
            const finale = lista.filter(r => r.gara === "Finale")[0];
            const semifinale = lista.filter(r => r.categoria === "Semifinale")[0];
            if (!finale && !semifinale) return (
                <td key={anno} className="p-2 text-center" style={{ padding: '0 8px', textAlign: 'center', border: '1px solid #e6e9ef', height: ROW_HEIGHT + 'px', minHeight: ROW_HEIGHT + 'px', maxHeight: ROW_HEIGHT + 'px', overflow: 'hidden' }} />
            );
            const halfLine = Math.floor(ROW_HEIGHT / 2);
            const containerStyle = { height: ROW_HEIGHT + 'px', minHeight: ROW_HEIGHT + 'px', maxHeight: ROW_HEIGHT + 'px', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', overflow: 'hidden' };
            const partStyle = { fontSize: '12px', textAlign: 'center', lineHeight: halfLine + 'px', height: halfLine + 'px', minHeight: halfLine + 'px', maxHeight: halfLine + 'px', width: '100%', overflow: 'hidden', whiteSpace: 'nowrap', padding: '0', margin: '0', display: 'flex', alignItems: 'center', justifyContent: 'center' };
            return (
                <td key={anno} className="p-2 text-center" style={{ padding: '0 8px', textAlign: 'center', border: '1px solid #e6e9ef', height: ROW_HEIGHT + 'px', minHeight: ROW_HEIGHT + 'px', maxHeight: ROW_HEIGHT + 'px', overflow: 'hidden' }}>
                    <div style={containerStyle}>
                        <div className="text-xs text-center" style={{ ...partStyle, color: '#3b82f6' }}>
                            {semifinale && `${semifinale.posizione}°`}
                        </div>
                        <div className="text-xs text-center" style={{ ...partStyle, color: '#ee0505' }}>
                            {finale && `${finale.posizione}°`}
                        </div>
                    </div>
                </td>
            )
        }
        : (lista, anno) => { 
            const r = lista[0];
            if (!r) return (
                <td key={anno} className="p-2 text-center" style={{ padding: '0 8px', textAlign: 'center', border: '1px solid #e6e9ef', height: ROW_HEIGHT + 'px', minHeight: ROW_HEIGHT + 'px', maxHeight: ROW_HEIGHT + 'px', overflow: 'hidden' }} />
            );
            const singleStyle = { fontSize: '12px', textAlign: 'center', height: ROW_HEIGHT + 'px', minHeight: ROW_HEIGHT + 'px', maxHeight: ROW_HEIGHT + 'px', lineHeight: ROW_HEIGHT + 'px', display: 'flex', alignItems: 'center', justifyContent: 'center', overflow: 'hidden', color: (r.categoria === 'Semifinale' ? '#3b82f6' : '#ee0505'), padding: '0', margin: '0' };
            return (
                <td key={anno} className="p-2 text-center" style={{ padding: '0 8px', textAlign: 'center', border: '1px solid #e6e9ef', height: ROW_HEIGHT + 'px', minHeight: ROW_HEIGHT + 'px', maxHeight: ROW_HEIGHT + 'px', overflow: 'hidden' }}>
                    <div key={r.gara} className="text-xs text-center" style={singleStyle}>
                        {r.posizione}°
                    </div>
                </td>
            )};


    const risultatiFiltrati = useMemo(() => risultati.filter(r => filtroGara(r) && (provinciaSel==="" || profiliScuole[r.id_scuola]?.provincia === provinciaSel)), [risultati, garaSel, provinciaSel]);
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

    const elenco_anni_non_vuoti = useMemo(() => {
        const set_anni = new Set();
        risultatiFiltrati.forEach(r => set_anni.add(r.anno));
        return elenco_anni.filter(anno => set_anni.has(anno));
    }, [risultatiFiltrati, elenco_anni]);

    return (
        <div className="bg-white rounded-xl shadow-sm border border-slate-100 overflow-hidden animate-in fade-in duration-500" style={{ backgroundColor: 'white', borderRadius: '12px', border: '1px solid #f1f5f9', overflow: 'hidden' }}>
        <div className="flex flex-col sm:flex-row gap-4 justify-between items-center bg-white p-2 rounded-xl shadow-sm border border-slate-100" style={{ display: 'flex', justifyContent: 'space-between', backgroundColor: 'white', padding: '8px', borderRadius: '12px', border: '1px solid #f1f5f9' }}>
            <div className="flex gap-4 w-full sm:w-auto" style={{ display: 'flex', gap: '16px' }}>
            <div className="flex flex-col w-1/2 sm:w-auto" style={{ display: 'flex', flexDirection: 'column' }}>
                <label className="text-xs font-semibold text-slate-500 uppercase mb-1" style={{ fontSize: '12px', fontWeight: 600, color: '#64748b', textTransform: 'uppercase', marginBottom: '4px' }}>
                    Categoria
                </label>
                <select value={garaSel} onChange={e => setGaraSel(e.target.value)} className="p-2 rounded-lg border border-slate-300 bg-slate-50" style={{ padding: '6px', borderRadius: '8px', border: '1px solid #cbd5e1', backgroundColor: '#f8fafc' }}>
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
                <select value={provinciaSel} onChange={e => setProvinciaSel(e.target.value)} className="p-2 rounded-lg border border-slate-300 bg-slate-50" style={{ padding: '6px', borderRadius: '8px', border: '1px solid #cbd5e1', backgroundColor: '#f8fafc' }}>
                <option value="">Tutte</option>
                {elenco_province.map(prov => <option key={prov} value={prov}>{prov}</option>)}
                </select>
            </div>
            </div>
        </div>

        <div className="overflow-x-auto" style={{ overflowX: 'auto' }}>
            <table className="w-full text-left border-collapse" style={{ width: '100%', textAlign: 'left', borderCollapse: 'collapse' }}>
            <thead>
                <tr className="bg-slate-50 text-slate-500 text-sm uppercase tracking-wide" style={{ backgroundColor: '#f8fafc', color: '#64748b', fontSize: '14px', textTransform: 'uppercase' }}>
                <th className="p-2 font-semibold" style={{ padding: '8px', fontWeight: 600, border: '1px solid #e6e9ef', backgroundColor: '#f3f4f6' }}>
                    Scuola
                </th>
                { elenco_anni_non_vuoti.map(anno => (
                    <th key={anno} className="p-2 font-semibold text-center" style={{ padding: '8px', fontWeight: 600, textAlign: 'center', border: '1px solid #e6e9ef' }}>
                    {anno}
                    </th>
                )) }
                </tr>
            </thead>
            <tbody className="divide-y divide-slate-100" style={{ borderTop: '1px solid #f1f5f9' }}>
                {risultatiScuole.map((row,idx) => (
                <tr 
                    key={row.id_scuola}
                    className="hover:bg-slate-50 cursor-pointer transition-colors"
                    style={{ height: '30px', minHeight: '30px', maxHeight: '30px', overflow: 'hidden' }}
                >
                        <td className="p-2" style={{ padding: '0 8px', border: '1px solid #e6e9ef', backgroundColor: '#f8fafc', height: '30px', minHeight: '30px', maxHeight: '30px', overflow: 'hidden' }}>
                        {(() => {
                                const id = row.id_scuola;
                                const pathParts = window.location.pathname.split('/').filter(Boolean);
                                const allowed = ['scuola', 'classifiche', 'albo', 'tabella'];
                                const last = pathParts[pathParts.length - 1];
                                if (allowed.includes(last)) pathParts.pop();
                                const basePath = '/' + pathParts.join('/');
                                const href = `./scuola/${encodeURIComponent(id)}`;
                                return (
                                    <a
                                        href={href}
                                        className="text-slate-800 hover:underline"
                                        style={{ color: '#1e293b', textDecoration: 'none', display: 'block', overflow: 'hidden' }}
                                    >
                                        <span style={{ display: 'inline-block', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', maxWidth: '100%' }}>
                                            {`${profiliScuole[id]?.nome || id} (${profiliScuole[id]?.comune || '???'})`}
                                        </span>
                                    </a>
                                );
                        })()}
                        </td>
                        {elenco_anni_non_vuoti.map(anno => (
                            display_results(row.mappa_anni[anno] || [], anno)
                        ))}
                </tr>
                ))}
            </tbody>
            </table>
        </div>
        </div>
    )
}