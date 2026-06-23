import { Versions } from '../store/config/Types';
import { PipelineMeta, Pipeline, PipelineShort, PipelineStatus, PipelineInputFormatListEnum } from '../store/pipeline/Types';
import { ErrorHandling } from '../utils/ErrorHandling';

import BackendProvider from './BackendProvider';

const ERROR_502_MESSAGE = 'Внутренний сервис недоступен в данный момент. Обратитесь к администратору.';

export default class PipelineService {
  static async getVersion(okCallback: (data: string, res?: Versions[]) => void, errorCallback: (errorMessage: string) => void) {
    const result = await BackendProvider.request('GET', '/internal/pipeline/index/metadata/version');

    if (result.ok) {
      const data = await result.text();
      try {
        const res = JSON.parse(data);
        okCallback(data, res);
      } catch (e) {
        okCallback(data);
      }
    } else {
      const message = await ErrorHandling.handleError(result, ERROR_502_MESSAGE);
      errorCallback(message.message);
    }
  }

  static async createPipeline(pipeline: Pipeline, okCallback?: () => void, errorCallback?: (errorMsg: { message: any; details?: string }) => void) {
    const res = await BackendProvider.request('POST', '/internal/pipeline/index/config', null, null, JSON.stringify(pipeline));

    if (res.ok) {
      if (okCallback) okCallback();
    } else if (errorCallback) {
      const getTopicNotFoundText = () => {
        if (pipeline.deadLetterQueue) {
          return ` ${pipeline.deadLetterQueue.target.kafka.projectKey}/${pipeline.deadLetterQueue.target.kafka.name} (один или несколько)`;
        }
        return ` ${pipeline.sources.kafka
          .map((value) => {
            return value.projectShortName + '/' + value.topicName;
          })
          .join(', ')} (один или несколько)`;
      };
      const message = await ErrorHandling.handleError(
        res,
        ERROR_502_MESSAGE,
        ` ${pipeline.projectShortName}`,
        ` ${pipeline.projectShortName}/${pipeline.name}`,
        '',
        '',
        getTopicNotFoundText(),
      );
      errorCallback(message);
    }
  }

  static async updatePipeline(
    projectShortName: string,
    name: string,
    pipeline: any,
    okCallback?: () => void,
    errorCallback?: (errorMsg: { message: string; details?: string }) => void,
  ) {
    const res = await BackendProvider.request(
      'PUT',
      '/internal/pipeline/index/project/' + projectShortName + '/name/' + name + '/config',
      null,
      null,
      JSON.stringify(pipeline),
    );

    if (res.ok) {
      if (okCallback) okCallback();
    } else if (errorCallback) {
      const getTopicNotFoundText = () => {
        if (pipeline.deadLetterQueue) {
          return ` ${pipeline.deadLetterQueue.target.kafka.projectKey}/${pipeline.deadLetterQueue.target.kafka.name} (один или несколько)`;
        }
        return ` ${pipeline.sources.kafka
          .map((value) => {
            return value.projectShortName + '/' + value.topicName;
          })
          .join(', ')} (один или несколько)`;
      };
      const message = await ErrorHandling.handleError(
        res,
        ERROR_502_MESSAGE,
        ` ${projectShortName}`,
        ` ${projectShortName}/${name}`,
        '',
        '',
        getTopicNotFoundText(),
      );
      errorCallback(message);
    }
  }

  static async listPipelines(okCallback?: (pipelines: PipelineShort[]) => void, errorCallback?: (errorMsg: string) => void) {
    const res = await BackendProvider.request('GET', '/internal/pipeline/index/list');

    if (res.ok) {
      const data = await res.json();
      if (okCallback) okCallback(data as PipelineShort[]);
    } else if (errorCallback) {
      const message = await ErrorHandling.handleError(res, ERROR_502_MESSAGE);
      errorCallback(message.message);
    }
  }

  static async listPipelinesStatus(okCallback?: (status: Map<string, string>) => void, errorCallback?: (errorMsg: string) => void) {
    const res = await BackendProvider.request('GET', '/internal/pipeline/index/list/status');

    if (res.ok) {
      const data: PipelineStatus[] = await res.json();
      const statuses: Map<string, string> = new Map<string, string>();
      data.map((pipeStatus: PipelineStatus) => {
        statuses.set(pipeStatus.name + pipeStatus.projectShortName + pipeStatus.zoneId, pipeStatus.status);
      });
      if (okCallback) okCallback(statuses);
    } else if (errorCallback) {
      const message = await ErrorHandling.handleError(res, ERROR_502_MESSAGE);
      errorCallback(message.message);
    }
  }

