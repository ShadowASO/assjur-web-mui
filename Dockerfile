# # -------- build --------
# FROM node:lts-alpine AS builder
# WORKDIR /app

# COPY package.json yarn.lock ./
# RUN yarn install --frozen-lockfile

# COPY . .
# RUN yarn build

# # -------- runtime --------
# FROM node:lts-alpine
# WORKDIR /app

# # instala o serve (aqui tem node)
# RUN npm i -g serve

# COPY --from=builder /app/dist ./dist

# EXPOSE 3002
# CMD ["serve", "-s", "dist", "-l", "3002"]

# -------- build --------
# -------- build --------
FROM node:lts-alpine AS builder
WORKDIR /app

# ativa o corepack para usar a versão do yarn definida pelo projeto
RUN corepack enable

COPY package.json yarn.lock ./

# se existir .yarnrc.yml, copie também
COPY .yarnrc.yml ./

# se existir pasta .yarn, copie também
COPY .yarn ./.yarn

RUN yarn install --immutable

COPY . .
RUN yarn build

# -------- runtime --------
FROM node:lts-alpine
WORKDIR /app

RUN npm i -g serve

COPY --from=builder /app/dist ./dist

EXPOSE 3002
CMD ["serve", "-s", "dist", "-l", "3002"]