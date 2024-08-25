package mesh

import (
	"encoding/json"
	"net/http"
)

func parseCalculateMeshDTO(w http.ResponseWriter, r *http.Request) (*CalculateMeshDTO, error) {
	body := r.Body
	defer body.Close()

	var calculateMeshDTO CalculateMeshDTO
	if err := json.NewDecoder(body).Decode(&calculateMeshDTO); err != nil {
		http.Error(w, "Failed to parse calculate mesh DTO", http.StatusInternalServerError)
		return nil, err
	}

	return &calculateMeshDTO, nil
}