  static async deletePipeline(
    projectShortName: string,
    name: string,
    zoneId?: string,
    okCallback?: () => void,
    errorCallback?: (errorMsg: { message: string; details?: string }) => void,
  ) {
    let res;
    if (zoneId) {
      res = await BackendProvider.request(
        'DELETE',
        '/internal/pipeline/index/project/' + projectShortName + '/name/' + name + '/zone/' + zoneId + '/instance',
      );
    } else {
      res = await BackendProvider.request('DELETE', '/internal/pipeline/index/project/' + projectShortName + '/name/' + name + '/config');
    }

    if (res.ok) {
      if (okCallback) okCallback();
    } else if (errorCallback) {
      const message = await ErrorHandling.handleError(res, ERROR_502_MESSAGE, ` ${projectShortName}`, ` ${projectShortName}/${name}`);
      errorCallback(message);
    }
  }

  static async getPipelineInfo(
    projectShortName: string,
    name: string,
    okCallback?: (pipeline: Pipeline) => void,
    errorCallback?: (errorMsg: string) => void,
  ) {
    const res = await BackendProvider.request('GET', '/internal/pipeline/index/project/' + projectShortName + '/name/' + name + '/config');

    if (res.ok) {
      const data = await res.json();
      if (okCallback) okCallback(data as Pipeline);
    } else if (errorCallback) {
      const message = await ErrorHandling.handleError(res, ERROR_502_MESSAGE, ` ${projectShortName}`, ` ${projectShortName}/${name}`);
      errorCallback(message.message);
    }
  }

  static async getPipelineMetaInfo(
    projectShortName: string,
    name: string,
    zoneId: string,
    okCallback?: (pipeline: PipelineMeta) => void,
    errorCallback?: (errorMsg: string) => void,
  ) {
    const res = await BackendProvider.request(
      'GET',
      '/internal/pipeline/index/project/' + projectShortName + '/name/' + name + '/zone/' + zoneId + '/instance/status',
    );

    if (res.ok) {
      const data = await res.json();
      if (okCallback) okCallback(data as PipelineMeta);
    } else if (errorCallback) {
      const message = await ErrorHandling.handleError(res, ERROR_502_MESSAGE, ` ${projectShortName}`, ` ${projectShortName}/${name}`);
      errorCallback(message.message);
    }
  }

  static async resumePipeline(
    projectShortName: string,
    name: string,
    zoneId: string,
    okCallback?: (msg: string) => void,
    errorCallback?: (errorMsg: { message: string; details?: string }) => void,
  ) {
    const res = await BackendProvider.request(
      'POST',
      '/internal/pipeline/index/project/' + projectShortName + '/name/' + name + '/zone/' + zoneId + '/instance/resume',
    );

    if (res.ok) {
      if (okCallback) okCallback('ok');
    } else if (errorCallback) {
      const message = await ErrorHandling.handleError(res, ERROR_502_MESSAGE, ` ${projectShortName}`, ` ${projectShortName}/${name}`);
      errorCallback(message);
    }
  }

  static async suspendPipeline(
    projectShortName: string,
    name: string,
    zoneId: string,
    okCallback?: (msg: string) => void,
    errorCallback?: (errorMsg: { message: string; details?: string }) => void,
  ) {
    const res = await BackendProvider.request(
      'POST',
      '/internal/pipeline/index/project/' + projectShortName + '/name/' + name + '/zone/' + zoneId + '/instance/suspend',
    );

    if (res.ok) {
      if (okCallback) okCallback('ok');
    } else if (errorCallback) {
      const message = await ErrorHandling.handleError(res, ERROR_502_MESSAGE, ` ${projectShortName}`, ` ${projectShortName}/${name}`);
      errorCallback(message);
    }
  }

  static async refreshInstancePipeline(
    projectShortName: string,
    name: string,
    zoneId: string,
    okCallback?: (msg: string) => void,
    errorCallback?: (errorMsg: { message: string; details?: string }) => void,
  ) {
    const res = await BackendProvider.request(
      'PUT',
      '/internal/pipeline/index/project/' + projectShortName + '/name/' + name + '/zone/' + zoneId + '/instance',
    );

    if (res.ok) {
      if (okCallback) okCallback('ok');
    } else if (errorCallback) {
      const message = await ErrorHandling.handleError(res, ERROR_502_MESSAGE, ` ${projectShortName}`, ` ${projectShortName}/${name}`);
      errorCallback(message);
    }
  }

