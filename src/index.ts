import "reflect-metadata"

import { DataSource, DataSourceOptions } from "typeorm"
import { Person } from "./Entity/Person.entity";
import { FileProcessor } from "./FileProcessor";
import { FileParser } from "./FileParser";

const sqliteTestDatabaseConfig: DataSourceOptions = {
  type: "sqlite",
  database: "database.sqlite",
  entities: [Person],
  synchronize: true,
  logging: true,
};

const SQLServerDatabaseConfig = {
    type: "postgres",
    host: "localhost",
    port: 5432,
    username: "root",
    password: "admin",
    database: "test",
    entities: [Person],
    synchronize: true,
    logging: false,
};


const AppDataSource = new DataSource(sqliteTestDatabaseConfig);

// to initialize the initial connection with the database, register all entities
// and "synchronize" database schema, call "initialize()" method of a newly created database
// once in your application bootstrap
AppDataSource.initialize()
    .then(() => {
        console.log('Conectado a la base de datos ✅');
        const fileProcessor = new FileProcessor(
            AppDataSource.manager,
            new FileParser(),
            100,
            console
        );
        fileProcessor.start(
            '../backend-challenge-file-ingestion/data-generator/challenge/input/CLIENTES_IN_0425.dat'
        );
    })
    .catch((error) => console.log(error))