FROM node:20-alpine as build
WORKDIR /app
RUN npm install -g pnpm
COPY . .
RUN pnpm install
WORKDIR /app/frontend
RUN pnpm run build

FROM nginx:alpine
COPY --from=build /app/frontend/dist /usr/share/nginx/html
COPY frontend/nginx.conf /etc/nginx/conf.d/default.conf
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
