package fileService

import (
	"fmt"
	postgres "mesh-service/internal/postgres/entity"
)

func (s *FileService) GetFile(id string) (*postgres.File, error) {
	query := `
		SELECT path, id, name
		FROM "File"
		WHERE id = $1
	`

	file := &postgres.File{}

	err := s.db.QueryRow(query, id).Scan(&file.Path, &file.Id, &file.Name)
	defer s.db.Close()

	if err != nil {
		fmt.Println("failed to get file record:", err)
		return nil, err
	}

	return file, nil

}
