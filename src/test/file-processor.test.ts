import { Person } from "../Entity/Person.entity";
import { FileProcessor } from "../FileProcessor";

describe('FileProcessor tests', () => {
    describe('no errors', () => {
        test('one line file', async () => {
            const manager = {
                insert: jest.fn(),
            };
            const parser = {
                parseLine: jest.fn().mockImplementation(() => {
                    return {
                        NombreCompleto: 'Sydney Nicolas',
                        DNI: '47225682',
                        Estado: 'Inactivo',
                        FechaIngreso: '8/23/2015',
                        EsPEP: true,
                        EsSujetoObligado: true,
                    }
                }),
            };
            const testFileName = './src/test/test-files/test-one-file.dat';

            const processor = new FileProcessor(manager, parser, 1);
            await processor.start(testFileName);
            expect(manager.insert).toHaveBeenCalledWith(
                Person,
                [{
                    NombreCompleto: 'Sydney Nicolas',
                    DNI: '47225682',
                    Estado: 'Inactivo',
                    FechaIngreso: '8/23/2015',
                    EsPEP: true,
                    EsSujetoObligado: true,
                }]
            );
        });
        test('two lines file', async () => {
            const manager = {
                insert: jest.fn(),
            };
            const parser = {
                parseLine: jest.fn().mockImplementation(() => {
                    return {
                        NombreCompleto: 'Sydney Nicolas',
                        DNI: '47225682',
                        Estado: 'Inactivo',
                        FechaIngreso: '8/23/2015',
                        EsPEP: true,
                        EsSujetoObligado: true,
                    }
                }),
            };
            const testFileName = './src/test/test-files/test-two-files.dat';

            const processor = new FileProcessor(manager, parser, 2);
            await processor.start(testFileName);
            expect(manager.insert).toHaveBeenCalledWith(
                Person,
                [{
                    NombreCompleto: 'Sydney Nicolas',
                    DNI: '47225682',
                    Estado: 'Inactivo',
                    FechaIngreso: '8/23/2015',
                    EsPEP: true,
                    EsSujetoObligado: true,
                },
                {
                    NombreCompleto: 'Sydney Nicolas',
                    DNI: '47225682',
                    Estado: 'Inactivo',
                    FechaIngreso: '8/23/2015',
                    EsPEP: true,
                    EsSujetoObligado: true,
                }]
            );
        });
    });

    describe('batchSize', () => {
        test('bigger than file length', async () => {
            const manager = {
                insert: jest.fn(),
            };
            const parser = {
                parseLine: jest.fn().mockImplementation(() => {
                    return {
                        NombreCompleto: 'Sydney Nicolas',
                        DNI: '47225682',
                        Estado: 'Inactivo',
                        FechaIngreso: '8/23/2015',
                        EsPEP: true,
                        EsSujetoObligado: true,
                    }
                }),
            };
            const testFileName = './src/test/test-files/test-one-file.dat';

            const processor = new FileProcessor(manager, parser, 2);
            await processor.start(testFileName);
            expect(manager.insert).toHaveBeenCalledWith(
                Person,
                [{
                    NombreCompleto: 'Sydney Nicolas',
                    DNI: '47225682',
                    Estado: 'Inactivo',
                    FechaIngreso: '8/23/2015',
                    EsPEP: true,
                    EsSujetoObligado: true,
                }]
            );
        });
        test('file length no divisible by batchSize', async () => {
            const manager = {
                insert: jest.fn(),
            };
            const parser = {
                parseLine: jest.fn().mockImplementation(() => {
                    return {
                        NombreCompleto: 'Sydney Nicolas',
                        DNI: '47225682',
                        Estado: 'Inactivo',
                        FechaIngreso: '8/23/2015',
                        EsPEP: true,
                        EsSujetoObligado: true,
                    }
                }),
            };
            const testFileName = './src/test/test-files/test-three-files.dat';

            const processor = new FileProcessor(manager, parser, 2);
            await processor.start(testFileName);
            expect(manager.insert).toHaveBeenCalledTimes(2)
            expect(manager.insert).toHaveBeenNthCalledWith(1,
                Person,
                [{
                    NombreCompleto: 'Sydney Nicolas',
                    DNI: '47225682',
                    Estado: 'Inactivo',
                    FechaIngreso: '8/23/2015',
                    EsPEP: true,
                    EsSujetoObligado: true,
                },
                {
                    NombreCompleto: 'Sydney Nicolas',
                    DNI: '47225682',
                    Estado: 'Inactivo',
                    FechaIngreso: '8/23/2015',
                    EsPEP: true,
                    EsSujetoObligado: true,
                },
                ]
            );

            expect(manager.insert).toHaveBeenNthCalledWith(2,
                Person,
                [{
                    NombreCompleto: 'Sydney Nicolas',
                    DNI: '47225682',
                    Estado: 'Inactivo',
                    FechaIngreso: '8/23/2015',
                    EsPEP: true,
                    EsSujetoObligado: true,
                }]
            );
        });
    })
});