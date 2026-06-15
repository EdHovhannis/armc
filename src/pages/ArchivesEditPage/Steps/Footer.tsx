import { Button } from '@sds-eng/base';
import { useUnit } from 'effector-react';
import { FC } from 'react';

import { $stepperIndex, onChangeStepperIndex } from '@src/Widgets/ArchiveEditStepper/model';

import * as styles from './styles.module.css';

const ArchiveEditFooter: FC = () => {
  const [stepperIndex, onChangeStepperIndexFn] = useUnit([$stepperIndex, onChangeStepperIndex]);
  return (
    <div className={styles.archiveFooterWrapper}>
      <Button size="md" view="secondary" disabled={stepperIndex === 0} onClick={() => onChangeStepperIndexFn(stepperIndex - 1)}>
        Назад
      </Button>
      <Button size="md" view="primary" disabled={stepperIndex === 5} onClick={() => onChangeStepperIndexFn(stepperIndex + 1)}>
        Далее
      </Button>
    </div>
  );
};

export default ArchiveEditFooter;
