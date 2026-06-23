import { blue, cyan, deepOrange, deepPurple, green, orange, pink, purple, red, yellow } from '@material-ui/core/colors';

import { ConstantNames } from './TraceConstants';
import { Span, TraceNode, Trace, TraceTree, TraceSummary, ServicesSummary, Endpoint, Annotation } from './Types';

export default class TraceUtils {
  static getSpanKey(span: Span) {
    if (span.shared) {
      return TraceUtils.keyString(span.id, true, span.localEndpoint);
    }
    return span.id;
  }

  static getParentKey(span: Span) {
    if (span.shared) {
      return span.id;
    }
    return span.parentId!;
  }

  // compares potentially undefined input
  static compare(a: any, b: any) {
    if (!a && !b) return 0;
    if (!a) return -1;
    if (!b) return 1;
    // @ts-ignore
    return (a > b) - (a < b);
  }

  static isUndefined(ref) {
    return typeof ref === 'undefined';
  }

  /*
   * Put spans with null endpoints first, so that their data can be attached to the first span with
   * the same ID and endpoint. It is possible that a server can get the same request on a different
   * port. Not addressing this.
   */
  static compareEndpoint(left, right) {
    // handle nulls first
    if (TraceUtils.isUndefined(left)) return -1;
    if (TraceUtils.isUndefined(right)) return 1;

    const byService = TraceUtils.compare(left.serviceName, right.serviceName);
    if (byService !== 0) return byService;
    const byIpV4 = TraceUtils.compare(left.ipv4, right.ipv4);
    if (byIpV4 !== 0) return byIpV4;
    return TraceUtils.compare(left.ipv6, right.ipv6);
  }

  // false or null first (client first)
  static compareShared(left, right) {
    const leftNotShared = TraceUtils.isUndefined(left.shared) || !left.shared;
    const rightNotShared = TraceUtils.isUndefined(right.shared) || !right.shared;

    if (leftNotShared && rightNotShared) {
      return left.kind === 'CLIENT' ? -1 : 1;
    }
    if (leftNotShared) return -1;
    if (rightNotShared) return 1;
    return 0;
  }

  static cleanupComparator(left, right) {
    // exported for testing
    const bySpanId = TraceUtils.compare(left.id, right.id);
    if (bySpanId !== 0) return bySpanId;
    const byShared = TraceUtils.compareShared(left, right);
    if (byShared !== 0) return byShared;
    return TraceUtils.compareEndpoint(left.localEndpoint, right.localEndpoint);
  }

  // sort by timestamp, then name, root/shared first in case of skew
  static spanComparator(a, b) {
    // exported for testing
    if (!a.parentId && b.parentId) {
      // a is root
      return -1;
    }
    if (a.parentId && !b.parentId) {
      // b is root
      return 1;
    }

    // order client first in case of shared spans (shared is always server)
    if (a.id === b.id) return TraceUtils.compareShared(a, b);

    // Either a and b are root or neither are. sort by shared timestamp, then name
    return TraceUtils.compare(a.timestamp, b.timestamp) || TraceUtils.compare(a.name, b.name);
  }

  static mergeV2ById(spans: Array<Span>) {
    const { length } = spans;

    if (length == 0) {
      return [];
    }

    const result = new Array<Span>();
    spans.sort(TraceUtils.cleanupComparator);

    let last: Span | undefined;
    for (let i = 0; i < spans.length; i++) {
      const currSpan: Span = spans[i];

      if (last && last.id === currSpan.id) {
        if (last.kind === 'CLIENT' && currSpan.kind == 'SERVER') {
          currSpan.shared = true;
        }
        if (currSpan.shared && !currSpan.parentId && last.parentId) {
          currSpan.parentId = last.parentId;
        }
      }

      last = currSpan;
      result[i] = currSpan;
    }

    return result.sort(TraceUtils.spanComparator);
  }

  // In javascript, dict keys can't be objects
  static keyString(id, shared = false, endpoint) {
    if (!shared) return id;
    const endpointString = endpoint ? JSON.stringify(endpoint) : 'x';
    return `${id}-${endpointString}`;
  }

