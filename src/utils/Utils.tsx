import { Column } from '@material-table/core';
import { createTheme } from '@material-ui/core';
import {
  Add,
  ArrowDownward,
  Check,
  ChevronLeft,
  ChevronRight,
  Clear,
  Delete,
  Edit,
  FilterList,
  FirstPage,
  LastPage,
  Remove,
  Search,
} from '@material-ui/icons';
import { cloneDeep } from 'lodash';
import * as React from 'react';
import { forwardRef } from 'react';

import { ProjectMeta } from '../components/projects/ProjectsForm';
import { FilterMenuItem } from '../components/utils/FilterMenu';
import { AlmgrQuota } from '../store/almgr/Type';
import { ShortArchiveTaskWithRole } from '../store/archive/Actions';
import { ArchiveTaskInstance, ArchiveTaskInstanceStatus, ArchiveTaskRequestStatus, ShortArchiveTaskWithId } from '../store/archive/Types';
import { BlockFilterParams, ConstraintFilterParams, ConstraintType, OBJECT_TYPE, OBJECT_TYPE_MAP } from '../store/constraint/Types';
import { BusinessTask, FlowInstanceExtended, FlowOverview } from '../store/flow/Types';
import { FulltextTask } from '../store/index/Types';
import { KafkaTopic } from '../store/kafka/Types';
import { Dictionary } from '../store/lookup/Types';
import { DruidSupervisorInfo, GenericSupervisorInfo, InstanceGenericSupervisorInfo } from '../store/monitoring/Types';
import { OsirisCheckQuotaProject, OsirisTrafficQuotaProject } from '../store/osiris/Type';
import { DlqTopic } from '../store/pipeline/Types';
import { Project } from '../store/project/Types';
import { Unit, UNIT_MAP } from '../store/role/Types';
import { UnimonProjectQuota } from '../store/unimon/Type';

import { IndexOverviewDataNew } from './IndexUtils';

export const themeHeader = createTheme({
  palette: {
    background: {
      paper: 'rgb(76, 175, 80, 0.25)',
    },
  },
});

export const theme = createTheme({
  palette: {
    primary: {
      main: '#4CAF50',
    },
    secondary: {
      main: '#4CAF50',
    },
  },
});

export const themeActions = createTheme({
  palette: {
    primary: {
      main: '#4CAF50',
    },
    secondary: {
      main: '#ea9313',
    },
  },
});

export enum OPERATORS {
  'IS' = 'is',
  'IS NOT' = 'is not',
  'IN' = 'in',
  'NOT IN' = 'not in',
  'MORE' = '>=',
  'EQUAL' = '=',
  'LESS' = '<=',
}

// Common icons
export const speedIcon = require('../images/speed.svg');

export const PERCENT_VALUES = ['>50%', '>90%', '100%', '<50%', '<90%'];

export const NAME_REGEXP = /^(?!\-)[\._A-Za-z0-9\-]+$/;
export const REPLICATION_NUMBER_REGEXP = /^(1000|[1-9]\d{0,2})$/;
export const ERROR_NAME_REGEXP_STRING =
  'Вы ввели недопустимые символы. Разрешено использовать заглавные и прописные буквы латинского алфавита, 0-9 и символы "-", "_" и "."';

export const tableIcons = {
  ResetSearch: forwardRef((props, ref) => <Clear {...props} ref={ref} />),
  Search: forwardRef((props, ref) => <Search {...props} ref={ref} />),
  Delete: forwardRef((props, ref) => <Delete {...props} ref={ref} />),
  Add: forwardRef((props, ref) => <Add {...props} ref={ref} />),
  SortArrow: forwardRef((props, ref) => <ArrowDownward {...props} ref={ref} />),
  Edit: forwardRef((props, ref) => <Edit {...props} ref={ref} />),
  Check: forwardRef((props, ref) => <Check {...props} ref={ref} />),
  ThirdStateCheck: forwardRef((props, ref) => <Remove {...props} ref={ref} />),
  Clear: forwardRef((props, ref) => <Clear {...props} ref={ref} />),
  DetailPanel: forwardRef((props, ref) => <ChevronRight {...props} ref={ref} />),
  FirstPage: forwardRef((props, ref) => <FirstPage {...props} ref={ref} />),
  LastPage: forwardRef((props, ref) => <LastPage {...props} ref={ref} />),
  NextPage: forwardRef((props, ref) => <ChevronRight {...props} ref={ref} />),
  PreviousPage: forwardRef((props, ref) => <ChevronLeft {...props} ref={ref} />),
  Filter: forwardRef((props, ref) => <FilterList fontSize="small" {...props} ref={ref} />),
};

export const tableIconsWithInvisibleAdd = {
  ResetSearch: forwardRef((props, ref) => <Clear {...props} ref={ref} />),
  Search: forwardRef((props, ref) => <Search {...props} ref={ref} />),
  Delete: forwardRef((props, ref) => <Delete {...props} ref={ref} />),
  Add: forwardRef((props, ref) => <Add style={{ color: '#ffffff', width: '0px', height: '0px' }} {...props} ref={ref} />),
  SortArrow: forwardRef((props, ref) => <ArrowDownward {...props} ref={ref} />),
  Edit: forwardRef((props, ref) => <Edit {...props} ref={ref} />),
  Check: forwardRef((props, ref) => <Check {...props} ref={ref} />),
  Clear: forwardRef((props, ref) => <Clear {...props} ref={ref} />),
};

