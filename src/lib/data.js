// ============================================================================
// IMPORT DATI REALI
// ============================================================================
import { parse } from 'papaparse';

// import classificheAnnuali from '../data/classifiche_annuali.json';
// import alboDati from '../data/albo_medagliere.json';

export default async function data() {
    const data = await get_data();

    const profili_scuole = {}; // id_scuola => {} 
    const risultati = []; 
    const insieme_anni = new Set();
    const insieme_province = new Set();
    const insieme_comuni = new Set();

    for (const item of data) {
        const id_scuola = `${item["Nome Scuola"].toLowerCase()} (${item["Comune"].toLowerCase()})`;
        if (!profili_scuole[id_scuola]) {
            profili_scuole[id_scuola] = {
                id: id_scuola,
                nome: item["Nome Scuola"],
                comune: item["Comune"],
                provincia: item["Provincia"],
            };
        }
        const profilo = profili_scuole[id_scuola];
        if (profilo.nome !== item["Nome Scuola"] || profilo.comune !== item["Comune"] || profilo.provincia !== item["Provincia"]) {
            console.warn(`Incoerenza dati per scuola ${id_scuola}:`, {
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

        const anno = String(item["Anno"]);
        insieme_anni.add(anno);
        insieme_province.add(item["Provincia"]);
        insieme_comuni.add(item["Comune"]);
        const posizione = parseInt(item.posizione, 10);
        const punti = parseInt(item["Punti"], 10);

        risultati.push({
            id_scuola,
            anno,
            categoria,
            gara,
            posizione,
            punti,
        })
    };

    return {
        profiliScuole: Object.fromEntries(Object.entries(profili_scuole).sort((a, b) => a[0].localeCompare(b[0]))),
        risultati,
        elenco_anni: Array.from(insieme_anni).sort((a, b) => a - b),
        elenco_province: Array.from(insieme_province).sort((a, b) => a.localeCompare(b)),
        elenco_comuni: Array.from(insieme_comuni).sort((a, b) => a.localeCompare(b)),
    };
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