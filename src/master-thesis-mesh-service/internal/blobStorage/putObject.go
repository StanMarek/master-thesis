package blobStorage

import (
	"context"
	"fmt"
	"log"
	"os"

	"github.com/minio/minio-go/v7"
)

func (s *BlobStorageService) PutFile(fileName string, file *os.File, contentType string) error {

	ctx := context.Background()
	if fileName == "" {
		return fmt.Errorf("fileName cannot be empty")
	}

	s.createBucket(s.bucketName)

	fileStat, err := file.Stat()
	if err != nil {
		fmt.Println(err)
		return nil
	}

	fileSize := fileStat.Size()

	_, err = s.client.PutObject(ctx, s.bucketName, fileName, file, fileSize, minio.PutObjectOptions{
		ContentType: contentType,
	})
	if err != nil {
		return fmt.Errorf("failed to upload file: %v", err)
	}

	log.Printf("File %s uploaded successfully, size: %d bytes", fileName, fileSize)
	return nil
}
