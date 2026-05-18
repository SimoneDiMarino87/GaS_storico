import React, { useState, useMemo, useEffect } from 'react';
import { BarChart, Search, ListOrdered, Award, Table } from 'lucide-react';
import VistaStoricoScuola from './components/VistaStoricoScuola';
import VistaClassifiche from './components/VistaClassifiche';
import VistaAlboOro from './components/VistaAlboOro';
import VistaTabella from './components/VistaTabella';
import get_data from './lib/data';

// ============================================================================
// COMPONENTE PRINCIPALE: CONTENITORE E NAVIGAZIONE
// ============================================================================
export default function App() {
  const [data, setData] = useState(null);
  const [activeTab, setActiveTab] = useState('scuola'); 
  
  const { profili } = data || {};

  const [scuolaSelezionata, setScuolaSelezionata] = useState("");

  useEffect(() => {
    get_data().then(d => {
      setData(d);
      const entries = Object.entries(d.profiliScuole || {});
      if (entries.length > 0) {
        const id_scuola = entries[0][0];
        setScuolaSelezionata(id_scuola);
      }
    });
  }, []);

  const handleNavigaAScuola = (idScuola) => {
    setScuolaSelezionata(idScuola);
    setActiveTab('scuola');
    window.scrollTo({ top: 0, behavior: 'smooth' }); 
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-800 font-sans pb-20" style={{ minHeight: '100vh', backgroundColor: '#f8fafc', color: '#1e293b', fontFamily: 'sans-serif', paddingBottom: '80px' }}>
      <Header activeTab={activeTab} setActiveTab={setActiveTab} />
      <main className="max-w-5xl mx-auto px-4 py-8" style={{ maxWidth: '1024px', margin: '0 auto', padding: '32px 16px' }}>
        { !data && <div>Caricamento dati...</div> }
        { data && activeTab === 'scuola' && <VistaStoricoScuola data={data} scuolaSelezionata={scuolaSelezionata} setScuolaSelezionata={setScuolaSelezionata} />}
        { data && activeTab === 'classifiche' && <VistaClassifiche data={data} goToSchool={handleNavigaAScuola} />}
        { data && activeTab === 'albo' && <VistaAlboOro data={data} />}
        { data && activeTab === 'tabella' && <VistaTabella data={data} />} 
      </main>
    </div>
  );
}

function Header({activeTab, setActiveTab}) {
  return (
    <header className="bg-white border-b border-slate-200 shadow-sm sticky top-0 z-10" style={{ backgroundColor: 'white', borderBottom: '1px solid #e2e8f0', position: 'sticky', top: 0, zIndex: 10 }}>
      <div className="max-w-5xl mx-auto px-4" style={{ maxWidth: '1024px', margin: '0 auto', padding: '0 16px' }}>
        <div className="flex flex-col sm:flex-row justify-between items-center py-4 gap-4" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '16px 0', flexWrap: 'wrap', gap: '16px' }}>
          <h1 className="text-2xl font-black text-blue-700 flex items-center gap-2" style={{ fontSize: '24px', fontWeight: 900, color: '#1d4ed8', display: 'flex', alignItems: 'center', gap: '8px', margin: 0 }}>
            <BarChart className="text-blue-600" color="#2563eb" />
            Statistiche GaS
          </h1>
          
          <nav className="flex bg-slate-100 p-1 rounded-lg overflow-x-auto" style={{ display: 'flex', backgroundColor: '#f1f5f9', padding: '4px', borderRadius: '8px', overflowX: 'auto' }}>
            <HeaderButton
              active={activeTab === 'scuola'}
              onClick={() => setActiveTab('scuola')}
              icon={Search}
            >
              Storico Squadra
            </HeaderButton>
            <HeaderButton
              active={activeTab === 'classifiche'}
              onClick={() => setActiveTab('classifiche')}
              icon={ListOrdered}
            >
              Classifiche
            </HeaderButton>
            <HeaderButton
              active={activeTab === 'albo'}
              onClick={() => setActiveTab('albo')}
              icon={Award}
            >
              Albo d'Oro
            </HeaderButton>
            <HeaderButton
              active={activeTab === 'tabella'}
              onClick={() => setActiveTab('tabella')}
              icon={Table}
            >
              Tabella
            </HeaderButton>
          </nav>
        </div>
      </div>
    </header>
  );
}

function HeaderButton({ active, onClick, icon: Icon, children }) {
  return (
    <button 
      onClick={onClick}
      className={`flex items-center gap-2 px-4 py-2 rounded-md text-sm font-medium transition-all whitespace-nowrap ${active ? 'bg-white text-blue-700 shadow-sm' : 'text-slate-600 hover:text-slate-900'}`}
      style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '8px 16px', borderRadius: '6px', fontSize: '14px', fontWeight: 500, whiteSpace: 'nowrap', border: 'none', cursor: 'pointer', backgroundColor: active ? 'white' : 'transparent', color: active ? '#1d4ed8' : '#475569', boxShadow: active ? '0 1px 2px 0 rgba(0, 0, 0, 0.05)' : 'none' }}
    >
      <Icon size={16} />
      {children}
    </button>
  );
}

