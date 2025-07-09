import "reflect-metadata"

import { DataSource, DataSourceOptions } from "typeorm"
import { Person } from "./Entity/Person.entity";
import { FileProcessor } from "./FileProcessor";
import { FileParser } from "./FileParser";
import http from 'http'; 
import url from 'url'

const fileLocation = process.env.FILE_LOCATION!;

const sqliteTestDatabaseConfig: DataSourceOptions = {
  type: "sqlite",
  database: "database.sqlite",
  entities: [Person],
  synchronize: true,
  logging: true,
};

const AppDataSource = new DataSource(
    process.env.USE_TEST_DATABASE 
        ? sqliteTestDatabaseConfig
        : {
            type: "mssql",
            host: process.env.DB_HOST,
            port: parseInt(process.env.DB_PORT!),
            username: process.env.DB_USERNAME,
            password: process.env.DB_PASSWORD,
            database: process.env.DB_NAME,
            entities: [Person],
            synchronize: true,
            logging: false,
        }
);

// Arranca conectandose a la base de datos
AppDataSource.initialize()
    .then(() => {
        console.log('Conectado a la base de datos ✅');

        // Instanciamos el procesador de archivos
        const fileProcessor = new FileProcessor(
            AppDataSource.manager,
            new FileParser(),
            100,
            console
        );


        // Creamos el servidor HTTP
        // Podríamos usar Express tambien y agregar mas medidas de seguridad
        // No me quise complicar mucho con esto
        const server = http.createServer((req, res) => {
            // Parse the URL
            const parsedUrl = url.parse(req!.url!, true);
            const pathname = parsedUrl.pathname;

            if (pathname === '/health') {
                res.writeHead(200, { 'Content-Type': 'text/json' });
                res.end(JSON.stringify(fileProcessor.getStatus()));
                return;
            }

            if (pathname === '/start') {
                if (fileProcessor.getStatus().hasStarted) {
                    res.writeHead(400, { 'Content-Type': 'text/json' });
                    res.end("Cannot start process (already started)");
                    return;
                } else {
                    fileProcessor.start(fileLocation);
                    res.writeHead(200, { 'Content-Type': 'text/json' });
                    res.end("Process started!");
                    return;
                }
            }

            res.writeHead(200, { 'Content-Type': 'text/plain' });
            res.end(pathname);
        });
        const PORT = parseInt(process.env.HTTP_SERVER_PORT!);
        const host = process.env.HTTP_SERVER_HOSTNAME!;
        server.listen(PORT, host, () => {
            console.log(`Server running at http://${host}:${PORT}/`);
        });

        // Dependiendo de la variable de entorno, iniciamos el proceso
        if (process.env.AUTO_START_PROCESS === '1') {
            fileProcessor.start(fileLocation);
        } else {
            console.log('Variable de entorno AUTO_START_PROCESS es false. Debe llamar a /start')
        }
    })
    .catch((error) => console.log(error))