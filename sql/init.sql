IF NOT EXISTS (SELECT name FROM sys.databases WHERE name = 'persons_database')
BEGIN
    CREATE DATABASE persons_database;
    PRINT 'Database persons_database created successfully';
END
ELSE
BEGIN
    PRINT 'Database persons_database already exists';
END
GO