import { Button, Checkbox, clsx, Icon, LabelControl, Segment, SegmentGroup, Select, Text } from '@sds-eng/base';
import { useUnit } from 'effector-react';
import { FC, useEffect } from 'react';
import { Controller, useFieldArray, useFormContext } from 'react-hook-form';

import { INPUTS_FORMAT } from '@src/Shared/constants/common';
import { components } from '@src/Shared/ui/VirtualizedList';

import { fetchCurrentTopicInfoFx, fetchTopicsFx } from '@src/Entities/Topic/api';
import { $optionsTopic } from '@src/Entities/Topic/model';

import AceEditor from '@src/Widgets/AceEditor';

import * as styles from './styles.module.css';

const MOCK = [
  {
    traceId: '6ebbf57235d128cc',
    parentId: null,
    id: '6ebbf57235d128cc',
    kind: 'SERVER',
    name: 'get',
    timestamp: 1684834626187,
    duration: 220,
    localService: 'none',
  },
  {
    traceId: '6ebbf57235d128cc',
    parentId: null,
    id: '6ebbf57235d128cc',
    kind: 'SERVER',
    name: 'get',
    timestamp: 1684834626187,
    duration: 220,
    localService: 'none',
  },
  {
    traceId: '6ebbf57235d128cc',
    parentId: null,
    id: '6ebbf57235d128cc',
    kind: 'SERVER',
    name: 'get',
    timestamp: 1684834626187,
    duration: 220,
    localService: 'none',
  },
  {
    traceId: '6ebbf57235d128cc',
    parentId: null,
    id: '6ebbf57235d128cc',
    kind: 'SERVER',
    name: 'get',
    timestamp: 1684834626187,
    duration: 220,
    localService: 'none',
  },
  {
    traceId: '6ebbf57235d128cc',
    parentId: null,
    id: '6ebbf57235d128cc',
    kind: 'SERVER',
    name: 'get',
    timestamp: 1684834626187,
    duration: 220,
    localService: 'none',
  },
];

const StepInputData: FC = () => {
  const { control } = useFormContext();
  const { fields, append, remove } = useFieldArray({ name: 'source.kafka', control });
  const [optionsTopic, loadingTopics, loadingTopicInfo, fetchCurrentTopicInfo] = useUnit([
    $optionsTopic,
    fetchTopicsFx.pending,
    fetchCurrentTopicInfoFx.pending,
    fetchCurrentTopicInfoFx,
  ]);

  useEffect(() => {
    if (fields.length === 0) {
      append({ project: null, name: null });
    }
  }, [fields.length, append]);

  return (
    <>
      <div className={styles.archiveStepWrapper}>
        <div className={styles.archiveStepInputDataTopic}>
          <Text as="h5" kind="h5b">
            Источник данных
          </Text>
          {fields.map((item, index) => (
            <Controller
              key={item.id}
              name={`source.kafka.${index}`}
              control={control}
              defaultValue={{ project: null, name: null }}
              rules={{}}
              render={({ field: { value, onChange, ...rest } }) => {
                const currentValue = optionsTopic.find((topic) => topic.value === `${value.project}/${value.name}`) || null;
                return (
                  <div className={styles.archiveStepInputDataTopicWrapper}>
                    <Select
                      placeholder="Выберите значение"
                      options={optionsTopic}
                      isSearchable
                      loading={loadingTopics}
                      limitByWidth
                      components={components}
                      value={currentValue}
                      required
                      onChange={(v) => {
                        const arr = v.split('/');
                        const project = arr[0] || null;
                        const name = arr[1] || null;
                        onChange({ project, name });
                      }}
                      {...rest}
                    />
                    <Button
                      icon={<Icon.VisibleShow />}
                      view="secondary"
                      kind="ghost"
                      contentType="Icon"
                      size="sm"
                      isLoading={loadingTopicInfo}
                      disabled={!currentValue?.id}
                      onClick={() => (currentValue?.id ? fetchCurrentTopicInfo(currentValue.id) : {})}
                    />
                    <Button icon={<Icon.Delete />} view="negative" kind="ghost" contentType="Icon" size="sm" onClick={() => remove(index)} />
                  </div>
                );
              }}
            />
          ))}
          <Button
            kind="ghost"
            size="sm"
            prefixIcon={<Icon.Plus />}
            className={styles.archiveStepInputDataTopicButton}
            onClick={() => append({ project: null, name: null })}
          >
            источник
          </Button>
        </div>
        <div className={clsx(styles.archiveStepItemWrapper, styles.archiveStepInputDataSegment)}>
          <Text as="h5" kind="h5b">
            Формат данных
          </Text>
          <Controller
            name="source.format.type"
            control={control}
            defaultValue="JSON"
            render={({ field }) => (
              <SegmentGroup {...field} size="md" classes={{ root: styles.archiveStepInputDataSegment }}>
                {INPUTS_FORMAT.map((inputFormat) => (
                  <Segment
                    key={inputFormat}
                    value={inputFormat}
                    classes={{ root: styles.archiveStepInputDataSegment, segment: styles.archiveStepInputDataSegmentText }}
                  >
                    {inputFormat}
                  </Segment>
                ))}
              </SegmentGroup>
            )}
          />
        </div>
        <div>
          <Controller
            name="flatten"
            control={control}
            defaultValue={false}
            render={({ field: { value, onChange, ...rest } }) => (
              <LabelControl label="Flatten" checked={value} onChange={() => onChange(!value)} {...rest} control={<Checkbox />} />
            )}
          />
        </div>
      </div>
      <div>
        <AceEditor id="step-input-data" value={JSON.stringify(MOCK, null, 2)} />
      </div>
    </>
  );
};

export default StepInputData;
