package kafka

import (
	"github.com/confluentinc/confluent-kafka-go/kafka"
)

const (
	KafkaServer = "localhost:29092"
)

type Producer = kafka.Producer

type KafkaService struct {
	Producer *kafka.Producer
}

func NewKafkaService() *KafkaService {

	return &KafkaService{
		Producer: NewProducer(),
	}
}
