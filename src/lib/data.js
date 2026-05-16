// ============================================================================
// IMPORT DATI REALI
// ============================================================================
import { parse } from 'papaparse';

import classificheAnnuali from '../data/classifiche_annuali.json';
import alboDati from '../data/albo_medagliere.json';

export default async function data() {
    const data = await get_data();

    const profili_scuole = {}; // id_scuola => {} 

    for (const item of data) {
        const id = `${item["Nome Scuola"]} (${item["Comune"]})`;
        if (!profili_scuole[id]) {
            profili_scuole[id] = {
                id: id,
                nome: item["Nome Scuola"],
                comune: item["Comune"],
                provincia: item["Provincia"],
                storia: [],
            };
        }
        const profilo = profili_scuole[id];
        if (profilo.nome !== item["Nome Scuola"] || profilo.comune !== item["Comune"] || profilo.provincia !== item["Provincia"]) {
            console.warn(`Incoerenza dati per scuola ${id}:`, {
                precedente: { nome: profilo.nome, comune: profilo.comune, provincia: profilo.provincia },
                nuovo: { nome: item["Nome Scuola"], comune: item["Comune"], provincia: item["Provincia"] },
            });
        }
        const gara = item["Gara"];
        let categoria = "???";
        if (gara.startsWith("Semi")) {
            categoria = "Semifinale";
        } else if (gara==="Finale") {
            categoria = "Finale Mista";
        } else if (gara==="FinaleF") {
            categoria = "Finale Femminile";
        }
        profilo.storia.push({
            anno: parseInt(item["Anno"]),
            categoria,
            gara_dettaglio: gara,
            posizione: parseInt(item["posizione"], 10),
            punti: parseInt(item["Punti"], 10),
        });
    }

    const profili_scuole_sort = Object.fromEntries(Object.entries(profili_scuole).sort((a, b) => a[0].localeCompare(b[0])));

    data.reduce((acc, item) => {
        const id_scuola = `${item["Nome Scuola"]} (${item["Comune"]})`;
        acc[item.id_scuola] = {
            nome: item["Nome Scuola"],
            comune: item["Comune"],
            provincia: item["Provincia"],
        };
        return acc;
    }, {});

    return {
        profiliScuole: profili_scuole_sort,
        classificheAnnuali,
        alboDati,
        TUTTI_GLI_ANNI: Array.from({length: 2026 - 2004 + 1}, (_, i) => 2026 - i),
    }
}

const get_data = async () => {
    const csvUrl = new URL('../assets/dati_classifiche_GaS.csv', import.meta.url).href
    console.log("Fetching data from:", csvUrl);
    const response = await fetch(csvUrl);
    const csvData = await response.text();
    const parsedData = parse(csvData, {
        header: true,
        skipEmptyLines: true,
    });
    console.log("Parsed data sample:", parsedData.data.slice(0, 5)); // Log dei primi 5 record parsati 
    return parsedData.data;
}