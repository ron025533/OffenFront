import { TDateFormat } from "../types";

export const getDate = (format: TDateFormat = 'DD/MM/YYYY'): string => {
    const date = new Date()

    const yyyy = date.getFullYear();
    const mm = String(date.getMonth() + 1).padStart(2, "0"); // Mois commence à 0
    const dd = String(date.getDate()).padStart(2, "0");

    switch (format) {
        case "YYYY-MM-DD":
            return `${yyyy}-${mm}-${dd}`;
        case "DD/MM/YYYY":
            return `${dd}/${mm}/${yyyy}`;
        case "MM-DD-YYYY":
            return `${mm}-${dd}-${yyyy}`;
        case "YYYY/MM/DD":
            return `${yyyy}/${mm}/${dd}`;
        case "DD-MM-YYYY":
            return `${dd}-${mm}-${yyyy}`;
        case "MM/DD/YYYY":
            return `${mm}/${dd}/${yyyy}`;
        default:
            throw new Error("Format de date non pris en charge");
    }
}

export const formatDate = (date: string, inputFormat: TDateFormat, outputFormat: TDateFormat): string => {
    let year = "";
    let month = "";
    let day = "";

    // Extraire les parties de la date selon l'inputFormat
    const parts = date.match(/\d+/g);
    if (!parts || parts.length !== 3) {
        throw new Error("Date invalide ou format non reconnu");
    }

    switch (inputFormat) {
        case "YYYY-MM-DD":
            [year, month, day] = parts;
            break;
        case "DD/MM/YYYY":
            [day, month, year] = parts;
            break;
        case "MM-DD-YYYY":
            [month, day, year] = parts;
            break;
        case "YYYY/MM/DD":
            [year, month, day] = parts;
            break;
        case "DD-MM-YYYY":
            [day, month, year] = parts;
            break;
        case "MM/DD/YYYY":
            [month, day, year] = parts;
            break;
        default:
            throw new Error("Format d'entrée non pris en charge");
    }

    // Reformater la date selon outputFormat
    switch (outputFormat) {
        case "YYYY-MM-DD":
            return `${year}-${month}-${day}`;
        case "DD/MM/YYYY":
            return `${day}/${month}/${year}`;
        case "MM-DD-YYYY":
            return `${month}-${day}-${year}`;
        case "YYYY/MM/DD":
            return `${year}/${month}/${day}`;
        case "DD-MM-YYYY":
            return `${day}-${month}-${year}`;
        case "MM/DD/YYYY":
            return `${month}/${day}/${year}`;
        default:
            throw new Error("Format de sortie non pris en charge");
    }
}