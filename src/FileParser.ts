export class FileParser {
    parseLine(line: string) {
        const fields = line.split('|');

        return {
            NombreCompleto: fields[0] + ' ' + fields[1],
            DNI: fields[2],
            Estado: fields[3],
            FechaIngreso: fields[4],
            EsPEP: fields[5] === 'true',
            EsSujetoObligado: fields[6] === 'true',
            FechaCreacion: new Date(),
        }
    }
};
