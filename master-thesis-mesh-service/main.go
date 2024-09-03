package main

import (
	"fmt"
	"log"
	"mesh-service/internal/api"
	"mesh-service/internal/api/file"
	"mesh-service/internal/api/mesh"
	"mesh-service/internal/api/middleware"

	"net/http"

	"github.com/joho/godotenv"
)

const (
	KafkaTestTopic = "kafka.check"
)

func main() {
	if err := godotenv.Load(); err != nil {
		log.Fatalf("Error loading the .env file: %v", err)
	}

	router := http.NewServeMux()

	router.Handle("/api/health-check", &api.HomeHandler{})
	// router.Handle("/api/kafka-check", kafkaHandler)

	// router.Handle("/api/private", middleware.EnsureValidToken()(
	// 	http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {

	// 		w.Header().Set("Content-Type", "application/json")
	// 		w.WriteHeader(http.StatusOK)
	// 		w.Write([]byte(`{"message":"Hello from a private endpoint! You need to be authenticated to see this."}`))
	// 	}),
	// ))

	router.Handle("/api/file/upload", middleware.EnableCors((middleware.EnsureValidToken()(
		http.HandlerFunc(file.UploadChunkedFile),
	))))

	router.Handle("/api/mesh/calculate", middleware.EnsureValidToken()(
		http.HandlerFunc(mesh.Calculate),
	))

	fmt.Println("Starting server on port 8080")
	http.ListenAndServe(":8080", router)
	log.Print("Server listening on http://localhost:8080")
	if err := http.ListenAndServe("0.0.0.0:8080", router); err != nil {
		log.Fatalf("There was an error with the http server: %v", err)
	}
}
