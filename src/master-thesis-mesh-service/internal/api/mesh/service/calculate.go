package meshService

import (
	"fmt"
	"io"
	"strings"

	entity "mesh-service/internal/postgres/entity"
)

func (service *MeshCalculationService) Calculate(file *entity.File, sub string) error {
	blob, err := service.BlobStorageService.GetObject(file.Path)
	if err != nil {
		return fmt.Errorf("failed to retrieve file from blob storage: %v", err)
	}

	buffer, err := io.ReadAll(blob)
	if err != nil {
		return fmt.Errorf("failed to read blob to buffer: %v", err)
	}

	parsedBuffer := strings.Split(string(buffer), "\n")
	dataMapping := service.mapData(parsedBuffer)
	pointsCoordinates := service.extractPointsCoordinates(dataMapping, parsedBuffer)

	meshID, err := service.InsertMeshMetadata(file.Name, sub, len(pointsCoordinates), file.Id)
	if err != nil {
		return fmt.Errorf("failed to create mesh metadata: %v", err)
	}

	if err := service.createMeshCommodities(meshID, dataMapping); err != nil {
		return fmt.Errorf("failed to create mesh commodities: %v", err)
	}

	if err := service.createMeshVertices(meshID, pointsCoordinates); err != nil {
		return fmt.Errorf("failed to create mesh vertices: %v", err)
	}

	return nil
}
