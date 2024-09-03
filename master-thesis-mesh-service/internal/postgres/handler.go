package postgres

import (
	"database/sql"
	"log"
	"os"

	_ "github.com/lib/pq"
)

func ConnectDB() *sql.DB {
	dbConnStr := os.Getenv("DB_CONNECTION_STRING")

	db, err := sql.Open("postgres", dbConnStr)
	if err != nil {
		log.Fatalf("Failed to connect to the database: %v", err)
	}

	err = db.Ping()
	if err != nil {
		log.Fatalf("Failed to ping the database: %v", err)

	}

	_, err = db.Exec("SET search_path TO public")
	if err != nil {
		log.Fatalf("Failed to set search_path: %v", err)
	}

	return db
}
