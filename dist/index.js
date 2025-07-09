"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
require("reflect-metadata");
const typeorm_1 = require("typeorm");
const Person_entity_1 = require("./Entity/Person.entity");
const sqliteTestDatabaseConfig = {
    type: "sqlite",
    database: "database.sqlite",
    entities: [Person_entity_1.Person],
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
    entities: [Person_entity_1.Person],
    synchronize: true,
    logging: false,
};
const AppDataSource = new typeorm_1.DataSource(sqliteTestDatabaseConfig);
// to initialize the initial connection with the database, register all entities
// and "synchronize" database schema, call "initialize()" method of a newly created database
// once in your application bootstrap
AppDataSource.initialize()
    .then(() => {
    console.log('It works!');
    // here you can start to work with your database
})
    .catch((error) => console.log(error));
