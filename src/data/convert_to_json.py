import pandas as pd
import json

def prepara_dati_gas_completo():
    print("Elaborazione dati in corso...")
    df = pd.read_csv('dati_classifiche_GaS.csv', sep=';')
    df = df.fillna("N/D")
    
    def categorizza_gara(gara):
        if gara == 'Finale': return 'Finale Mista'
        if gara == 'FinaleF': return 'Finale Femminile'
        if gara.startswith('Semi'): return 'Semifinale'
        return 'Altro'

    df['categoria'] = df['Gara'].apply(categorizza_gara)
    df['id_scuola'] = df['Nome Scuola'] + " (" + df['Comune'] + ")"

    # 1. PROFILI SCUOLE
    storia_scuole = {}
    for id_scuola, group in df.groupby('id_scuola'):
        records = []
        for _, row in group.iterrows():
            records.append({
                "anno": int(row['Anno']), "categoria": row['categoria'],
                "gara_dettaglio": row['Gara'], "posizione": int(row['posizione']), "punti": int(row['Punti'])
            })
        storia_scuole[id_scuola] = {
            "id": id_scuola, "nome": group['Nome Scuola'].iloc[0], "comune": group['Comune'].iloc[0],
            "provincia": group['Provincia'].iloc[0], "storia": records
        }

    # 2. ELENCO SCUOLE
    elenco_scuole = df[['id_scuola', 'Nome Scuola']].drop_duplicates().sort_values('id_scuola')

    # 3. CLASSIFICHE ANNUALI
    classifiche = {}
    for anno in df['Anno'].unique():
        classifiche[str(anno)] = {}
        df_anno = df[df['Anno'] == anno]
        for cat in ['Finale Mista', 'Finale Femminile', 'Semifinale']:
            df_cat = df_anno[df_anno['categoria'] == cat].sort_values(['Gara', 'posizione'])
            if not df_cat.empty:
                classifiche[str(anno)][cat] = df_cat[['posizione', 'id_scuola', 'Punti', 'Gara']].to_dict(orient='records')

    # 4. ALBO D'ORO E MEDAGLIERE
    albo_mista = []
    albo_femminile = []
    medagliere = {}

    for (anno, categoria), group in df.groupby(['Anno', 'categoria']):
        if categoria in ['Finale Mista', 'Finale Femminile']:
            podi = group[group['posizione'] <= 3].sort_values('posizione')
            record = {'anno': int(anno)}
            for _, row in podi.iterrows():
                if row['posizione'] == 1: record['oro'] = row['id_scuola']
                elif row['posizione'] == 2: record['argento'] = row['id_scuola']
                elif row['posizione'] == 3: record['bronzo'] = row['id_scuola']
            
            for m in ['oro', 'argento', 'bronzo']:
                if m not in record: record[m] = "-"
                    
            if categoria == 'Finale Mista': albo_mista.append(record)
            else: albo_femminile.append(record)

    for _, row in df[df['categoria'].isin(['Finale Mista', 'Finale Femminile'])].iterrows():
        pos = int(row['posizione'])
        id_scuola = row['id_scuola']
        if id_scuola not in medagliere:
            medagliere[id_scuola] = {
                'id_scuola': id_scuola, 'nome': row['Nome Scuola'],   'comune': row['Comune'],  'provincia': row['Provincia'],
                'oro': 0, 'argento': 0, 'bronzo': 0, 'oro_f': 0, 'argento_f': 0, 'bronzo_f': 0
            }
        if pos <= 3:
            if row['categoria'] == 'Finale Mista':
                if pos == 1: medagliere[id_scuola]['oro'] += 1
                elif pos == 2: medagliere[id_scuola]['argento'] += 1
                elif pos == 3: medagliere[id_scuola]['bronzo'] += 1
            else:
                if pos == 1: medagliere[id_scuola]['oro_f'] += 1
                elif pos == 2: medagliere[id_scuola]['argento_f'] += 1
                elif pos == 3: medagliere[id_scuola]['bronzo_f'] += 1

    # Ordinamento decrescente per anno
    albo_mista = sorted(albo_mista, key=lambda x: x['anno'], reverse=True)
    albo_femminile = sorted(albo_femminile, key=lambda x: x['anno'], reverse=True)
    dati_albo = { "mista": albo_mista, "femminile": albo_femminile, "medagliere": list(medagliere.values()) }

    # Salvataggio File
    with open('profili_scuole.json', 'w', encoding='utf-8') as f: json.dump(storia_scuole, f, ensure_ascii=False, indent=2)
    elenco_scuole.to_json('elenco_scuole.json', orient='records', indent=2)
    with open('classifiche_annuali.json', 'w', encoding='utf-8') as f: json.dump(classifiche, f, ensure_ascii=False, indent=2)
    with open('albo_medagliere.json', 'w', encoding='utf-8') as f: json.dump(dati_albo, f, ensure_ascii=False, indent=2)
    print("Completato! Sposta i 4 file JSON in src/data/")

if __name__ == "__main__":
    prepara_dati_gas_completo()