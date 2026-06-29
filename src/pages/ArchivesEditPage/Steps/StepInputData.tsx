import { Button, Checkbox, clsx, Icon, LabelControl, Segment, SegmentGroup, Select, Text } from '@sds-eng/base';
import { useUnit } from 'effector-react';
import { FC, useEffect, useMemo } from 'react';
import { Controller, useFieldArray, useFormContext, useWatch } from 'react-hook-form';

import { INPUTS_FORMAT } from '@src/Shared/constants/common';

import { fetchCurrentTopicInfoFx, fetchTopicsFx } from '@src/Entities/Topic/api';
import { $optionsTopic, $topicMessages } from '@src/Entities/Topic/model';

import AceEditor from '@src/Widgets/AceEditor';

import * as styles from './styles.module.css';

const StepInputData: FC = () => {
  const { control } = useFormContext();
  const { fields, append, remove } = useFieldArray({ name: 'source.kafka', control });
  const [optionsTopic, loadingTopics, loadingTopicInfo, fetchCurrentTopicInfo, topicMessages] = useUnit([
    $optionsTopic,
    fetchTopicsFx.pending,
    fetchCurrentTopicInfoFx.pending,
    fetchCurrentTopicInfoFx,
    $topicMessages,
  ]);
  const currentValues = useWatch({ name: 'source.kafka', defaultValue: [] }) as Array<{ project: string; name: string }>;

  const currentOptions = useMemo(() => {
    const arr = optionsTopic.filter((item) => {
      const currentItem = currentValues.find((value) => `${value.project}/${value.name}` === item.value);
      return !currentItem;
    });
    return arr;
  }, [currentValues, optionsTopic]);

  useEffect(() => {
    fetchTopicsFx();
  }, []);

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
                      options={currentOptions}
                      isSearchable
                      loading={loadingTopics}
                      limitByWidth
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
        <AceEditor id="step-input-data" value={JSON.stringify(topicMessages, null, 2)} />
      </div>
    </>
  );
};

export default StepInputData;
