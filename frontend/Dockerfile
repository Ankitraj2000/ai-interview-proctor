# Build React frontend
FROM node:20-alpine AS build
WORKDIR /app
COPY package*.json ./
RUN npm install
COPY . .
RUN npm run build

# Nginx static server
FROM nginx:alpine
COPY --from=build /app/dist /usr/share/nginx/html
# Nginx configs will be supplied by volume or custom config in docker-compose
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
