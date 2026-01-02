# ---------- Build stage ----------
FROM maven:3.9.4-eclipse-temurin-17 AS builder
WORKDIR /workspace

# Copy pom first to leverage Docker cache for dependencies
COPY pom.xml .
# If you have a settings.xml or .m2 config you can copy it here

# Download dependencies (will cache until pom.xml changes)
RUN mvn -B -q dependency:go-offline

# Copy the entire project and build
COPY . .
RUN mvn -B -DskipTests package

# ---------- Run stage ----------
FROM eclipse-temurin:17-jdk-jammy
ARG JAR_FILE=/workspace/target/*.jar
WORKDIR /app

# Create non-root user (optional)
RUN useradd --create-home --shell /bin/bash appuser || true
USER appuser

# Copy jar from the builder
COPY --from=builder --chown=appuser:appuser ${JAR_FILE} app.jar

# Expose default port (Spring Boot)
EXPOSE 8080

# Use environment variable PORT if provided (Spring Boot uses server.port)
ENV JAVA_OPTS=""
ENTRYPOINT ["sh","-c","exec java $JAVA_OPTS -jar /app/app.jar"]
