import { any } from 'prop-types';
import * as React from 'react';

import { IndexConfig } from '../../store/config/Types';
import { DruidSupervisor, GenericSupervisorInfo, TaskData, TuningConfig } from '../../store/monitoring/Types';

export default class TaskProvider extends React.Component<any, any> {
  static getEmptyGenericInfo(): GenericSupervisorInfo {
    return {
      id: -1,
      topicId: -1,
      projectId: -1,
      datasource: '',
      canEdit: true,
      canManageAccess: false,
      labels: undefined,
      datasourceFullName: '',
      tracing: false,
      version: '',
    };
  }

  static getExampleTaskData(): TaskData {
    return {
      filter: '',
      flattenData: [
        { type: 'path', name: 'type', expr: '$.metricset.name' },
        { type: 'path', name: 'hostname', expr: '$.host.name' },
        { type: 'path', name: 'module', expr: '$.metricset.module' },
        { type: 'path', name: 'namespace', expr: '$.metricset.namespace' },
        { type: 'path', name: 'name', expr: '$.metricset.name' },
        { type: 'path', name: 'diskio_iostat_request_avg_size', expr: '$.system.diskio.iostat.request.avg_size' },
        { type: 'path', name: 'diskio_iostat_await', expr: '$.system.diskio.iostat.await' },
        { type: 'path', name: 'diskio_iostat_service_time', expr: '$.system.diskio.iostat.service_time' },
        { type: 'path', name: 'diskio_read_bytes', expr: '$.system.diskio.read.bytes' },
        { type: 'path', name: 'diskio_read_time', expr: '$.system.diskio.read.time' },
        { type: 'path', name: 'diskio_read_count', expr: '$.system.diskio.read.count' },
        { type: 'path', name: 'diskio_write_bytes', expr: '$.system.diskio.write.bytes' },
        { type: 'path', name: 'diskio_wire_time', expr: '$.system.diskio.write.time' },
        { type: 'path', name: 'diskio_write_count', expr: '$.system.diskio.write.count' },
        { type: 'path', name: 'fsstat_total_size_used', expr: '$.system.fsstat.total_size.used' },
        { type: 'path', name: 'fsstat_total_size_total', expr: '$.system.fsstat.total_size.total' },
        { type: 'path', name: 'fsstat_total_size_free', expr: '$.system.fsstat.total_size.free' },
        { type: 'path', name: 'fsstat_total_file', expr: '$.system.fsstat.total_files' },
        { type: 'path', name: 'fsstat_count', expr: '$.system.fsstat.count' },
        { type: 'path', name: 'network_in_bytes', expr: '$.system.network.in.bytes' },
        { type: 'path', name: 'network_out_bytes', expr: '$.system.network.out.bytes' },
        { type: 'path', name: 'network_interface', expr: '$.system.network.name' },
        { type: 'path', name: 'memory_actual_used_bytes', expr: '$.system.memory.actual.used.bytes' },
        { type: 'path', name: 'memory_actual_free', expr: '$.system.memory.actual.free' },
        { type: 'path', name: 'memory_swap_used_bytes', expr: '$.system.memory.swap.used.bytes' },
        { type: 'path', name: 'memory_used_bytes', expr: '$.system.memory.used.bytes' },
        { type: 'path', name: 'memory_free_bytes', expr: '$.system.memory.free' },
        { type: 'path', name: 'cpu_user', expr: '$.system.cpu.user.pct' },
        { type: 'path', name: 'cpu_system', expr: '$.system.cpu.system.pct' },
        { type: 'path', name: 'device_name', expr: '$.system.diskio.name' },
        { type: 'path', name: 'jvm_heap_usage', expr: '$.jolokia.epm.memory.heap_usage.used' },
        { type: 'path', name: 'jvm_non_heap_usage', expr: '$.jolokia.epm.memory.non_heap_usage.used' },
        {
          type: 'path',
          name: 'jvm_objectPendingFinalizationCount',
          expr: '$.jolokia.epm.objectPendingFinalizationCount',
        },
        { type: 'path', name: 'jvm_daemonCount', expr: '$.jolokia.epm.threading.daemonCount' },
        { type: 'path', name: 'jvm_threadCount', expr: '$.jolokia.epm.threading.count' },
      ],
      dimensionExclusions: [],
      timestampSpec: {
        column: 'test',
        format: 'test',
      },
      dimensionData: [
        { name: 'diskio_iostat_request_avg_size', type: 'long' },
        { name: 'diskio_iostat_await', type: 'long' },
        { name: 'diskio_read_count', type: 'long' },
        { name: 'diskio_write_bytes', type: 'long' },
        { name: 'diskio_wire_time', type: 'long' },
        { name: 'diskio_write_count', type: 'long' },
        { name: 'fsstat_total_size_used', type: 'long' },
        { name: 'fsstat_total_size_total', type: 'long' },
        { name: 'fsstat_total_size_free', type: 'long' },
        { name: 'fsstat_total_file', type: 'long' },
        { name: 'fsstat_count', type: 'long' },
        { name: 'network_in_bytes', type: 'long' },
        { name: 'network_out_bytes', type: 'long' },
        { name: 'memory_actual_us ed_btes', type: 'long' },
        { name: 'memory_actual_free', type: 'long' },
        { name: 'memory_swap_used_bytes', type: 'long' },
        { name: 'memory_used_bytes', type: 'long' },
        { name: 'memory_free_bytes', type: 'long' },
        { name: 'cpu_user', type: 'double' },
        { name: 'cpu_system', type: 'double' },
        { name: 'jvm_heap_usage', type: 'long' },
        { name: 'jvm_non_heap_usage', type: 'long' },
        { name: 'jvm_objectPendingFinalizationCount', type: 'long' },
        { name: 'jvm_daemonCount', type: 'long' },
      ],
      transformData: [{ type: 'expression', name: 'name', expression: "trim(name,'\"')" }],
      granularitySpec: {
        queryGranularity: 'NONE',
        segmentGranularity: 'HOUR',
        type: 'uniform',
        rollup: false,
      },
      tuningConfig: this.getEmptyTuningConfig(),
      ioConfig: {
        replicas: 1,
        taskCount: 1,
        lateMessageRejectionPeriod: 'P1D',
        useEarliestOffset: false,
      },
      metricsData: [],
      datasource: '',
    };
  }

  static getEmptyData(): TaskData {
    return {
      filter: '',
      flattenData: [],
      timestampSpec: {
        column: '',
        format: 'auto',
      },
      dimensionData: [],
      dimensionExclusions: [],
      transformData: [],
      granularitySpec: {
        queryGranularity: 'NONE',
        segmentGranularity: 'HOUR',
        type: 'uniform',
        rollup: false,
      },
      tuningConfig: this.getEmptyTuningConfig(),
      ioConfig: {
        replicas: 1,
        taskCount: 1,
        useEarliestOffset: false,
      },
      metricsData: [],
      datasource: '',
      labels: undefined,
    };
  }

  static getEmptyTuningConfig(): TuningConfig {
    return {
      maxRowsPerSegment: 5000000,
      maxRowsInMemory: 1000000,
      maxBytesInMemory: 0,
    };
  }

  static getDruidTask(): DruidSupervisor {
    return {
      data: TaskProvider.getEmptyData(),
      id: 0,
      project_id: -1,
      topicId: -1,
      is_tracing: false,
      datasource: '',
      datasourceFullName: '',
      status: '',
    };
  }
}
