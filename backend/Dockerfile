FROM eclipse-temurin:21-jdk-alpine AS build
WORKDIR /workspace/app

COPY .mvn/ .mvn
COPY mvnw pom.xml ./
RUN chmod +x ./mvnw
# Download dependencies first for caching
RUN ./mvnw dependency:go-offline -B

COPY src src
RUN ./mvnw clean package -DskipTests

FROM eclipse-temurin:21-jre-alpine
VOLUME /tmp
WORKDIR /app
COPY --from=build /workspace/app/target/*.jar app.jar
ENV PORT=8080
ENV SPRING_PROFILES_ACTIVE=prod
EXPOSE 8080
ENTRYPOINT ["java", "-Djava.security.egd=file:/dev/./urandom", "-jar", "app.jar"]

