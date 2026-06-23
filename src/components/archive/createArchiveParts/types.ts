export interface EstimateTopic {
  project: string;
  name: string;
}

export interface EstimateData {
  speedBytes: number | null;
  sizeBytes: number | null;
  timeSec: number | null;
}
