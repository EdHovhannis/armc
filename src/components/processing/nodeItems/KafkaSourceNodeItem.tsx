import {
  Button,
  createStyles,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
  Paper,
  TextField,
  withStyles,
} from '@material-ui/core';
import FormControl from '@material-ui/core/FormControl';
import InputLabel from '@material-ui/core/InputLabel';
import MenuItem from '@material-ui/core/MenuItem';
import OutlinedInput from '@material-ui/core/OutlinedInput';
import Select from '@material-ui/core/Select';
import { Autocomplete } from '@material-ui/lab';
import * as React from 'react';
import Draggable from 'react-draggable';
import { ResizableBox } from 'react-resizable';

import ProjectService from '../../../services/ProjectService';
import { ProcessingNode } from '../../../store/flow/Types';
import { KafkaTopic } from '../../../store/kafka/Types';
import { Project } from '../../../store/project/Types';

const styles = (theme) =>
  createStyles({
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
  });

function PaperComponent(props) {
  return (
    <Draggable handle="#draggable-dialog-title" cancel={'[class*="MuiDialogContent-root"]'}>
      <Paper {...props} />
    </Draggable>
  );
}

export interface KafkaSourceNodeItemProps {
  displayError(msg: string): any;

  onClose(value: string, data?: any): any;

  close(value: boolean): any;

  currentNode?: ProcessingNode;
  projects: Array<Project>;
  topics: Array<KafkaTopic>;
  canEdit: boolean;
}

export interface KafkaSourceNodeItemState {
  topic: string;
  projectShortName: string;
  currentNode?: ProcessingNode;
}

class KafkaSourceNodeItem extends React.Component<KafkaSourceNodeItemProps, KafkaSourceNodeItemState> {
  constructor(props) {
    super(props);

    this.state = {
      topic: this.props.currentNode ? this.props.currentNode.node.topic : '',
      projectShortName: this.props.currentNode ? this.props.currentNode.node.projectShortName : '',
    };
  }

  static getDerivedStateFromProps(props, state) {
    if (props.currentNode !== state.currentNode) {
      return {
        topic: props.currentNode ? props.currentNode.node.topic : '',
        projectShortName: props.currentNode ? props.currentNode.node.projectShortName : '',
        currentNode: props.currentNode,
      };
    }
  }

  render() {
    const { classes } = this.props;
    return (
      <React.Fragment>
        <Dialog
          open={true}
          onClose={(e) => {
            this.props.close(false);
          }}
          maxWidth={false}
          PaperComponent={PaperComponent}
          aria-labelledby="draggable-dialog-title"
        >
          <ResizableBox width={750} className={classes.resizable}>
            <DialogTitle style={{ cursor: 'move' }} id="draggable-dialog-title">
              Конфигурация источника данных.
            </DialogTitle>
            <DialogContent>
              <DialogContentText>Выберите источник данных Kafka.</DialogContentText>
              <Autocomplete
                id="topicOut"
                fullWidth={true}
                disabled={!this.props.canEdit}
                options={this.props.topics}
                defaultValue={
                  this.state.topic === ''
                    ? undefined
                    : this.props.topics.filter((topic) => topic.topicFullName === this.state.projectShortName + '.' + this.state.topic).length > 0
                      ? this.props.topics.filter((topic) => topic.topicFullName === this.state.projectShortName + '.' + this.state.topic)[0]
                      : { topicFullName: this.state.projectShortName + '.' + this.state.topic, name: this.state.topic }
                }
                // defaultValue={this.props.topics.filter(topic => topic.name === this.state.topic)[0]}
                getOptionLabel={(option: KafkaTopic) => {
                  return this.props.projects.filter((project) => {
                    return project.id === option.projectId;
                  }).length > 0
                    ? this.props.projects
                        .filter((project) => {
                          return project.id === option.projectId;
                        })
                        .map((project) => {
                          return project.shortName;
                        })[0] +
                        '/' +
                        option.name
                    : option.topicFullName.split('.').length > 1
                      ? option.topicFullName.split('.')[0] + '/' + option.topicFullName.split('.')[1]
                      : option.topicFullName.split('.')[0];
                }}
                style={{ width: '100%', marginTop: 16 }}
                onChange={(event, newValue: KafkaTopic) => {
                  ProjectService.fetchProjectById(
                    newValue.projectId,
                    (project) => {
                      this.setState({
                        projectShortName: project.shortName,
                        topic: newValue.name,
                      });
                    },
                    (msg) => {
                      this.props.displayError(msg);
                    },
                  );
                }}
                renderInput={(params) => <TextField {...params} label=" Топик " variant="outlined" />}
              />
            </DialogContent>
            <DialogActions style={{ marginTop: 6 }}>
              <Button
                onClick={(e) => {
                  this.props.onClose('Cancel');
                  this.props.close(false);
                }}
                color="primary"
              >
                {this.props.canEdit ? 'Отменить' : 'Закрыть'}
              </Button>
              {this.props.canEdit && (
                <Button
                  onClick={(e) => {
                    if (
                      this.state.topic == '' ||
                      this.state.topic == null ||
                      this.state.projectShortName == '' ||
                      this.state.projectShortName == null
                    ) {
                      this.props.displayError('Топик не указан!');
                      return;
                    }
                    this.props.onClose('Ok', this.state);
                    this.props.close(false);
                  }}
                  color="primary"
                >
                  Сохранить
                </Button>
              )}
            </DialogActions>
          </ResizableBox>
        </Dialog>
      </React.Fragment>
    );
  }
}

export default withStyles(styles)(KafkaSourceNodeItem);
