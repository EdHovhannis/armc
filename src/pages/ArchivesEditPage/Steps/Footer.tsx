import { Button, notification } from '@sds-eng/base';
import { useUnit } from 'effector-react';
import { FC } from 'react';
import { useFormContext } from 'react-hook-form';
import { useNavigate, useSearchParams } from 'react-router';

import ROUTES from '@src/Shared/constants/routes';

import { createArchiveFx, updateArchiveFx } from '@src/Entities/Archives/api';

import { $stepperIndex, onChangeStepperIndex } from '@src/Widgets/ArchiveEditStepper/model';
import { isNextStepDisabled, useArchiveEditFormValidation } from '@src/Widgets/ArchiveEditStepper/useArchiveEditFormValidation';

import { buildCreateArchivePayload } from '../lib/buildCreateArchivePayload';
import { ArchiveEditFormValues } from '../types';

import * as styles from './styles.module.css';

const ArchiveEditFooter: FC = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { handleSubmit } = useFormContext<ArchiveEditFormValues>();
  const [stepperIndex, onChangeStepperIndexFn, isCreating, isUpdating] = useUnit([
    $stepperIndex,
    onChangeStepperIndex,
    createArchiveFx.pending,
    updateArchiveFx.pending,
  ]);
  const validation = useArchiveEditFormValidation();
  const isNextDisabled = isNextStepDisabled(stepperIndex, validation);
  const isResultStep = stepperIndex === 5;
  const editProject = searchParams.get('project')?.trim();
  const editName = searchParams.get('name')?.trim();
  const isEditMode = Boolean(editProject && editName);
  const isSaving = isCreating || isUpdating;

  const onSave = handleSubmit((values) => {
    const body = buildCreateArchivePayload(values);
    const request =
      isEditMode && editProject && editName
        ? updateArchiveFx({ project: editProject, taskName: editName, body })
        : createArchiveFx({
            project: values.projectShortName,
            body,
          });

    request
      .then(() => {
        notification({ title: isEditMode ? 'Конфигурация сохранена' : 'Конфигурация создана', status: 'success' });
        navigate(ROUTES.ARCHIVES);
      })
      .catch(() => undefined);
  });

  return (
    <div className={styles.archiveFooterWrapper}>
      <Button size="md" view="secondary" disabled={stepperIndex === 0 || isSaving} onClick={() => onChangeStepperIndexFn(stepperIndex - 1)}>
        Назад
      </Button>
      {isResultStep ? (
        <Button size="md" view="primary" isLoading={isSaving} onClick={onSave}>
          {isEditMode ? 'Сохранить' : 'Создать'}
        </Button>
      ) : (
        <Button size="md" view="primary" disabled={isNextDisabled} onClick={() => onChangeStepperIndexFn(stepperIndex + 1)}>
          Далее
        </Button>
      )}
    </div>
  );
};

export default ArchiveEditFooter;
