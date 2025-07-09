import * as fs from 'node:fs'
import { EntityTarget } from 'typeorm';
import { Person } from './Entity/Person.entity';
import { MalformedLineException } from './Exceptions/MalformedLineException';
const { createInterface } = require('readline');

export interface EntityManagerInterface {
    insert(type: EntityTarget<Person>, entities: any[]): any
};
export interface FileParserInterface { parseLine(line: string): {} };
export interface LoggerInterface { log(text: any): void }

type FileProcessorStatus = {
    currentLine: number,
    currentErrors: number,
    hasFinished: boolean,
    hasStarted: boolean,
    elapsedTime: number
}


export class FileProcessor {

    private batchSize: number = 100;
    private status: FileProcessorStatus;

    constructor(
        private manager: EntityManagerInterface,
        private parser: FileParserInterface,
        batchSize: number,
        private logger: LoggerInterface
    ) {
        this.batchSize = batchSize;
        this.status = {
            currentLine: 0,
            currentErrors: 0,
            hasFinished: false,
            hasStarted: false,
            elapsedTime: 0,
        }
    }

    async start(filePath: string) {
        let inserted = 0;
        this.status.hasStarted = true;
        const start = Date.now();
        
        const lineIterator = this.lineGenerator(filePath);
        const batchLines = [];
        for await (const record of lineIterator) {
            this.status.currentLine++;
            if (record.error !== null) {
                this.status.currentErrors++;
                this.logError(record.error, this.status.currentLine);
                // aca se podría tener un batch con errores 
                // y cuando se llene enviarlos a CloudWatch
            } else {
                const line = record.record;
                batchLines.push(line);
                inserted++;
            }
            if (batchLines.length % this.batchSize === 0) {
                this.status.elapsedTime = (Date.now() - start)/1000;
                this.logger.log(`Processed ${batchLines.length} lines in ${this.status.elapsedTime}s`);
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
        this.status.hasFinished = true;
        this.logger.log(`Total lines processed: ${inserted}`);
        this.logger.log(`Time taken: ${this.status.elapsedTime} seconds`);
    }

    public getStatus() {
        return this.status;
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