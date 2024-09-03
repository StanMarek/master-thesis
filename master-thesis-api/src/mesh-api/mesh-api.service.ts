import { Injectable, Logger } from '@nestjs/common';
import axios from 'axios';

@Injectable()
export class MeshApiService {
  async checkMeshApiHealth() {
    const options = {
      method: 'GET',
      url: 'http://localhost:8080/api/health-check',
    };

    try {
      const response = await axios.request(options);

      return response.data.status;
    } catch (error) {
      Logger.error('Error while checking Mesh API health:', error);
      return false;
    }
  }

  async checkKafkaHealth(sub: string) {
    const options = {
      method: 'GET',
      url: 'http://localhost:8080/api/kafka-check?clientId=' + sub,
    };

    try {
      const response = await axios.request(options);

      return response.data.status;
    } catch (error) {
      Logger.error('Error while checking Mesh API health:', error);
      return false;
    }
  }
}
