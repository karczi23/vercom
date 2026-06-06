FROM node:22-alpine AS deps
WORKDIR /app
COPY package.json tsconfig.base.json ./
COPY common/package.json common/package.json
COPY frontend/package.json frontend/package.json
RUN npm install

FROM deps AS build
COPY common common
COPY frontend frontend
RUN npm run build --workspace @vercom/common && npm run build --workspace @vercom/frontend

FROM node:22-alpine
WORKDIR /app
RUN npm install -g serve
COPY --from=build /app/frontend/dist frontend/dist
CMD ["serve", "-s", "frontend/dist", "-l", "3000"]
