package fileService

import (
	"database/sql"

	postgres "mesh-service/internal/postgres"
)

type FileService struct {
	db *sql.DB
}

func NewFileService() *FileService {
	return &FileService{
		db: postgres.ConnectDB(),
	}
}