export class Utils {
  //['<100', '<1000', '<10000', '>100', '>1000', '>10000']
  static isInRange(range: string, value: number) {
    switch (range) {
      case '<100':
        return value < 100;
      case '<1000':
        return value < 1000;
      case '<10000':
        return value < 10000;
      case '>100':
        return value > 100;
      case '>1000':
        return value > 1000;
      case '>10000':
        return value > 10000;
      case '≤2':
        return value <= 2;
      case '≤5':
        return value <= 5;
      case '≥2':
        return value >= 2;
      case '>2':
        return value > 2;
      case '≥5':
        return value >= 5;
      case '1':
        return value === 1;
      case '2':
        return value === 2;
      default:
        return false;
    }
  }

  //'>50%', '>90%', '100%', '<50%', '<90%'
  static isInPerCent(percent: string, value: number) {
    switch (percent) {
      case '>50%':
        return value > 0.5;
      case '>90%':
        return value > 0.9;
      case '100%':
        return value === 1;
      case '<50%':
        return value < 0.5;
      case '<90%':
        return value < 0.9;
      default:
        return false;
    }
  }

  static isMeetsConditionsPipeline(filter: FilterMenuItem, indexData: IndexOverviewDataNew[]): IndexOverviewDataNew[] | [] {
    const data = Array.isArray(indexData) ? indexData : indexData.instanceData;
    if (filter.field === 'status' || filter.field === 'numDocs') {
      return data;
    }
    switch (filter.operator) {
      case OPERATORS.IS:
      case OPERATORS.IN:
        if (filter.fieldName === 'Топик' || filter.fieldName === 'Источник данных') {
          return data.filter((d) => {
            if (!Array.isArray(d.topic)) return filter.values.includes(d.topic);

            let include = false;
            d.topic.map((topic) => {
              if (filter.values.includes(topic)) {
                include = true;
                return;
              }
            });

            return include;
          });
        } else if (filter.fieldName === 'Проект') {
          return data.filter((d) => filter.values.includes(d.project));
        } else if (filter.fieldName === 'Зона') {
          return data.filter((d) => filter.values.includes(d.zoneId as string));
        } else if (filter.fieldName === 'Версия') {
          return data.filter((d) => {
            if (
              (filter.values[0] === 'Совпадает' && d.matchingVersions) ||
              (filter.values[0] === 'Не совпадает' && !d.matchingVersions && d.matchingVersions != undefined)
            ) {
              return true;
            }
          });
        } else {
          return data.filter((d) => filter.values.includes(d[filter.field]));
        }
      case OPERATORS['IS NOT']:
      case OPERATORS['NOT IN']:
        if (filter.fieldName === 'Топик' || filter.fieldName === 'Источник данных') {
          return data.filter((d) => {
            if (!Array.isArray(d.topic)) return !filter.values.includes(d.topic);

            let include = true;
            d.topic.map((topic) => {
              if (filter.values.includes(topic)) {
                include = false;
                return;
              }
            });

            return include;
          });
        } else if (filter.fieldName === 'Проект') {
          return data.filter((data) => !filter.values.includes(data.project));
        } else if (filter.fieldName === 'Зона') {
          return data.filter((data) => !filter.values.includes(data.zoneId ? data.zoneId : ''));
        } else {
          return data.filter((data) => !filter.values.includes(data[filter.field]));
        }
      case OPERATORS.MORE:
        if (filter.fieldName === 'Скорость обработки (%)') {
          return data.filter(
            (data) => (data.overdraftPercent || data.overdraftPercent == 0) && data.overdraftPercent >= Number.parseInt(filter.values[0]),
          );
        }
      case OPERATORS.EQUAL:
        if (filter.fieldName === 'Скорость обработки (%)') {
          return data.filter(
            (data) => (data.overdraftPercent || data.overdraftPercent == 0) && data.overdraftPercent == Number.parseInt(filter.values[0]),
          );
        }
      case OPERATORS.LESS:
        if (filter.fieldName === 'Скорость обработки (%)') {
          return data.filter(
            (data) => (data.overdraftPercent || data.overdraftPercent == 0) && data.overdraftPercent <= Number.parseInt(filter.values[0]),
          );
        }
      default:
        return [];
    }
  }

  static getAllPossibleValues(data: any[]): any[] {
    const res: any[] = [];
    data.map((value) => {
      if (!res.some((val) => val === value)) {
        res.push(value);
      }
    });
    return res;
  }

  static getAllPossibleGlobalConfigVersions(data: DruidSupervisorInfo[]): any[] {
    const instances: InstanceGenericSupervisorInfo[] = [];
    data.map((config) => {
      if (config.info.instances) {
        instances.push(...config.info.instances);
      }
    });
    const res: any[] = [];
    instances
      .map((instance) => {
        return instance.globalConfigurationVersion;
      })
      .map((value) => {
        if (!res.some((val) => val === value)) {
          res.push(value);
        }
      });
    return res;
  }

  static checkVersionForSupervisorInstance(filter: string, data: DruidSupervisorInfo) {
    switch (filter) {
      case 'Совпадает':
        if (!data.info.instances || data.info.instances.length === 0) {
          return false;
        }
        return data.info.instances.map((instance) => instance.version).filter((instanceVersion) => instanceVersion === data.info.version).length > 0;
      case 'Не совпадает':
        if (!data.info.instances || data.info.instances.length === 0) {
          return false;
        }
        return data.info.instances.map((instance) => instance.version).filter((instanceVersion) => instanceVersion !== data.info.version).length > 0;
    }
  }

