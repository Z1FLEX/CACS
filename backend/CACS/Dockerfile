# Stage 1: Build the application
FROM maven:3.9.9-eclipse-temurin-21 AS build
WORKDIR /app

# Copy configuration files first to leverage Docker cache for dependencies
COPY pom.xml mvnw ./
COPY .mvn .mvn
RUN chmod +x mvnw

# Copy source and package
COPY src src
RUN ./mvnw -DskipTests package

# Stage 2: Runtime environment
FROM eclipse-temurin:21-jre
WORKDIR /app

# Install curl for Docker healthcheck support
RUN apt-get update && \
    apt-get install -y curl && \
    rm -rf /var/lib/apt/lists/*

# Copy the built WAR file from the build stage
COPY --from=build /app/target/cacs.war app.war

EXPOSE 8080

ENTRYPOINT ["java", "-jar", "/app/app.war"]