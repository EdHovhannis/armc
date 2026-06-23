import { Button, createStyles, FormControlLabel, Grid, Paper, Switch, Typography, withStyles } from '@material-ui/core';
import InfoIcon from '@material-ui/icons/Info';
import * as React from 'react';
import AceEditor from 'react-ace';
import { DragDropContext, Draggable, Droppable } from 'react-beautiful-dnd';
import { connect } from 'react-redux';

import { HtmlTooltip } from '../../containers/App';
import { PipelineUtils } from '../../containers/processing/PipelineEditorView';
import FlowService from '../../services/FlowService';
import * as authSelectors from '../../store/auth/Reducer';
import {
  AddCurrentTimeNode,
  AvroParseNode,
  CopyFieldProcessingNode,
  GenerateUUIDNode,
  JsonFlattenNode,
  MapNames,
  MapNodeDescription,
  MultiKafkaSinkNode,
  NodeType,
  ProcessingNode,
  ProcessingNodeType,
  RateLimiterNode,
  SourceSinkKafkaNode,
  SourceType,
  TimestampConvertNode,
} from '../../store/flow/Types';
import { KafkaTopic } from '../../store/kafka/Types';
import { CopyFieldNode } from '../../store/pipeline/Types';
import { Project } from '../../store/project/Types';
import { Utils } from '../../utils/Utils';

import {
  CONSUMER_GROUP_ID_ERROR,
  COUSUMER_GROUP_ID_ERROR_DELETE,
  SINK_NODE_WARN,
  SOURCE_NODE_WARN,
  MULTI_KAFKA_SINK_WARN,
  MULTI_KAFKA_SINK_WARN_MULTIPLE,
  MULTI_KAFKA_SINK_WARN_WITH_SINK,
} from './FlowEditorForm';
import AddCurrentTimeNodeItem, { AddCurrentTimeNodeItemState } from './nodeItems/AddCurrentTimeNodeItem';
import AvroParseNodeItem, { AvroParseNodeItemState } from './nodeItems/AvroParseNodeItem';
import ConvertTimestampNodeItem, { ConvertTimestampNodeItemState } from './nodeItems/ConvertTimestampNodeItem';
import CopyFieldNodeItem from './nodeItems/CopyFieldNodeItem';
import FlattenNodeItem, { FlattenNodeItemState } from './nodeItems/FlattenNodeItem';
import GenerateUuidNodeItem, { GenerateUuidNodeItemState } from './nodeItems/GenerateUuidNodeItem';
import JsonParseNodeItem from './nodeItems/JsonParseNodeItem';
import JsonSerializeNodeItem from './nodeItems/JsonSerializeNodeItem';
import KafkaSinkNodeItem from './nodeItems/KafkaSinkNodeItem';
import KafkaSourceNodeItem, { KafkaSourceNodeItemState } from './nodeItems/KafkaSourceNodeItem';
import MultiKafkaSinkNodeItem from './nodeItems/MultiKafkaSink';
import ReteLimiterNodeItem from './nodeItems/ReteLimiterNodeItem';

const grid = 8;

const styles = (theme) =>
  createStyles({
    button: {
      fontSize: '9px',
      color: 'white',
    },
  });

const getItemStyle = (isDragging: boolean, draggableStyle: React.CSSProperties, notEmptyConfig: boolean, nodeNotExist: boolean) => ({
  userSelect: 'none',
  padding: grid * 2,
  margin: `0 ${grid / 2}px ${grid}px 0`,
  borderTopLeftRadius: `${grid}px`,
  borderTopRightRadius: `${grid}px`,
  borderBottomLeftRadius: `${grid}px`,
  borderBottomRightRadius: `${grid}px`,
  boxShadow: '0px 2px 1px -1px rgba(0,0,0,0.2), 0px 1px 1px 0px rgba(0,0,0,0.14), 0px 1px 3px 0px rgba(0,0,0,0.12)',

  // change background colour if dragging
  background: isDragging ? '#bebebe' : nodeNotExist ? '#f1b621' : notEmptyConfig ? '#4caf50' : '#f77669',

  // styles we need to apply on draggables
  ...draggableStyle,
});

const getListStyle = (isDraggingOver: boolean) => ({
  background: !isDraggingOver ? '#fafafa' : 'lightgreen',

  minHeight: '100px',
  padding: grid,
  display: 'flex',
  borderTopLeftRadius: `${grid}px`,
  borderTopRightRadius: `${grid}px`,
  borderBottomLeftRadius: `${grid}px`,
  borderBottomRightRadius: `${grid}px`,
  overflow: 'auto',
});

