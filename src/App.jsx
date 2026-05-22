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

  useEffect(() => {
    // read tab from url path on first load (respecting any base path)
    try {
      const pathParts = window.location.pathname.split('/').filter(Boolean);
      const last = pathParts[pathParts.length - 1];
      const allowed = ['scuola', 'classifiche', 'albo', 'tabella'];
      if (allowed.includes(last)) setActiveTab(last);
      else if (pathParts.includes('scuola')) setActiveTab('scuola');
    } catch (e) {
      // ignore
    }

    get_data().then(d => {
      setData(d);
    });
  }, []);

  

  // central setter that also updates the URL (no reload)
  const setTab = (tab) => {
    setActiveTab(tab);
    try {
      const allowed = ['scuola', 'classifiche', 'albo', 'tabella'];
      if (!tab || !allowed.includes(tab)) return;
      const pathParts = window.location.pathname.split('/').filter(Boolean);
      // remove trailing tab segment if present
      const last = pathParts[pathParts.length - 1];
      if (allowed.includes(last)) pathParts.pop();
      // also remove any existing `/scuola/<id>` segment to avoid preserving school id when switching tabs
      const scuolaIndex = pathParts.findIndex(p => p === 'scuola');
      if (scuolaIndex !== -1) {
        pathParts.splice(scuolaIndex, 2);
      }
      const basePath = '/' + pathParts.join('/');
      const newPath = (basePath === '/' ? '' : basePath) + '/' + tab;
      window.history.replaceState({}, '', newPath + window.location.search + window.location.hash);
    } catch (e) {
      // ignore in environments without history
    }
  };

  return (
    <>
      <Header activeTab={activeTab} setActiveTab={setTab} />
      <main className="w-full px-4 py-8 min-h-screen" style={{ width: '100%', padding: '32px 16px', paddingBottom: '80px' }}>
        { !data && <div>Caricamento dati...</div> }
        { data && activeTab === 'scuola' && <VistaStoricoScuola data={data} />}
        { data && activeTab === 'classifiche' && <VistaClassifiche data={data} />}
        { data && activeTab === 'albo' && <VistaAlboOro data={data} />}
        { data && activeTab === 'tabella' && <VistaTabella data={data} />} 
      </main>
    </>
  );
}

function Header({activeTab, setActiveTab}) {
  return (
    <header className="bg-white border-b border-slate-200 shadow-sm sticky top-0 z-10" style={{ backgroundColor: 'white', borderBottom: '1px solid #e2e8f0', position: 'sticky', top: 0, zIndex: 10 }}>
      <div className="w-full px-4" style={{ width: '100%', margin: '0', padding: '0 16px' }}>
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

