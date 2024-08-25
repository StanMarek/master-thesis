package mesh

import (
	"fmt"
	"net/http"

	fileService "mesh-service/internal/api/file/service"
	meshService "mesh-service/internal/api/mesh/service"
	kafkaService "mesh-service/internal/kafka"
)

func Calculate(w http.ResponseWriter, r *http.Request) {

	dto, err := parseCalculateMeshDTO(w, r)
	if err != nil {
		w.Header().Set("Content-Type", "application/json")
		w.WriteHeader(http.StatusBadRequest)
		w.Write([]byte(`{"message":"Failed to parse calculate mesh DTO"}`))
		return
	}

	fileService := fileService.NewFileService()
	file, err := fileService.GetFile(dto.FileId)
	if err != nil {
		w.Header().Set("Content-Type", "application/json")
		w.WriteHeader(http.StatusBadRequest)
		w.Write([]byte(`{"message":"Failed to get file"}`))
		return
	}

	meshService := meshService.NewMeshCalculationService()
	err = meshService.Calculate(file, dto.Sub)

	if err != nil {
		w.Header().Set("Content-Type", "application/json")
		w.WriteHeader(http.StatusInternalServerError)
		w.Write([]byte(`{"message":"Failed to calculate mesh"}`))
		return
	}

	kafkaService := kafkaService.NewKafkaService()
	err = kafkaService.PublishMessage("mesh.calculated", []byte(fmt.Sprintf("sub:%s", dto.Sub)))

	if err != nil {
		w.Header().Set("Content-Type", "application/json")
		w.WriteHeader(http.StatusInternalServerError)
		w.Write([]byte(`{"message":"Failed to publish message"}`))
		return
	}
}
