FROM node:20-slim

# Install OpenSSL
RUN apt-get update && \
    apt-get install -y openssl && \
    rm -rf /var/lib/apt/lists/*

WORKDIR /app

# Copy package files
COPY package*.json ./

# Install dependencies
RUN npm ci

# Copy source code
COPY . .

# Generate Prisma client
RUN npx prisma generate

# Build application
RUN npm run build

# Set environment variables
ENV NODE_ENV=production

# Expose port
EXPOSE 8080

CMD ["npm", "run", "start:prod"]