  static checkGlobalVersionForSupervisorInstance(filter: string, data: DruidSupervisorInfo, globalVersion: Map<string, string>) {
    switch (filter) {
      case 'Совпадает':
        if (!data.info.instances || data.info.instances.length === 0) {
          return false;
        }
        return (
          data.info.instances.filter((instance) => {
            if (instance.globalConfigurationVersion && globalVersion.get(instance.zoneId)) {
              return instance.globalConfigurationVersion === globalVersion.get(instance.zoneId);
            }
          }).length > 0
        );
      case 'Не совпадает':
        if (!data.info.instances || data.info.instances.length === 0) {
          return false;
        }
        return data.info.instances.filter((instance) => instance.globalConfigurationVersion !== globalVersion.get(instance.zoneId)).length > 0;
    }
  }

  static filterSupervisorInfoByVersion(filter: string, data: DruidSupervisorInfo) {
    if (!data.info.instances || data.info.instances.length === 0) {
      return null;
    }
    const copyInstances = data.info.instances.filter((instance) => {
      switch (filter) {
        case 'Совпадает':
          return instance.version === data.info.version;
        case 'Не совпадает':
          return instance.version !== data.info.version;
      }
    });
    const copyData: DruidSupervisorInfo = Utils.getCopyOfElement(data);
    copyData.info.instances = copyInstances;
    return copyData;
  }

  static filterSupervisorInfoByGlobalVersion(filter: string, data: DruidSupervisorInfo, globalVersion: Map<string, string>) {
    if (!data.info.instances || data.info.instances.length === 0) {
      return null;
    }
    const copyInstances = data.info.instances.filter((instance) => {
      switch (filter) {
        case 'Совпадает':
          return instance.globalConfigurationVersion === globalVersion.get(instance.zoneId);
        case 'Не совпадает':
          return instance.globalConfigurationVersion !== globalVersion.get(instance.zoneId);
      }
    });
    const copyData: DruidSupervisorInfo = Utils.getCopyOfElement(data);
    copyData.info.instances = copyInstances;
    return copyData;
  }

  static filterSupervisorInfoByZone(zones: string[], data: DruidSupervisorInfo) {
    if (!data.info.instances || data.info.instances.length === 0) {
      return null;
    }
    const copyInstances = data.info.instances.filter((instance) => zones.includes(instance.zoneId));
    const copyData: DruidSupervisorInfo = Utils.getCopyOfElement(data);
    copyData.info.instances = copyInstances;
    return copyData;
  }

  static filterSupervisorInfoByStatus(statuses: string[], data: DruidSupervisorInfo) {
    if (!data.info.instances || data.info.instances.length === 0) {
      return null;
    }
    const copyInstances = data.info.instances.filter((instance) => statuses.includes(instance.status));
    const copyData: DruidSupervisorInfo = Utils.getCopyOfElement(data);
    copyData.info.instances = copyInstances;
    return copyData;
  }

  static isMeetsConditionsSupervisorConfig(
    filter: FilterMenuItem,
    data: DruidSupervisorInfo[],
    globalConfigVersion: Map<string, string>,
  ): DruidSupervisorInfo[] | [] {
    switch (filter.operator) {
      case OPERATORS.IS:
      case OPERATORS.IN:
        if (filter.fieldName === 'Топик' || filter.fieldName === 'Источник данных') {
          return data.filter((supervisor) => filter.values.includes(supervisor.info.topicId));
        } else if (filter.fieldName === 'Проект') {
          return data.filter((supervisor) => filter.values.includes(supervisor.info.projectId));
        } else if (filter.fieldName === 'Название') {
          return data.filter((supervisor) => filter.values.includes(supervisor.info.datasource));
        } else if (filter.fieldName === 'Статус') {
          return data.filter((supervisor) => {
            return (
              supervisor.info.instances && supervisor.info.instances?.map((inst) => inst.status).some((status) => filter.values.includes(status))
            );
          });
        } else if (filter.fieldName === 'Зоны') {
          return data.filter((supervisor) => {
            return (
              supervisor.info.instances && supervisor.info.instances?.map((inst) => inst.zoneId).some((status) => filter.values.includes(status))
            );
          });
        } else if (filter.fieldName === 'Версия конфигурации') {
          return data.filter((supervisor) => this.checkVersionForSupervisorInstance(filter.values[0], supervisor));
        } else if (filter.fieldName === 'Глобальная версия конфигурации') {
          return data.filter((supervisor) => this.checkGlobalVersionForSupervisorInstance(filter.values[0], supervisor, globalConfigVersion));
        } else if (filter.fieldName === 'Текущая глобальная версия конфигурации') {
          return data.filter((supervisor) => {
            return (
              supervisor.info.instances &&
              supervisor.info.instances?.map((inst) => inst.globalConfigurationVersion).some((version) => filter.values.includes(version))
            );
          });
        }
        break;
      case OPERATORS['IS NOT']:
      case OPERATORS['NOT IN']:
        if (filter.fieldName === 'Топик' || filter.fieldName === 'Источник данных') {
          return data.filter((supervisor) => !filter.values.includes(supervisor.info.topicId));
        } else if (filter.fieldName === 'Проект') {
          return data.filter((supervisor) => !filter.values.includes(supervisor.info.projectId));
        } else if (filter.fieldName === 'Название') {
          return data.filter((supervisor) => !filter.values.includes(supervisor.info.datasource));
        } else if (filter.fieldName === 'Статус') {
          return data.filter((supervisor) => {
            return (
              supervisor.info.instances && !supervisor.info.instances?.map((inst) => inst.status).some((status) => filter.values.includes(status))
            );
          });
        } else if (filter.fieldName === 'Зоны') {
          return data.filter((supervisor) => {
            return (
              supervisor.info.instances && !supervisor.info.instances?.map((inst) => inst.zoneId).some((status) => filter.values.includes(status))
            );
          });
        } else if (filter.fieldName === 'Версия') {
          return data.filter((supervisor) => !this.checkVersionForSupervisorInstance(filter.values[0], supervisor));
        }
        break;
      default:
        return [];
    }
  }