export interface FlowCreateItemProps {
  timezones: Array<string>;
  timeFormats: Array<string>;
  projects: Array<Project>;
  topics: Array<KafkaTopic>;
  items: Array<ProcessingNode>;
  data: string;
  canEdit: boolean;
  initParallelism: number;
  customFlow: boolean;
  isStartedFlow: boolean;
  useGlobalConsumerGroup: boolean;
  isAdmin: boolean;
  schemaNames: string[];
  customFlowChanged(customFlow: boolean): any;
  cunsumerGroupChanged(useGlobalConsumerGroup: boolean): void;
  displayError(msg: string): any;

  displayWarning(msg: string): any;

  changeItems(items: Array<ProcessingNode>): any;

  dataChanged(data: string): any;
}
function mapStateToProps(state: any): Partial<FlowCreateItemProps> {
  return {
    isAdmin: authSelectors.isAdmin(state),
  };
}
export interface FlowCreateItemState {
  id: number;
  items: Array<ProcessingNode>;
  data: string;
  processingNodes: Array<ProcessingNode>;
  sinkNodes: Array<ProcessingNode>;
  sourceNodes: Array<ProcessingNode>;
  currentNode?: ProcessingNode;
  lastNode?: ProcessingNode;
  removed?: ProcessingNode;
  copyFieldOpen: boolean;
  convertTimestampOpen: boolean;
  addCurrentTimeOpen: boolean;
  generateUuidOpen: boolean;
  jsonFlattenOpen: boolean;
  kafkaSourceOpen: boolean;
  kafkaSinkOpen: boolean;
  multiSinkKafkaOpen: boolean;
  jsonParseOpen: boolean;
  jsonSerializeOpen: boolean;
  customFlow: boolean;
  avroParseOpen: boolean;
  rateLimiterOpen: boolean;
  ids: string[];
  consumerGroupId: string;
}

class FlowCreateItem extends React.Component<FlowCreateItemProps, FlowCreateItemState> {
  constructor(props) {
    super(props);
    this.state = {
      id: 4,
      items: this.props.items.length === 0 ? PipelineUtils.getEmptyPipeline(this.props.initParallelism) : this.props.items,
      data:
        this.props.data === ''
          ? this.props.initParallelism
            ? JSON.stringify(PipelineUtils.getEmptyPipeline(this.props.initParallelism), null, 2)
            : JSON.stringify(PipelineUtils.getEmptyPipeline(1), null, 2)
          : this.props.data,
      processingNodes: this.props.initParallelism
        ? PipelineUtils.getEmptyProcessingNodes(this.props.initParallelism)
        : PipelineUtils.getEmptyProcessingNodes(1),
      sinkNodes: this.props.initParallelism
        ? PipelineUtils.getEmptySourceSinkNodes(this.props.initParallelism).filter((node) => {
            return node.element === NodeType.sink || node.element === NodeType.processing;
          })
        : PipelineUtils.getEmptySourceSinkNodes(1).filter((node) => {
            return node.element === NodeType.sink;
          }),
      sourceNodes: this.props.initParallelism
        ? PipelineUtils.getEmptySourceSinkNodes(this.props.initParallelism).filter((node) => {
            return node.element === NodeType.source;
          })
        : PipelineUtils.getEmptySourceSinkNodes(1).filter((node) => {
            return node.element === NodeType.source;
          }),
      copyFieldOpen: false,
      convertTimestampOpen: false,
      addCurrentTimeOpen: false,
      generateUuidOpen: false,
      jsonFlattenOpen: false,
      kafkaSinkOpen: false,
      multiSinkKafkaOpen: false,
      kafkaSourceOpen: false,
      jsonParseOpen: false,
      jsonSerializeOpen: false,
      avroParseOpen: false,
      rateLimiterOpen: false,
      customFlow: false,
      ids:
        this.props.items.length === 0
          ? PipelineUtils.getEmptyPipeline(this.props.initParallelism).map((node: ProcessingNode) => {
              return node.id;
            })
          : this.props.items.map((node) => {
              return node.id;
            }),
      consumerGroupId: this.props.items.length ? this.props.items[0]?.node?.consumerGroupId : undefined,
    };
  }

  id2List = {
    droppable: 'items',
    droppable2: 'processingNodes',
    droppable3: 'sourceNodes',
    droppable4: 'sinkNodes',
  };

  configNode = (list: ProcessingNode[], node) => {
    const result = Utils.getCopyOfElement(list);
    let index = 0;
    this.state.items.map((node, ind) => {
      if (node.id === this.state.currentNode.id) {
        index = ind;
      }
    });
    result[index].node = node;
    return result;
  };

  getNodeConfigButtonText = (item: ProcessingNode): string => {
    if (item.element === NodeType.processing) {
      if (item.node?.type === SourceType.multiKafka) {
        return MapNames['multiKafkaSink'];
      }
      return MapNames[item.node?.type];
    }
    if (MapNames[item.node?.type] === undefined) {
      return 'Настройки ноды будут доступны позже';
    }
    if (item.element === NodeType.source) {
      return MapNames[item.node?.type + 'Source'];
    }
    return MapNames[item.node?.type + 'Sink'];
  };