  static processTraceToTree(trace: Trace): TraceTree {
    const servicesSummary: ServicesSummary = {};
    let startTime: number = 100000000000000000;
    let endTime: number = -1;

    const depthZeroElements: TraceNode[] = [];
    const elementsByKey: Map<string, Span> = new Map();
    //  key - parent , value - children
    const relations: Map<string, Set<string>> = new Map();

    TraceUtils.mergeV2ById(trace.spans);

    // indexing trace tree
    trace.spans.forEach((span: Span) => {
      servicesSummary[span.localEndpoint.serviceName] = (servicesSummary[span.localEndpoint.serviceName] || 0) + 1;
      startTime = Math.min(startTime, span.timestamp);
      endTime = Math.max(endTime, span.timestamp + span.duration);

      const key = this.getSpanKey(span);
      if (elementsByKey.has(key)) {
        return;
      }
      if (!this.getParentKey(span)) {
        depthZeroElements.push({
          isVirtual: false,
          span: span,
          childrens: [],
        });
      } else {
        const relationArr = relations.get(this.getParentKey(span)) || new Set<string>();
        relationArr.add(this.getSpanKey(span));
        relations.set(this.getParentKey(span), relationArr);
      }
      elementsByKey.set(this.getSpanKey(span), span);
    });

    // build tree and add virtual node if required
    let parentNode: TraceNode;
    if (depthZeroElements.length > 1) {
      parentNode = {
        isVirtual: true,
        // quick hack, should replace it later
        span: depthZeroElements[0].span,
        childrens: depthZeroElements,
      };
      depthZeroElements.forEach((element) => {
        this.buildSubTree(element, elementsByKey, relations);
      });
    } else if (depthZeroElements.length === 0) {
      parentNode = {
        isVirtual: true,
        // quick hack, should replace it later
        span: {} as any,
        childrens: [],
      };
    } else {
      parentNode = depthZeroElements[0];
      this.buildSubTree(parentNode, elementsByKey, relations);
    }

    elementsByKey.forEach((value, key) => {
      const parentId = this.getParentKey(value);
      if (!parentId) {
        return;
      }
      if (!elementsByKey.has(parentId)) {
        const treeNode = {
          isVirtual: false,
          span: value,
          childrens: [],
        };
        parentNode.childrens.push(treeNode);
        this.buildSubTree(treeNode, elementsByKey, relations);
      }
    });

    elementsByKey.entries();
    // sort tree by time
    this.sortChildrenNodesByTime(parentNode);
    this.mergeTree(parentNode);
    return {
      root: parentNode,
      summary: {
        durationStr: TraceUtils.createDurationStr(endTime - startTime),
        traceId: trace.spans[0].traceId,
        servicesSummary: servicesSummary,
        endTime: endTime,
        startTime: startTime,
        spanCount: trace.spans.length,
        rootService: parentNode.isVirtual ? undefined : parentNode.span.localEndpoint.serviceName,
        rootSpan: parentNode.isVirtual ? undefined : parentNode.span.name,
      },
    };
  }

  static mergeTree(root: TraceNode) {
    let queue: TraceNode[] = [];
    if (root.isVirtual) {
      root.childrens.forEach((child) => queue.push(child));
    } else {
      queue.push(root);
    }

    while (queue.length !== 0) {
      const current: TraceNode = queue.shift()!;

      const spansToMerge: Span[] = [current.span];
      const childrens: TraceNode[] = [];

      current.childrens.forEach((children) => {
        const childSpan = children.span;
        if (childSpan.id === current.span.id && childSpan.kind === 'SERVER' && current.span.kind === 'CLIENT' && childSpan.shared) {
          spansToMerge.push(children.span);
        } else {
          childrens.push(children);
        }
      });

      queue = [...queue, ...childrens];
      current.span = TraceUtils.mergeClientAndServerSpan(spansToMerge, childrens.length === 0);
      current.childrens = childrens;
    }
  }

  static getServiceNameIfExist(endpoint: Endpoint) {
    if (endpoint && endpoint.serviceName) {
      return endpoint.serviceName;
    }
    return undefined;
  }