  static isMeetsConditionsSupervisorInstance(
    filter: FilterMenuItem,
    data: DruidSupervisorInfo[],
    globalConfigVersion: Map<string, string>,
  ): DruidSupervisorInfo[] | [] {
    switch (filter.operator) {
      case OPERATORS.IS:
      case OPERATORS.IN:
        if (filter.fieldName === 'Топик' || filter.fieldName === 'Источник данных') {
          return data.filter((supervisor) => filter.values.includes(supervisor.info.topicId));
        } else if (filter.fieldName === 'Проект') {
          return data.filter((supervisor) => filter.values.includes(supervisor.info.projectId));
        } else if (filter.fieldName === 'Название') {
          return data.filter((supervisor) => filter.values.includes(supervisor.info.datasource));
        } else if (filter.fieldName === 'Статус') {
          const filteredData: DruidSupervisorInfo[] = [];
          data.map((supervisor) => {
            const filteredSupervisor = this.filterSupervisorInfoByStatus(filter.values, supervisor);
            if (filteredSupervisor) {
              filteredData.push(filteredSupervisor);
            }
          });
          return filteredData;
        } else if (filter.fieldName === 'Зоны') {
          const filteredData: DruidSupervisorInfo[] = [];
          data.map((supervisor) => {
            const filteredSupervisor = this.filterSupervisorInfoByZone(filter.values, supervisor);
            if (filteredSupervisor) {
              filteredData.push(filteredSupervisor);
            }
          });
          return filteredData;
        } else if (filter.fieldName === 'Версия конфигурации') {
          const filteredData: DruidSupervisorInfo[] = [];
          data.map((supervisor) => {
            const filteredSupervisor = this.filterSupervisorInfoByVersion(filter.values[0], supervisor);
            if (filteredSupervisor) {
              filteredData.push(filteredSupervisor);
            }
          });
          return filteredData;
        } else if (filter.fieldName === 'Глобальная версия конфигурации') {
          const filteredData: DruidSupervisorInfo[] = [];
          data.map((supervisor) => {
            const filteredSupervisor = this.filterSupervisorInfoByGlobalVersion(filter.values[0], supervisor, globalConfigVersion);
            if (filteredSupervisor) {
              filteredData.push(filteredSupervisor);
            }
          });
          return filteredData;
        } else if (filter.fieldName === 'Текущая глобальная версия конфигурации') {
          return cloneDeep(data).filter((supervisor) => {
            if (!supervisor.info.instances) return false;
            supervisor.info.instances = supervisor.info.instances.filter((inst) => filter.values.includes(inst.globalConfigurationVersion));
            return !!supervisor.info.instances.length;
          });
        }
        break;
      case OPERATORS['IS NOT']:
      case OPERATORS['NOT IN']:
        if (filter.fieldName === 'Топик' || filter.fieldName === 'Источник данных') {
          return data.filter((supervisor) => !filter.values.includes(supervisor.info.topicId));
        } else if (filter.fieldName === 'Проект') {
          return data.filter((supervisor) => !filter.values.includes(supervisor.info.projectId));
        } else if (filter.fieldName === 'Название') {
          return data.filter((supervisor) => !filter.values.includes(supervisor.info.datasource));
        } else if (filter.fieldName === 'Статус') {
          return data.filter((supervisor) => {
            return (
              supervisor.info.instances && !supervisor.info.instances?.map((inst) => inst.status).some((status) => filter.values.includes(status))
            );
          });
        }
        break;
      default:
        return [];
    }
  }

  static isMeetsConditionsFlowInstances(filter: FilterMenuItem, data: FlowInstanceExtended[]): FlowInstanceExtended[] | [] {
    switch (filter.operator) {
      case OPERATORS.IS:
      case OPERATORS.IN:
        if (filter.fieldName === 'Название') {
          return data.filter((flow) => filter.values.includes(flow.flowName));
        } else if (filter.fieldName === 'Проект') {
          return data.filter((flow) => filter.values.includes(flow.projectId));
        } else if (filter.fieldName === 'Статус') {
          return data.filter((flow) => filter.values.includes(flow.status));
        } else if (filter.fieldName === 'Зоны') {
          return data.filter((flow) => filter.values.includes(flow.zoneId));
        } else if (filter.fieldName === 'Версия') {
          return data.filter((flow) => {
            if (filter.values[0] === 'Совпадает') {
              return flow.versionConfig === flow.version;
            }
            return flow.versionConfig !== flow.version;
          });
        } else if (filter.fieldName === 'Id') {
          return data.filter((flow) => filter.values.includes(flow.flowId));
        } else {
          return data.filter((flow) => filter.values.includes(flow[filter.field]));
        }
      case OPERATORS['IS NOT']:
      case OPERATORS['NOT IN']:
        if (filter.fieldName === 'Название') {
          return data.filter((flow) => !filter.values.includes(flow.flowName));
        } else if (filter.fieldName === 'Проект') {
          return data.filter((flow) => !filter.values.includes(flow.projectId));
        } else if (filter.fieldName === 'Статус') {
          return data.filter((flow) => !filter.values.includes(flow.status));
        } else if (filter.fieldName === 'Зоны') {
          return data.filter((flow) => !filter.values.includes(flow.zoneId));
        } else if (filter.fieldName === 'Id') {
          return data.filter((flow) => !filter.values.includes(flow.flowId));
        } else {
          return data.filter((flow) => !filter.values.includes(flow[filter.field]));
        }
      default:
        return [];
    }
  }

