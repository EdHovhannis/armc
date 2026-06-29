import { Button, notification } from '@sds-eng/base';
import { useUnit } from 'effector-react';
import { FC } from 'react';
import { useFormContext } from 'react-hook-form';
import { useNavigate } from 'react-router';

import ROUTES from '@src/Shared/constants/routes';

import { createArchiveFx } from '@src/Entities/Archives/api';

import { $stepperIndex, onChangeStepperIndex } from '@src/Widgets/ArchiveEditStepper/model';
import { isNextStepDisabled, useArchiveEditFormValidation } from '@src/Widgets/ArchiveEditStepper/useArchiveEditFormValidation';

import { buildCreateArchivePayload } from '../lib/buildCreateArchivePayload';
import { ArchiveEditFormValues } from '../types';

import * as styles from './styles.module.css';

const ArchiveEditFooter: FC = () => {
  const navigate = useNavigate();
  const { handleSubmit } = useFormContext<ArchiveEditFormValues>();
  const [stepperIndex, onChangeStepperIndexFn, isCreating] = useUnit([$stepperIndex, onChangeStepperIndex, createArchiveFx.pending]);
  const validation = useArchiveEditFormValidation();
  const isNextDisabled = isNextStepDisabled(stepperIndex, validation);
  const isResultStep = stepperIndex === 5;

  const onCreate = handleSubmit((values) => {
    createArchiveFx({
      project: values.projectShortName,
      body: buildCreateArchivePayload(values),
    })
      .then(() => {
        notification({ title: 'Конфигурация создана', status: 'success' });
        navigate(ROUTES.ARCHIVES);
      })
      .catch(() => undefined);
  });

  return (
    <div className={styles.archiveFooterWrapper}>
      <Button size="md" view="secondary" disabled={stepperIndex === 0 || isCreating} onClick={() => onChangeStepperIndexFn(stepperIndex - 1)}>
        Назад
      </Button>
      {isResultStep ? (
        <Button size="md" view="primary" isLoading={isCreating} onClick={onCreate}>
          Создать
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
