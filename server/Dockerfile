# Build stage
FROM node:20-slim AS builder

WORKDIR /app

RUN apt-get update && apt-get install -y python3 make g++

COPY package*.json ./
RUN npm install

COPY . .

# Final stage
FROM node:20-slim

WORKDIR /app

COPY --from=builder /app /app

EXPOSE 3001

CMD ["npm", "start"]