import { useUnit } from 'effector-react';
import { FC } from 'react';
import { FormProvider, useForm } from 'react-hook-form';

import ArchivesEditStepper from '@src/Widgets/ArchiveEditStepper';
import { $stepperIndex } from '@src/Widgets/ArchiveEditStepper/model';
import DrawerRestriction from '@src/Widgets/Header/DrawerRestriction';

import { ARCHIVE_EDIT_DEFAULT_VALUES } from './constants';
import ArchiveEditFooter from './Steps/Footer';
import { ArchiveEditFormValues } from './types';
import StepIndexName from './Steps/StepIndexName';
import StepInputData from './Steps/StepInputData';
import StepLimits from './Steps/StepLimits';
import StepPreprocessing from './Steps/StepPreprocessing';
import StepSchema from './Steps/StepSchema';
import * as styles from './styles.module.css';

const ArchivesEditContentPage: FC = () => {
  const [stepperIndex] = useUnit([$stepperIndex]);
  const methods = useForm<ArchiveEditFormValues>({ mode: 'onBlur', defaultValues: ARCHIVE_EDIT_DEFAULT_VALUES });
  return (
    <>
      <FormProvider {...methods}>
        <div className={styles.archiveEditPageWrapper}>
          <ArchivesEditStepper />
          {stepperIndex === 0 && <StepIndexName />}
          {stepperIndex === 1 && <StepInputData />}
          {stepperIndex === 2 && <StepLimits />}
          {stepperIndex === 3 && <StepSchema />}
          {stepperIndex === 4 && <StepPreprocessing />}
          <ArchiveEditFooter />
        </div>
      </FormProvider>
      <DrawerRestriction />
    </>
  );
};

export default ArchivesEditContentPage;
