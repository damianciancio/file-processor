"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
exports.FileProcessor = void 0;
const fs = __importStar(require("node:fs"));
const Person_entity_1 = require("./Entity/Person.entity");
const MalformedLineException_1 = require("./Exceptions/MalformedLineException");
const { createInterface } = require('readline');
;
;
class FileProcessor {
    manager;
    parser;
    logger;
    batchSize = 100;
    status;
    constructor(manager, parser, batchSize, logger) {
        this.manager = manager;
        this.parser = parser;
        this.logger = logger;
        this.batchSize = batchSize;
        this.status = {
            currentLine: 0,
            currentErrors: 0,
            hasFinished: false,
            hasStarted: false,
            elapsedTime: 0,
        };
    }
    async start(filePath) {
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
            }
            else {
                const line = record.record;
                batchLines.push(line);
                inserted++;
            }
            if (batchLines.length % this.batchSize === 0) {
                this.status.elapsedTime = (Date.now() - start) / 1000;
                this.logger.log(`Processed ${batchLines.length} lines in ${this.status.elapsedTime}s`);
                this.logger.log(`Inserting into database...`);
                this.logger.log(batchLines);
                await this.manager.insert(Person_entity_1.Person, [...batchLines]);
                this.logger.log(`${batchLines.length} new lines inserted`);
                // Reset array
                batchLines.splice(0, batchLines.length);
            }
        }
        if (batchLines.length) {
            await this.manager.insert(Person_entity_1.Person, [...batchLines]);
            this.logger.log(`${batchLines.length} new lines inserted`);
            // Reset array
            batchLines.splice(0, batchLines.length);
        }
        this.status.hasFinished = true;
        this.logger.log(`Total lines processed: ${inserted}`);
        this.logger.log(`Time taken: ${this.status.elapsedTime} seconds`);
    }
    getStatus() {
        return this.status;
    }
    async *lineGenerator(filePath) {
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
            }
            catch (e) {
                error = e;
            }
            yield { record, error };
        }
    }
    logError(error, lineNumber) {
        let errorMsg = '';
        if (error instanceof MalformedLineException_1.MalformedLineException) {
            const casted = error;
            errorMsg = `Error parseando la linea ${lineNumber}, causa: ${casted.cause.message}`
                + ', linea: ' + casted.getLine();
        }
        else {
            errorMsg = `Error parseando la linea ${lineNumber}, causa: ${error.message}`;
        }
        this.logger.log(errorMsg);
    }
}
exports.FileProcessor = FileProcessor;
