import { Button } from '@sds-eng/base';
import { useUnit } from 'effector-react';
import { FC } from 'react';

import { $stepperIndex, onChangeStepperIndex } from '@src/Widgets/ArchiveEditStepper/model';

import { isNextStepDisabled, useArchiveEditFormValidation } from '@src/Widgets/ArchiveEditStepper/useArchiveEditFormValidation';

import * as styles from './styles.module.css';

const ArchiveEditFooter: FC = () => {
  const [stepperIndex, onChangeStepperIndexFn] = useUnit([$stepperIndex, onChangeStepperIndex]);
  const validation = useArchiveEditFormValidation();
  const isNextDisabled = isNextStepDisabled(stepperIndex, validation);

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
