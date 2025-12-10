# Development Stage
FROM node:20-alpine AS development

WORKDIR /app

COPY package*.json ./
RUN npm install
COPY . .

EXPOSE 5000
CMD ["npm", "run", "dev"]

# Production Stage
FROM node:20-alpine AS production

WORKDIR /app

COPY package*.json ./
RUN npm install --omit=dev
COPY . .

RUN mkdir -p uploads
EXPOSE 5000
CMD ["npm", "start"]
