# Entrega Challenge

## Desafío y resolución

El principal desafío es ir leyendo las lineas del archivo sin saturar la memoria, pero guardando cuidado de no hacer demasiadas operaciones de entrada/salida contra la base de datos. Lo que se hizo fue ir leyendo linea por linea con un stream e ir guardando en un "batch" de registros leidos. Una vez que se hayan leido "n" lineas, se insertan todas juntas en la base de datos. Se puede ir jugando con el tamaño de este batch para buscar un equilibrio entre la memoria usadas y las IO realizadas.

Se utiliza TypeORM, lo que permitió desarrollar insertando los datos en una base de sqlite para agilizar el desarrollo y las pruebas (separando la capa de lógica de la de datos).

Como aspecto a mejorar, está el servidor web, pero me pareció accesorio al desafío. Se puede mejorar usando una app de express.

Las capas de seguridad estarían cubiertas por AWS (firewall, grupos de seguridad, etc).

## Desarrollo

Para desarrollo, movete al directorio `processor-project` y ejecutá la app desde allí.

## Configuración

1. Creá un archivo `.env` guiándote por `example.env`.

2. Parámetros de configuración principales:

- Ruta relativa al archivo a procesar (desde donde se ejecuta el programa):  
  ```
  FILE_LOCATION=./path/to/CLIENTES_IN_0425.dat
  ```

- Para usar una base de datos SQLite de prueba:
  ```
  USE_TEST_DATABASE=1
  ```

- Para usar una base de datos SQL Server (requerido si `USE_TEST_DATABASE=0`):
  ```
  DB_HOST=
  DB_PORT=
  DB_USERNAME=
  DB_PASSWORD=
  DB_NAME=
  ```

- Configuración del servidor HTTP:
  ```
  HTTP_SERVER_PORT=3000
  HTTP_SERVER_HOSTNAME=localhost
  ```

- Para indicar si el procesamiento comienza automáticamente o debe ser disparado manualmente desde `/start`:
  ```
  AUTO_START_PROCESS=0
  ```

## Instalación

```bash
npm install
```

## Compilación

```bash
npx tsc
```

## Ejecución

```bash
node ./dist/index.js
```

## Pruebas

```bash
npm test
```

---

## Solución completa (Docker)

La solución completa incluye un `Dockerfile` y un `docker-compose.yml` con dos servicios:  
- La aplicación principal  
- Una instancia de SQL Server

### Pasos para ejecutar con Docker:

1. Crear los archivos `.env` para cada servicio, basándote en los ejemplos:  
   - `example.env.app`  
   - `example.env.db`

2. Colocar el archivo a procesar en el root del proyecto con el nombre:  
   ```
   CLIENTES_IN_0424.dat
   ```

3. Asegurate de que el puerto especificado en `.env.app` coincida con el puerto mapeado en `docker-compose.yml`.

4. Ejecutar:

```bash
docker compose up -d --build
```

5. Endpoints disponibles en el navegador:  
   - `http://localhost:<puerto>/health`  
   - `http://localhost:<puerto>/start`

---

## Definición de la tabla

Si no existe, la aplicación la crea automáticamente. De todas formas, esta es la definición SQL:

```sql
CREATE TABLE persons_database.dbo.person (
	PersonId int IDENTITY(1,1) NOT NULL,
	NombreCompleto nvarchar(100) COLLATE Latin1_General_CI_AS NOT NULL,
	DNI bigint NOT NULL,
	Estado nvarchar(10) COLLATE Latin1_General_CI_AS NOT NULL,
	FechaIngreso datetime NOT NULL,
	EsPEP bit NOT NULL,
	EsSujetoObligado bit NOT NULL,
	FechaCreacion datetime2 DEFAULT getdate() NOT NULL,
	CONSTRAINT PK_95404bb5d55a83f3adec45a9073 PRIMARY KEY (PersonId)
);
```

---

## Propuestas de mejora

Para mejorar el rendimiento, se puede escalar horizontalmente mediante múltiples contenedores que procesen datos en paralelo. No poseo experiencia en Kubernetes, pero entiendo que nos permitiría realizar esta mejora en base a métricas como la cpu o el uso de la memoria. De todas maneras, deberíamos asignarle de antemano un rango de lineas del archivo a cada contenedor para que no se dupliquen en la base de datos. Una posible estrategia para esto podría ser usar una función Lambda que divida el archivo original en partes, y luego lanzar múltiples instancias del proceso para trabajar sobre cada parte simultáneamente.

Otra opción podría ser desglosar el parseo de las lineas del archivo de los insert en la base de datos. Es decir, en una app podemos ir leyendo el archivo y parseando las lineas. Las que no tienen error se envian en formato json a una cola SNS para que luego las tomen otras apps que las inserten en la base de datos. Las que tienen error, se envían a otra cola de error (creo que hay una por defecto en aws) para su posterior tratamiento. Podemos tomar métricas de la cola SNS para lanzar más contenedores que vayan tomando de la cola los registros a guardar.

La CPU y la memoria entiendo que pueden trackearse mediante AWS CloudWatch.