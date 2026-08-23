FROM maven:3.9-eclipse-temurin-17 AS build
WORKDIR /app
COPY pom.xml .
RUN --mount=type=cache,target=/root/.m2 mvn -B dependency:go-offline
COPY src ./src
RUN --mount=type=cache,target=/root/.m2 mvn -B package -DskipTests

FROM bellsoft/liberica-openjre-alpine:17-cds AS builder
WORKDIR /builder
ARG JAR_FILE=target/*.jar
COPY --from=build /app/target/*.jar application.jar
RUN java -Djarmode=tools -jar application.jar extract --layers --destination extracted

FROM bellsoft/liberica-openjre-alpine:17-cds
WORKDIR /application
RUN addgroup -S appgroup && adduser -S appuser -G appgroup
COPY --from=builder --chown=appuser:appgroup /builder/extracted/dependencies/ ./
COPY --from=builder --chown=appuser:appgroup /builder/extracted/spring-boot-loader/ ./
COPY --from=builder --chown=appuser:appgroup /builder/extracted/snapshot-dependencies/ ./
COPY --from=builder --chown=appuser:appgroup /builder/extracted/application/ ./
USER appuser
ENTRYPOINT ["java", "-cp", "spring-boot-loader:dependencies:snapshot-dependencies:application", "org.springframework.boot.loader.launch.JarLauncher"]
