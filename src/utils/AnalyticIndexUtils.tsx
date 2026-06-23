import { Typography } from '@material-ui/core';
import * as React from 'react';

import { KafkaTopic } from '../store/kafka/Types';
import {
  ConfigQuotaUsage,
  DruidSupervisor,
  DruidSupervisorInfo,
  DruidSupervisorStat,
  GenericSupervisorInfo,
  InstanceGenericSupervisorInfo,
  InstanceQuotaUsage,
} from '../store/monitoring/Types';
import { Project } from '../store/project/Types';

export interface DruidSupervisorInstanceInfo {
  id: number;
  name: string;
  project: string;
  projectId: number;
  topic: string;
  status: string;
  aggregatedLag: number;
  fiveMinuteStats: string;
  totalStats: string;
  zone: string;
  isOutdated: boolean;
  isGlobalOutdated: boolean;
  canEdit: boolean;
  versionConfig: string;
  versionInstance: string;
  globalVersionInstance?: string;
  configQuotaUsage?: ConfigQuotaUsage;
  instanceQuotaUsage?: InstanceQuotaUsage;
}

export class AnalyticIndexUtils {
  static createDruidSupervisorInstanceInfoArray(
    supervisors: DruidSupervisorInfo[],
    projects: Project[],
    topics: KafkaTopic[],
    globalVersion: Map<string, string>,
  ): DruidSupervisorInstanceInfo[] {
    const res: DruidSupervisorInstanceInfo[] = [];
    supervisors.map((supervisor) => {
      this.createDruidSupervisorInstanceInfoElement(supervisor, projects, topics, globalVersion).map((elem) => {
        res.push(elem);
      });
    });
    return res;
  }

  static createDruidSupervisorInstanceInfoElement(
    supervisor: DruidSupervisorInfo,
    projects: Project[],
    topics: KafkaTopic[],
    globalVersion: Map<string, string>,
  ): DruidSupervisorInstanceInfo[] {
    if (!supervisor.info.instances) {
      return [];
    } else {
      return supervisor.info.instances.map((instance) => {
        return {
          id: supervisor.info.id,
          name: supervisor.info.datasource,
          project: this.getProjectKeyById(projects, supervisor.info.projectId),
          projectId: supervisor.info.projectId,
          topic: this.getTopicNameById(topics, supervisor.info.topicId),
          status: instance.status,
          aggregatedLag: instance.aggregatedLag,
          fiveMinuteStats: this.formatStats(instance.supervisorStats?.fiveMinuteStats),
          totalStats: this.formatStats(instance.supervisorStats?.totalStats),
          zone: instance.zoneId,
          isOutdated: supervisor.info.version !== instance.version,
          isGlobalOutdated: instance.globalConfigurationVersion !== globalVersion.get(instance.zoneId),
          canEdit: supervisor.info.canEdit,
          versionConfig: supervisor.info.version,
          versionInstance: instance.version,
          globalVersionInstance: instance.globalConfigurationVersion,
          configQuotaUsage: instance.configQuotaUsage,
          instanceQuotaUsage: instance.instanceQuotaUsage,
        };
      });
    }
  }

  static formatStats(stat?: DruidSupervisorStat) {
    return stat
      ? stat.processed.toFixed(2) + '/' + stat.processedWithError.toFixed(2) + '/' + stat.thrownAway.toFixed(2) + '/' + stat.unparseable.toFixed(2)
      : '';
  }

  static getTableFonts() {
    return {
      fontFamily: ['Roboto', 'Helvetica', 'Arial', 'sans-serif'],
      fontSize: 12,
    };
  }

  static getTaskColor(status) {
    switch (status) {
      case 'ACTIVE':
        return 'primary';
      case 'DISABLED':
        return 'error';
      default:
        return 'primary';
    }
  }

  static getProjectKeyById(projects: Project[], projectId: number) {
    return projects.filter((project) => project.id === projectId)[0]?.shortName || '';
  }

  static getTopicNameById(topics: KafkaTopic[], topicId: number) {
    return topics.filter((topic) => topic.id === topicId)[0]?.name || '';
  }

