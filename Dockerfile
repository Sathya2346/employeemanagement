# Multi-stage Dockerfile for Render Deployment
# Stage 1: Build the Application
FROM maven:3.9.6-eclipse-temurin-17 AS build
WORKDIR /app
COPY pom.xml .
COPY src ./src
RUN mvn clean package -DskipTests

# Stage 2: Production Lightweight Image
FROM eclipse-temurin:17-jre-alpine
RUN apk add --no-cache ca-certificates
WORKDIR /app
COPY --from=build /app/target/*.jar app.jar
EXPOSE 8080 10000
ENTRYPOINT ["java", "-jar", "app.jar"]
