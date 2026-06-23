export interface UnimonProjectQuota {
  limitTrafficPerMin: number;
  currentUtilization: number;
  overdraftMinutes: number;
  overdraftPercent: number;
}

export interface UnimonProjectRequestQuota {
  limitTrafficPerMin: number;
  overdraftMinutes: number;
  overdraftPercent: number;
}
