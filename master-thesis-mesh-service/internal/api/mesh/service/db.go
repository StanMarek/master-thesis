package meshService

import (
	"fmt"

	"github.com/google/uuid"

	pg "github.com/lib/pq"
)

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

func (service *MeshCalculationService) GetVertices(meshID string) ([]MeshVertex, error) {
	rows, err := service.DbClient.Query(`
		SELECT x, y, z, "order"
		FROM "MeshVertice"
		WHERE "meshId" = $1`, meshID)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	var vertices []MeshVertex
	for rows.Next() {

		var vertex MeshVertex
		err := rows.Scan(&vertex.X, &vertex.Y, &vertex.Z, &vertex.Order)
		if err != nil {
			return nil, err
		}
		vertex.MeshId = meshID
		vertex.Color = "blue"
		vertices = append(vertices, vertex)
	}

	return vertices, nil
}

func (service *MeshCalculationService) GetEdges(meshID string) ([]MeshEdge, error) {
	rows, err := service.DbClient.Query(`
		SELECT "start", "end", "data"
		FROM "MeshEdge"
		WHERE "meshId" = $1`, meshID)

	if err != nil {
		return nil, err
	}
	defer rows.Close()

	var edges []MeshEdge
	for rows.Next() {

		var edge MeshEdge
		err := rows.Scan(&edge.Start, &edge.End, pg.Array(&edge.Data))
		if err != nil {
			fmt.Println(err)
			return nil, err
		}
		edge.MeshId = meshID
		edges = append(edges, edge)
	}

	return edges, nil
}
