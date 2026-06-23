import * as _ from 'lodash';

import {
  Cluster,
  ClusterItem,
  Connection,
  QuotaListItem,
  ClusterAllowanceUpdateItem,
  ClusterQuotaUpdateItem,
  QuotaRemainingItem,
  CheckClustersEstimateParams,
  CheckClustersResponse,
} from '../store/clusters/Types';
import { ErrorHandling } from '../utils/ErrorHandling';

import BackendProvider from './BackendProvider';

const ERROR_502_MESSAGE = 'Сервис размещений в данный момент недоступен. Обратитесь к администратору.';
const apiRoot = '/internal/source/kafka/clusters';

export default class ClusterService {
  // Получение списка кластеров
  static async getClusters(okCallback: (clusters: Cluster[]) => void, errorCallback: (message: string) => void) {
    const result = await BackendProvider.request('GET', apiRoot);

    if (result.ok) {
      if (this.isNoContent(result.status)) {
        okCallback([]);
      } else {
        okCallback((await result.json()) as Cluster[]);
      }
    } else {
      const message = await ErrorHandling.handleError(result, ERROR_502_MESSAGE);
      errorCallback(message.message);
    }
  }

  // Получение кластера по id
  static async getCluster(id: number, okCallback: (cluster: Cluster) => void, errorCallback: (message: string) => void) {
    const result = await BackendProvider.request('GET', `${apiRoot}/${id}`);

    if (result.ok) {
      okCallback((await result.json()) as Cluster);
    } else {
      const message = await ErrorHandling.handleError(result, ERROR_502_MESSAGE);
      errorCallback(message.message);
    }
  }

  // Создание кластера
  static async createCluster(cluster: Cluster, okCallback: () => void, errorCallback: (message: string) => void) {
    const result = await BackendProvider.request('POST', apiRoot, null, null, JSON.stringify(cluster));

    if (result.ok) {
      okCallback();
    } else {
      const message = await ErrorHandling.handleError(result, ERROR_502_MESSAGE);
      errorCallback(message.message);
    }
  }

  // Редактирование кластера
  static async editCluster(id: number, cluster: Cluster, okCallback: () => void, errorCallback: (message: string) => void) {
    const result = await BackendProvider.request('PUT', `${apiRoot}/${id}`, null, null, JSON.stringify(cluster));

    if (result.ok) {
      okCallback();
    } else {
      const message = await ErrorHandling.handleError(result, ERROR_502_MESSAGE);
      errorCallback(message.message);
    }
  }

  // Удаление кластера
  static async deleteCluster(id: number, okCallback: () => void, errorCallback: (message: string) => void) {
    const result = await BackendProvider.request('DELETE', `${apiRoot}/${id}`);

    if (result.ok) {
      okCallback();
    } else {
      const message = await ErrorHandling.handleError(result, ERROR_502_MESSAGE);
      errorCallback(message.message);
    }
  }

  // Проверка подключения
  static async testKafkaConnection(connection: Connection, okCallback: (result: any) => void, errorCallback: (message: string) => void) {
    const result = await BackendProvider.request('POST', apiRoot.replace('clusters', 'test'), null, null, JSON.stringify(connection));

    if (result.ok) {
      okCallback((await result.json()) as Connection);
    } else {
      const message = await ErrorHandling.handleError(result, ERROR_502_MESSAGE);
      errorCallback(message.message);
    }
  }

  static async getKafkaClustersByProject(projectId: number, okCallback: (clusters: Cluster[]) => void, errorCallback: (message: string) => void) {
    const result = await BackendProvider.request('GET', `${apiRoot}/project/${projectId}`);

    if (result.ok) {
      if (this.isNoContent(result.status)) {
        okCallback([]);
      } else {
        okCallback((await result.json()) as Cluster[]);
      }
    } else {
      const message = await ErrorHandling.handleError(result, ERROR_502_MESSAGE);
      errorCallback(message.message);
    }
  }

