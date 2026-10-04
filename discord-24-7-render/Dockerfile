FROM node:20-slim
RUN apt-get update && apt-get install -y chromium --no-install-recommends && rm -rf /var/lib/apt/lists/*
ENV PUPPETEER_EXECUTABLE_PATH=/usr/bin/chromium CHROME_PATH=/usr/bin/chromium EPHEMERAL_CHROME=1
WORKDIR /app
COPY package.json ./
RUN npm install --omit=dev
COPY . ./
CMD ["node", "bot-pc.js"]
