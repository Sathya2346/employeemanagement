# Build stage
FROM maven:3.9.4-eclipse-temurin-17 AS build
WORKDIR /app

# Copy the pom.xml and dependencies
COPY pom.xml .
# Download dependencies first to cache them if pom.xml hasn't changed
RUN mvn dependency:go-offline

# Copy the source code
COPY src ./src
# Build the application (skipping tests for faster build)
RUN mvn clean package -DskipTests

# Run stage
FROM eclipse-temurin:17-jre
WORKDIR /app

# Copy the built jar from the build stage
COPY --from=build /app/target/*.jar app.jar

# Expose the application port (based on your configuration)
EXPOSE 8085

# Run the application
ENTRYPOINT ["java", "-jar", "app.jar"]
