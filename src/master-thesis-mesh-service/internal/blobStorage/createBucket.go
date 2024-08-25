package blobStorage

import (
	"context"
	"log"

	"github.com/minio/minio-go/v7"
)

func (s *BlobStorageService) createBucket(bucketName string) {
	ctx := context.Background()
	exists, err := s.client.BucketExists(ctx, bucketName)
	if err != nil {
		log.Printf("Failed to check if bucket exists: %v", err)
	}

	if !exists {
		err = s.client.MakeBucket(ctx, bucketName, minio.MakeBucketOptions{Region: s.region})
		if err != nil {
			log.Printf("Failed to create bucket: %v", err)
		}
		log.Printf("Bucket %s created successfully", bucketName)
	}

}
