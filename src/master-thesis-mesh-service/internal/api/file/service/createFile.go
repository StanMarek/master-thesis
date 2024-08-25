package fileService

import (
	"fmt"
	"strings"

	postgres "mesh-service/internal/postgres/entity"

	"github.com/google/uuid"
)

func (s *FileService) InsertFile(user string, fileName string, filePath string, fileSize int64, fileType string) (*postgres.File, error) {
	format := strings.Split(fileName, ".")[len(strings.Split(fileName, "."))-1]

	file := &postgres.File{
		Name:         fileName,
		OriginalName: fileName,
		Format:       format,
		Size:         fileSize,
		Owner:        user,
		Type:         fileType,
		Path:         filePath,
	}

	query := `
		INSERT INTO "File" (name, "originalName", format, size, owner, type, path, id)
		VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
	`

	id := uuid.New()

	_, err := s.db.Exec(query, file.Name, file.OriginalName, file.Format, file.Size, file.Owner, file.Type, file.Path, id)
	defer s.db.Close()

	if err != nil {
		fmt.Println("failed to create file record:", err)
		return nil, err
	}

	return file, nil
}
