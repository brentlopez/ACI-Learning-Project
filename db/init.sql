CREATE TABLE course (
	id serial PRIMARY KEY,
	name TEXT NOT NULL,
	status TEXT NOT NULL,
	createdAt TIMESTAMP NOT NULL,
	updatedAt TIMESTAMP NOT NULL,
	deletedAt TIMESTAMP
);