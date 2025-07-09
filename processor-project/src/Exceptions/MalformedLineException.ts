export class MalformedLineException extends Error {
    constructor(private line: string, cause?: Error) {
        super('malformed line error', { cause });
    }

    getLine() {
        return this.line;
    }
}