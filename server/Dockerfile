FROM node:20-slim AS builder

WORKDIR /app

COPY package*.json ./
RUN npm install

COPY . .

# Final stage
FROM node:20-slim

WORKDIR /app

COPY --from=builder /app /app

EXPOSE 3001

CMD ["npm", "start"]
