package com.sushama;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.data.jpa.repository.config.EnableJpaAuditing;

@SpringBootApplication
@EnableJpaAuditing
public class NovaCartApplication {

	public static void main(String[] args) {
		SpringApplication.run(NovaCartApplication.class, args);
	}

}
