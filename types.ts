
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

export interface QuantumMetrics {
  entanglementLevel: number;
  coherenceTime: number;
  gateOps: number;
  noiseLevel: number;
}

export type HealthStatus = 'OPTIMAL' | 'WARNING' | 'CRITICAL';

export interface SystemHealth {
  quantumCore: HealthStatus;
  temporalStabilizer: HealthStatus;
  dataLink: HealthStatus;
}

export enum ControlView {
  DASHBOARD = 'DASHBOARD',
  TEMPORAL_LEAP = 'TEMPORAL_LEAP',
  QUBIT_LAB = 'QUBIT_LAB',
  STEERING = 'STEERING',
  VOICE_COMMAND = 'VOICE_COMMAND',
  GOVERNANCE = 'GOVERNANCE'
}
