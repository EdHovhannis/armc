import TraceUtils from '../store/tracingSearch/TraceUtils';
import { SearchResult, ServicesSummary, Span, TraceQueryFilter, Trace, TraceTree, TraceSummary, TracingTimeSort } from '../store/tracingSearch/Types';
import { ErrorHandling } from '../utils/ErrorHandling';

const ERROR_500_MESSAGE = 'Внутренняя ошибка сервисов Abyss. Обратитесь к администратору';
import BackendProvider from './BackendProvider';

export default class TracingSearchService {
  static async fetchServices(
    datasourceId: number,
    startTs: number,
    endTs: number,
    okCallback: (services: string[]) => void,
    errorCallback: (message: string) => void,
  ) {
    const result = await BackendProvider.request('GET', '/internal/tracing/search/services', null, {
      datasourceId: datasourceId,
      startTs: startTs,
      endTs: endTs,
    });
    const data = await result.json();
    if (result.ok) okCallback(data as string[]);
    else {
      const message = await ErrorHandling.handleError(data, ERROR_500_MESSAGE);
      errorCallback(message.message);
    }
  }

  static async fetchSpans(
    datasourceId: number,
    services: string[],
    startTs: number,
    endTs: number,
    okCallback: (services: string[]) => void,
    errorCallback: (message: string) => void,
  ) {
    const result = await BackendProvider.request('GET', '/internal/tracing/search/spans', null, {
      serviceNames: services.join(','),
      datasourceId: datasourceId,
      startTs: startTs,
      endTs: endTs,
    });
    const data = await result.json();
    if (result.ok) okCallback(data as string[]);
    else {
      const message = await ErrorHandling.handleError(data, ERROR_500_MESSAGE);
      errorCallback(message.message);
    }
  }

  static async fetchKeys(datasourceId: number, okCallback: (keys: string[]) => void, errorCallback: (message: string) => void) {
    const result = await BackendProvider.request('GET', '/internal/tracing/search/autocompleteKeys', null, { datasourceId: datasourceId });
    const data = await result.json();
    if (result.ok) okCallback(data as string[]);
    else {
      const message = await ErrorHandling.handleError(data, ERROR_500_MESSAGE);
      errorCallback(message.message);
    }
  }

  static async fetchTrace(
    datasource: string,
    traceId: string,
    okCallback: ({ trace, traceTree }: { trace: Trace; traceTree: TraceTree }) => void,
    errorCallback: (message: string) => void,
    startTs?: number | undefined,
    endTs?: number | undefined,
  ) {
    const params = startTs ? (endTs ? { startTs: startTs, endTs: endTs } : null) : null;
    const result = await BackendProvider.request('GET', '/internal/tracing/trace/' + datasource + '/' + traceId, null, params);
    const data = await result.json();
    if (!result.ok) {
      const message = await ErrorHandling.handleError(data, ERROR_500_MESSAGE);
      errorCallback(message.message);
      return;
    }

    const spans: Array<Span> = data as Array<Span>;
    if (spans.length === 0) {
      return errorCallback('Trace with specified id was not found');
    }
    okCallback({ trace: data, traceTree: TraceUtils.processTraceToTree({ spans: spans }) });
  }

  static async searchTraces(
    datasourceId: number,
    services: Array<string>,
    spans: Array<string>,
    filters: TraceQueryFilter[],
    rootOnlyMatch: boolean,
    timeSort: TracingTimeSort | undefined,
    limit: number,
    startTs: number,
    endTs: number,
    okCallback: (searchResult: SearchResult, traces: Map<string, Array<Span>>) => void,
    errorCallback: (message: string) => void,
  ) {
    let queryFilter = '';
    filters.forEach((filter, i) => {
      queryFilter += filter.key + '=' + filter.value;
      if (i != filters.length - 1) {
        queryFilter += ' and ';
      }
    });

    const params: any = {
      datasourceId: datasourceId,
      filter: queryFilter,
      startTs: startTs,
      endTs: endTs,
      rootOnlyMatch: rootOnlyMatch,
      limit: limit,
    };
    if (timeSort != undefined) {
      params.timeSort = timeSort;
    }

    if (services && services.length > 0) {
      params.serviceNames = services.join(',');
    }

    if (spans && spans.length > 0) {
      params.spanNames = spans.join(',');
    }

    const result = await BackendProvider.request('GET', '/internal/tracing/search/traces', null, params);
    const fetchedTraces = new Map<string, Array<Span>>();
    const data = await result.json();
    if (result.ok) {
      let maxDuration: number = -1;
      const result: Array<Array<Span>> = data;
      const fetchResult: Array<Array<Span>> = data;
      const queryResult: Array<TraceSummary> = [];

      result.forEach((traceSpans) => {
        let startTime = 1565688389618000000;
        let endTime = -1;
        const roots: Array<Span> = new Array<Span>();
        const servicesSummary: ServicesSummary = {};
        traceSpans.forEach((span) => {
          startTime = Math.min(span.timestamp, startTime);
          endTime = Math.max(span.timestamp + span.duration, endTime);
          servicesSummary[span.localEndpoint.serviceName] = (servicesSummary[span.localEndpoint.serviceName] || 0) + 1;

          if (!span.parentId) {
            roots.push(span);
          }
        });
        maxDuration = Math.max(maxDuration, endTime - startTime);
        fetchedTraces.set(traceSpans[0].traceId, traceSpans);

        let rootService: string;
        let rootSpan: string;
        if (roots.length >= 1) {
          rootSpan = roots[0].name;
          rootService = roots[0].localEndpoint.serviceName;
        } else {
          rootService = 'No root';
          rootSpan = '';
        }

        const traceSummary: TraceSummary = {
          durationStr: TraceUtils.createDurationStr(endTime - startTime),
          traceId: traceSpans[0].traceId,
          rootService: rootService,
          rootSpan: rootSpan,
          spanCount: traceSpans.length,
          startTime: startTime,
          endTime: endTime,
          servicesSummary: servicesSummary,
        };
        queryResult.push(traceSummary);
      });

      fetchResult.map((spans: Span[]) => {
        spans.map((span: Span) => {
          span.annotations = TraceUtils.processAnnotations(span);
        });
      });

      okCallback(
        {
          fetchResult: fetchResult,
          summaryList: queryResult,
          maxDuration: maxDuration,
        },
        fetchedTraces,
      );
    } else {
      const message = await ErrorHandling.handleError(data, ERROR_500_MESSAGE);
      errorCallback(message.message);
    }
  }
}
