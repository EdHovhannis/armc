import { Typography } from '@material-ui/core';
import * as React from 'react';

import { FulltextTask, FullTextTaskInstances } from '../store/index/Types';
import { KafkaTopic } from '../store/kafka/Types';
import { KafkaSource, PipelineShort, PipelineStatus } from '../store/pipeline/Types';
import { Project } from '../store/project/Types';

export interface CommonIndexOverviewFields {
  id: number;
  name: string;
  project: string;
  labels?: string[];
  maxDataRateBytesPerSec: number;
  maxSizeBytes?: number;
  maxStorageTimeSec?: number;
  indexActions: string[];
  flowActions: string[];
  backupCount?: number;
  instances?: FullTextTaskInstances[];
}

export interface UniqueIndexOverviewDataNew {
  instanceId?: number;
  topic?: string | string[] | null;
  topicName?: string | string[] | null;
  zoneId?: string;
  status?: string | PipelineStatus;
  matchingVersions?: boolean;
  instanceVersion?: string;
  configVersion?: string;
  overdraftPercent?: number;
  maxAvailableOverdraft?: number;
  savepointCount?: number;
  instances?: FullTextTaskInstances[];
}

export interface UniqueIndexOverviewDataTableConfig {
  topic: string;
  countZone: number;
  countZoneRender: number;
  zones: string[];
}

export type IndexOverviewDataNew = CommonIndexOverviewFields & UniqueIndexOverviewDataNew;

export type IndexOverviewDataTableConfig = CommonIndexOverviewFields & UniqueIndexOverviewDataTableConfig;

export interface IndexOverviewInstanceData {
  id: number;
  name: string;
  project: string;
  topic: string;
  labels?: string[];
  zoneId: string;
  status: string;
  matchingVersions?: boolean;
  instanceVersion?: string;
  configVersion?: string;
}

export interface DetailPanelData {
  id: number;
  zoneId: string;
  status: string;
  name: string;
  project: string;
  matchingVersions: boolean;
  instanceVersion: string;
  configVersion: string;
  overdraftPercent: number;
  maxAvailableOverdraft: number;
}

export class IndexUtils {
  static getIndexOverviewDataNew(
    pipelines: PipelineShort[],
    statuses: Map<string, PipelineStatus>,
    fulltextTasks: FulltextTask[],
  ): { configData: IndexOverviewDataNew[]; instanceData: IndexOverviewDataNew[] } {
    const resConfigData: IndexOverviewDataNew[] = [];
    const resInstanceData: IndexOverviewDataNew[] = [];
    if (pipelines.length > 0) {
      fulltextTasks.map((ftTask) => {
        const pipeline = pipelines.filter((pipeline) => {
          return pipeline.name === ftTask.name && ftTask.project === pipeline.projectShortName;
        })[0];
        const ftData: IndexOverviewDataNew = {
          id: ftTask.id,
          indexActions: ftTask.indexActions,
          flowActions: ftTask.flowActions,
          name: ftTask.name,
          project: ftTask.project,
          topic: null,
          topicName: null,
          maxAvailableOverdraft: undefined,
          labels: ftTask.labels,
          configVersion: ftTask.version,
          maxDataRateBytesPerSec: ftTask.maxDataRateBytesPerSec,
          maxSizeBytes: ftTask.maxSizeBytes,
          maxStorageTimeSec: ftTask.maxStorageTimeSec,
        };
        if (pipeline && pipeline.instances && pipeline.instances.length > 0) {
          pipeline.instances.forEach((instance) => {
            const currentZoneTask = ftTask.instances && ftTask.instances.find((taskInstance) => taskInstance.zoneId === instance.zoneId);
            const topics: string[] = [];
            const topicsName: string[] = [];
            if (pipeline.sources) {
              pipeline.sources.kafka?.map((row) => {
                topics.push(`${row.projectShortName}/${row.topicName}`);
                topicsName.push(row.topicName);
              });
            } else {
              topicsName.push('<invalid>');
              topics.push('<invalid>');
            }
            const maxDataRateBytesPerSec = currentZoneTask?.maxDataRateBytesPerSec ?? 0;
            const maxSizeBytes = currentZoneTask?.maxSizeBytes ?? 0;
            const maxStorageTimeSec = currentZoneTask?.maxStorageTimeSec ?? 0;
            resInstanceData.push({
              id: ftTask.id,
              indexActions: ftTask.indexActions,
              flowActions: ftTask.flowActions,
              instanceId: currentZoneTask && currentZoneTask.id,
              name: ftTask.name,
              project: ftTask.project,
              topic: topics,
              topicName: topicsName,
              labels: ftTask.labels,
              zoneId: instance.zoneId,
              matchingVersions: currentZoneTask ? currentZoneTask.version === ftTask.version : true,
              instanceVersion: currentZoneTask && currentZoneTask.version,
              configVersion: ftTask.version,
              status:
                statuses.size === 0
                  ? 'UNDEFINED'
                  : statuses.has(ftTask.name + ftTask.project + instance.zoneId)
                    ? statuses.get(ftTask.name + ftTask.project + instance.zoneId)
                    : 'UNDEFINED',
              overdraftPercent: currentZoneTask && currentZoneTask.overdraftPercent,
              maxAvailableOverdraft: currentZoneTask?.metadata.maxAvailableOverdraft,
              maxDataRateBytesPerSec,
              maxSizeBytes,
              maxStorageTimeSec,
              backupCount: currentZoneTask?.backupCount,
              savepointCount: currentZoneTask?.savepointCount,
              instances: ftTask.instances?.map((item) => {
                return {
                  ...item,
                  matchingVersions: item ? item.version === ftTask.version : true,
                  overdraftPercent: item && item.overdraftPercent,
                  maxAvailableOverdraft: item?.metadata.maxAvailableOverdraft,
                  configVersion: ftTask.version,
                  instanceVersion: item && item.version,
                  flowActions: ftTask.flowActions,
                  indexActions: ftTask.indexActions,
                  status:
                    statuses.size === 0
                      ? 'UNDEFINED'
                      : statuses.has(ftTask.name + ftTask.project + instance.zoneId)
                        ? statuses.get(ftTask.name + ftTask.project + instance.zoneId)
                        : 'UNDEFINED',
                  name: ftTask.name,
                  project: ftTask.project,
                };
              }),
              recoveryStrategy: currentZoneTask?.recoveryStrategy,
            });
          });
        } else if (pipeline) {
          ftData.topic = pipeline.sources ? pipeline.sources.kafka[0].projectShortName + '/' + pipeline.sources.kafka[0].topicName : '<invalid>';
          ftData.topicName = pipeline.sources ? pipeline.sources.kafka[0].topicName : '<invalid>';
        }
        if (pipeline === undefined) {
          if (ftTask.instances!.length === 0) {
            ftData.topic = null;
            ftData.topicName = null;
          } else if (ftTask.instances!.length > 0) {
            ftTask.instances!.map((inst) => {
              resInstanceData.push({
                id: ftTask.id,
                indexActions: ftTask.indexActions,
                flowActions: ftTask.flowActions,
                name: ftTask.name,
                project: ftTask.project,
                topic: null,
                topicName: null,
                instanceId: inst.id,
                instanceVersion: inst.version,
                zoneId: inst.zoneId,
                status:
                  statuses.size === 0
                    ? 'UNDEFINED'
                    : statuses.has(ftTask.name + ftTask.project + inst.zoneId)
                      ? statuses.get(ftTask.name + ftTask.project + inst.zoneId)
                      : 'UNDEFINED',
                maxAvailableOverdraft: undefined,
                labels: ftTask.labels,
                configVersion: ftTask.version,
                maxDataRateBytesPerSec: inst.maxDataRateBytesPerSec,
                maxSizeBytes: inst.maxSizeBytes,
                maxStorageTimeSec: inst.maxStorageTimeSec,
              });
            });
          }
        }
        resConfigData.push(ftData);
      });
    }
    return { configData: resConfigData, instanceData: resInstanceData };
  }

