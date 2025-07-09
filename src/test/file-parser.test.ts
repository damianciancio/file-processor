import { describe, test, expect } from '@jest/globals';

import { FileParser } from '../FileParser';

describe('FileParser test', () => {
    test('parse a regular line', () => {
        const parser = new FileParser();
        const parsed = parser.parseLine(
            'Mariah|Wilderman|65140717|Activo|6/21/2018|false|true'
        );
        expect(parsed).toMatchObject({
            NombreCompleto: 'Mariah Wilderman',
            DNI: '65140717',
            Estado: 'Activo',
            FechaIngreso: '6/21/2018',
            EsPEP: false,
            EsSujetoObligado: true,
        });

        expect(parsed.FechaCreacion).toBeDefined();
    });

    test('parse another regular line', () => {
        const parser = new FileParser();
        const parsed = parser.parseLine(
            'Sid|Sauer|13465828|Inactivo|1/18/2022|true|true'
        );
        expect(parsed).toMatchObject({
            NombreCompleto: 'Sid Sauer',
            DNI: '13465828',
            Estado: 'Inactivo',
            FechaIngreso: '1/18/2022',
            EsPEP: true,
            EsSujetoObligado: true,
        });

        expect(parsed.FechaCreacion).toBeDefined();
    });

});