export interface QuantumBit {
  id: number;
  aliceBit: number;
  aliceBasis: string;
  bobBasis: string;
  bobMeasurement: number;
  match: boolean;
  kept: boolean;
  eavesdropped: boolean;
  eveMeasureBasis?: string | null;
  eveMeasurement?: number | null;
  eveResendBasis?: string | null;
}

export interface ExperimentResult {
  id: string;
  name: string;
  parameters: Record<string, unknown>;
  data: Record<string, unknown>[];
  analysis: string;
  completed: boolean;
  timestamp: string;
  usedBits?: QuantumBit[];
}

export interface ExperimentComponentProps {
  onSaveExperiment?: (result: ExperimentResult) => void;
}

export interface ExperimentParams {
  [key: string]: unknown;
  qubits?: number;
  noise?: number;
  step?: number;
  qubitRange?: [number, number];
  noiseRange?: [number, number];
  eavesDroppingRange?: [number, number];
  distanceRange?: [number, number];
  distance?: number;
  iterations?: number;
  basisSelection?: string;
}