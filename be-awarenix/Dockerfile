# syntax=docker/dockerfile:1.5
FROM golang:1.24-alpine AS build
ENV GOPROXY=https://proxy.golang.org,direct \
    GOSUMDB=off

WORKDIR /app
COPY go.mod go.sum ./

RUN --mount=type=cache,target=/go/pkg/mod \
    --mount=type=cache,target=/root/.cache/go-build \
    go mod download

COPY . .
RUN CGO_ENABLED=0 GOOS=linux go build -o main ./main.go

FROM scratch
LABEL org.opencontainers.image.source="https://github.com/awarenix/backend" \
      org.opencontainers.image.version="v1.0.0"

COPY --from=build /app/main /main
USER 65532:65532

EXPOSE 3000
HEALTHCHECK --interval=30s --timeout=5s \
  CMD ["./main", "health"]  

ENTRYPOINT ["/main"]
