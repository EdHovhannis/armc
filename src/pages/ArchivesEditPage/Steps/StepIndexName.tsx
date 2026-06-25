import { Select, Text, TextField } from '@sds-eng/base';
import { useUnit } from 'effector-react';
import { FC, useEffect } from 'react';
import { Controller, useFormContext, useWatch } from 'react-hook-form';

import { components } from '@src/Shared/ui/VirtualizedList';

import { fetchCurrentProjectLimitsFx } from '@src/Entities/Limits/api';
import { fetchProjectsFx } from '@src/Entities/Project/api';
import { $optionsProject } from '@src/Entities/Project/model';

import { fetchArchiveIdFx } from './api';
import * as styles from './styles.module.css';

const StepIndexName: FC = () => {
  const { control } = useFormContext();
  const [optionsProject, loading, fetchProjectLimits, fetchArchiveId] = useUnit([
    $optionsProject,
    fetchProjectsFx.pending,
    fetchCurrentProjectLimitsFx,
    fetchArchiveIdFx,
  ]);

  const name = useWatch({ control, name: 'name', defaultValue: '' }) as string;
  const project = useWatch({ control, name: 'project', defaultValue: '' }) as string;

  useEffect(() => {
    const projectValue = project?.trim();
    const nameValue = name?.trim();
    if (!projectValue) return;

    fetchProjectLimits(projectValue);

    if (nameValue) {
      fetchArchiveId({ project: projectValue, name: nameValue });
    }
  }, [project, name, fetchProjectLimits, fetchArchiveId]);

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
          name="project"
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
                components={components}
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