  static isMeetsConditionsFlow(filter: FilterMenuItem, data: FlowOverview[]): FlowOverview[] | [] {
    switch (filter.operator) {
      case OPERATORS.IS:
      case OPERATORS.IN:
        if (filter.fieldName === 'Название') {
          return data.filter((flow) => filter.values.includes(flow.name));
        } else if (filter.fieldName === 'Проект') {
          return data.filter((flow) => filter.values.includes(flow.projectId));
        } else if (filter.fieldName === 'Статус') {
          const filteredData = data.filter((flow) => {
            const statuses = flow.instances.map((element) => element.status);
            return filter.values.some((value) => statuses.includes(value));
          });
          return filteredData;
        } else if (filter.fieldName === 'Зоны') {
          const filteredData = data.filter((flow) => {
            const instances = flow.instances.map((element) => element.zoneId);
            return filter.values.some((value) => instances.includes(value));
          });
          return filteredData;
        } else if (filter.fieldName === 'Версия') {
          if (filter.values[0] === 'Совпадает') {
            const filteredData = data.filter((flow) => {
              // получаем список версий экземпляров текущей конфигурации: flow
              const versions = flow.instances.map((element) => element.version);
              // если у конфгурации нет экземпляров, она НЕ попадает в отфильтрованный список
              if (!(versions && versions.length !== 0)) {
                return false;
              }
              // в отфильтрованный список конфигурация попадет, если у всех экземпляров версия совпадает с конфигурационной
              return versions.every((ver) => flow.version === ver);
            });
            return filteredData;
          }
          // обработка варианта фильтра "Не совпадает"
          const filteredData = data.filter((flow) => {
            // получаем список версий экземпляров текущей конфигурации: flow
            const versions = flow.instances.map((element) => element.version);
            // если у конфгурации нет экземпляров, она попадает в отфильтрованный список
            if (!(versions && versions.length !== 0)) {
              return false;
            }
            // в отфильтрованный список конфигурация попадет, если хотя бы у одного экземпляра версия не совпадает с конфигурационной
            return versions.some((ver) => flow.version !== ver);
          });
          return filteredData;
        } else {
          return data.filter((flow) => filter.values.includes(flow[filter.field]));
        }
      case OPERATORS['IS NOT']:
      case OPERATORS['NOT IN']:
        if (filter.fieldName === 'Название') {
          return data.filter((flow) => !filter.values.includes(flow.name));
        } else if (filter.fieldName === 'Проект') {
          return data.filter((flow) => !filter.values.includes(flow.projectId));
        } else if (filter.fieldName === 'Статус') {
          const filteredData = data.filter((flow) => {
            const statuses = flow.instances.map((element) => element.status);
            return filter.values.every((value) => !statuses.includes(value));
          });
          return filteredData;
        } else if (filter.fieldName === 'Зоны') {
          const filteredData = data.filter((flow) => {
            const instances = flow.instances.map((element) => element.zoneId);
            return filter.values.every((value) => !instances.includes(value));
          });
          return filteredData;
        } else {
          return data.filter((flow) => !filter.values.includes(flow[filter.field]));
        }
      default:
        return [];
    }
  }

  //isMeetsConditionsArchive
  static isMeetsConditionsArchive(filter: FilterMenuItem, data: ShortArchiveTaskWithRole[]): ShortArchiveTaskWithRole[] | [] {
    if (filter.field === 'status') {
      return data;
    }
    switch (filter.operator) {
      case OPERATORS.IS:
      case OPERATORS.IN:
        if (filter.fieldName === 'Проект') {
          return data.filter((archive) => filter.values.includes(archive.project));
        } else if (filter.field === 'zone') {
          return data.filter((archive) => archive.instances.findIndex((instance) => filter.values.includes(instance.zoneId)) >= 0);
        } else if (filter.field === 'version') {
          return data.filter((archive) => {
            // @ts-ignore
            const { version: archiveVersion } = archive;
            const instanceVersions = archive.instances.map((instance) => instance.version);

            if (filter.values[0] === 'Совпадает') {
              const res = instanceVersions.includes(archiveVersion);
              return res;
            }
            const r = !instanceVersions.includes(archiveVersion);
            return r;
          });
        } else {
          return data.filter((archive) => filter.values.includes(archive[filter.field]));
        }
      case OPERATORS['IS NOT']:
      case OPERATORS['NOT IN']:
        if (filter.fieldName === 'Проект') {
          return data.filter((archive) => !filter.values.includes(archive.project));
        } else if (filter.field === 'zone') {
          return data.filter((archive) => archive.instances.findIndex((instance) => filter.values.includes(instance.zoneId)) === -1);
        } else {
          return data.filter((archive) => !filter.values.includes(archive[filter.field]));
        }
      case OPERATORS.MORE:
        if (filter.fieldName === 'Скорость обработки (%)') {
          const res = data.filter(
            (archiveTask) => archiveTask.instances.findIndex((instance) => instance.overdraftPercent >= Number.parseInt(filter.values[0])) >= 0,
          );
          return res;
        }
      case OPERATORS.EQUAL:
        if (filter.fieldName === 'Скорость обработки (%)') {
          return data.filter(
            (archiveTask) => archiveTask.instances.findIndex((instance) => instance.overdraftPercent === Number.parseInt(filter.values[0])) >= 0,
          );
        }
      case OPERATORS.LESS:
        if (filter.fieldName === 'Скорость обработки (%)') {
          const res = data.filter(
            (archiveTask) => archiveTask.instances.findIndex((instance) => instance.overdraftPercent <= Number.parseInt(filter.values[0])) >= 0,
          );
          return res;
        }
      default:
        return [];
    }
  }

