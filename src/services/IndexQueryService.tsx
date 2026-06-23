import { FulltextFlowEstimateResponse, QuotaIndexProps } from '../components/shared';
import { Versions } from '../store/config/Types';
import { IndexQuota, EstimatedIndexQuota, LuceneQuery } from '../store/index/Types';
import { QuotaPipeline } from '../store/pipeline/Types';
import { ErrorHandling } from '../utils/ErrorHandling';
import { Utils } from '../utils/Utils';

import BackendProvider from './BackendProvider';

const ERROR_502_MESSAGE = 'Сервис индексации в данный момент недоступен. Обратитесь к администратору.';

export default class IndexQueryService {
  static savedParam?: any = null;
  static async getVersion(okCallback: (data: string, res?: Versions[]) => void, errorCallback: (errorMessage: string) => void) {
    const result = await BackendProvider.request('GET', '/internal/index/fulltext/metadata/version');

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

  static async asyncFetchFieldsByIndexId(
    projectShortName: string,
    indexName: string,
    okCallback: (fields: any) => void,
    errorCallback?: (error: string) => void,
  ) {
    const res = await BackendProvider.request('GET', '/internal/index/fulltext/project/' + projectShortName + '/schema/' + indexName + '/fields');

    if (res.ok) {
      const data = await res.json();
      okCallback(data);
    } else if (errorCallback) {
      const message = await ErrorHandling.handleError(res, ERROR_502_MESSAGE, ` ${projectShortName}`, ` ${projectShortName}/${indexName}`);
      errorCallback(message.message);
    }
  }

  static async asyncQueryIndexById(
    projectShortName: string,
    indexName: string,
    query: LuceneQuery,
    okCallback,
    errorCallback?: (error: string) => void,
  ) {
    const res = await BackendProvider.request(
      'POST',
      '/internal/index/fulltext/project/' + projectShortName + '/query/' + indexName,
      null,
      null,
      JSON.stringify(query),
    );

    if (res.ok) {
      const data = await res.json();
      okCallback(data);
    } else if (errorCallback) {
      const message = await ErrorHandling.handleError(res, ERROR_502_MESSAGE, ` ${projectShortName}`, ` ${projectShortName}/${indexName}`);
      errorCallback(message.message);
    }
  }

  static async asyncFetchQuota(projectShortName: string, okCallback: (quota: IndexQuota) => void, errorCallback?: (error: string) => void) {
    const res = await BackendProvider.request('GET', '/internal/index/fulltext/quota/' + projectShortName);

    if (res.ok) {
      const data = await res.json();
      const quotaObj: IndexQuota = {
        projectShortName: projectShortName,
        currentVolume: data.currentSizeBytes,
        maxVolume: data.maxSizeBytes,
        currentRate: data.currentDataRateBytesPerSec,
        maxRate: data.maxDataRateBytesPerSec,
      };
      okCallback(quotaObj);
    } else if (errorCallback) {
      const message = await ErrorHandling.handleError(res, ERROR_502_MESSAGE, ` ${projectShortName}`);
      errorCallback(message.message);
    }
  }

  static async updateIndexInstanceQuota(
    projectShortName: string,
    name: string,
    zoneId: string,
    quota: QuotaPipeline,
    okCallback?: () => void,
    errorCallback?: (errorMsg: { message: string; details?: string }) => void,
  ) {
    const res = await BackendProvider.request(
      'PUT',
      '/internal/index/fulltext/project/' + projectShortName + '/name/' + name + '/zone/' + zoneId + '/instance/quotas',
      null,
      {
        maxDataRateBytesPerSec: quota.maxDataRateBytesPerSec,
        maxSizeBytes: quota.maxSizeBytes,
        maxStorageTimeSec: quota.maxStorageTimeSec,
      },
    );
    if (res.ok) {
      if (okCallback) okCallback();
    } else if (errorCallback) {
      const message = await ErrorHandling.handleError(res, ERROR_502_MESSAGE, ` ${projectShortName}`, ` ${projectShortName}/${name}`);
      errorCallback(message);
    }
  }

  static async calculateEstimate(
    quota: QuotaIndexProps,
    okCallback?: (data: FulltextFlowEstimateResponse) => void,
    errorCallback?: (error: string) => void,
  ) {
    const { projectShortName, indexName, ...rest } = quota;
    const path = `/index/fulltext/task/estimate/${projectShortName}`;

    const res = await BackendProvider.request('POST', path, null, indexName ? { indexName } : null, JSON.stringify(rest));

    if (res.ok) {
      const data: FulltextFlowEstimateResponse = await res.json();
      if (okCallback) okCallback(data);
    } else if (errorCallback) {
      const message = await ErrorHandling.handleError(res, ERROR_502_MESSAGE);
      errorCallback(message?.message?.message);
    }
  }

  static async asyncCalculateQuota(
    projectShortName: string,
    size: number,
    rate: number,
    replicationFactor: number,
    okCallback: (quota: EstimatedIndexQuota) => void,
    errorCallback,
    indexName?,
  ) {
    const res = await BackendProvider.request(
      'GET',
      '/internal/index/fulltext/quota/' + projectShortName,
      null,
      indexName
        ? {
            maxDataRateBytesPerSec: rate,
            maxSizeBytes: size,
            replicationFactor: replicationFactor,
            indexName: indexName,
          }
        : {
            maxDataRateBytesPerSec: rate,
            maxSizeBytes: size,
            replicationFactor: replicationFactor,
          },
    );

    if (res.ok) {
      const data = await res.json();
      const quotaObj: EstimatedIndexQuota = {
        currentQuota: {
          projectShortName: data.currentQuota.projectShortName,
          currentVolume: data.currentQuota.currentSizeBytes,
          maxVolume: data.currentQuota.maxSizeBytes,
          currentRate: data.currentQuota.currentDataRateBytesPerSec,
          maxRate: data.currentQuota.maxDataRateBytesPerSec,
        },
        plannedVolume: data.plannedSizeBytes,
        plannedRate: data.plannedDataRateBytesPerSec,
        approximatedRealIndexSizeBytes: data.approximatedRealIndexSizeBytes,
        approximatedStoreTimeSec: data.approximatedStoreTimeSec,
        quotaAllowed: data.quotaAllowed,
      };
      okCallback(quotaObj);
    } else {
      const message = await ErrorHandling.handleError(res, ERROR_502_MESSAGE, ` ${projectShortName}`, ` ${projectShortName}/${indexName}`);
      errorCallback(message.message);
    }
  }

  static async asyncUpdateQuotaForProject(projectShortName: string, volume: number, rate: number, okCallback?, errorCallback?) {
    const res = await BackendProvider.request(
      'PUT',
      '/internal/index/fulltext/quota/',
      null,
      null,
      JSON.stringify({
        projectShortName: projectShortName,
        maxSizeBytes: volume,
        maxDataRateBytesPerSec: rate,
      }),
    );

    if (res.ok)
      okCallback({
        currentVolume: 0,
        maxVolume: volume,
        currentRate: 0,
        maxRate: rate,
        projectShortName: projectShortName,
      } as IndexQuota);
    else {
      const message = await ErrorHandling.handleError(res, ERROR_502_MESSAGE, ` ${projectShortName}`);
      errorCallback(message.message);
    }
  }

  static async calculateMinAllowedMaxSizeBytes(
    maxDataRateBytesPerSec: number,
    replicationFactor: number,
    okCallback: (minAllowedMaxSizeBytes: number) => void,
    errorCallback,
  ) {
    const res = await BackendProvider.request('GET', '/internal/index/fulltext/quota/estimateParams/calculateMinAllowedMaxSizeBytes', null, {
      maxDataRateBytesPerSec: maxDataRateBytesPerSec,
      replicationFactor: replicationFactor,
    });

    if (res.ok) {
      const data = await res.json();
      okCallback(data);
    } else {
      const message = await ErrorHandling.handleError(res, ERROR_502_MESSAGE);
      errorCallback(message.message);
    }
  }

  static async asyncFetchQuotas(okCallback: (quotas: IndexQuota[]) => void, errorCallback?: (error: string) => void) {
    const res = await BackendProvider.request('GET', '/internal/index/fulltext/quota/list');

    if (res.ok) {
      const datas = await res.json();
      const quotas: IndexQuota[] = [];
      datas.forEach((data) => {
        const quotaObj: IndexQuota = {
          projectShortName: data.projectShortName,
          currentVolume: data.currentSizeBytes,
          maxVolume: data.maxSizeBytes,
          currentRate: data.currentDataRateBytesPerSec,
          maxRate: data.maxDataRateBytesPerSec,
        };
        quotas.push(quotaObj);
      });
      okCallback(quotas);
    } else if (errorCallback) {
      const message = await ErrorHandling.handleError(res, ERROR_502_MESSAGE);
      errorCallback(message.message);
    }
  }

  ///project/{projectShortName}/name/{indexName}
  static async getFulltextTaskByProjectAndName(projectShortName, indexName, okCallback?, errorCallback?) {
    const res = await BackendProvider.request('GET', '/internal/index/fulltext/project/' + projectShortName + '/name/' + indexName + '/config');

    if (res.ok) {
      const data = await res.json();
      okCallback(data);
    } else {
      const message = await ErrorHandling.handleError(res, ERROR_502_MESSAGE, ` ${projectShortName}`, ` ${projectShortName}/${indexName}`);
      errorCallback(message.message);
    }
  }

  static async fetchFulltextLabels(
    projectShortName: string,
    name: string,
    okCallback: (labels: string[]) => void,
    errorCallback?: (error: string) => void,
  ) {
    const res = await BackendProvider.request('GET', `/internal/index/fulltext/project/${projectShortName}/name/${name}/labels`);

    if (res.ok) {
      const data = await res.json();
      okCallback(data);
    } else if (errorCallback) {
      const message = await ErrorHandling.handleError(res, ERROR_502_MESSAGE, ` ${projectShortName}`, ` ${projectShortName}/${name}`);
      errorCallback(message.message);
    }
  }

  static async addFulltextLabel(projectShortName: string, name: string, label: string, okCallback, errorCallback?: (error: string) => void) {
    const res = await BackendProvider.request('POST', `/internal/index/fulltext/project/${projectShortName}/name/${name}/label/${label}`);

    if (res.ok) {
      // let data = await res.json();
      okCallback();
    } else if (errorCallback) {
      const message = await ErrorHandling.handleError(res, ERROR_502_MESSAGE, ` ${projectShortName}`, ` ${projectShortName}/${name}`);
      errorCallback(message.message);
    }
  }

  static async deleteFulltextLabels(projectShortName: string, name: string, label: string, okCallback, errorCallback?: (error: string) => void) {
    const res = await BackendProvider.request('DELETE', `/internal/index/fulltext/project/${projectShortName}/name/${name}/label/${label}`);

    if (res.ok) {
      // let data = await res.json();
      okCallback();
    } else if (errorCallback) {
      const message = await ErrorHandling.handleError(res, ERROR_502_MESSAGE, ` ${projectShortName}`, ` ${projectShortName}/${name}`);
      errorCallback(message.message);
    }
  }

  static async getFulltextTasksList(labels?: string[], okCallback?: any, errorCallback?: any) {
    if (labels && !this.savedParam) {
      this.savedParam = {
        labels: labels.filter((w) => !w.includes('woBackup')).join(','),
        woBackup: labels.find((w) => w.includes('woBackup'))?.split('=')[1] || '',
      };
    } else if (labels && this.savedParam) {
      const wo = labels.find((w) => w.includes('woBackup'));
      if (wo) {
        this.savedParam = {
          ...this.savedParam,
          woBackup: wo?.split('=')[1] || '',
          labels: this.savedParam.labels,
        };
      } else {
        this.savedParam = {
          ...this.savedParam,
          labels: labels.filter((w) => !w.includes('woBackup')).join(',') || '',
          woBackup: this.savedParam.woBackup,
        };
      }
    } else if (!labels && this.savedParam) {
      this.savedParam = {
        ...this.savedParam,
        labels: '',
      };
    }

    const res = await BackendProvider.request('GET', '/internal/index/fulltext/list', null, this.savedParam);
    if (res.ok) {
      const data = await res.json();
      okCallback(data);
    } else {
      const message = await ErrorHandling.handleError(res, ERROR_502_MESSAGE);
      errorCallback(message.message);
    }
  }

  static async getFulltextLabelsList(okCallback?: any, errorCallback?: any) {
    const res = await BackendProvider.request('GET', '/internal/index/fulltext/list');

    if (res.ok) {
      const data = await res.json();
      okCallback(Utils.getAllPossibleFulltextLabels(data));
    } else {
      const message = await ErrorHandling.handleError(res, ERROR_502_MESSAGE);
      errorCallback(message.message);
    }
  }

  static async forceRotateIndex(
    projectShortName: string,
    name: string,
    zoneId: string,
    okCallback?: (msg: string) => void,
    errorCallback?: (errorMsg: { message: string; details?: string }) => void,
  ) {
    const res = await BackendProvider.request(
      'POST',
      '/internal/index/fulltext/project/' + projectShortName + '/name/' + name + '/zone/' + zoneId + '/instance/rotate',
    );
    if (res.ok) {
      if (okCallback) okCallback('ok');
    } else if (errorCallback) {
      const message = await ErrorHandling.handleError(res, ERROR_502_MESSAGE, ` ${projectShortName}`, ` ${projectShortName}/${name}`);
      errorCallback(message);
    }
  }
}
