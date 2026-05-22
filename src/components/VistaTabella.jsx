import { useState, useMemo } from 'react';

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
        ? (lista) => {
            const finale = lista.filter(r => r.gara === "Finale")[0];
            const semifinale = lista.filter(r => r.categoria === "Semifinale")[0];
            if (!finale && !semifinale) return null;
            const cellStyle = { fontSize: '12px', textAlign: 'center', minHeight: '20px', display: 'flex', alignItems: 'center', justifyContent: 'center' };
            return <>
                <div className="text-xs text-center" style={{ ...cellStyle, color: '#3b82f6' }}>
                    {semifinale && `${semifinale.posizione}°`}
                </div>
                <div className="text-xs text-center" style={{ ...cellStyle, color: '#ee0505' }}>
                    {finale && `${finale.posizione}°`}
                </div>
            </>
        }
        : (lista) => { 
            const r = lista[0];
            if (!r) return null;
            const singleStyle = { fontSize: '12px', textAlign: 'center', minHeight: '20px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: (r.categoria === 'Semifinale' ? '#3b82f6' : '#ee0505') };
            return (
            <div key={r.gara} className="text-xs text-center" style={singleStyle}>
                {r.posizione}°
            </div>
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
                <tr className="bg-slate-50 text-slate-500 text-sm uppercase tracking-wide" style={{ backgroundColor: '#f8fafc', color: '#64748b', fontSize: '14px', textTransform: 'uppercase' }}>
                <th className="p-4 font-semibold" style={{ padding: '16px', fontWeight: 600, border: '1px solid #e6e9ef', backgroundColor: '#f3f4f6' }}>
                    Scuola
                </th>
                { elenco_anni.map(anno => (
                    <th key={anno} className="p-4 font-semibold text-center" style={{ padding: '16px', fontWeight: 600, textAlign: 'center', border: '1px solid #e6e9ef' }}>
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
                >
                                        <td className="p-4" style={{ padding: '16px', border: '1px solid #e6e9ef', backgroundColor: '#f8fafc' }}>
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
                                                        style={{ color: '#1e293b', textDecoration: 'none' }}
                                                    >
                                                        {profiliScuole[id]?.nome || id}
                                                        &nbsp;({profiliScuole[id]?.comune || '???'})
                                                    </a>
                                                );
                                        })()}
                                        </td>
                    {elenco_anni.map(anno => <td key={anno} className="p-4 text-center" style={{ padding: '16px', textAlign: 'center', border: '1px solid #e6e9ef' }}>
                        {display_results(row.mappa_anni[anno] || [])}
                    </td>)}
                </tr>
                ))}
            </tbody>
            </table>
        </div>
        </div>
    )
}