  static isMeetsConditionsArchiveTaskInstance(
    filter: FilterMenuItem | undefined,
    archiveTaskInstanceStatus: {
      instance: ArchiveTaskInstance;
      status?: ArchiveTaskInstanceStatus | ArchiveTaskRequestStatus;
    }[],
  ) {
    if (filter?.field === 'status') {
      return archiveTaskInstanceStatus.filter(({ status, instance }) => {
        switch (filter.operator) {
          case OPERATORS.IS:
          case OPERATORS.IN:
            if (instance !== undefined && status !== undefined && status.indexing !== undefined) {
              return filter.values.includes(status.indexing.status);
            }
          case OPERATORS['IS NOT']:
          case OPERATORS['NOT IN']:
            if (instance !== undefined && status !== undefined && status.indexing !== undefined) {
              return !filter.values.includes(status.indexing.status);
            }
        }
      });
    }
    if (!filter || (filter.field !== 'zone' && filter.fieldName !== 'Скорость обработки (%)')) {
      return archiveTaskInstanceStatus;
    }
    return archiveTaskInstanceStatus.filter(({ status, instance }) => {
      switch (filter.operator) {
        case OPERATORS.IS:
        case OPERATORS.IN:
          if (instance !== undefined && instance.zoneId !== undefined && filter.field === 'zone') {
            return filter.values.includes(instance.zoneId);
          }
        case OPERATORS['IS NOT']:
        case OPERATORS['NOT IN']:
          if (instance !== undefined && instance.zoneId !== undefined && filter.field === 'zone') {
            return filter.values.includes(instance.zoneId) === false;
          }
        case OPERATORS.MORE:
          if (filter.fieldName === 'Скорость обработки (%)') {
            return instance?.overdraftPercent >= Number.parseInt(filter.values[0]);
          }
        case OPERATORS.EQUAL:
          if (filter.fieldName === 'Скорость обработки (%)') {
            return instance?.overdraftPercent === Number.parseInt(filter.values[0]);
          }
        case OPERATORS.LESS:
          if (filter.fieldName === 'Скорость обработки (%)') {
            return instance?.overdraftPercent <= Number.parseInt(filter.values[0]);
          }
      }
    });
  }

  static isMeetsConditionsDictionary(filter: FilterMenuItem, data: Dictionary[]): Dictionary[] | [] {
    switch (filter.operator) {
      case OPERATORS.IS:
      case OPERATORS.IN:
        if (filter.fieldName === 'Зона') {
          return data.filter((dictionary) => filter.values.includes(dictionary.instances[0].zoneId));
        }
        if (filter.fieldName === 'Проект') {
          return data.filter((dictionary) => filter.values.includes(dictionary.project));
        } else {
          return data.filter((dictionary) => filter.values.includes(dictionary[filter.field]));
        }
      case OPERATORS['IS NOT']:
      case OPERATORS['NOT IN']:
        if (filter.fieldName === 'Зона') {
          return data.filter((dictionary) => !filter.values.includes(dictionary.instances[0].zoneId));
        }
        if (filter.fieldName === 'Проект') {
          return data.filter((dictionary) => !filter.values.includes(dictionary.project));
        } else {
          return data.filter((dictionary) => !filter.values.includes(dictionary[filter.field]));
        }
      default:
        return [];
    }
  }

  static isMeetsConditionsMeta(filter: FilterMenuItem, status: string): boolean {
    if (filter.field === 'status') {
      switch (filter.operator) {
        case OPERATORS.IS:
        case OPERATORS.IN:
          return filter.values.includes(status);
        case OPERATORS['IS NOT']:
        case OPERATORS['NOT IN']:
          return !filter.values.includes(status);
        default:
          return true;
      }
    } else {
      return true;
    }
  }

  static isMeetsConditionsArchiveMeta(
    filter: FilterMenuItem,
    archive: ShortArchiveTaskWithRole,
    statuses: Map<string, ArchiveTaskInstanceStatus | ArchiveTaskRequestStatus>,
  ): boolean {
    if (filter.field === 'status') {
      switch (filter.operator) {
        case OPERATORS.IS:
          if (archive.instancesIds.length == 0) {
            return false;
          }
          let res = false;
          archive.instancesIds.map((id) => {
            if (
              !(
                statuses.get(id) == ArchiveTaskRequestStatus.success ||
                statuses.get(id) == ArchiveTaskRequestStatus.failed ||
                statuses.get(id) == ArchiveTaskRequestStatus.inProcess
              )
            ) {
              res = res || filter.values.includes(statuses.get(id)?.indexing?.status);
            }
          });
          return res;
        default:
          return false;
      }
    } else {
      return true;
    }
  }

