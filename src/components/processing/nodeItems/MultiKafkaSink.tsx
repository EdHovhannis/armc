import {
  Box,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
  IconButton,
  Paper,
  TextField,
  Tooltip,
} from '@material-ui/core';
import { makeStyles } from '@material-ui/core/styles';
import AddIcon from '@material-ui/icons/Add';
import CloseIcon from '@material-ui/icons/Close';
import { Autocomplete } from '@material-ui/lab';
import * as React from 'react';
import { useEffect, useMemo, useState } from 'react';
import Draggable from 'react-draggable';
import { ResizableBox } from 'react-resizable';

import ProjectService from '../../../services/ProjectService';
import { MultiKafkaSinkNode, ProcessingNode, SourceType } from '../../../store/flow/Types';
import { KafkaTopic } from '../../../store/kafka/Types';
import { Project } from '../../../store/project/Types';

const useStyles = makeStyles((theme) => ({
  resizable: {
    position: 'relative',
    '& .react-resizable-handle': {
      position: 'absolute',
      width: 20,
      height: 20,
      bottom: 0,
      right: 0,
      background:
        "url('data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHZpZXdCb3g9IjAgMCA2IDYiIHN0eWxlPSJiYWNrZ3JvdW5kLWNvbG9yOiNmZmZmZmYwMCIgeD0iMHB4IiB5PSIwcHgiIHdpZHRoPSI2cHgiIGhlaWdodD0iNnB4Ij48ZyBvcGFjaXR5PSIwLjMwMiI+PHBhdGggZD0iTSA2IDYgTCAwIDYgTCAwIDQuMiBMIDQgNC4yIEwgNC4yIDQuMiBMIDQuMiAwIEwgNiAwIEwgNiA2IEwgNiA2IFoiIGZpbGw9IiMwMDAwMDAiLz48L2c+PC9zdmc+')",
      'background-position': 'bottom right',
      padding: '0 3px 3px 0',
      'background-repeat': 'no-repeat',
      'background-origin': 'content-box',
      'box-sizing': 'border-box',
      cursor: 'se-resize',
    },
  },
}));

function PaperComponent(props) {
  return (
    <Draggable handle="#draggable-dialog-title" cancel={'[class*="MuiDialogContent-root"]'}>
      <Paper {...props} />
    </Draggable>
  );
}

export interface MultiKafkaSinkNodeItemProps {
  displayError(msg: string): any;
  onSave(data: MultiKafkaSinkNode): any;
  close(value: boolean): any;
  currentNode?: ProcessingNode;
  projects: Array<Project>;
  topics: Array<KafkaTopic>;
  canEdit: boolean;
}

