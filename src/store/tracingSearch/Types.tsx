export interface Endpoint {
  serviceName: string;
  ipv4: string;
}

export interface TraceQueryFilter {
  key: string;
  value: string;
}

export enum TracingTimeSort {
  ORDER_TIME_DESC = 'ORDER_TIME_DESC',
  ORDER_TIME_ASC = 'ORDER_TIME_ASC',
}

export interface SearchResult {
  fetchResult: Array<Array<Span>>;
  maxDuration: number;
  summaryList: Array<TraceSummary>;
}

export interface TraceTree {
  root: TraceNode;
  summary: TraceSummary;
}

export interface TraceNode {
  isVirtual: boolean;
  span: Span;
  childrens: TraceNode[];
}

export interface Span {
  duration: number;
  timestamp: number;
  shared: boolean;
  traceId: string;
  parentId: string | undefined;
  id: string;
  kind: string;
  name: string;
  annotations: Array<Annotation> | undefined;
  serviceName: string;
  services: Set<string>;
  localEndpoint: Endpoint;
  remoteEndpoint: Endpoint;
  tags: object;
}

export interface Annotation {
  timestamp: number;
  value: string;
  endpoint: string | undefined;
}

export interface ServicesSummary {
  [serviceName: string]: number;
}

export interface TraceSummary {
  traceId: string;
  rootService: string | undefined;
  durationStr: string;
  rootSpan: string | undefined;
  spanCount: number;
  servicesSummary: ServicesSummary;
  startTime: number;
  endTime: number;
}

export interface Trace {
  spans: Array<Span>;
}

export interface LookBackEntry {
  title: string;
  value: number;
}

export const Lookbacks: Array<LookBackEntry> = [
  { title: '1 час', value: 3600000 },
  { title: '2 часа', value: 7200000 },
  { title: '6 часов', value: 21600000 },
  { title: '12 часов', value: 43200000 },
  { title: '1 день', value: 86400000 },
  { title: '2 дня', value: 172800000 },
  { title: '7 дней', value: 604800000 },
  { title: 'Другое', value: -1 },
];
