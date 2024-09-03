package kafka

import "github.com/confluentinc/confluent-kafka-go/kafka"

func NewProducer() *kafka.Producer {
	producer, err := kafka.NewProducer(&kafka.ConfigMap{
		"bootstrap.servers": KafkaServer,
	})

	if err != nil {
		panic(err)
	}

	return producer
}
