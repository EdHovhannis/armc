import { Select, Text, TextField } from '@sds-eng/base';
import { useUnit } from 'effector-react';
import { FC, useEffect } from 'react';
import { Controller, useFormContext, useWatch } from 'react-hook-form';

import { fetchCurrentProjectLimitsFx } from '@src/Entities/Limits/api';
import { $currentProjectLimits } from '@src/Entities/Limits/model';
import { fetchProjectsFx } from '@src/Entities/Project/api';
import { $optionsProject } from '@src/Entities/Project/model';

import { onChangeArchiveEditName, onChangeArchiveEditProjectShortName } from '../model';

import { fetchArchiveIdFx } from './api';
import * as styles from './styles.module.css';

const StepIndexName: FC = () => {
  const { control, setValue } = useFormContext();
  const [optionsProject, loading, fetchProjectLimits, fetchArchiveId, currentProjectLimits] = useUnit([
    $optionsProject,
    fetchProjectsFx.pending,
    fetchCurrentProjectLimitsFx,
    fetchArchiveIdFx,
    $currentProjectLimits,
  ]);

  const name = useWatch({ control, name: 'name', defaultValue: '' }) as string;
  const projectShortName = useWatch({ control, name: 'projectShortName', defaultValue: '' }) as string;

  useEffect(() => {
    fetchProjectsFx();
  }, []);

  useEffect(() => {
    onChangeArchiveEditName(name?.trim() ?? '');
  }, [name]);

  useEffect(() => {
    onChangeArchiveEditProjectShortName(projectShortName ?? '');
  }, [projectShortName]);

  useEffect(() => {
    const projectValue = projectShortName?.trim() ?? '';
    const selectedProject = optionsProject.find((item) => item.value === projectValue);
    setValue('projectName', selectedProject?.name ?? projectValue);
  }, [projectShortName, optionsProject, setValue]);

  useEffect(() => {
    setValue('availableQuota', currentProjectLimits);
  }, [currentProjectLimits, setValue]);

  useEffect(() => {
    const projectValue = projectShortName?.trim();
    const nameValue = name?.trim();
    if (!projectValue) return;

    fetchProjectLimits(projectValue);

    if (nameValue) {
      fetchArchiveId({ project: projectValue, name: nameValue });
    }
  }, [projectShortName, name, fetchProjectLimits, fetchArchiveId]);

  return (
    <div className={styles.archiveStepWrapper}>
      <div className={styles.archiveStepItemWrapper}>
        <Text as="h5" kind="h5b">
          Название
        </Text>
        <Controller
          name="name"
          control={control}
          rules={{}}
          render={({ field }) => <TextField placeholder="Введите значение" required {...field} />}
        />
      </div>
      <div className={styles.archiveStepItemWrapper}>
        <Text as="h5" kind="h5b">
          Проект
        </Text>
        <Controller
          name="projectShortName"
          control={control}
          rules={{}}
          render={({ field }) => {
            const currentValue = optionsProject.find((item) => item.value === field.value) || null;
            return (
              <Select
                defaultValue={null}
                placeholder="Выберите значение"
                options={optionsProject}
                canClear
                isSearchable
                loading={loading}
                limitByWidth
                required
                {...field}
                value={currentValue}
              />
            );
          }}
        />
      </div>
    </div>
  );
};

export default StepIndexName;
