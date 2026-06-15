import { useUnit } from 'effector-react';
import { FC } from 'react';
import { FormProvider, useForm } from 'react-hook-form';

import ArchivesEditStepper from '@src/Widgets/ArchiveEditStepper';
import { $stepperIndex } from '@src/Widgets/ArchiveEditStepper/model';
import DrawerRestriction from '@src/Widgets/Header/DrawerRestriction';

import ArchiveEditFooter from './Steps/Footer';
import StepIndexName from './Steps/StepIndexName';
import StepInputData from './Steps/StepInputData';
import * as styles from './styles.module.css';

const ArchivesEditContentPage: FC = () => {
  const [stepperIndex] = useUnit([$stepperIndex]);
  const methods = useForm({ mode: 'onBlur' });
  // eslint-disable-next-line react-hooks/incompatible-library
  const currentValue = methods.watch();
  console.log(currentValue, 'currentValue');
  return (
    <>
      <FormProvider {...methods}>
        <div className={styles.archiveEditPageWrapper}>
          <ArchivesEditStepper />
          {stepperIndex === 0 && <StepIndexName />}
          {stepperIndex === 1 && <StepInputData />}
          <ArchiveEditFooter />
        </div>
      </FormProvider>
      <DrawerRestriction />
    </>
  );
};

export default ArchivesEditContentPage;
