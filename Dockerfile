# =========================================================
# Stage 1 – Build the Spring Boot JAR using Maven image
# =========================================================
FROM maven:3.9.6-eclipse-temurin-17-alpine AS builder

WORKDIR /app

# Copy pom.xml first to cache Maven dependencies layer
COPY pom.xml .

# Download all dependencies (re-used unless pom.xml changes)
RUN mvn dependency:go-offline -B

# Copy source code and build the JAR (tests skipped for image build)
COPY src ./src
RUN mvn clean package -DskipTests -B

# =========================================================
# Stage 2 – Minimal JRE runtime image
# =========================================================
FROM eclipse-temurin:17-jre-alpine AS runtime

# Create a non-root user for security
RUN addgroup -S appgroup && adduser -S appuser -G appgroup

WORKDIR /app

# Copy the fat JAR from the builder stage
COPY --from=builder /app/target/product-management-1.0.0.jar app.jar

# Switch to non-root user
USER appuser

# Expose Spring Boot default port
EXPOSE 8080

# JVM tuning for containerised environments
ENV JAVA_OPTS="-XX:+UseContainerSupport -XX:MaxRAMPercentage=75.0 -Djava.security.egd=file:/dev/./urandom"

# Health check via Spring Actuator
HEALTHCHECK --interval=30s --timeout=10s --start-period=60s --retries=3 \
  CMD wget -qO- http://localhost:8080/actuator/health || exit 1

ENTRYPOINT ["sh", "-c", "java $JAVA_OPTS -jar app.jar"]
