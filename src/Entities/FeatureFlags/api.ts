import { AxiosError, AxiosResponse } from 'axios';
import { createEffect } from 'effector';

import { axios } from '@src/Shared/api/axios';
import { AxiosResponseError } from '@src/Shared/api/types';

import { GetCurrentFeatureSettingsValueParams } from './types';

export const fetchFeatureFlagFx = createEffect<
  GetCurrentFeatureSettingsValueParams,
  AxiosResponse<{ value: string }>,
  AxiosError<AxiosResponseError>
>(async (params) => axios.get('/v1/feature-settings/value', { params }));