  static mergeClientAndServerSpan(spansToMerge: Span[], isLeafNode: boolean) {
    const mergedSpan: Span = spansToMerge[0];

    for (let i = 0; i < spansToMerge.length; i++) {
      const span: Span = spansToMerge[i];

      if (span.kind === 'SERVER') {
        mergedSpan.name = span.name;
      }

      const localService = TraceUtils.getServiceNameIfExist(span.localEndpoint);
      const remoteService = TraceUtils.getServiceNameIfExist(span.remoteEndpoint);
      // determine best suitable service name
      if (localService && span.kind === 'SERVER') {
        mergedSpan.serviceName = localService;
      } else if (isLeafNode && remoteService && span.kind === 'CLIENT' && !mergedSpan.serviceName) {
        mergedSpan.serviceName = remoteService;
      } else if (localService && !mergedSpan.serviceName) {
        mergedSpan.serviceName = localService;
      }

      // add services stats
      if (!mergedSpan.services) {
        mergedSpan.services = new Set<string>();
      }
      if (localService) mergedSpan.services.add(localService);
      if (remoteService) mergedSpan.services.add(remoteService);

      // merge tags
      let tags: object = mergedSpan.tags;
      if (!tags) {
        tags = {};
      }
      if (span.tags) {
        Object.keys(span.tags).forEach((key) => {
          if (!tags[key]) {
            tags[key] = span.tags[key];
          }
        });
      }
      mergedSpan.tags = tags;

      // process annotation or generate them if they are missing
      let annotations = mergedSpan.annotations;
      if (!annotations) {
        annotations = [];
      }

      TraceUtils.processAnnotations(span).forEach((annotation) => {
        annotations!.push(annotation);
      });

      mergedSpan.annotations = annotations;
    }

    mergedSpan.annotations!.sort((a, b) => a.timestamp - b.timestamp);
    return mergedSpan;
  }

  static toAnnotationRow(a, localFormatted): Annotation {
    const res: Annotation = {
      value: ConstantNames[a.value] || a.value,
      timestamp: a.timestamp,
      endpoint: localFormatted,
    };
    return res;
  }

  static formatEndpoint(endpoint) {
    if (!endpoint) return undefined;
    const { ipv4, ipv6, port, serviceName } = endpoint;
    if (ipv4 || ipv6) {
      const ip = ipv6 ? `[${ipv6}]` : ipv4; // arbitrarily prefer ipv6
      const portString = port ? `:${port}` : '';
      const serviceNameString = serviceName ? ` (${serviceName})` : '';
      return ip + portString + serviceNameString;
    }
    return serviceName || '';
  }

  static processAnnotations(span: Span) {
    const localFormatted = this.formatEndpoint(span.localEndpoint) || undefined;

    let startTs = span.timestamp || 0;
    let endTs = startTs && span.duration ? startTs + span.duration : 0;
    let msTs = 0;
    let wsTs = 0;
    let wrTs = 0;
    let mrTs = 0;

    let begin;
    let end;

    let { kind } = span;

    // scan annotations in case there are better timestamps, or inferred kind
    const annotationsToAdd: Annotation[] = [];
    if (span.annotations) {
      span.annotations.forEach((a) => {
        switch (a.value) {
          case 'cs':
            kind = 'CLIENT';
            if (a.timestamp <= startTs) {
              startTs = a.timestamp;
            } else {
              annotationsToAdd.push(a);
            }
            break;
          case 'sr':
            kind = 'SERVER';
            if (a.timestamp <= startTs) {
              startTs = a.timestamp;
            } else {
              annotationsToAdd.push(a);
            }
            break;
          case 'ss':
            kind = 'SERVER';
            if (a.timestamp >= endTs) {
              endTs = a.timestamp;
            } else {
              annotationsToAdd.push(a);
            }
            break;
          case 'cr':
            kind = 'CLIENT';
            if (a.timestamp >= endTs) {
              endTs = a.timestamp;
            } else {
              annotationsToAdd.push(a);
            }
            break;
          case 'ms':
            kind = 'PRODUCER';
            msTs = a.timestamp;
            break;
          case 'mr':
            kind = 'CONSUMER';
            mrTs = a.timestamp;
            break;
          case 'ws':
            wsTs = a.timestamp;
            break;
          case 'wr':
            wrTs = a.timestamp;
            break;
          default:
            annotationsToAdd.push(a);
        }
      });
    }

    switch (kind) {
      case 'CLIENT':
        begin = 'Client Start';
        end = 'Client Finish';
        break;
      case 'SERVER':
        begin = 'Server Start';
        end = 'Server Finish';
        break;
      case 'PRODUCER':
        begin = 'Producer Start';
        end = 'Producer Finish';
        if (startTs === 0 || (msTs !== 0 && msTs < startTs)) {
          startTs = msTs;
          msTs = 0;
        }
        if (endTs === 0 || (wsTs !== 0 && wsTs > endTs)) {
          endTs = wsTs;
          wsTs = 0;
        }
        break;
      case 'CONSUMER':
        if (startTs === 0 || (wrTs !== 0 && wrTs < startTs)) {
          startTs = wrTs;
          wrTs = 0;
        }
        if (endTs === 0 || (mrTs !== 0 && mrTs > endTs)) {
          endTs = mrTs;
          mrTs = 0;
        }
        if (endTs !== 0 || wrTs !== 0) {
          begin = 'Consumer Start';
          end = 'Consumer Finish';
        } else {
          begin = 'Consumer Start';
        }
        break;
      default:
    }

    // restore sometimes special-cased annotations
    if (msTs) annotationsToAdd.push({ timestamp: msTs, value: 'ms', endpoint: undefined });
    if (wsTs) annotationsToAdd.push({ timestamp: wsTs, value: 'ws', endpoint: undefined });
    if (wrTs) annotationsToAdd.push({ timestamp: wrTs, value: 'wr', endpoint: undefined });
    if (mrTs) annotationsToAdd.push({ timestamp: mrTs, value: 'mr', endpoint: undefined });

    const beginAnnotation = startTs && begin;
    const endAnnotation = endTs && end;

    const annotations: Annotation[] = []; // prefer empty to undefined for arrays

    if (beginAnnotation) {
      annotations.push(
        TraceUtils.toAnnotationRow(
          {
            value: begin,
            timestamp: startTs,
          },
          localFormatted,
        ),
      );
    }

    annotationsToAdd.forEach((a) => {
      if (beginAnnotation && a.value === begin) return;
      if (endAnnotation && a.value === end) return;
      annotations.push(TraceUtils.toAnnotationRow(a, localFormatted));
    });

    if (endAnnotation) {
      annotations.push(
        TraceUtils.toAnnotationRow(
          {
            value: end,
            timestamp: endTs,
          },
          localFormatted,
        ),
      );
    }

    return annotations;
  }