  normalize = (list: Array<ProcessingNode>, needWarning: boolean) => {
    const result = list;
    let index = 0;
    let sinkCount = 0;
    let multiKafkaCount = 0;

    result.map((node, ind) => {
      if (ind > 0) {
        node.parents = [result[ind - 1].id];
      }
      if (node.element === NodeType.source) {
        index = ind;
        if (ind > 0 && needWarning) {
          this.props.displayWarning(SOURCE_NODE_WARN);
        }
      }
      if (node.element === NodeType.sink) {
        sinkCount++;
        if (ind + 1 !== result.length && needWarning) {
          this.props.displayWarning(SINK_NODE_WARN);
        }
      }
      if (node.element === NodeType.multiKafka) {
        multiKafkaCount++;
        if (ind + 1 !== result.length && needWarning) {
          this.props.displayWarning(MULTI_KAFKA_SINK_WARN);
        }
      }
    });

    // Предупреждения для Multi Kafka sink нод
    if (needWarning) {
      if (multiKafkaCount > 1) {
        this.props.displayWarning(MULTI_KAFKA_SINK_WARN_MULTIPLE);
      }
      if (multiKafkaCount > 0 && sinkCount > 0) {
        this.props.displayWarning(MULTI_KAFKA_SINK_WARN_WITH_SINK);
      }
    }
    if (index === 0 && result.length > 0) {
      const source = {
        id: result[0].id,
        node: result[0].node,
        parallelism: result[0].parallelism,
        element: result[0].element,
      };
      if (this.state.consumerGroupId !== (result[0].node as SourceSinkKafkaNode)?.consumerGroupId && this.props.isStartedFlow === false) {
        this.props.displayError(CONSUMER_GROUP_ID_ERROR);
        (source.node as SourceSinkKafkaNode).consumerGroupId = (result[0].node as SourceSinkKafkaNode).consumerGroupId;
      }
      if (this.props.isStartedFlow && (result[0].node as SourceSinkKafkaNode).consumerGroupId === undefined && this.state.consumerGroupId) {
        this.props.displayError(COUSUMER_GROUP_ID_ERROR_DELETE);
      }

      result[0] = source;
    }
    return result;
  };

  reorder = (list, startIndex, endIndex) => {
    const result = Array.from(list);
    if (startIndex !== endIndex) {
      if (startIndex > endIndex) {
        const parentForRemoved = result[endIndex].parents;
        const [removed] = result.splice(startIndex, 1);
        const parentForMoved = removed.id;
        removed.parents = parentForRemoved;
        result[endIndex].parents = [parentForMoved];
        result.splice(endIndex, 0, removed);
      } else {
        const parentForMoved = result[startIndex].parents;
        const parentForRemoved = result[endIndex].id;
        result[endIndex].parents = parentForMoved;
        const [removed] = result.splice(startIndex, 1);
        removed.parents = [parentForRemoved];
        result.splice(endIndex, 0, removed);
      }
    }
    return this.normalize(result, true);
  };

