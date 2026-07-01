import { useUnit } from 'effector-react';
import { FC, useEffect, useRef } from 'react';
import { FormProvider, useForm } from 'react-hook-form';
import { useSearchParams } from 'react-router';

import { fetchArchiveConfigFx } from '@src/Entities/Archives/api';

import ArchivesEditStepper from '@src/Widgets/ArchiveEditStepper';
import { $stepperIndex } from '@src/Widgets/ArchiveEditStepper/model';
import DrawerRestriction from '@src/Widgets/Header/DrawerRestriction';

import ArchiveEditFooter from './Steps/Footer';
import StepIndexName from './Steps/StepIndexName';
import StepInputData from './Steps/StepInputData';
import StepLimits from './Steps/StepLimits';
import StepPreprocessing from './Steps/StepPreprocessing';
import StepResult from './Steps/StepResult';
import StepSchema from './Steps/StepSchema';
import { ARCHIVE_EDIT_DEFAULT_VALUES } from './constants';
import { mapArchiveConfigToFormValues } from './lib/mapArchiveConfigToFormValues';
import { $archiveEditImportedConfig, onResetArchiveEditImportedConfig } from './model';
import * as styles from './styles.module.css';
import { ArchiveEditFormValues } from './types';

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
          {stepperIndex === 2 && <StepLimits />}
          {stepperIndex === 3 && <StepSchema />}
          {stepperIndex === 4 && <StepPreprocessing />}
          {stepperIndex === 5 && <StepResult />}
          <ArchiveEditFooter />
        </div>
      </FormProvider>
      <DrawerRestriction />
    </>
  );
};

export default ArchivesEditContentPage;