  // получение квот на кластеры для проектов
  static async getClustersQuota(
    projects: string[],
    clustersId: number[],
    okCallback: (data: QuotaListItem[]) => void,
    errorCallback: (errorMessage: string) => void,
  ): Promise<void> {
    const query: { projects: string[]; cluster_ids: number[] } = { projects: [], cluster_ids: [] };

    if (projects.length) {
      query.projects = projects;
    } else {
      delete query.projects;
    }
    if (clustersId.length) {
      query.cluster_ids = clustersId;
    } else {
      delete query.cluster_ids;
    }

    const result = await BackendProvider.request('GET', '/source/kafka/quota/list', null, _.isEmpty(query) ? null : query);

    if (result.ok) {
      if (this.isNoContent(result.status)) {
        okCallback([]);
      } else {
        const data = await result.json();
        okCallback(data);
      }
    } else {
      const message = await ErrorHandling.handleError(result, ERROR_502_MESSAGE);
      errorCallback(message.message);
    }
  }

  // получить кластеры, включенные для проекта
  static async getProjectClusters(
    project: string,
    okCallback: (data: ClusterItem[]) => void,
    errorCallback: (errorMessage: string) => void,
  ): Promise<void> {
    const result = await BackendProvider.request('GET', '/source/kafka/clusters/project/' + project + '/list');

    if (result.ok) {
      if (this.isNoContent(result.status)) {
        okCallback([]);
      } else {
        const data = await result.json();
        okCallback(data);
      }
    } else {
      const message = await ErrorHandling.handleError(result, ERROR_502_MESSAGE);
      errorCallback(message.message);
    }
  }

  // изменить максимальное значение квоты для переданных кластеров, если кластер не был передан - квота обнуляется
  static async setClustersQuota(
    projectId: number,
    quotas: ClusterQuotaUpdateItem[],
    okCallback: () => void,
    errorCallback: (errorMessage: string) => void,
  ): Promise<void> {
    const result = await BackendProvider.request('POST', `/internal/source/kafka/quota/${projectId}/clusters`, null, null, JSON.stringify(quotas));

    if (result.ok) {
      okCallback();
    } else {
      const message = await ErrorHandling.handleError(result, ERROR_502_MESSAGE);
      errorCallback(message.message);
    }
  }

  // изменить максимальное значение квоты для переданных кластеров, если кластер не был передан - квота обнуляется
  static async checkClustersEstimate({
    projectName,
    clusterId,
    topicName,
    params,
    okCallback,
    errorCallback,
  }: CheckClustersEstimateParams): Promise<void> {
    const search = new URLSearchParams();
    search.set('clusterId', `${clusterId}`);
    if (topicName) {
      search.set('topicName', topicName);
    }
    const result = await BackendProvider.request(
      'POST',
      `/source/kafka/quota/estimate/${projectName}?${search.toString()}`,
      null,
      null,
      JSON.stringify(params),
    );

    if (result.ok) {
      const data: CheckClustersResponse = await result.json();
      okCallback(data);
    } else {
      const message = await ErrorHandling.handleError(result, ERROR_502_MESSAGE);
      errorCallback(message.message);
    }
  }

  // включить кластеры clustersId[] для данного проекта
  static async setClustersAllowance(
    projectId: number,
    clustersId: ClusterAllowanceUpdateItem[],
    okCallback: () => void,
    errorCallback: (errorMessage: string) => void,
  ): Promise<void> {
    const result = await BackendProvider.request(
      'POST',
      `/internal/source/kafka/clusters/allowance/project/${projectId}`,
      null,
      null,
      JSON.stringify(clustersId),
    );

    if (result.ok) {
      okCallback();
    } else {
      const message = await ErrorHandling.handleError(result, ERROR_502_MESSAGE);
      errorCallback(message.message);
    }
  }

  static async getClustersRemainingQuota(
    okCallback: (data: QuotaRemainingItem[]) => void,
    errorCallback: (errorMessage: string) => void,
  ): Promise<void> {
    const result = await BackendProvider.request('GET', '/internal/source/kafka/quota/clusters/remaining');

    if (result.ok) {
      if (this.isNoContent(result.status)) {
        okCallback([]);
      } else {
        const data = await result.json();
        okCallback(data);
      }
    } else {
      const message = await ErrorHandling.handleError(result, ERROR_502_MESSAGE);

      errorCallback(message.message);
    }
  }

  static isNoContent = (statusCode: number) => statusCode === 204;
}