  move = (source, destination, droppableSource, droppableDestination, sinkSourceFlag, destinationDroppableId, sourceDroppableId) => {
    const destClone = Array.from(destination);
    const sourceClone = Array.from(source);

    if (
      sinkSourceFlag &&
      !(
        (destinationDroppableId === 'droppable2' || destinationDroppableId === 'droppable3' || destinationDroppableId === 'droppable3') &&
        sourceDroppableId !== 'droppable'
      )
    ) {
      const removed = source[droppableSource.index];
      let newOne: ProcessingNode = {};
      const id = this.state.id;
      const ids: string[] = this.state.ids;
      let newId = `${removed.id + id}`;
      if (
        ids.some((id) => {
          return id === newId;
        })
      ) {
        newId = newId + 1;
      }
      if (removed.element !== NodeType.source) {
        if (removed.element === NodeType.sink) {
          if (
            destClone.filter((node) => {
              return node.element === NodeType.sink;
            }).length > 2
          ) {
            this.props.displayError('В пайплайне превышен лимит sink-нод.');
            return;
          }
          if (destClone.length !== droppableDestination.index) {
            this.props.displayWarning(SINK_NODE_WARN);
          }
        }
        if (destClone[droppableDestination.index - 1]) {
          const last = destClone[droppableDestination.index - 1];
          newOne = {
            id: newId,
            node: removed.node,
            parallelism: removed.parallelism,
            element: removed.element,
            parents: [last.id],
          };
        } else if (droppableDestination.index === 0 && removed.element === NodeType.sink) {
          const last = destClone[0];
          newOne = {
            id: newId,
            node: removed.node,
            parallelism: removed.parallelism,
            element: removed.element,
            parents: [last.id],
          };
        } else {
          this.props.displayWarning(SOURCE_NODE_WARN);
          newOne = {
            id: newId,
            node: removed.node,
            parallelism: removed.parallelism,
            element: removed.element,
            parents: [],
          };
        }
      } else {
        if (
          destClone.filter((node) => {
            return node.element === NodeType.source;
          }).length > 2
        ) {
          this.props.displayError('В пайплайне превышен лимит source-нод.');
          return;
        } else {
          if (droppableDestination.index !== 0) {
            this.props.displayWarning(SOURCE_NODE_WARN);
            if (destClone[droppableDestination.index - 1]) {
              const last = destClone[droppableDestination.index - 1];
              newOne = {
                id: newId,
                node: removed.node,
                parallelism: removed.parallelism,
                element: removed.element,
                parents: [last.id],
              };
            } else {
              newOne = {
                id: newId,
                node: removed.node,
                parallelism: removed.parallelism,
                element: removed.element,
                parents: [],
              };
            }
          } else {
            newOne = {
              id: newId,
              node: removed.node,
              parallelism: removed.parallelism,
              element: removed.element,
            };
          }
        }
      }

      if (destClone[droppableDestination.index] && droppableDestination.index !== 0) {
        destClone[droppableDestination.index].parents = [newOne.id];
      }
      ids.push(newOne.id);
      this.setState({ id: id + 1, ids: ids });
      destClone.splice(droppableDestination.index === 0 ? 1 : droppableDestination.index, 0, newOne);
    } else {
      sourceClone.splice(droppableSource.index, 1);
    }

    const result = {};
    result[droppableSource.droppableId] = sourceClone;
    result[droppableDestination.droppableId] = destClone;

    return result;
  };

  getList = (id) => this.state[this.id2List[id]];

  onDragEnd = (result) => {
    const { source, destination } = result;

    if (!destination) {
      return;
    }

    if (!this.props.canEdit) {
      this.props.displayError('У вас недостаточно прав для этого.');
      return;
    }

    if (source.droppableId === destination.droppableId) {
      if (source.droppableId === 'droppable2' || source.droppableId === 'droppable3' || source.droppableId === 'droppable4') {
        return;
      }

      const items = this.reorder(this.getList(source.droppableId), source.index, destination.index);

      const state = { items };

      this.props.changeItems(items);

      this.setState(state);
    } else {
      const result = this.move(
        this.getList(source.droppableId),
        this.getList(destination.droppableId),
        source,
        destination,
        source.droppableId === 'droppable2' || source.droppableId === 'droppable3' || source.droppableId === 'droppable4',
        destination.droppableId,
        source.droppableId,
      );

      const normalizeItems = this.normalize(
        result.droppable,
        !(
          (destination.droppableId === 'droppable2' || destination.droppableId === 'droppable3' || destination.droppableId === 'droppable3') &&
          source.droppableId !== 'droppable'
        ),
      );
      this.props.changeItems(normalizeItems);

      this.setState({
        items: normalizeItems,
      });
    }
  };

