import * as fs from 'node:fs'
import { EntityTarget } from 'typeorm';
import { Person } from './Entity/Person.entity';
const { createInterface } = require('readline');
const { pipeline } = require('stream/promises');

export interface EntityManagerInterface {
    insert(type: EntityTarget<Person>, entities: any[]): any
};
export interface FileParserInterface { parseLine(line: string): {} };

export class FileProcessor {

    private batchSize: number = 100;

    constructor(
        private manager: EntityManagerInterface,
        private parser: FileParserInterface,
        batchSize: number,
    ) {
        this.batchSize = batchSize;
    }

    async start(filePath: string) {
        try {
            let counter = 0;
            const start = Date.now();
            
            const lineIterator = this.lineGenerator(filePath);
            const batchLines = [];
            for await (const line of lineIterator) {
                counter++;
                console.log('line', line);
                batchLines.push(line);
                if (counter % this.batchSize === 0) {
                    console.log(`Processed ${counter} lines in ${(Date.now() - start)/1000}s`);
                    console.log(`Inserting into database...`);
                    console.log(batchLines);
                    await this.manager.insert(Person, [...batchLines]);
                    console.log(`${counter} new lines inserted`);
                    // Reset array
                    batchLines.splice(0, batchLines.length);
                }
            }
            if (batchLines.length) {
                    await this.manager.insert(Person, [...batchLines]);
                    console.log(`${counter} new lines inserted`);
                    // Reset array
                    batchLines.splice(0, batchLines.length);
            }
            console.log(`Total lines processed: ${counter}`);
            console.log(`Time taken: ${(Date.now() - start)/1000} seconds`);
        } catch (err) {
            console.error('Error processing file:', err);
        }
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
            const ln = this.parser.parseLine(line)
            yield ln;
        }
    } 





}