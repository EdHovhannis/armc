import * as _ from 'lodash';

import { SchemaArchive } from '../components/archive/ArchiveEditorForm';
import * as transformHelpers from '../components/processing/TransformArray/functions';
import { ITransformTableData, ITransformArray } from '../components/processing/TransformArray/types';
import {
  ArchivalPrimaryFieldType,
  ArchivalQuota,
  ArchivalStatus,
  ARCHIVE_TYPES,
  ArchiveInputFormatListEnum,
  ArchiveMessageFilterCondition,
  ArchiveProcessing,
  ArchiveSchema,
  ArchiveSource,
  ArchiveTask,
  Field,
  KafkaArchiveSource,
} from '../store/archive/Types';
import { KafkaTopic } from '../store/kafka/Types';
import { Project } from '../store/project/Types';

export class ArchiveUtils {
  static isFieldNameAvailableForFilter(name: string, processing: ArchiveProcessing): boolean {
    let res = true;
    if (processing.copyField) {
      res = res && !processing.copyField.some((copy) => copy.to.includes(name));
    }
    return res;
  }

  static isUniqCondition(messageFilterCondition: ArchiveMessageFilterCondition, processing: ArchiveProcessing): boolean {
    if (processing.messageFilter) {
      if (
        processing.messageFilter.condition.conditions.filter((cond) => {
          return (
            cond.value === messageFilterCondition.value &&
            cond.type === messageFilterCondition.type &&
            cond.field === messageFilterCondition.field &&
            cond.inverted === messageFilterCondition.inverted
          );
        }).length > 0
      ) {
        return false;
      }
    }
    return true;
  }

  static equalConditions(messageFilterCondition: ArchiveMessageFilterCondition, cond: ArchiveMessageFilterCondition): boolean {
    return (
      cond.value === messageFilterCondition.value &&
      cond.type === messageFilterCondition.type &&
      cond.field === messageFilterCondition.field &&
      cond.inverted === messageFilterCondition.inverted
    );
  }

  static isFieldNotUnique(name: string, schema: ArchiveSchema, processing: ArchiveProcessing) {
    let res: boolean = schema.fields.some((field) => field.name === name);
    if (processing && processing.copyField) {
      if (processing.copyField?.filter((node) => node.to[0] === name).length > 0) {
        res = true;
      }
    }
    return res;
  }

  static getEmptyArchive(): ArchiveTask {
    return {
      name: '',
      source: {
        kafka: [this.getEmptySource()],
        format: {
          type: ArchiveInputFormatListEnum.JSON,
          schemaName: null,
        },
      },
      processing: {
        copyField: [],
      },
      schema: {
        fields: [],
      },
      quota: {
        maxDataRateBytesPerSec: 0,
        maxSizeBytes: 0,
      },
      primaryTimeField: {
        type: ArchivalPrimaryFieldType.AUTOGENERATE,
      },
      labels: undefined,
    };
  }

  static getEmptySource(): KafkaArchiveSource {
    return {
      project: '',
      name: '',
    };
  }

  static getEmptyArchivalQuota(): ArchivalQuota {
    return {
      maxDataRateBytesPerSec: 0,
      currentDataRateBytesPerSec: 0,
      maxSizeBytes: 0,
      currentSizeBytes: 0,
    };
  }

  static getEmptyAutoSchema(): SchemaArchive {
    return {
      allFields: [],
    };
  }

  static isEqualQuota(quota1: ArchivalQuota, quota2: ArchivalQuota): boolean {
    return (
      quota1.maxDataRateBytesPerSec === quota2.maxDataRateBytesPerSec &&
      quota1.currentSizeBytes === quota2.currentSizeBytes &&
      quota1.maxSizeBytes === quota2.maxSizeBytes &&
      quota1.currentDataRateBytesPerSec === quota2.currentDataRateBytesPerSec
    );
  }

  static getEmptyMeta() {
    return {
      storage: {
        currentSizeBytes: 0,
        maxSizeBytes: 0,
      },
      indexing: {
        status: ArchivalStatus.UNDEFINED,
      },
    };
  }

  static getArchiveTaskInstanceStatusId(project: string, taskName: string, zoneId: string) {
    return `${project}-${taskName}-${zoneId}`;
  }

  static getArchiveTaskInstanceId(project: string, name: string, zoneId: string, instanceId?: string) {
    return `${project}-${name}-${zoneId}${instanceId ? `-${instanceId}` : ''}`;
  }

  static getArchiveTaskId(project: string, name: string) {
    return `${project}-${name}`;
  }

