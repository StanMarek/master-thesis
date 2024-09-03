package blobStorage

import (
	"log"
	"os"

	"github.com/minio/minio-go/v7"
	"github.com/minio/minio-go/v7/pkg/credentials"
)

type BlobStorageService struct {
	client     *minio.Client
	bucketName string
	region     string
}

func NewBlobStorageService() *BlobStorageService {
	endpoint := os.Getenv("BLOB_STORAGE_ENDPOINT")
	accessKeyID := os.Getenv("BLOB_STORAGE_ACCESS")
	secretAccessKey := os.Getenv("BLOB_STORAGE_SECRET")
	useSSL := false

	client, err := minio.New(endpoint, &minio.Options{
		Creds:  credentials.NewStaticV4(accessKeyID, secretAccessKey, ""),
		Secure: useSSL,
	})
	if err != nil {
		log.Fatalf("Failed to initialize MinIO client: %v", err)
	}

	service := &BlobStorageService{
		client:     client,
		bucketName: "mesh-vtk-files",
		region:     "us-east-1",
	}

	service.createBucket(service.bucketName)

	return service
}
