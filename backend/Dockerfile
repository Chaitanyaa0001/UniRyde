FROM node:24-alpine

WORKDIR /app

RUN npm install -g pnpm@11.8.0

COPY package.json pnpm-lock.yaml pnpm-workspace.yaml ./

RUN pnpm ci

COPY . .

EXPOSE 5050

CMD ["pnpm", "start"]