  static sortChildrenNodesByTime(node: TraceNode) {
    node.childrens.sort((a: TraceNode, b: TraceNode) => {
      return a.span.timestamp - b.span.timestamp;
    });

    node.childrens.forEach((children: TraceNode) => {
      this.sortChildrenNodesByTime(children);
    });
  }

  static buildSubTree(parentNode: TraceNode, elementsByKey: Map<string, Span>, relations: Map<string, Set<string>>) {
    const childrens: Set<string> | undefined = relations.get(this.getSpanKey(parentNode.span));
    if (childrens !== undefined) {
      childrens.forEach((spanId) => {
        const span: Span | undefined = elementsByKey.get(spanId);

        if (span == undefined) {
          return;
        }

        const childrenNode: TraceNode = {
          isVirtual: false,
          span: span,
          childrens: [],
        };
        this.buildSubTree(childrenNode, elementsByKey, relations);
        parentNode.childrens.push(childrenNode);
      });
    }
  }

  static iterateTraceTree(tree: TraceTree, callback: (node: TraceNode, depth: number) => void) {
    this.iterateTraceTreeNodes(tree.root, callback, 0);
  }

  static iterateTraceTreeNodes(node: TraceNode, callback: (node: TraceNode, depth: number) => void, currentDepth: number) {
    if (!node.isVirtual) {
      callback(node, currentDepth);
      currentDepth++;
    }
    node.childrens.forEach((node: TraceNode) => {
      this.iterateTraceTreeNodes(node, callback, currentDepth);
    });
  }

  static createDurationStr(duration) {
    if (duration === 0 || typeof duration === 'undefined') {
      return '0μs';
    }
    if (duration < 1000) {
      return `${duration.toFixed(0)}μs`;
    }
    if (duration < 1000000) {
      if (duration % 1000 === 0) {
        // Sometimes spans are in milliseconds resolution
        return `${(duration / 1000).toFixed(0)}ms`;
      }
      return `${(duration / 1000).toFixed(3)}ms`;
    }
    return `${(duration / 1000000).toFixed(3)}s`;
  }

  static getServiceNameColor(serviceName) {
    switch (serviceName.length % 10) {
      case 0:
        return green;
      case 1:
        return yellow;
      case 2:
        return purple;
      case 3:
        return deepOrange;
      case 4:
        return orange;
      case 5:
        return blue;
      case 6:
        return pink;
      case 7:
        return red;
      default:
        return green;
    }
  }
}
