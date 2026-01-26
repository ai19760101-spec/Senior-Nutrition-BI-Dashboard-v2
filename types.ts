
export interface MNAData {
  date: string;
  score: number;
  weight: number;
}

export interface AnthropometricData {
  label: string;
  value: number;
  min: number;
  max: number;
  thresholds: number[];
  unit: string;
}

export interface RadarData {
  subject: string;
  value: number;
  fullMark: number;
}
