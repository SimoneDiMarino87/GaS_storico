// ============================================================================
// IMPORT DATI REALI
// ============================================================================
import { parse } from 'papaparse';

import classificheAnnuali from '../data/classifiche_annuali.json';
import alboDati from '../data/albo_medagliere.json';

export default async function data() {
    const data = await get_data();

    const profili_scuole = {}; // id_scuola => {} 
    const classifiche = {};
    const elenco_scuole = [];
    const medagliereMap = {};

    for (const item of data) {
        const id = `${item["Nome Scuola"].toLowerCase()} (${item["Comune"].toLowerCase()})`;
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
        let categoria = "Altro";
        if (gara.startsWith("Semi")) {
            categoria = "Semifinale";
        } else if (gara==="Finale") {
            categoria = "Finale Mista";
        } else if (gara==="FinaleF") {
            categoria = "Finale Femminile";
        }
        profilo.storia.push({
            anno: parseInt(item["Anno"], 10),
            categoria,
            gara_dettaglio: gara,
            posizione: parseInt(item["posizione"], 10),
            punti: parseInt(item["Punti"], 10),
        });

        const anno = String(item["Anno"]);
        if (!classifiche[anno]) {
            classifiche[anno] = {};
        }
        // aggiungi a elenco_scuole deduplicato
        const id_scuola = id;
        if (!elenco_scuole.includes(id_scuola)) {
            elenco_scuole.push(id_scuola);
        }

        // costruisci medagliere (solo Finali e FinaleF)
        if (item.categoria === 'Finale Mista' || item.categoria === 'Finale Femminile') {
            const pos = parseInt(item.posizione, 10);
            if (!medagliereMap[id_scuola]) {
                medagliereMap[id_scuola] = {
                    id_scuola,
                    nome: item["Nome Scuola"],
                    comune: item["Comune"],
                    provincia: item["Provincia"],
                    oro: 0, argento: 0, bronzo: 0,
                    oro_f: 0, argento_f: 0, bronzo_f: 0,
                };
            }
            if (pos <= 3) {
                if (item.categoria === 'Finale Mista') {
                    if (pos === 1) medagliereMap[id_scuola].oro += 1;
                    else if (pos === 2) medagliereMap[id_scuola].argento += 1;
                    else if (pos === 3) medagliereMap[id_scuola].bronzo += 1;
                } else {
                    if (pos === 1) medagliereMap[id_scuola].oro_f += 1;
                    else if (pos === 2) medagliereMap[id_scuola].argento_f += 1;
                    else if (pos === 3) medagliereMap[id_scuola].bronzo_f += 1;
                }
            }
        }
        
    }

    const profili_scuole_sort = Object.fromEntries(Object.entries(profili_scuole).sort((a, b) => a[0].localeCompare(b[0])));

    // costruisci classifiche_annuali nello stesso shape del file JSON importato
    for (const [anno, items] of Object.entries(classifiche)) {
        // inizializza categorie principali
        classifiche[anno] = classifiche[anno] || {};
    }

    // elenco scuole dettagliato: array di oggetti { id_scuola, nome }
    const elenco_scuole_obj = elenco_scuole.sort().map(id => {
        const m = id.match(/^(.*) \((.*)\)$/);
        const nome = m ? m[1] : id;
        return { id_scuola: id, nome };
    });

    const albo_mista = [];
    const albo_femminile = [];
    // ricostruisci albo per anno+categoria prendendo dai profili_storia
    for (const [id, prof] of Object.entries(profili_scuole_sort)) {
        for (const record of prof.storia) {
            if (record.categoria === 'Finale Mista' || record.categoria === 'Finale Femminile') {
                // troveremo i podi successivamente aggregando per anno
            }
        }
    }

    // invece di ricostruire podi complessi, prendiamo i dati importati da classificheAnnuali/alboDati
    const resultAlbo = {
        mista: alboDati.mista || [],
        femminile: alboDati.femminile || [],
        medagliere: Object.values(medagliereMap).concat((alboDati.medagliere || []).filter(m => !medagliereMap[m.id_scuola])),
    };

    return {
        profiliScuole: profili_scuole_sort,
        elencoScuole: elenco_scuole_obj,
        classificheAnnuali: classificheAnnuali,
        alboDati: resultAlbo,
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