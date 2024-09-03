package mesh

import (
	"encoding/json"
	"fmt"
	meshService "mesh-service/internal/api/mesh/service"
	quadric "mesh-service/internal/quadric"
	"net/http"
	"time"
)

func Vertices(w http.ResponseWriter, r *http.Request) {

	params := r.URL.Query()
	id := params.Get("id")

	if id == "" {
		w.WriteHeader(http.StatusBadRequest)
		w.Write([]byte(`{"error": "Missing mesh ID"}`))
		return
	}
	meshCalculationService := meshService.NewMeshCalculationService()

	// Get the vertices for the mesh
	fmt.Println("Getting vertices for mesh with ID: ", id)
	startTime := time.Now()
	vertices, err := meshCalculationService.GetVertices(id)
	if err != nil {
		w.WriteHeader(http.StatusInternalServerError)
		w.Write([]byte(fmt.Sprintf(`{"error": "%v"}`, err)))
		return
	}
	fmt.Println("Vertices: ", len(vertices))

	// if len(vertices) <= 10000 {
	// 	fmt.Println("Getting edges for mesh with ID: ", id)
	// 	edges, err := meshCalculationService.GetEdges(id)
	// 	if err != nil {
	// 		w.WriteHeader(http.StatusInternalServerError)
	// 		w.Write([]byte(fmt.Sprintf(`{"error": "%v"}`, err)))
	// 		return
	// 	}
	// 	fmt.Println("Edges: ", len(edges))

	// 	verticesJSON, _ := json.Marshal(vertices)
	// 	edgesJSON, _ := json.Marshal(edges)
	// 	w.Header().Set("Content-Type", "application/json")
	// 	w.WriteHeader(http.StatusOK)
	// 	w.Write([]byte(fmt.Sprintf(`{"vertices": %s, "edges": %s}`, verticesJSON, edgesJSON)))

	// 	return
	// }

	fmt.Println("Getting edges for mesh with ID: ", id)
	edges, err := meshCalculationService.GetEdges(id)
	if err != nil {
		w.WriteHeader(http.StatusInternalServerError)
		w.Write([]byte(fmt.Sprintf(`{"error": "%v"}`, err)))
		return
	}
	fmt.Println("Edges: ", len(edges))

	targetNumPoints := 30000
	simplifiedPoints, simplifiedEdges := quadric.SimplifyMesh(vertices, edges, targetNumPoints)
	endTime := time.Now()
	fmt.Println("Simplified vertices: ", len(simplifiedPoints))
	fmt.Println("Simplified edges: ", len(simplifiedEdges))
	fmt.Println("Time taken [ms]: ", endTime.Sub(startTime).Milliseconds())

	simplifiedJSON, _ := json.Marshal(simplifiedPoints)

	w.Header().Set("Content-Type", "application/json")
	w.WriteHeader(http.StatusOK)
	w.Write([]byte(fmt.Sprintf(`{"vertices": %s, "edges": %s}`, simplifiedJSON, []byte("[]"))))

}
