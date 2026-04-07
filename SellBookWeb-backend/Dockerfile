FROM maven:3.9-eclipse-temurin-17-alpine AS build
WORKDIR /app
COPY pom.xml .
COPY src ./src
RUN mvn -q -DskipTests package

FROM eclipse-temurin:17-jre-alpine
WORKDIR /app
RUN addgroup -S spring && adduser -S spring -G spring
COPY --from=build /app/target/bookstore-backend-*.jar app.jar
RUN mkdir -p /app/uploads/images /app/logs && chown -R spring:spring /app
USER spring
EXPOSE 8080
ENV SPRING_PROFILES_ACTIVE=docker
ENTRYPOINT ["java", "-jar", "/app/app.jar"]