  render() {
    const { classes, isAdmin, isStartedFlow, useGlobalConsumerGroup, cunsumerGroupChanged } = this.props;
    return (
      <React.Fragment>
        <Grid
          container
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            overflow: 'auto',
          }}
        >
          <Paper
            style={{
              margin: 6,
              padding: 12,
              overflow: 'auto',
              width: '100%',
            }}
          >
            <Grid container justifyContent="flex-start" alignItems="center" style={{ width: '100%', marginLeft: 6 }} direction={'row'}>
              <FormControlLabel
                control={
                  <Switch
                    color={'primary'}
                    name="customFlow"
                    defaultChecked={this.props.customFlow}
                    checked={this.state.customFlow}
                    onChange={(e) => {
                      if (this.state.customFlow) {
                        try {
                          const normalizeItems = this.normalize(JSON.parse(this.state.data), false);
                          this.props.changeItems(normalizeItems);
                          this.setState({
                            customFlow: e.target.checked,
                            items: normalizeItems,
                          });
                        } catch (e) {
                          this.props.displayError('Поток должен быть валидным JSON.');
                        }
                      } else {
                        const normalizeItems = this.normalize(this.state.items, false);
                        this.props.changeItems(normalizeItems);
                        this.setState({
                          customFlow: e.target.checked,
                          data: JSON.stringify(normalizeItems, null, 2),
                        });
                      }
                      this.props.customFlowChanged(e.target.checked);
                    }}
                  />
                }
                label="Нестандартный поток"
              />
              <HtmlTooltip
                title={
                  <React.Fragment>
                    <Typography color="primary" variant={'body2'}>
                      <b>Нестандартный поток</b>
                    </Typography>
                    <Typography variant={'caption'} color="inherit">
                      {' '}
                      {'Отметьте эту галочку, если Вы хотите сами ввести полный JSON потока. Только при включенном ' +
                        'режиме "Нестандартный поток" Вы сможете перейти на следующий шаг, ничего не вводя на текущем.\n'}
                    </Typography>
                  </React.Fragment>
                }
              >
                <InfoIcon fontSize={'small'} color={'primary'} />
              </HtmlTooltip>
            </Grid>
            <Grid container justifyContent="flex-start" alignItems="center" style={{ width: '100%', marginLeft: 6 }} direction={'row'}>
              <FormControlLabel
                control={
                  // Функциональность создания единой consumer group для всех зон
                  // потока обработки должна быть доступна только пользователю с
                  // правами администратора. и только при отсутствии экзепляров (т.е. при не запущенном потоке)
                  <Switch
                    color={'primary'}
                    name="useGlobalConsumerGroup"
                    disabled={isStartedFlow || !isAdmin}
                    defaultChecked={useGlobalConsumerGroup}
                    checked={useGlobalConsumerGroup}
                    onChange={(e) => {
                      cunsumerGroupChanged(e.target.checked);
                    }}
                  />
                }
                label="Использовать единую consumer group для всех зон"
              />
            </Grid>
            {!this.state.customFlow ? (
              <DragDropContext onDragEnd={this.onDragEnd}>
                <Grid container direction={'column'}>
                  <Grid item>
                    <Typography>Ваш поток обработки:</Typography>
                    <Droppable droppableId="droppable" direction="horizontal">
                      {(provided, snapshot) => (
                        <div ref={provided.innerRef} style={getListStyle(snapshot.isDraggingOver)}>
                          {this.state.items?.map((item, index) => {
                            return (
                              <Draggable key={item.id} draggableId={item.id} index={index}>
                                {(provided, snapshot) => (
                                  <div
                                    ref={provided.innerRef}
                                    {...provided.draggableProps}
                                    {...provided.dragHandleProps}
                                    style={getItemStyle(
                                      snapshot.isDragging,
                                      provided.draggableProps.style,
                                      FlowService.checkConfiguration(item),
                                      item.node.type === SourceType.multiKafka ? false : MapNames[item.node?.type] === undefined,
                                    )}
                                  >
                                    <Button
                                      className={classes.button}
                                      size={'small'}
                                      onClick={(e) => {
                                        switch (item.element) {
                                          case NodeType.source:
                                            this.setState({
                                              kafkaSourceOpen: true,
                                              currentNode: item,
                                            });
                                            break;
                                          case NodeType.sink:
                                            this.setState({
                                              kafkaSinkOpen: true,
                                              currentNode: item,
                                            });
                                            break;

                                          case NodeType.processing:
                                            switch (item.node.type) {
                                              case SourceType.multiKafka:
                                                this.setState({
                                                  multiSinkKafkaOpen: true,
                                                  currentNode: item,
                                                });
                                                break;
                                              case ProcessingNodeType.addCurrentTime:
                                                this.setState({
                                                  addCurrentTimeOpen: true,
                                                  currentNode: item,
                                                });
                                                break;
                                              case ProcessingNodeType.copyField:
                                                this.setState({
                                                  copyFieldOpen: true,
                                                  currentNode: item,
                                                });
                                                break;
                                              case ProcessingNodeType.generateUUID:
                                                this.setState({
                                                  generateUuidOpen: true,
                                                  currentNode: item,
                                                });
                                                break;
                                              case ProcessingNodeType.jsonFlatten:
                                                this.setState({
                                                  jsonFlattenOpen: true,
                                                  currentNode: item,
                                                });
                                                break;
                                              case ProcessingNodeType.jsonParse:
                                                this.setState({
                                                  jsonParseOpen: true,
                                                  currentNode: item,
                                                });
                                                break;
                                              case ProcessingNodeType.jsonSerialize:
                                                this.setState({
                                                  jsonSerializeOpen: true,
                                                  currentNode: item,
                                                });
                                                break;
                                              case ProcessingNodeType.timestampConvert:
                                                this.setState({
                                                  convertTimestampOpen: true,
                                                  currentNode: item,
                                                });
                                                break;
                                              case ProcessingNodeType.avroParse:
                                                this.setState({
                                                  avroParseOpen: true,
                                                  currentNode: item,
                                                });
                                                break;
                                              case ProcessingNodeType.rateLimiter:
                                                this.setState({
                                                  rateLimiterOpen: true,
                                                  currentNode: item,
                                                });
                                                break;
                                              default:
                                                break;
                                            }
                                        }
                                      }}
                                    >
                                      {this.getNodeConfigButtonText(item)}
                                    </Button>
                                  </div>
                                )}
                              </Draggable>
                            );
                          })}
                          {provided.placeholder}
                        </div>
                      )}
                    </Droppable>
                  </Grid>
                  <Grid>
                    <Typography>Ноды обработки:</Typography>
                    <Droppable droppableId="droppable2" direction="horizontal">
                      {(provided, snapshot) => (
                        <div ref={provided.innerRef} style={getListStyle(snapshot.isDraggingOver)}>
                          {this.state.processingNodes.map((item, index) => {
                            return (
                              <Draggable key={item.id} draggableId={item.id} index={index}>
                                {(provided, snapshot) => (
                                  <div
                                    ref={provided.innerRef}
                                    {...provided.draggableProps}
                                    {...provided.dragHandleProps}
                                    style={getItemStyle(snapshot.isDragging, provided.draggableProps.style, true, false)}
                                  >
                                    <HtmlTooltip title={MapNodeDescription[item.node?.type]}>
                                      <Button size={'small'} className={classes.button}>
                                        {MapNames[item.node?.type]}
                                      </Button>
                                    </HtmlTooltip>
                                  </div>
                                )}
                              </Draggable>
                            );
                          })}
                          {provided.placeholder}
                        </div>
                      )}
                    </Droppable>
                  </Grid>
                </Grid>
                <Grid container direction={'row'}>
                  <Grid item style={{ width: 'calc(50% - 12px)', margin: '6px' }}>
                    <Typography>Source-ноды:</Typography>
                    <Droppable droppableId="droppable3" direction="horizontal">
                      {(provided, snapshot) => (
                        <div ref={provided.innerRef} style={getListStyle(snapshot.isDraggingOver)}>
                          {this.state.sourceNodes.map((item, index) => {
                            return (
                              <Draggable key={item.id} draggableId={item.id} index={index}>
                                {(provided, snapshot) => (
                                  <div
                                    ref={provided.innerRef}
                                    {...provided.draggableProps}
                                    {...provided.dragHandleProps}
                                    style={getItemStyle(snapshot.isDragging, provided.draggableProps.style, true, false)}
                                  >
                                    <HtmlTooltip title={MapNodeDescription[item.node?.type + 'Source']}>
                                      <Button className={classes.button} size={'small'}>
                                        {MapNames[item.node?.type + 'Source']}
                                      </Button>
                                    </HtmlTooltip>
                                  </div>
                                )}
                              </Draggable>
                            );
                          })}
                          {provided.placeholder}
                        </div>
                      )}
                    </Droppable>
                  </Grid>
                  <Grid item style={{ width: 'calc(50% - 12px)', margin: '6px' }}>
                    <Typography>Sink-ноды:</Typography>
                    <Droppable droppableId="droppable4" direction="horizontal">
                      {(provided, snapshot) => (
                        <div ref={provided.innerRef} style={getListStyle(snapshot.isDraggingOver)}>
                          {this.state.sinkNodes.map((item, index) => {
                            return (
                              <Draggable key={item.id} draggableId={item.id} index={index}>
                                {(provided, snapshot) => (
                                  <div
                                    ref={provided.innerRef}
                                    {...provided.draggableProps}
                                    {...provided.dragHandleProps}
                                    style={getItemStyle(snapshot.isDragging, provided.draggableProps.style, true, false)}
                                  >
                                    <HtmlTooltip
                                      title={
                                        MapNodeDescription[item.node?.type === SourceType.multiKafka ? 'multiKafkaSink' : item.node?.type + 'Sink']
                                      }
                                    >
                                      <Button className={classes.button} size={'small'}>
                                        {item.node?.type === SourceType.multiKafka ? MapNames['multiKafkaSink'] : MapNames[item.node?.type + 'Sink']}
                                      </Button>
                                    </HtmlTooltip>
                                  </div>
                                )}
                              </Draggable>
                            );
                          })}
                          {provided.placeholder}
                        </div>
                      )}
                    </Droppable>
                  </Grid>
                </Grid>
              </DragDropContext>
            ) : (
              <Grid item xs={12}>
                <Paper style={{ padding: 12 }}>
                  <AceEditor
                    readOnly={!this.props.canEdit}
                    mode="javascript"
                    value={this.state.data}
                    theme="github"
                    onChange={(e) => {
                      this.setState({ data: e });
                      try {
                        const nodes: ProcessingNode[] = JSON.parse(e);
                        const normalizeItems = this.normalize(nodes, false);
                        // this.props.changeItems(normalizeItems)
                        this.props.dataChanged(JSON.stringify(normalizeItems, null, 2));
                      } catch (error) {
                        this.props.dataChanged(e);
                      }
                    }}
                    highlightActiveLine
                    width={'100%'}
                    height={'600px'}
                    showPrintMargin
                    setOptions={{
                      showLineNumbers: true,
                      tabSize: 4,
                    }}
                  />
                </Paper>
              </Grid>
            )}
          </Paper>
        </Grid>

