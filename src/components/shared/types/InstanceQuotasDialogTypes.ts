export const durationUnit = ['месяцы', 'дни', 'часы', 'минуты', 'секунды'];
export const MAX_SPEED_MINIMUM_VALUE = 1048576;
export const MAX_DURATION_MINIMUM_VALUE = 1;

export interface KafkaTopic {
  projectShortName: string; // Короткое наименование проекта, pattern: ^[A-Za-z0-9_\-:]{2,100}+$
  topicName: string; // Наименование топика Kafka, pattern: ^[a-zA-Z0-9.\-_]+$
}

export interface Source {
  kafka: Array<KafkaTopic>; // Список топиков Kafka
}

export interface QuotaIndex {
  maxDataRateBytesPerSec: number;
  maxSizeBytes?: number | null;
  maxStoreDurationSec?: number | null;
  replicationFactor: number;
  sources: Source;
  maxShardSizeBytes?: number | null;
  collectionShards?: number | null;
  sourcesParallelism?: number | null;
  nodesAndSinkParallelism?: number | null;
}

export interface QuotaIndexProps extends QuotaIndex {
  projectShortName: string;
  indexName?: string;
}

export interface QuotaProps {
  value: number;
  unit: string;
}

export interface Quota {
  maxSize: QuotaProps;
  maxSpeed: QuotaProps;
  maxTime: QuotaProps;
}

// Конфигурация, на основании которой выполняются расчеты потока полнотекстовых данных
export interface FulltextFlowEstimateConfiguration {
  maxShardSizeBytes: number; // Максимальный размер шарда коллекции Apache Solr
  maxDataRateBytesPerSecPerShard: number; // Максимальная скорость на один шард коллекции Apache Solr
  indexPartitionRatio: number; // Количество партиций на индекс
  indexFillingRatio: number; // Максимально допустимый уровень заполнения индекса (суммарно по всем коллекциям)
  indexSizeCorrectionRatio: number; // Коэффициент увеличения объемов хранения индекса, применяемый к максимальной скорости входящего потока данных
  avgToMaxIndexSpeedRatio: number; // Коэффициент усреднения скорости входящего потока данных
  minAllowedRotationIntervalSec: number; // Минимально допустимый ротационный интервал
  maxOverdraftPercent: number; // Максимально допустимый процент увеличения скорости приема входящего потока данных при овердрафте
  maxThreadDataRateBytesPerSec: number; // Максимальная скорость на один слот Apache Flink
}

// Информация о квотах полнотекстовых индексов
export interface FullTextIndexQuota {
  projectShortName: string; // Короткое наименование проекта
  maxSizeBytes: number; // Максимальный объем хранилища
  currentSizeBytes: number; // Текущий объем хранилища
  maxDataRateBytesPerSec: number; // Максимальный трафик
  currentDataRateBytesPerSec: number; // Текущий трафик
}

// Результаты автоматических расчетов лимитов
export interface FullTextIndexEstimatedQuota {
  currentQuota: FullTextIndexQuota;
  plannedDataRateBytesPerSec: number; // Плановый общий трафик на весь проект
  plannedSizeBytes: number; // Плановый общий объем хранения на весь проект
  approximatedStoreTimeSec: number; // Расчетная длительность хранения
  approximatedRealIndexSizeBytes: number; // Расчетный объем хранения
  quotaAllowed: boolean; // Допустимость плановых параметров
}

// Запрос на автоматический расчет потока полнотекстового индекса FulltextFlowEstimateRequest
export interface FulltextFlowEstimateRequest {
  maxDataRateBytesPerSec: number; // Максимальный трафик потока (байты в секунду), minimum: 1048576
  maxSizeBytes: number; // Максимальный объем хранилища (байты), minimum: 1
  maxStoreDurationSec: number; // Максимальный продолжительность хранения (секунды), minimum: 1
  replicationFactor: number; // Фактор репликации, minimum: 1
  sources: Source; // Источники данных
}

// Результаты автоматических расчетов потоков
export interface FulltextFlowEstimateResponse {
  request: FulltextFlowEstimateRequest;
  configuration: FulltextFlowEstimateConfiguration;
  taskSlots: number; // Количество слотов Apache Flink
  avgBytesPerTaskSlot: number; // Средний трафик на один слот Apache Flink
  minAllowedMaxSizeBytes: number; // Минимальный размер хранилища
  partitionToSlotsRatio: number; // Соотношение партиций к слотам Apache Flink
  quota: FullTextIndexEstimatedQuota;
  numShards: number; // Количество шардов на коллекцию
  estimatedCollSizeBytes: number; // Размер одной коллекции Apache Solr (расчет по максимальному размеру одного шарда)
  minRotationTimeSec: number; // Расчетный минимальный ротационный интервал
  maxSizeBytes: number; // Максимальный размер хранилища (байты)
  maxStoreDurationSec: number; // Максимальный продолжительность хранения (секунды), minimum: 1
  dataRateMaxPercent: number; // Допустимый процент повышения скорости вычитки и обработки сообщений (см. maxProcessingRate)
  warnings: string[]; // Предупреждения о несоответствии рекомендуемым параметрам
  blockers: string[]; // Критические несоответствия допустимым параметрам
  errors: string[];
}
