import {
  Cluster,
  ClusterAllowanceUpdateItem,
  ClusterInfoTableItem,
  ClusterItem,
  ClusterQuotaUpdateItem,
  QuotaListItem,
  QuotaRemainingItem,
} from '../store/clusters/Types';

export class ClusterUtils {
  static errors = {
    isMoreThanRemainingQuota: 'Квота на количество партиций для проекта не может превышать максимальное значение квоты. ',
    isNegative: 'Квота на количество партиций для проекта не может быть отрицательной. ',
    isLessThanCurrentQuota: 'Квота на количество партиций для проекта не может быть меньше текущего значения квоты. ',
  };

  /**
   * Функция возвращает список данных для рендера таблицы
   * @param clusters - список всех отображаемых в таблице кластеров
   * @param projectClusters - список всех включенных для проекта кластеров (галочка вкл)
   * @param quotas - список всех квот для кластеров проекта (если отсутсвуют, то равны нулю)
   * @param remainingQuotas - список квот для всех существующих кластеров, если отсутсвуют, то равны нулю
   */
  static getClusterTableData(
    clusters: Cluster[],
    projectClusters: ClusterItem[] = [],
    quotas: QuotaListItem[],
    remainingQuotas: QuotaRemainingItem[] = [],
  ): ClusterInfoTableItem[] {
    const projectQuotas = quotas[0]?.clusters ?? [];
    const remainingQuotasHelper = remainingQuotas ?? [];

    return clusters.map((cluster) => {
      const clusterQuota = projectQuotas.find((projectCluster) => projectCluster.clusterId === cluster?.id);
      const remainingQuota = remainingQuotasHelper.find((quota) => quota.clusterId === cluster?.id);
      // добавлен ли данный кластер для проекта
      const isEnabledCluster = projectClusters.some((projectCluster) => projectCluster?.clusterId === cluster?.id);

      const maxQuota = clusterQuota?.maxPartitions ?? 0;
      const remainQuota = remainingQuota?.remainingQuota ?? 0;
      return {
        name: cluster.name ?? '',
        clusterId: cluster?.id as number,
        maxPartitions: maxQuota,
        currentPartitions: clusterQuota?.currentPartitions ?? 0,
        remainingQuota: maxQuota + remainQuota,
        isEnable: isEnabledCluster,
      };
    });
  }

  /**
   * Функция возвращает массив квот для кластеров, отметая нулевые квоты
   * @param clusters
   * @return number[] - список включенных кластеров
   */
  static getClustersQuotaUpdateData = (clusters: ClusterInfoTableItem[]): ClusterQuotaUpdateItem[] =>
    clusters
      .filter((cluster) => cluster.maxPartitions !== 0)
      .map((cluster) => ({
        clusterId: cluster.clusterId,
        maxPartitions: cluster.maxPartitions,
      }));

  /**
   * Функия возвращает массив, содержащий id кластеров
   * @param clusters
   * @return number[] - список включенных кластеров
   */
  static getClustersId = (clusters: ClusterInfoTableItem[]): ClusterAllowanceUpdateItem[] => clusters.map((cluster) => cluster.clusterId);

  /**
   * Функия валидация для кластеров
   * @param data
   * @return true - valid, false - invalid
   */
  static validateClusters(data: ClusterInfoTableItem[]): { isValid: boolean; errorMsg: string | undefined } {
    const errors: {
      isMoreThanRemainingQuota?: string;
      isNegative?: string;
      isLessThanCurrentQuota?: string;
    } = {};

    data.forEach((d) => {
      const isMoreThanRemainingQuota = d.maxPartitions > d.remainingQuota;
      const isNegative = d.maxPartitions < 0;
      const isLessThanCurrentQuota = d.maxPartitions < d.currentPartitions;
      if (!errors.isMoreThanRemainingQuota && isMoreThanRemainingQuota) {
        errors.isMoreThanRemainingQuota = ClusterUtils.errors.isMoreThanRemainingQuota;
      }
      if (!errors.isNegative && isNegative) {
        errors.isNegative = ClusterUtils.errors.isNegative;
      }
      if (!errors.isLessThanCurrentQuota && isLessThanCurrentQuota) {
        errors.isLessThanCurrentQuota = ClusterUtils.errors.isLessThanCurrentQuota;
      }
    });

    const errorsArray = Object.values(errors);

    const isValid = errorsArray.length === 0;
    const errorMsg = isValid ? undefined : errorsArray.join('');
    return { isValid, errorMsg: errorMsg };
  }

  /**
   * Функция возвращает включенные кластеры (флаг isEnable: true)
   * @param clusters
   */
  static getEnabledClusters = (clusters: ClusterInfoTableItem[]) => clusters.filter((cluster) => cluster.isEnable);
}