  static isMeetsConditionsKafka(filter: FilterMenuItem, data: KafkaTopic[]): KafkaTopic[] | [] {
    switch (filter.operator) {
      case OPERATORS.IS:
      case OPERATORS.IN:
        if (filter.fieldName === 'Количество партиций') {
          return data.filter((topic) => {
            return filter.values.some((range) => Utils.isInRange(range, topic[filter.field]));
          });
        } else if (filter.fieldName === 'Количество реплик') {
          return data.filter((topic) => {
            let res = false;
            filter.values.map((range) => {
              res = res || this.isInRange(range, topic[filter.field]);
            });
            return res;
          });
        } else if (filter.fieldName === 'Проект') {
          return data.filter((topic) => filter.values.includes(topic.projectId));
        } else {
          return data.filter((flow) => filter.values.includes(flow[filter.field]));
        }
      case OPERATORS['IS NOT']:
      case OPERATORS['NOT IN']:
        if (filter.fieldName === 'Количество партиций' || filter.fieldName === 'Количество реплик') {
          return data.filter((topic) => {
            let res = true;
            filter.values.map((range) => {
              res = res && !this.isInRange(range, topic[filter.field]);
            });
            return res;
          });
        } else if (filter.fieldName === 'Проект') {
          return data.filter((topic) => !filter.values.includes(topic.projectId));
        } else {
          return data.filter((flow) => !filter.values.includes(flow[filter.field]));
        }
      default:
        return [];
    }
  }

  static isMeetsConditionsProjects(filter: FilterMenuItem, data: ProjectMeta[]): ProjectMeta[] | [] {
    switch (filter.operator) {
      case OPERATORS.IS:
      case OPERATORS.IN:
        if (filter.fieldName === 'Проект') {
          return data.filter((project) => filter.values.includes(project.name));
        } else {
          return data.filter((project) => {
            let res = true;
            filter.values.map((percent) => {
              res = res && this.isInPerCent(percent, isNaN(project[filter.field]) ? 0 : project[filter.field]);
            });
            return res;
          });
        }
      case OPERATORS['IS NOT']:
      case OPERATORS['NOT IN']:
        if (filter.fieldName === 'Проект') {
          return data.filter((project) => !filter.values.includes(project.name));
        } else {
          return data.filter((project) => {
            let res = true;
            filter.values.map((percent) => {
              res = res && !this.isInPerCent(percent, isNaN(project[filter.field]) ? 0 : project[filter.field]);
            });
            return res;
          });
        }
      default:
        return [];
    }
  }

  static getNounByCount(number, one, two, five) {
    let n = Math.abs(number);
    n %= 100;
    if (n >= 5 && n <= 20) {
      return five;
    }
    n %= 10;
    if (n === 1) {
      return one;
    }
    if (n >= 2 && n <= 4) {
      return two;
    }
    return five;
  }

  static getAllPossibleSupervisorsLabels(supervisors: GenericSupervisorInfo[]): string[] {
    const res: string[] = [];
    supervisors
      .filter((supervisor) => supervisor.labels?.length > 0)
      .map((supervisor) => {
        return supervisor.labels;
      })
      .map((labels) => {
        return labels.map((label) => {
          res.push(label);
        });
      });
    return Utils.getAllPossibleValues(res);
  }

  static getAllPossibleFulltextLabels(fulltextTasks: FulltextTask[]): string[] {
    const res: string[] = [];
    fulltextTasks
      .filter((fulltextTask) => fulltextTask?.labels)
      .map((fulltextTask) => {
        return fulltextTask.labels;
      })
      .map((labels) => {
        return labels.map((label) => {
          res.push(label);
        });
      });
    return Utils.getAllPossibleValues(res);
  }

  static getAllPossibleArchiveLabels(archiveTasks: ShortArchiveTaskWithId[]): string[] {
    const res: string[] = [];
    archiveTasks
      .filter((archiveTask) => archiveTask?.labels)
      .map((archiveTask) => {
        return archiveTask.labels;
      })
      .map((labels) => {
        return labels.map((label) => {
          res.push(label);
        });
      });
    return Utils.getAllPossibleValues(res);
  }

  static createLabelsFilter(filters: FilterMenuItem[]): string[] {
    let labels: string[] = [];
    if (filters) {
      filters.forEach((filter) => {
        if (filter.field === 'label') {
          filter.values.map((value) => {
            labels.push(value);
          });
        }
      });
    }
    labels = Utils.getAllPossibleValues(labels);
    return labels;
  }
  static getOperatorType(operator: string) {
    switch (operator) {
      case 'is':
        return 'eq';
      case 'is not':
        return 'isNot';
      case 'not in':
        return 'notIn';
      case 'in':
        return 'in';
      case '=':
        return 'eq';
      case '>=':
        return 'ge';
      case '<=':
        return 'le';
      default:
        return '';
    }
  }
  static createArchiveFilters(filters: FilterMenuItem[]) {
    return filters.map((item) => {
      if (item.field === 'version') {
        return {
          field: 'versionMatch',
          op: Utils.getOperatorType(item.operator),
        };
      }
      if (item.field === 'overdraft') {
        return {
          field: 'maxOverdraftPercent',
          op: Utils.getOperatorType(item.operator),
          values: item.values,
        };
      }
      if (item.field === 'shortName') {
        return {
          field: 'project',
          op: Utils.getOperatorType(item.operator),
          values: item.values,
        };
      }
      return {
        field: item.field,
        op: Utils.getOperatorType(item.operator),
        values: item.values,
      };
    });
  }

  static createConstraintFilterParamsFromFilterMenuItem(filters: FilterMenuItem[]): ConstraintFilterParams {
    const res: ConstraintFilterParams = {};
    filters.map((filter) => {
      if (filter.fieldName === 'Проект') {
        if (res.projects) {
          filter.values.map((value) => res.projects?.push(value));
        } else {
          res.projects = filter.values;
        }
      } else if (filter.field === 'constraintType') {
        const allTypes = [ConstraintType.fulltext, ConstraintType.archive, ConstraintType.analytic];
        switch (filter.operator) {
          case OPERATORS.IS:
          case OPERATORS.IN:
            res.constraintType = filter.values;
            break;
          case OPERATORS['NOT IN']:
          case OPERATORS['IS NOT']:
            res.constraintType = allTypes.filter((type) => !filter.values.includes(type));
            break;
        }
      } else {
        switch (filter.values[0]) {
          case OBJECT_TYPE_MAP.PROJECT:
            res.objectType = OBJECT_TYPE.PROJECT;
            break;
          case OBJECT_TYPE_MAP.INDEX:
            res.objectType = OBJECT_TYPE.INDEX;
            break;
        }
      }
    });
    if (res.projects) {
      res.projects = Utils.getAllPossibleValues(res.projects);
    }
    return res;
  }