        {this.state.copyFieldOpen && (
          <React.Fragment>
            <CopyFieldNodeItem
              canEdit={this.props.canEdit}
              currentNode={this.state.currentNode}
              displayError={this.props.displayError}
              onClose={(value, data) => {
                if (value === 'Ok' && data) {
                  const copyNode: CopyFieldNode = {
                    toFields: data.toFields,
                    fromField: data.fromField,
                  };
                  const node: CopyFieldProcessingNode = {
                    type: ProcessingNodeType.copyField,
                    copyParametersList: [copyNode],
                  };
                  const result = this.configNode(this.state.items, node);
                  this.props.changeItems(result);
                  this.setState({ items: result });
                }
              }}
              close={(isOpen) => this.setState({ copyFieldOpen: isOpen })}
            />
          </React.Fragment>
        )}

        {this.state.jsonFlattenOpen && (
          <React.Fragment>
            <FlattenNodeItem
              canEdit={this.props.canEdit}
              currentNode={this.state.currentNode}
              displayError={this.props.displayError}
              onClose={(value, data: FlattenNodeItemState) => {
                if (value === 'Ok' && data) {
                  const { excludedFromFlatteningFields } = data;
                  if (
                    excludedFromFlatteningFields.length > 0 &&
                    !(excludedFromFlatteningFields.length === 1 && excludedFromFlatteningFields[0] === '')
                  ) {
                    const node: JsonFlattenNode = {
                      type: ProcessingNodeType.jsonFlatten,
                      excludedFromFlatteningFields: excludedFromFlatteningFields,
                    };
                    const result = this.configNode(this.state.items, node);
                    this.setState({ items: result });
                  }
                  if (excludedFromFlatteningFields.length === 1 && excludedFromFlatteningFields[0] === '') {
                    const node: JsonFlattenNode = {
                      type: ProcessingNodeType.jsonFlatten,
                      excludedFromFlatteningFields: [],
                    };
                    const result = this.configNode(this.state.items, node);
                    this.props.changeItems(result);
                    this.setState({ items: result });
                  }
                }
              }}
              close={(isOpen) => this.setState({ jsonFlattenOpen: isOpen })}
            />
          </React.Fragment>
        )}