  static async addInstancePipeline(
    projectShortName: string,
    name: string,
    zoneId: string,
    okCallback?: (msg: string) => void,
    errorCallback?: (errorMsg: { message: string; details?: string }) => void,
  ) {
    const res = await BackendProvider.request(
      'POST',
      '/internal/pipeline/index/project/' + projectShortName + '/name/' + name + '/zone/' + zoneId + '/instance',
    );

    if (res.ok) {
      if (okCallback) okCallback('ok');
    } else if (errorCallback) {
      const message = await ErrorHandling.handleError(res, ERROR_502_MESSAGE, ` ${projectShortName}`, ` ${projectShortName}/${name}`);
      errorCallback(message);
    }
  }

  static async resetInstanceOverdraft(
    project: string,
    name: string,
    zoneId: string,
    okCallback?: () => void,
    errorCallback?: (errorMsg: { message: string; details?: string }) => void,
  ) {
    const res = await BackendProvider.request(
      'POST',
      '/internal/index/fulltext/task/project/' + project + '/name/' + name + '/zone/' + zoneId + '/instance/overdraft/reset',
    );

    if (res.ok) {
      if (okCallback) okCallback();
    } else if (errorCallback) {
      const message = await ErrorHandling.handleError(res, ERROR_502_MESSAGE, ` ${project}`, ` ${project}/${name}/${zoneId}`);
      errorCallback(message);
    }
  }

  static async changeInstanceOverdraft(
    project: string,
    name: string,
    zoneId: string,
    value: number,
    okCallback?: () => void,
    errorCallback?: (errorMsg: { message: string; details?: string }) => void,
  ) {
    const res = await BackendProvider.request(
      'POST',
      '/internal/index/fulltext/task/project/' + project + '/name/' + name + '/zone/' + zoneId + '/instance/overdraft',
      null,
      null,
      JSON.stringify({ overdraftPercent: value }),
    );

    if (res.ok) {
      if (okCallback) okCallback();
    } else if (errorCallback) {
      const message = await ErrorHandling.handleError(res, ERROR_502_MESSAGE, ` ${project}`, ` ${project}/${name}/${zoneId}`);
      errorCallback(message);
    }
  }

  static async resetZoneOverdraft(
    zoneId: string,
    okCallback?: () => void,
    errorCallback?: (errorMsg: { message: string; details?: string }) => void,
  ) {
    const res = await BackendProvider.request('POST', '/internal/index/fulltext/task/zone/' + zoneId + '/instance/overdraft/reset/all');

    if (res.ok) {
      if (okCallback) okCallback();
    } else if (errorCallback) {
      const message = await ErrorHandling.handleError(res, ERROR_502_MESSAGE, ` ${zoneId}`, ` ${zoneId}`);
      errorCallback(message);
    }
  }

  static async getOverdraftValue(quota: any, okCallback?: (value: number) => void, errorCallback?: (error: string) => void) {
    const res = await BackendProvider.request('POST', '/internal/index/fulltext/task/overdraft/estimate', null, null, JSON.stringify(quota));

    if (res.ok) {
      const data = await res.json();
      // let res = JSON.parse(res);
      if (okCallback) okCallback(data.value);
    } else if (errorCallback) {
      const message = await ErrorHandling.handleError(res, ERROR_502_MESSAGE);
      errorCallback(message.message);
    }
  }

  /**
   * Получение наименований схем AVRO
   * @param okCallback
   * @param errorCallback
   */
  static async getSchemaNames(okCallback?: (schemaNames: string[]) => void, errorCallback?: (errorMsg: string) => void) {
    const res = await BackendProvider.request('GET', '/internal/pipeline/index/avro/schema/names');

    if (res.ok) {
      const data = await res.json();
      if (okCallback) okCallback(data as string[]);
    } else if (errorCallback) {
      const message = await ErrorHandling.handleError(res, ERROR_502_MESSAGE);
      errorCallback(message.message);
    }
  }

  /**
   * Получение списка поддерживаемых форматов данных
   * @param okCallback
   * @param errorCallback
   */
  static async getInputFormatList(okCallback?: (formatData: PipelineInputFormatListEnum[]) => void, errorCallback?: (errorMsg: string) => void) {
    const res = await BackendProvider.request('GET', '/internal/pipeline/index/input-format/list');

    if (res.ok) {
      const data = await res.json();
      if (okCallback) okCallback(data as PipelineInputFormatListEnum[]);
    } else if (errorCallback) {
      const message = await ErrorHandling.handleError(res, ERROR_502_MESSAGE);
      errorCallback(message.message);
    }
  }
}
