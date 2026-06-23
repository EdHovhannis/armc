import * as _ from 'lodash';

import { SchemaIndex } from '../components/index/CreateIndexPage';
import * as transformHelpers from '../components/processing/TransformArray/functions';
import { ITransformArray, ITransformData, ITransformTableData } from '../components/processing/TransformArray/types';
import { ARCHIVE_TYPES } from '../store/archive/Types';
import { KafkaTopic } from '../store/kafka/Types';
import {
  Field,
  MessageFilterCondition,
  Pipeline,
  PIPELINE_TYPES,
  PipelineMeta,
  ProcessingPipeline,
  SchemaPipeline,
  SourcesPipeline,
  TimestampNode,
} from '../store/pipeline/Types';
import { Project } from '../store/project/Types';

export class PipelineUtils {
  static isFieldNotUnique(name: string, schema: SchemaPipeline): boolean {
    let res: boolean = schema.fields.some((field) => field.name === name);
    if (schema.dynamicFields != null && schema.dynamicFields?.length != 0) {
      res = res && schema.dynamicFields.some((field) => field.name === name);
    }
    return res;
  }

  static isFieldNameAvailableForFilter(name: string, processing: ProcessingPipeline): boolean {
    let res = true;
    if (processing.copyFieldParams) {
      res = res && !processing.copyFieldParams.some((copy) => copy.toFields.includes(name));
    }
    if (processing.addCurrentTimeParams) {
      res = res && !processing.addCurrentTimeParams.some((addTime) => addTime.toField === name);
    }
    if (processing.generateUuidParams) {
      res = res && !processing.generateUuidParams.some((generateUuid) => generateUuid.toField === name);
    }
    return res;
  }

