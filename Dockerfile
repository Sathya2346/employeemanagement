# =========================================================
# Stage 1 – Build the Spring Boot JAR with Maven
# =========================================================
FROM eclipse-temurin:17-jdk-alpine AS builder

WORKDIR /app

# Cache Maven dependencies first (only re-downloaded if pom.xml changes)
COPY pom.xml .
COPY mvnw .
COPY .mvn .mvn

# Download dependencies (offline-capable after first run)
RUN chmod +x mvnw && ./mvnw dependency:go-offline -B

# Copy source code and build the JAR (skip tests during image build)
COPY src ./src
RUN ./mvnw clean package -DskipTests -B

# =========================================================
# Stage 2 – Minimal JRE runtime image
# =========================================================
FROM eclipse-temurin:17-jre-alpine AS runtime

# Create a non-root user for security best-practices
RUN addgroup -S appgroup && adduser -S appuser -G appgroup

WORKDIR /app

# Copy the fat JAR produced in the builder stage
COPY --from=builder /app/target/product-management-1.0.0.jar app.jar

# Switch to non-root user
USER appuser

# Expose the Spring Boot default port
EXPOSE 8080

# JVM tuning for containerised environments
ENV JAVA_OPTS="-XX:+UseContainerSupport -XX:MaxRAMPercentage=75.0 -Djava.security.egd=file:/dev/./urandom"

# Health check (requires the actuator dependency already in pom.xml)
HEALTHCHECK --interval=30s --timeout=10s --start-period=60s --retries=3 \
  CMD wget -qO- http://localhost:8080/actuator/health || exit 1

ENTRYPOINT ["sh", "-c", "java $JAVA_OPTS -jar app.jar"]
