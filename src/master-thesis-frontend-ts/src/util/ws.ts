export type SocketEventType = {
  [SocketEventName.CONNECTED]: {
    status: string;
    clientId: string;
  };
  [SocketEventName.KAFKA_CHECK]: string;
  [SocketEventName.CALCULATE_MESH_START]: null;
  [SocketEventName.CALCULATE_MESH_END]: null;
  [SocketEventName.CALCULATE_MESH_ALREADY_DONE]: null;
  [SocketEventName.CALCULATE_MESH_FAILED]: string;
};

export type SocketEventDataType<T> = {
  status: boolean;
  message: string;
  data: T;
};

export enum SocketEventName {
  CONNECTED = 'client.socket.connect',
  KAFKA_CHECK = 'client.kafka.check',
  CALCULATE_MESH_START = 'client.mesh.calculate.start',
  CALCULATE_MESH_END = 'client.mesh.calculate.end',
  CALCULATE_MESH_ALREADY_DONE = 'client.mesh.calculate.already.done',
  CALCULATE_MESH_FAILED = 'client.mesh.calculate.fail',
}
export type SocketResponseType<E extends keyof SocketEventType> = SocketEventDataType<
  SocketEventType[E]
>;