const MultiKafkaSinkNodeItem: React.FC<MultiKafkaSinkNodeItemProps> = ({ displayError, onSave, close, currentNode, projects, topics, canEdit }) => {
  const classes = useStyles();

  interface TopicConfig {
    topic: string;
    projectShortName: string;
  }

  const initialTopicConfigs = useMemo(() => {
    if (currentNode && 'topics' in currentNode.node && Array.isArray(currentNode.node.topics) && currentNode.node.topics.length > 0) {
      return currentNode.node.topics;
    }
    return [{ topic: '', projectShortName: '' }];
  }, [currentNode]);

  const [topicConfigs, setTopicConfigs] = useState<TopicConfig[]>(initialTopicConfigs);
  const checkTopicDuplicate = (topicName: string, topiclist: TopicConfig[], isProject: boolean) => {
    return topiclist.some(
      (config) =>
        config.topic &&
        config.projectShortName &&
        `${config.projectShortName}.${config.topic}` === (isProject ? `${topicName}.${config.topic}` : topicName),
    );
  };
  const getOptionsLabel = (option: KafkaTopic) => {
    const project = projects.find((project) => project.id === option.projectId);
    if (!project) {
      console.warn('Unable to resolve project', option, projects);
    }
    const projectShortName =
      (project?.shortName ?? option.topicFullName?.split('.').length > 0) ? option.topicFullName?.split('.')[0] : (option.topicFullName ?? 'unknown');
    return `${projectShortName}/${option.name}`;
  };

  const addTopic = () => {
    if (topicConfigs.length < 10) {
      setTopicConfigs([...topicConfigs, { topic: '', projectShortName: '' }]);
    }
  };

  const removeTopic = (index: number) => {
    if (topicConfigs.length > 1) {
      setTopicConfigs(topicConfigs.filter((_, i) => i !== index));
    }
  };
  const updateTopic = (index: number, topicConfig: TopicConfig) => {
    const newTopicConfigs = [...topicConfigs];
    newTopicConfigs[index] = topicConfig;
    setTopicConfigs(newTopicConfigs);
  };
  const getValue = (topicConfig: TopicConfig, topicList: KafkaTopic[]) => {
    if (topicConfig.topic === '') {
      return undefined;
    }
    const project = projects.find((p) => p.shortName === topicConfig.projectShortName);
    if (!project) {
      console.warn('Unable to find topic definition', topicConfig, topicList);
      return undefined;
    }
    return topicList.find((top) => top.projectId === project.id && top.name === topicConfig.topic);
  };

  const [topicsList, setTopicsList] = useState<KafkaTopic[]>(topics);
  useEffect(() => {
    setTopicsList(
      topics.filter((topic) => {
        const arr = projects.filter((project) => {
          return project.id === topic.projectId;
        });
        const projectName = arr[0]?.shortName + '.' + topic.name;
        if (
          !topicConfigs.some((topicConfig) => {
            return `${topicConfig.projectShortName}.${topicConfig.topic}` === projectName && topicConfig.topic === topic.name;
          })
        ) {
          return projectName;
        }
      }),
    );
  }, [topicConfigs]);

  return (
    <>
      <Dialog
        open={true}
        onClose={(e) => {
          close(false);
        }}
        maxWidth={false}
        PaperComponent={PaperComponent}
        aria-labelledby="draggable-dialog-title"
      >
        <ResizableBox width={750} className={classes.resizable}>
          <DialogTitle style={{ cursor: 'move' }} id="draggable-dialog-title">
            Конфигурация приемника данных.
          </DialogTitle>
          <DialogContent>
            <DialogContentText>Выберите топики Kafka.</DialogContentText>

            {topicConfigs.map((topicConfig, index) => (
              <Box key={index} style={{ display: 'flex', alignItems: 'center', marginTop: 16 }}>
                <Autocomplete
                  id={`topicIn-${index}`}
                  fullWidth={true}
                  disabled={!canEdit}
                  options={topicsList}
                  value={getValue(topicConfig, topics)}
                  getOptionLabel={getOptionsLabel}
                  style={{ flex: 1 }}
                  onChange={(event, newValue: KafkaTopic | null) => {
                    if (!newValue) {
                      // Очистка выбора
                      updateTopic(index, {
                        topic: '',
                        projectShortName: '',
                      });
                      return;
                    }

                    if (newValue.projectId) {
                      // проверка при стандартном имени топика
                      const isAlreadySelected = checkTopicDuplicate(`${newValue.topicFullName}`, topicConfigs, false);
                      if (isAlreadySelected) {
                        displayError('Этот топик уже добавлен!');
                        return;
                      }
                      ProjectService.fetchProjectById(
                        newValue.projectId,
                        (project) => {
                          updateTopic(index, {
                            topic: newValue.name,
                            projectShortName: project.shortName,
                          });
                        },
                        (msg) => {
                          displayError(msg);
                        },
                      );
                    }
                  }}
                  renderInput={(params) => <TextField {...params} label=" Топик " variant="outlined" />}
                />
                {topicConfigs.length > 1 && canEdit && (
                  <Tooltip title="Удалить топик">
                    <IconButton onClick={() => removeTopic(index)} style={{ marginLeft: 8, color: '#f44336' }}>
                      <CloseIcon />
                    </IconButton>
                  </Tooltip>
                )}
              </Box>
            ))}

            {topicConfigs.length < 10 && canEdit && (
              <Box style={{ marginTop: 16, textAlign: 'left' }}>
                <Tooltip title="Добавить топик Kafka">
                  <IconButton onClick={addTopic} style={{ color: '#4caf50' }}>
                    <AddIcon />
                  </IconButton>
                </Tooltip>
              </Box>
            )}
          </DialogContent>
          <DialogActions style={{ marginTop: 6 }}>
            <Button
              onClick={(e) => {
                close(false);
              }}
              color="primary"
            >
              {canEdit ? 'Отменить' : 'Закрыть'}
            </Button>
            {canEdit && (
              <Button
                onClick={(e) => {
                  const emptyTopics = topicConfigs.filter((t) => t.topic === '' || t.projectShortName === '');

                  if (emptyTopics.length > 0) {
                    displayError('Не все топики указаны!');
                    return;
                  }

                  onSave({
                    type: SourceType.multiKafka,
                    topics: topicConfigs,
                  });
                  close(false);
                }}
                color="primary"
              >
                Сохранить
              </Button>
            )}
          </DialogActions>
        </ResizableBox>
      </Dialog>
    </>
  );
};

export default MultiKafkaSinkNodeItem;
