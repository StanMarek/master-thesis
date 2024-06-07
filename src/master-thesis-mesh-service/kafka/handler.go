package kafka

import "github.com/confluentinc/confluent-kafka-go/kafka"

const (
	KafkaServer = "localhost:29092"
)

type Producer = kafka.Producer

type TestStruct struct {
	ID   int    `json:"id"`
	Name string `json:"name"`
	Sub  string `json:"sub"`
}

func NewProducer() *kafka.Producer {
	producer, err := kafka.NewProducer(&kafka.ConfigMap{
		"bootstrap.servers": KafkaServer,
	})

	if err != nil {
		panic(err)
	}

	return producer
}

func PublishMessage(producer *kafka.Producer, topic string, message []byte) {

	err := producer.Produce(&kafka.Message{
		TopicPartition: kafka.TopicPartition{Topic: &topic, Partition: kafka.PartitionAny},
		Value:          message,
	}, nil)

	if err != nil {
		panic(err)
	}
}
