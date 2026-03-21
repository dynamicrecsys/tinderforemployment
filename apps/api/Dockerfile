FROM node:22-alpine

WORKDIR /app

# Copy workspace root config
COPY package.json package-lock.json ./

# Copy shared package
COPY packages/shared ./packages/shared

# Copy api package
COPY apps/api ./apps/api

# Install dependencies
RUN npm install

# Build shared package first, then API
RUN npx tsc --project packages/shared/tsconfig.json
RUN npx tsc --project apps/api/tsconfig.json

# Railway provides PORT env var
ENV API_PORT=3001
EXPOSE 3001

CMD ["node", "apps/api/dist/index.js"]
