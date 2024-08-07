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

export const SocketEvent = {
  [SocketEventName.CONNECTED]: {
    eventName: SocketEventName.CONNECTED,
    dataType: {} as SocketEventDataType<
      SocketEventType[SocketEventName.CONNECTED]
    >,
  },
  [SocketEventName.KAFKA_CHECK]: {
    eventName: SocketEventName.KAFKA_CHECK,
    dataType: {} as SocketEventDataType<
      SocketEventType[SocketEventName.KAFKA_CHECK]
    >,
  },
  [SocketEventName.CALCULATE_MESH_START]: {
    eventName: SocketEventName.CALCULATE_MESH_START,
    dataType: {} as SocketEventDataType<
      SocketEventType[SocketEventName.CALCULATE_MESH_START]
    >,
  },
  [SocketEventName.CALCULATE_MESH_END]: {
    eventName: SocketEventName.CALCULATE_MESH_END,
    dataType: {} as SocketEventDataType<
      SocketEventType[SocketEventName.CALCULATE_MESH_END]
    >,
  },
  [SocketEventName.CALCULATE_MESH_ALREADY_DONE]: {
    eventName: SocketEventName.CALCULATE_MESH_ALREADY_DONE,
    dataType: {} as SocketEventDataType<
      SocketEventType[SocketEventName.CALCULATE_MESH_ALREADY_DONE]
    >,
  },
  [SocketEventName.CALCULATE_MESH_FAILED]: {
    eventName: SocketEventName.CALCULATE_MESH_FAILED,
    dataType: {} as SocketEventDataType<
      SocketEventType[SocketEventName.CALCULATE_MESH_FAILED]
    >,
  },
} as const;
