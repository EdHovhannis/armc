import { useUnit } from 'effector-react';
import { FC, useEffect } from 'react';
import { FormProvider, useForm } from 'react-hook-form';
import { useSearchParams } from 'react-router';

import { fetchArchiveConfigFx } from '@src/Entities/Archives/api';

import ArchivesEditStepper from '@src/Widgets/ArchiveEditStepper';
import { $stepperIndex } from '@src/Widgets/ArchiveEditStepper/model';
import DrawerRestriction from '@src/Widgets/Header/DrawerRestriction';

import { ARCHIVE_EDIT_DEFAULT_VALUES } from './constants';
import { mapArchiveConfigToFormValues } from './lib/mapArchiveConfigToFormValues';
import ArchiveEditFooter from './Steps/Footer';
import StepIndexName from './Steps/StepIndexName';
import StepInputData from './Steps/StepInputData';
import StepLimits from './Steps/StepLimits';
import StepPreprocessing from './Steps/StepPreprocessing';
import StepResult from './Steps/StepResult';
import StepSchema from './Steps/StepSchema';
import * as styles from './styles.module.css';
import { ArchiveEditFormValues } from './types';

const ArchivesEditContentPage: FC = () => {
  const [stepperIndex] = useUnit([$stepperIndex]);
  const [searchParams] = useSearchParams();
  const methods = useForm<ArchiveEditFormValues>({ mode: 'onBlur', defaultValues: ARCHIVE_EDIT_DEFAULT_VALUES });
  const project = searchParams.get('project')?.trim();
  const name = searchParams.get('name')?.trim();

  useEffect(() => {
    if (!project || !name) {
      methods.reset(ARCHIVE_EDIT_DEFAULT_VALUES);
      return;
    }

    fetchArchiveConfigFx({ project, taskName: name })
      .then((response) => methods.reset(mapArchiveConfigToFormValues(response.data, project)))
      .catch(() => undefined);
  }, [methods, name, project]);

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
