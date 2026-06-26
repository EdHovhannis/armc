import { BackLink, Step, Stepper } from '@sds-eng/base';
import { useUnit } from 'effector-react';
import { FC } from 'react';
import { useNavigate } from 'react-router';

import { $stepperIndex, onChangeStepperIndex } from './model';
import * as styles from './styles.module.css';

const ArchivesEditStepper: FC = () => {
  const navigate = useNavigate();
  const [stepperIndex, onChangeStepperIndexFn] = useUnit([$stepperIndex, onChangeStepperIndex]);
  return (
    <div className={styles.archiveEditStepperWrapper}>
      <BackLink className={styles.archiveEditStepperBackLink} as="button" onClick={() => navigate('/archives')}>
        Архивы
      </BackLink>
      <Stepper activeStep={stepperIndex} clickable onChange={onChangeStepperIndexFn}>
        <Step index={0}>Название индекса</Step>
        <Step index={1}>Входные данные</Step>
        <Step index={2}>Квота</Step>
        <Step index={3}>Схема</Step>
        <Step index={4}>Предобработка</Step>
        <Step index={5}>Итог</Step>
      </Stepper>
    </div>
  );
};

export default ArchivesEditStepper;
