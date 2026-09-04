IF NOT EXISTS (
    SELECT 1
    FROM sys.tables
    WHERE name = 'contacts'
      AND schema_id = SCHEMA_ID('dbo')
)
BEGIN
    CREATE TABLE contacts (
        id BIGINT IDENTITY(1,1) PRIMARY KEY,

        user_id BIGINT NOT NULL,

        first_name VARCHAR(100) NOT NULL,
        last_name VARCHAR(100) NULL,
        title VARCHAR(100) NULL,

        created_at DATETIME2 NOT NULL DEFAULT GETDATE(),
        updated_at DATETIME2 NOT NULL DEFAULT GETDATE(),

        CONSTRAINT fk_contacts_user
            FOREIGN KEY (user_id)
            REFERENCES users(id)
            ON DELETE CASCADE
    );
END;

IF NOT EXISTS (
    SELECT 1
    FROM sys.tables
    WHERE name = 'contact_emails'
      AND schema_id = SCHEMA_ID('dbo')
)
BEGIN
    CREATE TABLE contact_emails (
        id BIGINT IDENTITY(1,1) PRIMARY KEY,

        contact_id BIGINT NOT NULL,

        email VARCHAR(255) NOT NULL,
        label VARCHAR(50) NOT NULL,

        CONSTRAINT fk_contact_emails_contact
            FOREIGN KEY (contact_id)
            REFERENCES contacts(id)
            ON DELETE CASCADE
    );
END;

IF NOT EXISTS (
    SELECT 1
    FROM sys.tables
    WHERE name = 'contact_phones'
      AND schema_id = SCHEMA_ID('dbo')
)
BEGIN
    CREATE TABLE contact_phones (
        id BIGINT IDENTITY(1,1) PRIMARY KEY,

        contact_id BIGINT NOT NULL,

        phone VARCHAR(30) NOT NULL,
        label VARCHAR(50) NOT NULL,

        CONSTRAINT fk_contact_phones_contact
            FOREIGN KEY (contact_id)
            REFERENCES contacts(id)
            ON DELETE CASCADE
    );
END;