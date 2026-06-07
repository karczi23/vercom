FROM node:22-alpine AS deps
WORKDIR /app
COPY package.json tsconfig.base.json ./
COPY common/package.json common/package.json
COPY backend/package.json backend/package.json
RUN npm install

FROM deps AS build
COPY common common
COPY backend backend
RUN npm run build --workspace @vercom/common && npm run build --workspace @vercom/backend

FROM node:22-alpine
WORKDIR /app
ENV NODE_ENV=production
COPY --from=deps /app/node_modules node_modules
COPY --from=build /app/common/dist common/dist
COPY common/package.json common/package.json
COPY --from=build /app/backend/dist backend/dist
COPY backend/src/api/openapi.yaml backend/dist/src/api/openapi.yaml
CMD ["node", "backend/dist/src/api/server.js"]
