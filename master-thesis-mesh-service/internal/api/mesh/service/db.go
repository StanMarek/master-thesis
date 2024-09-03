package meshService

import "github.com/google/uuid"

func (service *MeshCalculationService) InsertMeshMetadata(name, owner string, verticesCount int, fileID string) (string, error) {
	var meshID string

	err := service.DbClient.QueryRow(`
		INSERT INTO "MeshMetadata" (name, owner, "verticesCount", "fileId", id)
		VALUES ($1, $2, $3, $4, $5)
		RETURNING id`, name, owner, verticesCount, fileID, uuid.New()).Scan(&meshID)

	if err != nil {
		return "", err
	}

	return meshID, nil
}

func (service *MeshCalculationService) InsertMeshCommodities(meshID string, commodities []MeshCommodity) error {

	for _, commodity := range commodities {

		_, err := service.DbClient.Exec(`
			INSERT INTO "MeshCommodity" ("meshId", "fileLineIndex", name, "originalName", visible, tag, id)
			VALUES ($1, $2, $3, $4, $5, $6, $7)`,
			meshID, commodity.FileLineIndex, commodity.Name, commodity.OriginalName, commodity.Visible, commodity.Tag, uuid.New())
		if err != nil {
			return err
		}
	}
	return nil
}

func (service *MeshCalculationService) InsertMeshVertices(meshID string, points []MeshVertex) error {

	for _, point := range points {
		_, err := service.DbClient.Exec(`
			INSERT INTO "MeshVertice" ("meshId", x, y, z, id, "order")
			VALUES ($1, $2, $3, $4, $5, $6)`,
			meshID, point.X, point.Y, point.Z, uuid.New(), point.Order)
		if err != nil {

			return err
		}
	}
	return nil
}
