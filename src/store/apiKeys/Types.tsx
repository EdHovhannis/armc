import { string } from 'prop-types';

export interface APIkeyInfo {
  user: string;
  description: string;
  key: string;
  createdAt: string;
  expiredAt: string;
}

export interface TimeToLive {
  unit: string;
  value: number;
}

export interface APIkeyParameters {
  description: string;
  timeToLive: TimeToLive;
}

export interface APIkeyParametersWithUser {
  user: string;
  params: APIkeyParameters;
}
