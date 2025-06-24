# Use a Go base image
FROM golang:1.24-alpine AS build

# Set the working directory inside the container
WORKDIR /app

# Copy go.mod and go.sum to leverage Docker cache
COPY go.mod go.sum ./

# Download Go module dependencies
RUN go mod download

# Copy the rest of the backend application code
COPY . .

# Build the Go application
# CGO_ENABLED=0 disables CGO, making the binary static and easier to run in Alpine
# -o main specifies the output executable name
# ./... builds all packages in the current directory and its subdirectories
RUN CGO_ENABLED=0 GOOS=linux go build -o main ./main.go

# Use a minimal base image for the final executable
FROM alpine:latest

# Set the working directory
WORKDIR /root/

# Copy the built executable from the build stage
COPY --from=build /app/main .

# Expose the port your Go API listens on (e.g., 8080 or 3000 as per your FE_API_URL)
EXPOSE 3000

# Command to run the Go application
CMD ["./main"]