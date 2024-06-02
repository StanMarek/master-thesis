package main

import (
	"encoding/json"
	"fmt"

	"github.com/confluentinc/confluent-kafka-go/kafka"
)

const (
	KafkaServer = "localhost:29092"
	KafkaTopic  = "test-topic"
)

type TestStruct struct {
	ID   int    `json:"id"`
	Name string `json:"name"`
}

func main() {
	p, err := kafka.NewProducer(&kafka.ConfigMap{
		"bootstrap.servers": KafkaServer,
	})
	if err != nil {
		panic(err)
	}
	fmt.Println("Producer created: ", p)
	defer p.Close()

	topic := KafkaTopic

	// flush := p.Flush(15 * 1000)
	// fmt.Println("Flush: ", flush)

	for i := 0; i < 10; i++ {
		order := TestStruct{
			ID:   i,
			Name: "Test xyz",
		}

		value, err := json.Marshal(order)
		if err != nil {
			panic(err)
		}
		err = p.Produce(&kafka.Message{
			TopicPartition: kafka.TopicPartition{Topic: &topic, Partition: kafka.PartitionAny},
			Value:          value,
		}, nil)

		if err != nil {
			panic(err)
		}
	}

}