  static recursiveFunctionWithZoneIdAndId(
    selectedRows: DruidSupervisorInstanceInfo[],
    result: any,
    prefixErrorString: string,
    fn: (id: number, zoneId: string, okCallback?, errorCallback?) => void,
    onEnd: (endData: any) => void,
  ) {
    fn(
      selectedRows[0].id,
      selectedRows[0].zone,
      () => {
        result.success.push(selectedRows[0]);
        selectedRows.splice(0, 1);
        if (selectedRows.length === 0) {
          if (result.errors.length > 0) {
            const errorString = (
              <React.Fragment>
                <Typography variant={'h5'} style={{ marginBottom: 4 }}>
                  <b>{prefixErrorString}</b>
                </Typography>
                <Typography variant="subtitle1">
                  {result.errors.map((error) => {
                    return <div>{error.row.project + '/' + error.row.name + ' (' + error.row.zone + '): ' + error.errorMsg.message + ''}</div>;
                  })}
                </Typography>
              </React.Fragment>
            );
            const detailString = (
              <React.Fragment>
                <Typography variant="body2" color={'error'}>
                  {result.errors.map((error) => {
                    return (
                      <React.Fragment>
                        <div>
                          <b>{error.row.project + '/' + error.row.name + ' (' + error.row.zone + '): '}</b>
                        </div>
                        <div>{error.errorMsg.details}</div>
                      </React.Fragment>
                    );
                  })}
                </Typography>
              </React.Fragment>
            );
            onEnd({ success: false, error: errorString, details: detailString });
          } else {
            onEnd({ success: true });
          }
          return result;
        } else {
          return this.recursiveFunctionWithZoneIdAndId(selectedRows, result, prefixErrorString, fn, onEnd);
        }
      },
      (error: { message: string; details?: string }) => {
        result.errors.push({ row: selectedRows[0], errorMsg: error });
        selectedRows.splice(0, 1);
        if (selectedRows.length === 0) {
          const errorString = (
            <React.Fragment>
              <Typography variant={'h5'} style={{ marginBottom: 4 }}>
                <b>{prefixErrorString}</b>
              </Typography>
              <Typography variant="subtitle1">
                {result.errors.map((error) => {
                  return <div>{error.row.project + '/' + error.row.name + ' (' + error.row.zone + '): ' + error.errorMsg.message + ''}</div>;
                })}
              </Typography>
            </React.Fragment>
          );
          const detailString = (
            <React.Fragment>
              <Typography variant="body2" color={'error'}>
                {result.errors.map((error) => {
                  return (
                    <React.Fragment>
                      <div>
                        <b>{error.row.project + '/' + error.row.name + ' (' + error.row.zone + '): '}</b>
                      </div>
                      <div>{error.errorMsg.details}</div>
                    </React.Fragment>
                  );
                })}
              </Typography>
            </React.Fragment>
          );
          onEnd({ success: false, error: errorString, details: detailString });
          return result;
        } else {
          return this.recursiveFunctionWithZoneIdAndId(selectedRows, result, prefixErrorString, fn, onEnd);
        }
      },
    );
  }

  static isAllZonesHasImplements(supervisor: GenericSupervisorInfo, zones: string[]): boolean {
    const supervisorZones: string[] = [];
    supervisor.instances?.map((supervisor) => {
      supervisorZones.push(supervisor.zoneId);
    });
    if (supervisorZones.length > zones.length) {
      return zones.filter((zone) => !supervisorZones.includes(zone)).length === 0;
    }
    return (
      zones.filter((zone) => !supervisorZones.includes(zone)).length === 0 &&
      supervisorZones.filter((supervisorZone) => !zones.includes(supervisorZone)).length === 0
    );
  }

  static createInfoForSupervisorInstanceTable(instances: InstanceGenericSupervisorInfo[]) {
    return instances.map((instance) => {
      return {
        zoneId: instance.zoneId,
        status: instance.status,
        aggregatedLag: instance.aggregatedLag,
        fiveMinuteStats: this.formatStats(instance.supervisorStats?.fiveMinuteStats),
        totalStats: this.formatStats(instance.supervisorStats?.totalStats),
        version: instance.version,
        globalConfigurationVersion: instance.globalConfigurationVersion,
        configQuotaUsage: instance.configQuotaUsage,
        instanceQuotaUsage: instance.instanceQuotaUsage,
      };
    });
  }

  static getTablePageSize(instances?: InstanceGenericSupervisorInfo[]) {
    return instances ? instances.length : 0;
  }

  static validateImportTask(importTask: DruidSupervisor) {
    return !!importTask.data;
  }
}
