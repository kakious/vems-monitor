# base environment
FROM node:16.19.0-alpine3.17 as base-stage
RUN mkdir /app && chown -R node:node /app
RUN apk add python3 --no-cache
WORKDIR /app
USER node

# dependency environment
FROM base-stage as dependency-stage
COPY --link --chown=1000:1000 package*.json ./
RUN npm ci

# prebuild stage to stop at for testing
FROM dependency-stage as prebuild-stage
COPY --link --chown=1000:1000 . .

# build environment
FROM prebuild-stage as build-stage
RUN npm run build

# prod dependency environment
FROM dependency-stage as production-dependency-stage
RUN npm prune --production

# production environment
FROM alpine:3.17.0 as production-stage
WORKDIR /app
RUN apk add --no-cache libstdc++ tini \
  && addgroup -g 1000 node && adduser -u 1000 -G node -s /bin/sh -D node \
  && chown node:node ./

COPY --from=base-stage /usr/local/bin/node /usr/local/bin/

USER node
COPY --link --chown=1000:1000 --from=production-dependency-stage /app/node_modules node_modules
COPY --link --chown=1000:1000 --from=build-stage /app/dist .

ENTRYPOINT ["/sbin/tini", "--"]
CMD ["node", "/app/main.js"]
