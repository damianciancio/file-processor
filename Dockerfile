FROM node:24-alpine AS build

WORKDIR /build
COPY processor-project/package*.json ./
RUN npm install
COPY processor-project/. .
RUN npx tsc

FROM node:24-alpine
WORKDIR /app
COPY --from=build /build/dist/ ./
COPY --from=build /build/package.json ./
RUN npm install --only=production

COPY CLIENTES_IN_0425.dat /file/
CMD ["node", "./index.js"]