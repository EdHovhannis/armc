import { Button } from '@sds-eng/base';
import { useUnit } from 'effector-react';
import { FC } from 'react';
import { useFormContext, useWatch } from 'react-hook-form';

import { $stepperIndex, onChangeStepperIndex } from '@src/Widgets/ArchiveEditStepper/model';

import { isKafkaSourcesFilled, isQuotaFilled } from '../lib/formValidation';

import * as styles from './styles.module.css';

const ArchiveEditFooter: FC = () => {
  const [stepperIndex, onChangeStepperIndexFn] = useUnit([$stepperIndex, onChangeStepperIndex]);
  const { control } = useFormContext();
  const [name, project] = useWatch({ control, name: ['name', 'project'] });
  const kafkaSources = useWatch({ control, name: 'source.kafka', defaultValue: [] }) as Array<{ project: string | null; name: string | null }>;
  const quota = useWatch({ control, name: 'quota', defaultValue: {} }) as {
    maxDataRateBytesPerSec?: number;
    maxSizeBytes?: number;
    maxStorageTimeSec?: number;
  };

  const isIndexNameStepValid = Boolean(String(name ?? '').trim()) && Boolean(project);
  const isInputDataStepValid = isKafkaSourcesFilled(kafkaSources ?? []);
  const isLimitsStepValid = isQuotaFilled(quota ?? {});
  const isNextDisabled =
    stepperIndex === 5 ||
    (stepperIndex === 0 && !isIndexNameStepValid) ||
    (stepperIndex === 1 && !isInputDataStepValid) ||
    (stepperIndex === 2 && !isLimitsStepValid);

  return (
    <div className={styles.archiveFooterWrapper}>
      <Button size="md" view="secondary" disabled={stepperIndex === 0} onClick={() => onChangeStepperIndexFn(stepperIndex - 1)}>
        Назад
      </Button>
      <Button size="md" view="primary" disabled={isNextDisabled} onClick={() => onChangeStepperIndexFn(stepperIndex + 1)}>
        Далее
      </Button>
    </div>
  );
};

export default ArchiveEditFooter;