  static isUniqCondition(messageFilterCondition: MessageFilterCondition, processing: ProcessingPipeline): boolean {
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

  static equalConditions(messageFilterCondition: MessageFilterCondition, cond: MessageFilterCondition): boolean {
    return (
      cond.value === messageFilterCondition.value &&
      cond.type === messageFilterCondition.type &&
      cond.field === messageFilterCondition.field &&
      cond.inverted === messageFilterCondition.inverted
    );
  }

  static createTimestampNode(field: string, autoSchema: SchemaIndex): TimestampNode {
    const timestampNode: TimestampNode = {
      field: field,
      outputTimezone: 'UTC',
      outputFormat: "yyyy-MM-dd'T'HH:mm:ss.SSSZ",
      inputTimezone: 'UTC',
      inputFormats: [],
    };
    autoSchema.timestampFields.filter((tField) => {
      return tField.name === field;
    }).length !== 0
      ? (timestampNode.inputFormats = autoSchema.timestampFields
          .filter((tField) => {
            return tField.name === field;
          })
          .map((field) => {
            return field.format;
          }))
      : null;
    return timestampNode;
  }

  static createEmptyMeta(): PipelineMeta {
    return {
      storage: {
        docNum: 0,
        currentSizeBytes: 0,
        maxSizeBytes: 0,
      },
      indexing: {
        status: 'UNDEFINED',
      },
    };
  }

  static isFieldDate(field: Field) {
    return field.fieldType === PIPELINE_TYPES.DATE || field.subType === PIPELINE_TYPES.DATE;
  }

  static getAllTransformArrayFields(data: ITransformTableData[]): ITransformData[] {
    const fields = transformHelpers.getAllPropsByKey<ITransformTableData>(data, 'fields') as ITransformData[][];

    let linearFields: ITransformData[] = [];

    fields.forEach((array) => {
      linearFields = linearFields.concat(array);
    });

    return linearFields;
  }

  static getAllTransformArrayDateFields(data: ITransformTableData[]): ITransformData[] {
    return this.getAllTransformArrayFields(data).filter((field) => field.type === PIPELINE_TYPES.DATE);
  }

  static covertTransformToSchemaPipeline(data: ITransformTableData[]): Array<TimestampNode & { id?: number }> {
    const dateFields = this.getAllTransformArrayDateFields(data);

    return dateFields.map((field) => {
      const format = field.format as TimestampNode;
      if (!format) {
        return {
          field: field.targetArray,
          outputTimezone: 'UTC',
          outputFormat: "yyyy-MM-dd'T'HH:mm:ss.SSSZ",
          inputTimezone: 'UTC',
          inputFormats: [],
          id: field.id,
        };
      } else {
        return {
          field: format?.field,
          outputTimezone: format?.outputTimezone,
          inputFormats: format?.inputFormats,
          inputTimezone: format?.inputTimezone,
          outputFormat: format?.outputFormat,
          id: field.id,
        };
      }
    });
  }

  static convertTransformArrayToSchema(transformArray: ITransformArray['transformArray']): SchemaPipeline['fields'] {
    const transformArrayData = transformArray ?? [];

    const tableData: ITransformTableData[] = transformHelpers.getTransformTableData(transformArrayData);

    return transformHelpers.covertTransformToSchemaPipeline(tableData);
  }

  static convertTransformArrayToTimestamp(transformArray: ITransformArray['transformArray']): ProcessingPipeline['convertTimestampParams'] {
    const transformArrayData = transformArray ?? [];

    const tableData: ITransformTableData[] = transformHelpers.getTransformTableData(transformArrayData);

    return this.covertTransformToSchemaPipeline(tableData);
  }

  /**
   * Функция преобразовывает processing.transformArray -> Archive['fields'] и фильтрует по subtype === ARCHIVE_TYPES.DATE
   * @param transformArray
   * @return массив SchemaPipeline['fields'] с subtype DATE
   */
  static getAllSubTypeDates(transformArray: ITransformArray['transformArray']): SchemaPipeline['fields'] {
    return this.convertTransformArrayToSchema(transformArray).filter((field) => field.subType === ARCHIVE_TYPES.DATE);
  }

  static getResultFields(schema: SchemaPipeline['fields'], transformArray: ITransformArray['transformArray']) {
    // удаляем id из fields
    const transformArrayFields = this.convertTransformArrayToSchema(transformArray ?? []).map((field) => ({
      name: field?.name,
      fieldType: field?.fieldType,
      subType: field?.subType,
    }));
    return [...schema].concat(transformArrayFields);
  }

  static removeIdAndFormats(transformArray: ITransformArray['transformArray']): ITransformArray['transformArray'] {
    return transformArray?.map((array) => ({
      sourceArrays: array.sourceArrays,
      targetConfig: array.targetConfig.map(({ id, format, ...props }) => ({ ...props })),
    }));
  }

  static addPartitionsInSource(sources: SourcesPipeline, topics: KafkaTopic[], projects: Project[]): SourcesPipeline {
    const sourceHelper = _.cloneDeep(sources);
    sourceHelper.kafka.map((kafkaSource) => {
      const projectId = projects.filter((project) => project.shortName === kafkaSource.projectShortName)[0]?.id;
      const topic = topics.filter((topic) => topic.name === kafkaSource.topicName && projectId === topic.projectId)[0];
      kafkaSource.partition = topic ? topic.partitions : 0;
    });
    return sourceHelper;
  }

  static removeIdAndPartitions(sources: SourcesPipeline): SourcesPipeline {
    const sourceHelper = _.cloneDeep(sources);
    sourceHelper.kafka.map((kafka) => {
      delete kafka.id;
      delete kafka.partition;
    });
    return sourceHelper;
  }

  static removeProcessingFromSchema(schema: SchemaPipeline, transformArray: ITransformArray['transformArray']) {
    const transformArrayFields = this.convertTransformArrayToSchema(transformArray ?? []);

    const schemaHelper = _.cloneDeep(schema);
    if (schemaHelper.fields) {
      schemaHelper.fields = schemaHelper.fields.filter((field) => {
        const isProcessingField = transformArrayFields.some(
          (processingField) =>
            processingField.name === field.name &&
            processingField.fieldType === field.fieldType &&
            processingField.subType === processingField.subType,
        );

        return !isProcessingField;
      });
    }

    return schemaHelper;
  }

  static removeProcessingFromTimestamp(timestamp: ProcessingPipeline['convertTimestampParams'], transformArray: ITransformArray['transformArray']) {
    const transformArrayFields = this.convertTransformArrayToSchema(transformArray ?? []);

    let timestampHelper = _.cloneDeep(timestamp) ?? [];
    timestampHelper = timestampHelper.filter((date) => {
      const isProcessingField = transformArrayFields.some((processingField) => processingField.name === date.field);
      return !isProcessingField;
    });

    return timestampHelper;
  }

  static addIdsAndFormatsToTransformArray(
    transformArray: ITransformArray['transformArray'],
    timestamp?: ProcessingPipeline['convertTimestampParams'],
  ): ITransformArray['transformArray'] {
    return transformArray?.map((array) => ({
      ...array,
      targetConfig: array.targetConfig.map((target) => ({
        ...target,
        id: +transformHelpers.nanoid(4),
        format: timestamp ? timestamp.find((fields) => fields.field === target.targetArray) : undefined,
      })),
    }));
  }

  static getResultTimestamp(
    timestamp: ProcessingPipeline['convertTimestampParams'],
    transformArray: ITransformArray['transformArray'],
  ): ProcessingPipeline['convertTimestampParams'] {
    if (transformArray && timestamp) {
      const transformArrayDates = PipelineUtils.getAllTransformArrayDateFields(transformHelpers.getTransformTableData(transformArray));
      return timestamp?.concat(transformArrayDates.map((array) => array.format as TimestampNode));
    } else if (timestamp) {
      return timestamp;
    } else if (transformArray) {
      const transformArrayDates = PipelineUtils.getAllTransformArrayDateFields(transformHelpers.getTransformTableData(transformArray));
      return transformArrayDates.map((array) => array.format as TimestampNode);
    } else {
      return timestamp;
    }
  }

  static getIndexTypes() {
    return {
      STRING: 'string',
      TEXT: 'text',
      INT: 'int',
      DOUBLE: 'double',
      LONG: 'long',
      DATE: 'date',
      UUID: 'uuid',
      BOOLEAN: 'boolean',
      ARRAY: 'array',
    };
  }

  static getIndexSubTypes(withText?: boolean) {
    if (withText) {
      return {
        STRING: 'string',
        TEXT: 'text',
        INT: 'int',
        DOUBLE: 'double',
        LONG: 'long',
        DATE: 'date',
        UUID: 'uuid',
        BOOLEAN: 'boolean',
      };
    }
    return {
      STRING: 'string',
      INT: 'int',
      DOUBLE: 'double',
      LONG: 'long',
      DATE: 'date',
      UUID: 'uuid',
      BOOLEAN: 'boolean',
    };
  }

  static isImportTaskValid(pipeline: Pipeline) {
    return (
      pipeline?.projectShortName !== undefined &&
      pipeline?.name !== undefined &&
      pipeline?.quota !== undefined &&
      pipeline?.sources?.kafka.length > 0 &&
      pipeline?.schema?.primaryTimeField !== undefined &&
      pipeline?.schema !== undefined &&
      pipeline?.replicationFactor !== undefined
    );
  }
}
