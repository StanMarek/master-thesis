package blobStorage

import (
	"context"

	"github.com/minio/minio-go/v7"
)

func (s *BlobStorageService) GetObject(filePath string) (*minio.Object, error) {
	ctx := context.Background()

	file, err := s.client.GetObject(ctx, s.bucketName, filePath, minio.GetObjectOptions{})
	if err != nil {
		return nil, err
	}

	return file, nil
}
