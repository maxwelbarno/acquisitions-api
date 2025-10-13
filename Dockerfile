ARG NODE_VERSION=22.14.0

FROM node:${NODE_VERSION}-bookworm-slim AS base

# set working directory
WORKDIR /app

# copy package files
COPY package*.json ./

# install dependencies
RUN npm ci --only=production && npm cache clean --force

# copy source code 
COPY . .

# create non root user for security
RUN groupadd -g 1001 nodejsgroup  && useradd -u 1001 -g nodejsgroup -m -s /bin/bash nodejsuser

# change ownership of the app directory
RUN chown -R nodejsuser:nodejsgroup .

USER nodejsuser

# expose port
EXPOSE 3000

# health check
HEALTHCHECK --interval=30s --timeout=30s --start-period=5s --retries=3 \
    CMD node -e "require('http').get('http://localhost:3000/health', (res)=>{process.exit(res.statusCode===200?0:1)}).on('error', ()=>{process.exit(1)})"

# development stage
FROM base AS development
USER root
RUN npm ci && npm cache clean --force
USER nodejsuser
CMD [ "npm", "run", "dev" ]

# production stage
FROM base AS production
CMD [ "npm", "start" ]
