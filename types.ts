
export interface QubitState {
  id: number;
  alpha: number; // probability of |0>
  beta: number;  // probability of |1>
  phase: number; // phase in radians
}

export interface TemporalLog {
  id: string;
  timestamp: string;
  destinationDate: string;
  narrative: string;
  stability: number;
}

export enum ControlView {
  DASHBOARD = 'DASHBOARD',
  TEMPORAL_LEAP = 'TEMPORAL_LEAP',
  QUBIT_LAB = 'QUBIT_LAB',
  STEERING = 'STEERING'
}
