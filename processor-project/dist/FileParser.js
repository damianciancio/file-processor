"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.FileParser = void 0;
const MalformedLineException_1 = require("./Exceptions/MalformedLineException");
class FileParser {
    parseLine(line) {
        const fields = line.split('|');
        try {
            if (fields.length !== 7) {
                throw new Error('missing fields');
            }
            return {
                NombreCompleto: this.getNombreCompleto(fields[0] + ' ' + fields[1]),
                DNI: this.getDNI(fields[2]),
                Estado: this.getEstado(fields[3]),
                FechaIngreso: this.getFechaIngreso(fields[4]),
                EsPEP: this.getBooleanField(fields[5], 'EsPEP'),
                EsSujetoObligado: this.getBooleanField(fields[6], 'EsSujetoObligado'),
            };
        }
        catch (e) {
            throw new MalformedLineException_1.MalformedLineException(line, e);
        }
    }
    getNombreCompleto(field) {
        const text = field.trim();
        if (text.length > 100) {
            throw new Error('NombreCompleto exceeds text length');
        }
        return text;
    }
    getEstado(field) {
        const text = field.trim();
        if (text.length > 10) {
            throw new Error('Estado exceeds text length');
        }
        return text;
    }
    getDNI(field) {
        const int = Number.parseInt(field);
        if (Number.isNaN(int)) {
            throw new Error('DNI is not a number');
        }
        return int;
    }
    getFechaIngreso(field) {
        const date = new Date(field);
        if (isNaN(date.getTime())) {
            throw new Error('FechaIngreso is not a valid date');
        }
        return date;
    }
    getBooleanField(field, fieldName) {
        if (!['true', 'false'].includes(field)) {
            throw new Error(`${fieldName} is not a valid boolean value`);
        }
        return field === 'true';
    }
}
exports.FileParser = FileParser;
;