  static countZoneRerender(data) {
    if (data == 0) {
      return <span style={{ color: '#FFA500' }}>{data}</span>;
    }
    return data;
  }

  static isSelectEnable(data: IndexOverviewDataTableConfig[]) {
    return data.filter((elem) => elem.countZone != 0).length === 0;
  }

  static getConfigTableData(configData: IndexOverviewDataNew[], instanceData: IndexOverviewDataNew[]): IndexOverviewDataTableConfig[] {
    const filteredData = instanceData.filter((item) => configData.find((it) => it.id === item.id));
    const reduceData = filteredData.reduce((acc: IndexOverviewDataTableConfig[], curr: IndexOverviewDataNew): IndexOverviewDataTableConfig[] => {
      // Найдем объект в массиве, соответствующий текущему элементу по имени и проекту
      const existingItemIndex = acc.findIndex((item) => item.name === curr.name && item.project === curr.project);
      const configItem = configData.find((item) => item.id === curr.id);
      if (existingItemIndex === -1) {
        // Объект ещё не существует
        acc.push({
          id: curr.id,
          name: curr.name,
          project: curr.project,
          topic: Array.isArray(curr.topic) ? curr.topic.join(', ') : curr.topic || '',
          labels: curr.labels || [], // Преобразуем undefined/null в пустой массив
          countZone: curr.zoneId ? 1 : 0,
          countZoneRender: IndexUtils.countZoneRerender(curr.zoneId ? 1 : 0),
          zones: curr.zoneId ? [curr.zoneId] : [],
          maxDataRateBytesPerSec: configItem ? configItem.maxDataRateBytesPerSec : curr.maxDataRateBytesPerSec,
          maxSizeBytes: configItem ? configItem.maxSizeBytes : curr.maxSizeBytes,
          maxStorageTimeSec: configItem ? configItem.maxStorageTimeSec : curr.maxStorageTimeSec,
          indexActions: curr.indexActions,
          flowActions: curr.flowActions,
          backupCount: curr.backupCount,
          instances: curr.instances,
        });
      } else {
        // Если объект уже есть, обновляем зоны и счётчик зон
        if (curr.zoneId) {
          acc[existingItemIndex].zones.push(curr.zoneId); // Добавляем новую зону
          acc[existingItemIndex].countZone++; // Увеличиваем количество зон
          acc[existingItemIndex].countZoneRender = IndexUtils.countZoneRerender(acc[existingItemIndex].countZone); // Пересчитываем рендер
        }
      }
      return acc;
    }, []);

    return reduceData;
  }

