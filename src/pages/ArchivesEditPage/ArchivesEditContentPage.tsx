import { GlobalSpinner } from '@pvm-ui/kit';
import { useUnit } from 'effector-react';
import { FC, useEffect, useRef, useState } from 'react';
import { FormProvider, useForm } from 'react-hook-form';
import { useSearchParams } from 'react-router';

import { fetchArchiveConfigFx } from '@src/Entities/Archives/api';

import ArchivesEditStepper from '@src/Widgets/ArchiveEditStepper';
import { $stepperIndex, onResetStepperIndex } from '@src/Widgets/ArchiveEditStepper/model';
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
import {
  $archiveEditImportedConfig,
  onChangeArchiveEditName,
  onChangeArchiveEditProjectShortName,
  onResetArchiveEditImportedConfig,
} from './model';
import { ArchiveEditFormValues } from './types';
import * as styles from './styles.module.css';

const ArchivesEditContentPage: FC = () => {
  const [searchParams] = useSearchParams();
  const editProject = searchParams.get('project')?.trim() ?? '';
  const editName = searchParams.get('name')?.trim() ?? '';
  const isEditMode = Boolean(editProject && editName);

  const [stepperIndex, importedConfig, resetStepperIndex, resetImportedConfig, fetchArchiveConfig, setArchiveEditName, setArchiveEditProject] =
    useUnit([
      $stepperIndex,
      $archiveEditImportedConfig,
      onResetStepperIndex,
      onResetArchiveEditImportedConfig,
      fetchArchiveConfigFx,
      onChangeArchiveEditName,
      onChangeArchiveEditProjectShortName,
    ]);
  const methods = useForm<ArchiveEditFormValues>({
    mode: 'onBlur',
    defaultValues: ARCHIVE_EDIT_DEFAULT_VALUES,
  });
  const { reset } = methods;
  const initializedKeyRef = useRef<string | null>(null);
  const [isFormReady, setIsFormReady] = useState(!isEditMode);

  const syncArchiveEditMeta = (values: ArchiveEditFormValues) => {
    setArchiveEditName(values.name?.trim() ?? '');
    setArchiveEditProject(values.projectShortName ?? '');
  };

  useEffect(() => {
    resetStepperIndex();

    return () => {
      resetStepperIndex();
      resetImportedConfig();
      initializedKeyRef.current = null;
    };
  }, [resetStepperIndex, resetImportedConfig]);

  useEffect(() => {
    const configKey = isEditMode
      ? `edit:${editProject}:${editName}`
      : importedConfig
        ? `import:${importedConfig.name}:${importedConfig.source.kafka[0]?.project ?? ''}`
        : 'create';

    if (initializedKeyRef.current === configKey) {
      return;
    }

    if (isEditMode) {
      setIsFormReady(false);

      void fetchArchiveConfig({ project: editProject, taskName: editName })
        .then((response) => {
          const formValues = mapArchiveConfigToFormValues(response.data, editProject);
          reset(formValues);
          syncArchiveEditMeta(formValues);
          initializedKeyRef.current = configKey;
          setIsFormReady(true);
        })
        .catch(() => {
          initializedKeyRef.current = configKey;
          setIsFormReady(true);
        });

      return;
    }

    if (importedConfig) {
      const projectShortName = importedConfig.source.kafka[0]?.project ?? '';
      const formValues = mapArchiveConfigToFormValues(importedConfig, projectShortName);
      reset(formValues);
      syncArchiveEditMeta(formValues);
      resetImportedConfig();
      initializedKeyRef.current = configKey;
      setIsFormReady(true);
      return;
    }

    reset(ARCHIVE_EDIT_DEFAULT_VALUES);
    syncArchiveEditMeta(ARCHIVE_EDIT_DEFAULT_VALUES);
    initializedKeyRef.current = configKey;
    setIsFormReady(true);
  }, [editProject, editName, importedConfig, isEditMode, reset, fetchArchiveConfig, resetImportedConfig, setArchiveEditName, setArchiveEditProject]);

  if (!isFormReady) {
    return <GlobalSpinner />;
  }

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