  static isFieldDate(field: Field) {
    return field.type === ARCHIVE_TYPES.DATE || field.subType === ARCHIVE_TYPES.DATE;
  }

  static convertTransformArrayToSchema(transformArray: ITransformArray['transformArray']): ArchiveSchema['fields'] {
    const transformArrayData = transformArray ?? [];

    const tableData: ITransformTableData[] = transformHelpers.getTransformTableData(transformArrayData);

    return transformHelpers.covertTransformToSchemaArchive(tableData);
  }

  /**
   * Функция преобразовывает processing.transformArray -> Archive['fields'] и фильтрует по subtype === ARCHIVE_TYPES.DATE
   * @param transformArray
   * @return массив ArchiveSchema['fields'] с subtype DATE
   */
  static getAllSubTypeDates(transformArray: ITransformArray['transformArray']): ArchiveSchema['fields'] {
    return this.convertTransformArrayToSchema(transformArray).filter((field) => field.subType === ARCHIVE_TYPES.DATE);
  }

  static getResultFields(schema: ArchiveSchema['fields'], transformArray: ITransformArray['transformArray']) {
    // удаляем id из fields
    const transformArrayFields = this.convertTransformArrayToSchema(transformArray ?? []).map((field) => ({
      name: field?.name,
      type: field?.type,
      subType: field?.subType,
      format: field?.format,
    }));
    return _.uniqBy(
      [...schema].concat(transformArrayFields).filter(({ ...el }) => ({ ...el })),
      'name',
    );
  }

  static removeIdAndFormats(transformArray: ITransformArray['transformArray']): ITransformArray['transformArray'] {
    return transformArray?.map((array) => ({
      sourceArrays: array.sourceArrays,
      targetConfig: array.targetConfig.map(({ id, format, ...props }) => ({ ...props })),
    }));
  }

  static removeProcessingFromSchema(schema: ArchiveSchema, transformArray: ITransformArray['transformArray']) {
    const transformArrayFields = this.convertTransformArrayToSchema(transformArray ?? []);

    const schemaHelper = _.cloneDeep(schema);
    schemaHelper.fields = schemaHelper.fields.filter((field) => {
      const isProcessingField = transformArrayFields.some(
        (processingField) =>
          processingField.name === field.name && processingField.type === field.type && processingField.subType === processingField.subType,
      );
      return !isProcessingField;
    });
    return schemaHelper;
  }

  static addPartitionsInSource(sources: ArchiveSource, topics: KafkaTopic[], projects: Project[]): ArchiveSource {
    const sourceHelper = _.cloneDeep(sources);
    if (!Array.isArray(sources.kafka)) {
      sourceHelper.kafka = [sourceHelper.kafka];
    }
    if (Array.isArray(sourceHelper.kafka)) {
      sourceHelper.kafka.map((kafkaSource) => {
        const projectId = projects.filter((project) => project.shortName === kafkaSource.project)[0]?.id;
        const topic = topics.filter((topic) => topic.name === kafkaSource.name && projectId === topic.projectId)[0];
        kafkaSource.partition = topic ? topic.partitions : 0;
      });
    }
    return sourceHelper;
  }

  static addIdsAndFormatsToTransformArray(
    transformArray: ITransformArray['transformArray'],
    schemaFields?: ArchiveSchema['fields'],
  ): ITransformArray['transformArray'] {
    return transformArray?.map((array) => ({
      ...array,
      targetConfig: array.targetConfig.map((target) => ({
        ...target,
        id: +transformHelpers.nanoid(4),
        format: schemaFields ? (schemaFields.find((fields) => fields.name === target.targetArray)?.format ?? target.format) : target.format,
      })),
    }));
  }

  static getTopicIds(kafka: KafkaArchiveSource[], topics: KafkaTopic[], projects: Project[]) {
    const sourcesIds = {};
    kafka.map(
      (source: KafkaArchiveSource) =>
        (sourcesIds[source.id as string] = topics.find((topic: KafkaTopic) => {
          const projectId = projects.find((project) => project.shortName === source.project)?.id;
          return projectId === topic.projectId && topic.name === source.name;
        })?.id),
    );
    return sourcesIds;
  }

  static isImportTaskValid(archiveTask: ArchiveTask) {
    return (
      archiveTask?.source !== undefined &&
      archiveTask?.source?.kafka.length > 0 &&
      archiveTask?.name !== undefined &&
      archiveTask?.quota !== undefined &&
      archiveTask?.schema !== undefined &&
      archiveTask?.primaryTimeField !== undefined
    );
  }
}
