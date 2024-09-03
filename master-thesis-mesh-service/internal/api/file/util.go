package file

import (
	"fmt"
	"net/http"
	"strconv"
	"strings"
	"time"
)

func generateFilePath(userId string, originalFileName string) string {
	fileName := strings.TrimSpace(originalFileName)
	fileName = strings.ToLower(fileName)
	fileName = strings.ReplaceAll(fileName, " ", "_")

	filePath := fmt.Sprintf("%s/%d-%s", userId, time.Now().Unix(), fileName)
	return filePath
}

func parseUploadFileDTO(w http.ResponseWriter, r *http.Request) (*UploadFileDTO, error) {
	if err := r.ParseMultipartForm(10 << 20); err != nil {
		return nil, fmt.Errorf("unable to parse form: %v", err)
	}

	file, _, err := r.FormFile("file")
	if err != nil {
		http.Error(w, "File not provided", http.StatusBadRequest)
		return nil, err
	}
	defer file.Close()

	filename := r.FormValue("filename")
	chunkIndex, err := strconv.Atoi(r.FormValue("chunkIndex"))
	if err != nil {
		http.Error(w, "Invalid chunk index", http.StatusBadRequest)
		return nil, err
	}

	totalChunks, err := strconv.Atoi(r.FormValue("totalChunks"))
	if err != nil {
		http.Error(w, "Invalid total chunks value", http.StatusBadRequest)
		return nil, err
	}

	return &UploadFileDTO{
		Filename:    filename,
		ChunkIndex:  chunkIndex,
		TotalChunks: totalChunks,
		File:        file,
	}, nil
}
