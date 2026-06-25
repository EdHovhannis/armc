import { Button } from '@sds-eng/base';
import { useUnit } from 'effector-react';
import { FC } from 'react';
import { useFormContext, useWatch } from 'react-hook-form';

import { $stepperIndex, onChangeStepperIndex } from '@src/Widgets/ArchiveEditStepper/model';

import * as styles from './styles.module.css';

const ArchiveEditFooter: FC = () => {
  const [stepperIndex, onChangeStepperIndexFn] = useUnit([$stepperIndex, onChangeStepperIndex]);
  const { control } = useFormContext();
  const [name, project] = useWatch({ control, name: ['name', 'project'] });

  const isIndexNameStepValid = Boolean(String(name ?? '').trim()) && Boolean(project);
  const isNextDisabled = stepperIndex === 5 || (stepperIndex === 0 && !isIndexNameStepValid);

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
