package ru.ddc.gatewayreactive;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.session.data.redis.config.annotation.web.server.EnableRedisWebSession;

@SpringBootApplication
@EnableRedisWebSession
public class GatewayReactiveApplication {

    public static void main(String[] args) {
        SpringApplication.run(GatewayReactiveApplication.class, args);
    }

}
