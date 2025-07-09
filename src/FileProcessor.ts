import * as fs from 'node:fs'
import { EntityTarget } from 'typeorm';
import { Person } from './Entity/Person.entity';
import { MalformedLineException } from './Exceptions/MalformedLineException';
const { createInterface } = require('readline');
const { pipeline } = require('stream/promises');

export interface EntityManagerInterface {
    insert(type: EntityTarget<Person>, entities: any[]): any
};
export interface FileParserInterface { parseLine(line: string): {} };
export interface LoggerInterface { log(text: any): void }
export class FileProcessor {

    private batchSize: number = 100;

    constructor(
        private manager: EntityManagerInterface,
        private parser: FileParserInterface,
        batchSize: number,
        private logger: LoggerInterface
    ) {
        this.batchSize = batchSize;
    }

    async start(filePath: string) {
        let counter = 0;
        let inserted = 0;
        const start = Date.now();
        
        const lineIterator = this.lineGenerator(filePath);
        const batchLines = [];
        for await (const record of lineIterator) {
            counter++;
            if (record.error !== null) {
                this.logError(record.error, counter);
                // aca se podría tener un batch con errores y cuando se llene enviarlos a CloudWatch
                // O registrarlos por consola
            } else {
                const line = record.record;
                batchLines.push(line);
                inserted++;
            }
            if (batchLines.length % this.batchSize === 0) {
                this.logger.log(`Processed ${batchLines.length} lines in ${(Date.now() - start)/1000}s`);
                this.logger.log(`Inserting into database...`);
                this.logger.log(batchLines);
                await this.manager.insert(Person, [...batchLines]);
                this.logger.log(`${batchLines.length} new lines inserted`);
                // Reset array
                batchLines.splice(0, batchLines.length);
            }
        }
        if (batchLines.length) {
                await this.manager.insert(Person, [...batchLines]);
                this.logger.log(`${batchLines.length} new lines inserted`);
                // Reset array
                batchLines.splice(0, batchLines.length);
        }
        this.logger.log(`Total lines processed: ${inserted}`);
        this.logger.log(`Time taken: ${(Date.now() - start)/1000} seconds`);
    }

    private async* lineGenerator(filePath: string) {
        const fileStream = fs.createReadStream(filePath, {
            encoding: 'utf8',
            highWaterMark: 1024 * 1024 * 10 // 10MB buffer
        });

        const rl = createInterface({
            input: fileStream,
            crlfDelay: Infinity
        });

        for await (const line of rl) {
            let record = null;
            let error = null;
            try {
                record = this.parser.parseLine(line);
            } catch (e: unknown) {
                error = e as Error;
            }
            yield { record, error }
        }
    }

    private logError(error: Error, lineNumber: number) {
        let errorMsg = ''
        if (error instanceof MalformedLineException) {
            const casted = (error as MalformedLineException);
            errorMsg = `Error parseando la linea ${lineNumber}, causa: ${(casted.cause as Error).message}`
                + ', linea: ' + casted.getLine();
        } else {
            errorMsg = `Error parseando la linea ${lineNumber}, causa: ${(error as Error).message}`
        }
        this.logger.log(errorMsg);
    }
}