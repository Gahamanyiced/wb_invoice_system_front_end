# Stage 1: Build the Vite React app
FROM node:18 AS builder
WORKDIR /app

# Copy dependency files and install dependencies
COPY package*.json ./
RUN npm install

# Copy all source files and build the production app
COPY . .
RUN npm run build 

# Stage 2: Serve the built app using Nginx
FROM nginx:latest

# Copy the built React app from the previous stage to the Nginx HTML directory
COPY --from=builder /app/build /usr/share/nginx/html

# Copy custom nginx configuration file
COPY ./nginx.conf /etc/nginx/conf.d/default.conf

# Expose port 95 (as in your reference)
EXPOSE 95

# Run Nginx in the foreground
CMD ["nginx", "-g", "daemon off;"]