  static createBlockFilterParamsFromFilterMenuItem(filters: FilterMenuItem[]): BlockFilterParams {
    const res: BlockFilterParams = {};
    filters.map((filter) => {
      if (filter.fieldName === 'Проект') {
        if (res.projects) {
          filter.values.map((value) => res.projects?.push(value));
        } else {
          res.projects = filter.values;
        }
      } else if (filter.field === 'constraintType') {
        const allTypes = [ConstraintType.fulltext, ConstraintType.archive, ConstraintType.analytic];
        switch (filter.operator) {
          case OPERATORS.IS:
          case OPERATORS.IN:
            res.constraintType = filter.values;
            break;
          case OPERATORS['NOT IN']:
          case OPERATORS['IS NOT']:
            res.constraintType = allTypes.filter((type) => !filter.values.includes(type));
            break;
        }
      } else if (filter.field === 'objectType') {
        switch (filter.values[0]) {
          case OBJECT_TYPE_MAP.PROJECT:
            res.objectType = OBJECT_TYPE.PROJECT;
            break;
          case OBJECT_TYPE_MAP.INDEX:
            res.objectType = OBJECT_TYPE.INDEX;
            break;
          case OBJECT_TYPE_MAP.GLOBAL:
            res.objectType = OBJECT_TYPE.GLOBAL;
            break;
        }
      } else {
        switch (filter.values[0]) {
          case UNIT_MAP.USER:
            res.subjectType = Unit.USER;
            break;
          case UNIT_MAP.GROUP:
            res.subjectType = Unit.GROUP;
            break;
        }
      }
    });
    if (res.projects) {
      res.projects = Utils.getAllPossibleValues(res.projects);
    }
    return res;
  }

  static getCopyOfElement(element: any) {
    return JSON.parse(JSON.stringify(element));
  }

  static isOsirisCheckQuotaEquals(first: OsirisCheckQuotaProject, second: OsirisCheckQuotaProject) {
    return first.quotaType.name === first.quotaType.name && first.max === second.max && first.spent === second.spent;
  }

  static isOsirisTrafficQuotaEquals(first: OsirisTrafficQuotaProject, second: OsirisTrafficQuotaProject) {
    return first && second
      ? first.quotaType.name === first.quotaType.name &&
          first.max === second.max &&
          first.spent === second.spent &&
          first.maxSecondsInOver === second.maxSecondsInOver &&
          first.over === second.over
      : false;
  }

  static isUnimonQuotaEquals(first: UnimonProjectQuota, second: UnimonProjectQuota) {
    return first && second
      ? first.overdraftMinutes === second.overdraftMinutes &&
          first.overdraftPercent === second.overdraftPercent &&
          first.limitTrafficPerMin === second.limitTrafficPerMin &&
          first.currentUtilization === second.currentUtilization
      : false;
  }

  static isAlmgrQuotaEquals(first: AlmgrQuota, second: AlmgrQuota) {
    return first && second
      ? first.maxRpm === second.maxRpm &&
          first.maxGroupRulesAmount === second.maxGroupRulesAmount &&
          first.currentRpm === second.currentRpm &&
          first.currentGroupRulesAmount === second.currentGroupRulesAmount
      : false;
  }

  static isOsirisTrafficQuotaEmpty(quota: OsirisTrafficQuotaProject) {
    return quota.maxSecondsInOver === 0 && quota.max === 0 && quota.over === 0;
  }

  static isOsirisCheckQuotaEmpty(quota: OsirisCheckQuotaProject) {
    return quota.max === 0;
  }

  static isInputNumberPositiveInteger(number?: string) {
    return number && number >= 0 && !isNaN(number) && Number.isInteger(parseFloat(number));
  }

  static flowFormat(
    flowName: string,
    data: string,
    projectId: number,
    useGlobalConsumerGroup: boolean,
    dlqTopic?: DlqTopic,
    businessTask?: BusinessTask,
  ) {
    const json = {
      projectId: projectId,
      name: flowName,
      jobConfiguration: {
        useGlobalConsumerGroup: useGlobalConsumerGroup || false,
        graph: JSON.parse(data),
      },
    };

    if (businessTask) json.businessTask = businessTask;
    if (dlqTopic)
      json.jobConfiguration.deadLetterQueue = {
        target: {
          kafka: dlqTopic,
        },
      };

    return JSON.stringify(json);
  }

  static getColumns(columns: Column<any>[], groupingState: any): Column<any>[] {
    if (groupingState.length > 0) {
      groupingState.map((state) => {
        columns.map((column) => {
          if (column.field == state.field) {
            column['defaultGroupOrder'] = state.tableData.groupOrder;
          }
        });
      });
    }
    return columns;
  }

  static getTopicNameWithProject(topicId: number, topics: KafkaTopic[], projects: Project[]) {
    const topic: KafkaTopic | null = topics.find((row) => row.id === topicId) ?? null;
    if (!topic) return null;

    const project = projects.find((row) => row.id === topic.projectId);

    return project ? `${project.name}\/${topic.name}` : topic.name;
  }
}
