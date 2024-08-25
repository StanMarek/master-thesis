package meshService

import (
	"database/sql"

	blobStorage "mesh-service/internal/blobStorage"
	postgres "mesh-service/internal/postgres"

	_ "github.com/lib/pq" // PostgreSQL driver
)

type MeshCalculationService struct {
	DbClient           *sql.DB
	BlobStorageService *blobStorage.BlobStorageService
}

func NewMeshCalculationService() *MeshCalculationService {
	return &MeshCalculationService{
		DbClient:           postgres.ConnectDB(),
		BlobStorageService: blobStorage.NewBlobStorageService(),
	}
}
