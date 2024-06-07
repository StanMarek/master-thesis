package main

import (
	"encoding/json"
	"fmt"
	"mesh-service/kafka"
	"net/http"
)

const (
	KafkaTestTopic = "kafka.check"
)

func main() {
	producer := kafka.NewProducer()
	defer producer.Close()

	kafkaHandler := &KafkaHandler{
		Producer: producer,
		Topic:    KafkaTestTopic,
	}

	mux := http.NewServeMux()

	mux.Handle("/api/health-check", &HomeHandler{})
	mux.Handle("/api/kafka-check", kafkaHandler)

	fmt.Println("Starting server on port 8080")
	http.ListenAndServe(":8080", mux)
}

type HomeHandler struct {
}

type KafkaHandler struct {
	Producer *kafka.Producer
	Topic    string
}

type ApiHealth struct {
	Status bool `json:"status"`
}

func (handler *HomeHandler) ServeHTTP(w http.ResponseWriter, r *http.Request) {
	w.Header().Set("Content-Type", "application/json")

	status := ApiHealth{
		Status: true,
	}

	bytes, err := json.Marshal(status)

	if err != nil {
		w.WriteHeader(http.StatusInternalServerError)
		w.Write([]byte("Internal server error"))
		return
	}

	w.WriteHeader(http.StatusOK)
	w.Write(bytes)
}

func (handler *KafkaHandler) ServeHTTP(w http.ResponseWriter, r *http.Request) {
	producer := handler.Producer

	sub := r.URL.Query().Get("clientId")

	for i := 0; i < 10; i++ {
		testStruct := kafka.TestStruct{
			ID:   i,
			Name: "Test",
			Sub:  sub,
		}

		message, err := json.Marshal(testStruct)

		if err != nil {
			panic(err)
		}

		kafka.PublishMessage(producer, KafkaTestTopic, message)
	}

	w.Header().Set("Content-Type", "application/json")

	status := ApiHealth{
		Status: true,
	}

	bytes, err := json.Marshal(status)

	if err != nil {
		w.WriteHeader(http.StatusInternalServerError)
		w.Write([]byte("Internal server error"))
		return
	}

	w.WriteHeader(http.StatusOK)
	w.Write(bytes)
}
