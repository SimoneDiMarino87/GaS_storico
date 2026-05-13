import React, { useState, useMemo } from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { Trophy, Medal, MapPin } from 'lucide-react';

// Simula l'importazione del JSON generato da Python
// import profiliScuole from './data/profili_scuole.json'; 
// import elencoScuole from './data/elenco_scuole.json';

// Dati mock basati sul tuo dataset per far funzionare l'esempio


const profiliScuole = fetch('/data/profili_scuole.json');


const elencoScuole = fetch('/data/elenco_scuole.json');

export default function DashboardScuole() {
  const [scuolaSelezionata, setScuolaSelezionata] = useState("Leonardo (Brescia)");

  const profilo = profiliScuole[scuolaSelezionata];

  // Custom Tooltip per il grafico
  const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
      return (
        <div style={{ background: '#fff', padding: '10px', border: '1px solid #ccc', borderRadius: '5px' }}>
          <p style={{ margin: 0, fontWeight: 'bold' }}>Anno: {label}</p>
          <p style={{ margin: 0 }}>Posizione: {payload[0].value}°</p>
          <p style={{ margin: 0, color: '#666' }}>Punti: {payload[0].payload.punti}</p>
        </div>
      );
    }
    return null;
  };

  return (
    <div style={{ fontFamily: 'sans-serif', maxWidth: '1000px', margin: '0 auto', padding: '20px' }}>
      <h1 style={{ textAlign: 'center' }}>Storico Gare a Squadre Nazionali</h1>
      
      {/* Selettore Scuola */}
      <div style={{ marginBottom: '30px', textAlign: 'center' }}>
        <label style={{ marginRight: '10px', fontWeight: 'bold' }}>Seleziona una scuola:</label>
        <select 
          value={scuolaSelezionata} 
          onChange={(e) => setScuolaSelezionata(e.target.value)}
          style={{ padding: '8px', fontSize: '16px', borderRadius: '4px' }}
        >
          {elencoScuole.map(s => (
            <option key={s.id_scuola} value={s.id_scuola}>{s.id_scuola}</option>
          ))}
        </select>
      </div>

      {/* Sezione Statistiche Rapide */}
      {profilo && (
        <>
          <div style={{ display: 'flex', justifyContent: 'space-around', background: '#f8f9fa', padding: '20px', borderRadius: '8px', marginBottom: '30px' }}>
            <div style={{ textAlign: 'center' }}>
              <Trophy size={32} color="#f59e0b" />
              <h3>{profilo.nome}</h3>
              <p><MapPin size={16} /> {profilo.comune} ({profilo.provincia})</p>
            </div>
            <div style={{ textAlign: 'center' }}>
              <h2 style={{ fontSize: '36px', margin: '10px 0' }}>{profilo.partecipazioni}</h2>
              <p>Finali Disputate</p>
            </div>
            <div style={{ textAlign: 'center' }}>
              <h2 style={{ fontSize: '36px', margin: '10px 0' }}><Medal size={32} color="#3b82f6" /> {profilo.miglior_piazzamento}°</h2>
              <p>Miglior Piazzamento</p>
            </div>
          </div>

          {/* Grafico Andamento */}
          <div style={{ height: '400px', marginBottom: '40px' }}>
            <h3 style={{ marginBottom: '20px' }}>Andamento Storico (Posizione)</h3>
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={profilo.storia} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" opacity={0.5} />
                <XAxis dataKey="anno" />
                {/* L'asse Y è rovesciato: la posizione 1 (migliore) sta in alto */}
                <YAxis reversed={true} domain={[1, 'dataMax']} />
                <Tooltip content={<CustomTooltip />} />
                <Line 
                  type="monotone" 
                  dataKey="posizione" 
                  stroke="#2563eb" 
                  strokeWidth={3}
                  activeDot={{ r: 8 }} 
                />
              </LineChart>
            </ResponsiveContainer>
          </div>

          {/* Tabella Dati */}
          <div>
            <h3>Dettaglio Punteggi</h3>
            <table style={{ width: '100%', borderCollapse: 'collapse', marginTop: '10px' }}>
              <thead>
                <tr style={{ background: '#e2e8f0', textAlign: 'left' }}>
                  <th style={{ padding: '12px', borderBottom: '2px solid #cbd5e1' }}>Anno</th>
                  <th style={{ padding: '12px', borderBottom: '2px solid #cbd5e1' }}>Posizione</th>
                  <th style={{ padding: '12px', borderBottom: '2px solid #cbd5e1' }}>Punti</th>
                </tr>
              </thead>
              <tbody>
                {profilo.storia.map((record) => (
                  <tr key={record.anno} style={{ borderBottom: '1px solid #e2e8f0' }}>
                    <td style={{ padding: '12px' }}>{record.anno}</td>
                    <td style={{ padding: '12px', fontWeight: 'bold' }}>{record.posizione}°</td>
                    <td style={{ padding: '12px' }}>{record.punti}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </>
      )}
    </div>
  );
}
