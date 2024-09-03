package file

import (
	"fmt"
	"io"
	"mesh-service/internal/api/middleware"
	"net/http"
	"os"
	"path/filepath"

	fileService "mesh-service/internal/api/file/service"
	blobStorage "mesh-service/internal/blobStorage"
)

func UploadChunkedFile(w http.ResponseWriter, r *http.Request) {
	uploadFileDTO, err := parseUploadFileDTO(w, r)
	if err != nil {
		http.Error(w, "Failed to parse upload file DTO", http.StatusInternalServerError)
		return
	}

	file, filename, totalChunks, chunkIndex := uploadFileDTO.File, uploadFileDTO.Filename, uploadFileDTO.TotalChunks, uploadFileDTO.ChunkIndex

	if filepath.Ext(filename) != ".vtk" {
		http.Error(w, "Invalid file type - required .vtk file", http.StatusBadRequest)
		return
	}

	userID, err := middleware.ExtractUserSub(w, r)
	if err != nil {
		http.Error(w, "Failed to extract user ID", http.StatusInternalServerError)
		return
	}

	tempDir := filepath.Join("uploads", "tmp", userID)
	if err := os.MkdirAll(tempDir, os.ModePerm); err != nil {
		http.Error(w, "Failed to create temporary directory", http.StatusInternalServerError)
		return
	}

	chunkPath := filepath.Join(tempDir, fmt.Sprintf("%s.part%d", filename, chunkIndex))
	dst, err := os.Create(chunkPath)
	if err != nil {
		http.Error(w, "Failed to save chunk", http.StatusInternalServerError)
		return
	}
	defer dst.Close()

	if _, err := io.Copy(dst, file); err != nil {
		http.Error(w, "Failed to write chunk data", http.StatusInternalServerError)
		return
	}

	if chunkIndex == totalChunks-1 {
		finalFilePath := filepath.Join(tempDir, filename)
		finalFile, err := os.Create(finalFilePath)
		if err != nil {
			http.Error(w, "Failed to create final file", http.StatusInternalServerError)
			return
		}
		defer finalFile.Close()

		for i := 0; i < totalChunks; i++ {
			chunkFilePath := filepath.Join(tempDir, fmt.Sprintf("%s.part%d", filename, i))
			chunkData, err := os.ReadFile(chunkFilePath)
			if err != nil {
				http.Error(w, "Failed to read chunk", http.StatusInternalServerError)
				return
			}
			if _, err := finalFile.Write(chunkData); err != nil {
				http.Error(w, "Failed to write chunk to final file", http.StatusInternalServerError)
				return
			}
			os.Remove(chunkFilePath)
		}

		file, err := os.Open(finalFilePath)
		if err != nil {
			http.Error(w, "Failed to open final file", http.StatusInternalServerError)
			return
		}
		defer file.Close()

		fileStat, err := file.Stat()
		if err != nil {
			fmt.Println(err)
			return
		}

		fileSize := fileStat.Size()
		filePath := generateFilePath(userID, filename)

		fileService := fileService.NewFileService()
		fileService.InsertFile(userID, filename, filePath, fileSize, "application/octet-stream")

		blobStorage := blobStorage.NewBlobStorageService()
		blobStorage.PutFile(filePath, file, "application/octet-stream")

		os.Remove(finalFilePath)

		w.WriteHeader(http.StatusOK)
		fmt.Fprintf(w, `{"status": true, "message": "File uploaded and assembled successfully"}`)
		return
	}

	w.WriteHeader(http.StatusOK)
	fmt.Fprintf(w, `{"status": true, "message": "Chunk %d of %d uploaded successfully"}`, chunkIndex+1, totalChunks)
}