        {this.state.generateUuidOpen && (
          <React.Fragment>
            <GenerateUuidNodeItem
              canEdit={this.props.canEdit}
              displayError={this.props.displayError}
              currentNode={this.state.currentNode}
              onClose={(value, data: GenerateUuidNodeItemState) => {
                if (value === 'Ok' && data) {
                  const node: GenerateUUIDNode = {
                    type: ProcessingNodeType.generateUUID,
                    toField: data.toField,
                  };
                  const result = this.configNode(this.state.items, node);
                  this.props.changeItems(result);
                  this.setState({ items: result });
                }
              }}
              close={(isOpen) => this.setState({ generateUuidOpen: isOpen })}
            />
          </React.Fragment>
        )}

        {this.state.addCurrentTimeOpen && (
          <React.Fragment>
            <AddCurrentTimeNodeItem
              displayError={this.props.displayError}
              timeFormats={this.props.timeFormats}
              timezones={this.props.timezones}
              currentNode={this.state.currentNode}
              canEdit={this.props.canEdit}
              onClose={(value, data: AddCurrentTimeNodeItemState) => {
                if (value === 'Ok' && data) {
                  const node: AddCurrentTimeNode = {
                    type: ProcessingNodeType.addCurrentTime,
                    toField: data.toField,
                    timezone: data.timezone,
                    timeFormat: data.timeFormat,
                  };
                  const result = this.configNode(this.state.items, node);
                  this.props.changeItems(result);
                  this.setState({ items: result });
                }
              }}
              close={(isOpen) => this.setState({ addCurrentTimeOpen: isOpen })}
            />
          </React.Fragment>
        )}

        {this.state.convertTimestampOpen && (
          <React.Fragment>
            {' '}
            <ConvertTimestampNodeItem
              displayError={this.props.displayError}
              timeFormats={this.props.timeFormats}
              timezones={this.props.timezones}
              currentNode={this.state.currentNode}
              canEdit={this.props.canEdit}
              onClose={(value, data: ConvertTimestampNodeItemState) => {
                if (value === 'Ok' && data) {
                  const node: TimestampConvertNode = {
                    type: ProcessingNodeType.timestampConvert,
                    field: data.field,
                    inputFormats: data.inputFormats,
                    outputFormat: data.outputFormat,
                    inputTimezone: data.inputTimezone,
                    outputTimezone: data.outputTimezone,
                  };
                  const result = this.configNode(this.state.items, node);
                  this.props.changeItems(result);
                  this.setState({ items: result });
                }
              }}
              close={(isOpen) => this.setState({ convertTimestampOpen: isOpen })}
            />
          </React.Fragment>
        )}