  static isAllZonesHasImplements(data: IndexOverviewDataTableConfig, zones: string[]): boolean {
    if (data.zones.length > zones.length) {
      return zones.filter((zone) => !data.zones.includes(zone)).length === 0;
    }
    return (
      zones.filter((zone) => !data.zones.includes(zone)).length === 0 && data.zones.filter((indexZone) => !zones.includes(indexZone)).length === 0
    );
  }

  static getDetailPanelData(data: IndexOverviewDataNew[], selectedRowData: IndexOverviewDataTableConfig): IndexOverviewDataNew[] {
    const res: IndexOverviewDataNew[] = data.filter(
      (item) => item.name === selectedRowData.name && item.project === selectedRowData.project && item.zoneId,
    );
    return res;
  }

  static getCountInstanceOverdraft(data: IndexOverviewDataNew[]) {
    const res = data.reduce((sum, current) => {
      if (current.overdraftPercent && current.overdraftPercent > 0) {
        sum = sum + 1;
        return sum;
      } else {
        return sum;
      }
    }, 0);
    return res;
  }

  static recursiveFunction(
    selectedRows: any[],
    result: any,
    prefixErrorString: string,
    fn: (project: string, name: string, zoneId?: string, okCallback?, errorCallback?) => void,
    onEnd: (endData: any) => void,
  ) {
    fn(
      selectedRows[0].project,
      selectedRows[0].name,
      selectedRows[0].zoneId,
      () => {
        result.success.push(selectedRows[0]);
        selectedRows.splice(0, 1);
        if (selectedRows.length === 0) {
          if (result.errors.length > 0) {
            const errorTopicString = (
              <React.Fragment>
                <Typography variant={'h5'} style={{ marginBottom: 4 }}>
                  <b>{prefixErrorString}</b>
                </Typography>
                <Typography variant="subtitle1">
                  {result.errors.map((error) => {
                    return <div>{error.row.project + '/' + error.row.name + ' (' + error.errorMsg.message + ')'}</div>;
                  })}
                </Typography>
              </React.Fragment>
            );
            const errorDetailsString = (
              <React.Fragment>
                <Typography variant="body2" color={'error'}>
                  {result.errors.map((error) => {
                    return (
                      <React.Fragment>
                        <div>
                          <b>{error.row.project + '/' + error.row.name + ':'}</b>
                        </div>
                        <div>{error.errorMsg.details}</div>
                      </React.Fragment>
                    );
                  })}
                </Typography>
              </React.Fragment>
            );
            onEnd({ success: false, error: errorTopicString, details: errorDetailsString });
          } else {
            onEnd({ success: true });
          }
          return result;
        } else {
          return this.recursiveFunction(selectedRows, result, prefixErrorString, fn, onEnd);
        }
      },
      (error: { message: string; details?: string }) => {
        result.errors.push({ row: selectedRows[0], errorMsg: error });
        selectedRows.splice(0, 1);
        if (selectedRows.length === 0) {
          const errorTopicString = (
            <React.Fragment>
              <Typography variant={'h5'} style={{ marginBottom: 4 }}>
                <b>{prefixErrorString}</b>
              </Typography>
              <Typography variant="subtitle1">
                {result.errors.map((error) => {
                  return <div>{error.row.project + '/' + error.row.name + ' (' + error.errorMsg.message + ')'}</div>;
                })}
              </Typography>
            </React.Fragment>
          );
          const errorDetailsString = (
            <React.Fragment>
              <Typography variant="body2" color={'error'}>
                {result.errors.map((error) => {
                  return (
                    <React.Fragment>
                      <div>
                        <b>{error.row.project + '/' + error.row.name + ':'}</b>
                      </div>
                      <div>{error.errorMsg.details}</div>
                    </React.Fragment>
                  );
                })}
              </Typography>
            </React.Fragment>
          );
          onEnd({ success: false, error: errorTopicString, details: errorDetailsString });
          return result;
        } else {
          return this.recursiveFunction(selectedRows, result, prefixErrorString, fn, onEnd);
        }
      },
    );
  }

  static getTopicIds(kafka: KafkaSource[], topics: KafkaTopic[], projects: Project[]) {
    const sourcesIds = {};
    kafka.map(
      (source: KafkaSource) =>
        (sourcesIds[source.id as string] = topics.find((topic: KafkaTopic) => {
          const projectId = projects.find((project) => project.shortName === source.projectShortName)?.id;
          return projectId === topic.projectId && topic.name === source.topicName;
        })?.id),
    );
    return sourcesIds;
  }

  static sourcesTooltip = (data: string[]) => (
    <>
      {data.map((row, index) => (
        <div key={`sources${index + 1}`}>{row}</div>
      ))}
    </>
  );
}
