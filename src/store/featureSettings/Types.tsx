export interface CurrentFeatureSettings {
  feature: string;
  setting: string;
  project?: string;
  user?: string;
  value: boolean;
}

export interface GetCurrentFeatureSettingsValueParams {
  setting: string;
  feature: string;
  project?: string;
  user?: string;
}

export interface GetCurrentFeatureSettingsValueResponse {
  value: 'true' | 'false';
}
