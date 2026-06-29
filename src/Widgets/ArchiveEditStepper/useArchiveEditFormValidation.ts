import { useMemo } from 'react';
import { useFormContext, useWatch } from 'react-hook-form';

import { isKafkaSourcesFilled, isQuotaFilled } from './formValidation';

export type ArchiveEditFormValidation = {
  isIndexNameStepValid: boolean;
  isInputDataStepValid: boolean;
  isLimitsStepValid: boolean;
};

export const isStepValid = (stepIndex: number, validation: ArchiveEditFormValidation): boolean => {
  switch (stepIndex) {
    case 0:
      return validation.isIndexNameStepValid;
    case 1:
      return validation.isInputDataStepValid;
    case 2:
      return validation.isLimitsStepValid;
    default:
      return true;
  }
};

export const isNextStepDisabled = (stepIndex: number, validation: ArchiveEditFormValidation): boolean =>
  stepIndex === 5 ||
  (stepIndex === 0 && !validation.isIndexNameStepValid) ||
  (stepIndex === 1 && !validation.isInputDataStepValid) ||
  (stepIndex === 2 && !validation.isLimitsStepValid);

export const canNavigateToStep = (fromStep: number, toStep: number, validation: ArchiveEditFormValidation): boolean => {
  if (toStep <= fromStep) return true;

  for (let step = fromStep; step < toStep; step++) {
    if (!isStepValid(step, validation)) return false;
  }

  return true;
};

export const useArchiveEditFormValidation = (): ArchiveEditFormValidation => {
  const { control } = useFormContext();
  const [name, projectShortName] = useWatch({ control, name: ['name', 'projectShortName'] });
  const kafkaSources = useWatch({ control, name: 'source.kafka', defaultValue: [] }) as Array<{ project: string | null; name: string | null }>;
  const quota = useWatch({ control, name: 'quota', defaultValue: {} }) as {
    maxDataRateBytesPerSec?: number;
    maxSizeBytes?: number;
    maxStorageTimeSec?: number;
  };

  return useMemo(
    () => ({
      isIndexNameStepValid: Boolean(String(name ?? '').trim()) && Boolean(projectShortName),
      isInputDataStepValid: isKafkaSourcesFilled(kafkaSources ?? []),
      isLimitsStepValid: isQuotaFilled(quota ?? {}),
    }),
    [name, projectShortName, kafkaSources, quota],
  );
};
