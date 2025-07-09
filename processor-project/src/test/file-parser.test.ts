import { describe, test, expect } from '@jest/globals';

import { FileParser } from '../FileParser';

describe('FileParser test', () => {
    describe('no errors', () => {
        test('parse a regular line', () => {
            const parser = new FileParser();
            const parsed = parser.parseLine(
                'Mariah|Wilderman|65140717|Activo|6/21/2018|false|true'
            );
            expect(parsed).toMatchObject({
                NombreCompleto: 'Mariah Wilderman',
                DNI: 65140717,
                Estado: 'Activo',
                FechaIngreso: new Date('6/21/2018'),
                EsPEP: false,
                EsSujetoObligado: true,
            });

        });

        test('parse another regular line', () => {
            const parser = new FileParser();
            const parsed = parser.parseLine(
                'Sid|Sauer|13465828|Inactivo|1/18/2022|true|true'
            );
            expect(parsed).toMatchObject({
                NombreCompleto: 'Sid Sauer',
                DNI: 13465828,
                Estado: 'Inactivo',
                FechaIngreso: new Date('1/18/2022'),
                EsPEP: true,
                EsSujetoObligado: true,
            });

        });
    });

    describe('errors', () => {
        test('fullname field length exceeded', () => {
            const line = "cotidie similique beatae vesper sint anser una adfero cupiditate tum sophismata venia ver conitor combibo versus denego voco tricesimus aequus curriculum vigor cimentarius contabesco vulgo aduro spargo vallum crastinus cras utrimque tabernus quidem curvo aufero spiritus adeptio vel comitatus ciminatio vir avaritia nesciunt antea verumtamen custodia vinculum tero arceo desparatus|facilis comis arbustum taceo candidus crinis amplitudo volup deserunt minima tabesco usitas eum valens aequitas apud cruciamentum vos bellicus deficio rerum vilis allatus bis deorsum theologus cotidie vaco conventus labore tertius cupio talio cado omnis tego at arceo velut taceo votum velociter circumvenio vigor vulnero sortitus delinquo accusantium nihil velociter|20527549|Inactivo|3/1/2020|true|true";
            const parser = new FileParser();
            expect(() => parser.parseLine(line)).toThrow();
        });

        test('missing EsSujetoObligado boolean field', () => {
            const line = "Savanna|Brown|79782888|Inactivo|3/3/2024|true|";
            const parser = new FileParser();
            expect(() => parser.parseLine(line)).toThrow();
        });

        test('missing EsPEP boolean field', () => {
            const line = "Savanna|Brown|79782888|Inactivo|3/3/2024||true";
            const parser = new FileParser();
            expect(() => parser.parseLine(line)).toThrow();
        });

        test('invalid date for FechaIngreso', () => {
            const line = "Ivory|Christiansen|44879400|Inactivo|0000-00-00|true|true";
            const parser = new FileParser();
            expect(() => parser.parseLine(line)).toThrow();
        });

        test('another invalid date for FechaIngreso', () => {
            const line = "Roselyn|Fritsch|82167902|Activo|99/99/9999|false|true";
            const parser = new FileParser();
            expect(() => parser.parseLine(line)).toThrow();
        });
    });
    

});