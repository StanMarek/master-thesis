package kafka

import (
	"fmt"

	"github.com/confluentinc/confluent-kafka-go/kafka"
)

func (service *KafkaService) PublishMessage(topic string, message []byte) error {
	fmt.Println("Publishing message to topic:", topic)
	err := service.Producer.Produce(&kafka.Message{
		TopicPartition: kafka.TopicPartition{Topic: &topic, Partition: kafka.PartitionAny},
		Value:          message,
	}, nil)

	defer service.Producer.Close()

	if err != nil {
		fmt.Println("failed to publish message:", err)
		return err
	}

	return nil
}