        {this.state.kafkaSourceOpen && (
          <React.Fragment>
            <KafkaSourceNodeItem
              displayError={this.props.displayError}
              projects={this.props.projects}
              topics={this.props.topics}
              currentNode={this.state.currentNode}
              onClose={(value, data: KafkaSourceNodeItemState) => {
                if (value === 'Ok' && data) {
                  const node: SourceSinkKafkaNode = {
                    type: SourceType.kafka,
                    topic: data.topic,
                    projectShortName: data.projectShortName,
                  };
                  const result = this.configNode(this.state.items, node);
                  this.props.changeItems(result);
                  this.setState({ items: result });
                }
              }}
              canEdit={this.props.canEdit}
              close={(isOpen) => this.setState({ kafkaSourceOpen: isOpen })}
            />
          </React.Fragment>
        )}
        {this.state.multiSinkKafkaOpen && (
          <React.Fragment>
            {' '}
            <MultiKafkaSinkNodeItem
              displayError={this.props.displayError}
              projects={this.props.projects}
              topics={this.props.topics}
              currentNode={this.state.currentNode}
              onSave={(data: MultiKafkaSinkNode) => {
                if (data) {
                  const node: MultiKafkaSinkNode = {
                    type: SourceType.multiKafka,
                    topics: data.topics,
                  };
                  const result = this.configNode(this.state.items, node);
                  this.props.changeItems(result);
                  this.setState({ items: result, multiSinkKafkaOpen: false });
                }
              }}
              canEdit={this.props.canEdit}
              close={(isOpen) => this.setState({ multiSinkKafkaOpen: isOpen })}
            />
          </React.Fragment>
        )}

        {this.state.kafkaSinkOpen && (
          <React.Fragment>
            {' '}
            <KafkaSinkNodeItem
              displayError={this.props.displayError}
              projects={this.props.projects}
              topics={this.props.topics}
              currentNode={this.state.currentNode}
              onClose={(value, data: KafkaSourceNodeItemState) => {
                if (value === 'Ok' && data) {
                  const node: SourceSinkKafkaNode = {
                    type: SourceType.kafka,
                    topic: data.topic,
                    projectShortName: data.projectShortName,
                  };
                  const result = this.configNode(this.state.items, node);
                  this.props.changeItems(result);
                  this.setState({ items: result });
                }
              }}
              canEdit={this.props.canEdit}
              close={(isOpen) => this.setState({ kafkaSinkOpen: isOpen })}
            />
          </React.Fragment>
        )}

        {this.state.jsonParseOpen && (
          <React.Fragment>
            <JsonParseNodeItem close={(isOpen) => this.setState({ jsonParseOpen: isOpen })} />
          </React.Fragment>
        )}

        {this.state.jsonSerializeOpen && (
          <React.Fragment>
            <JsonSerializeNodeItem close={(isOpen) => this.setState({ jsonSerializeOpen: isOpen })} />
          </React.Fragment>
        )}

        {this.state.avroParseOpen && (
          <>
            <AvroParseNodeItem
              displayError={this.props.displayError}
              schemaNames={this.props.schemaNames}
              currentNode={this.state.currentNode}
              onClose={(value, data: AvroParseNodeItemState) => {
                if (value === 'Ok' && data) {
                  const node: AvroParseNode = {
                    type: ProcessingNodeType.avroParse,
                    schemaName: data.schemaName,
                  };
                  const result = this.configNode(this.state.items, node);
                  this.props.changeItems(result);
                  this.setState({ items: result });
                }
              }}
              canEdit={this.props.canEdit}
              close={(isOpen) => this.setState({ avroParseOpen: isOpen })}
            />
          </>
        )}
        {this.state.rateLimiterOpen && (
          <>
            <ReteLimiterNodeItem
              displayError={this.props.displayError}
              schemaNames={this.props.schemaNames}
              currentNode={this.state.currentNode}
              onClose={(value, data) => {
                if (value === 'Ok' && data) {
                  const node: RateLimiterNode = {
                    type: ProcessingNodeType.rateLimiter,
                    messagesPerSecond: data.messagesPerSecond,
                    bytesPerSecond: data.bytesPerSecond,
                    limitBy: 'BYTES',
                  };
                  const result = this.configNode(this.state.items, node);
                  this.props.changeItems(result);
                  this.setState({ items: result });
                }
              }}
              canEdit={this.props.canEdit}
              close={(isOpen) => this.setState({ rateLimiterOpen: isOpen })}
            />
          </>
        )}
      </React.Fragment>
    );
  }
}

export default connect(mapStateToProps)(withStyles(styles)(FlowCreateItem));
