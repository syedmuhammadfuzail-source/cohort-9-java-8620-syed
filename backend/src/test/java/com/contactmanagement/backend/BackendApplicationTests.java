package com.contactmanagement.backend;

import org.junit.jupiter.api.Test;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.testcontainers.service.connection.ServiceConnection;
import org.testcontainers.containers.MSSQLServerContainer;
import org.testcontainers.junit.jupiter.Container;
import org.testcontainers.junit.jupiter.Testcontainers;

@Testcontainers
@SpringBootTest
class BackendApplicationTests {

    @Container
@ServiceConnection
static MSSQLServerContainer sqlServer =
        new MSSQLServerContainer(
                "mcr.microsoft.com/mssql/server:2022-CU20-ubuntu-22.04"
        ).acceptLicense();
    @Test
    void contextLoads() {
    }
}