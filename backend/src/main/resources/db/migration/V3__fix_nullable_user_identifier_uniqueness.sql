ALTER TABLE users
DROP CONSTRAINT uq_users_email;

ALTER TABLE users
DROP CONSTRAINT uq_users_phone;

CREATE UNIQUE INDEX uq_users_email
ON users(email)
WHERE email IS NOT NULL;

CREATE UNIQUE INDEX uq_users_phone
ON users(phone)
WHERE phone IS NOT NULL;