"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.MalformedLineException = void 0;
class MalformedLineException extends Error {
    line;
    constructor(line, cause) {
        super('malformed line error', { cause });
        this.line = line;
    }
    getLine() {
        return this.line;
    }
}
exports.MalformedLineException = MalformedLineException;
