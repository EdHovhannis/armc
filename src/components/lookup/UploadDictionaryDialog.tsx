import { DialogActions } from '@material-ui/core';
import Button from '@material-ui/core/Button';
import Dialog from '@material-ui/core/Dialog';
import DialogContent from '@material-ui/core/DialogContent';
import DialogTitle from '@material-ui/core/DialogTitle';
import Paper from '@material-ui/core/Paper';
import TextField from '@material-ui/core/TextField';
import { green } from '@material-ui/core/colors';
import { createStyles, withStyles } from '@material-ui/core/styles';
import { Autocomplete } from '@material-ui/lab';
import { DropzoneArea } from 'material-ui-dropzone';
import * as React from 'react';
import Draggable from 'react-draggable';
import { ResizableBox } from 'react-resizable';

import { DictionaryQuota } from '../../store/lookup/Types';
import { Project } from '../../store/project/Types';

const MAX_SIZE_DICTIONARY = 52428800; //50 Mb

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
    previewChip: {
      minWidth: 160,
      maxWidth: 210,
    },
    dropZone: {
      color: green[500],
    },
  });

function PaperComponent(props) {
  return (
    <Draggable handle="#draggable-dialog-title" cancel={'[class*="MuiDialogContent-root"]'}>
      <Paper {...props} />
    </Draggable>
  );
}

export interface UploadDictionaryDialogProps {
  projects: Project[];
  zones: string[];
  isUpdate: boolean;
  name?: string;
  projectName?: string;
  zone?: string;
  classes: {
    resizable: string;
    previewChip: string;
    dropZone: string;
  };
  close(): any;

  changeInfo(projectName, name, zone, data): any;

  getDictionaryQuota(projectShortName: string, successCallback?: (quota: DictionaryQuota) => void, errorCallback?): any;

  displayError(msg: string): any;
}

export interface UploadDictionaryDialogStat {
  name: string;
  project: Project | undefined;
  zone: string;
  files: any[];
}

class UploadDictionaryDialog extends React.Component<UploadDictionaryDialogProps, UploadDictionaryDialogStat> {
  constructor(props) {
    super(props);
    this.state = {
      name: '',
      project: undefined,
      zone: '',
      files: [],
    };
  }

  handleChange(files) {
    this.setState({
      files: files,
    });
  }

  render() {
    const { classes } = this.props;
    return (
      <React.Fragment>
        <Dialog
          open={true}
          onClose={() => this.props.close()}
          maxWidth={false}
          PaperComponent={PaperComponent}
          aria-labelledby="draggable-dialog-title"
        >
          <ResizableBox width={800} className={classes.resizable}>
            <DialogTitle style={{ cursor: 'move' }} id="draggable-dialog-title">
              {this.props.isUpdate ? 'Обновление справочника ' + this.props.projectName + '/' + this.props.name : 'Добавление нового словаря'}
            </DialogTitle>
            <DialogContent>
              {!this.props.isUpdate && (
                <React.Fragment>
                  <TextField
                    autoFocus
                    error={this.state.name === ''}
                    margin="dense"
                    id="name"
                    label="Имя справочника"
                    placeholder={'Введите имя нового справочника'}
                    onChange={(e) => {
                      this.setState({ name: e.target.value });
                    }}
                    value={this.state.name}
                    fullWidth
                  />
                  <Autocomplete
                    options={this.props.projects}
                    renderOption={(option: Project) => {
                      return option.name;
                    }}
                    getOptionLabel={(option) => {
                      return option.name;
                    }}
                    defaultValue={this.state.project}
                    onChange={(event, newValue) => {
                      this.setState({ project: newValue });
                    }}
                    renderInput={(params) => (
                      <TextField
                        {...params}
                        variant="standard"
                        error={this.state.project?.name === ''}
                        label="Имя проекта"
                        placeholder="Введите имя проекта"
                        margin="normal"
                        fullWidth
                      />
                    )}
                  />
                  <Autocomplete
                    options={this.props.zones}
                    renderOption={(option: string) => option}
                    getOptionLabel={(option) => option}
                    defaultValue={this.state.zone}
                    onChange={(event, newValue) => {
                      this.setState({ zone: newValue || '' });
                    }}
                    renderInput={(params) => (
                      <TextField
                        {...params}
                        variant="standard"
                        error={this.state.zone === ''}
                        label="Зона"
                        placeholder="Выберите зону"
                        margin="normal"
                        fullWidth
                      />
                    )}
                  />
                </React.Fragment>
              )}
              <DropzoneArea
                onChange={this.handleChange.bind(this)}
                filesLimit={1}
                maxFileSize={MAX_SIZE_DICTIONARY}
                dropzoneText={'Перетащите сюда файл в формате ".csv"'}
                acceptedFiles={['.csv']}
                previewText={'Ваш файл'}
                showPreviews={true}
                showPreviewsInDropzone={false}
                useChipsForPreview
                dropzoneClass={classes.dropZone}
                previewGridProps={{ container: { spacing: 1, direction: 'row' } }}
                previewChipProps={{ classes: { root: classes.previewChip } }}
                showAlerts={['error']}
              />
            </DialogContent>
            <DialogActions style={{ marginTop: 6 }}>
              <Button onClick={() => this.props.close()} color="primary">
                Отменить
              </Button>
              <Button
                onClick={(e) => {
                  if (!this.props.isUpdate) {
                    if (this.state.project === undefined) {
                      this.props.displayError('Проект не выбран!');
                      return;
                    }
                    if (this.state.name === '') {
                      this.props.displayError('Имя справочника не введено!');
                      return;
                    }
                    if (this.state.zone === '') {
                      this.props.displayError('Зона для справочика не выбрана!');
                      return;
                    }
                  }
                  if (this.state.files.length === 0) {
                    this.props.displayError('Файл с данными справочника не выбран!');
                    return;
                  }
                  if (!this.props.isUpdate) {
                    this.props.getDictionaryQuota(
                      this.state.project?.shortName,
                      (quota) => {
                        if (quota.maxSizeBytes < 0) {
                          this.props.displayError('Квоты на данный проект нет');
                          return;
                        } else {
                          this.props.close();
                          this.props.changeInfo(this.state.project?.shortName, this.state.name, this.state.zone, this.state.files);
                        }
                      },
                      (error) => {
                        this.props.displayError('Квоты на данный проект нет');
                        return;
                      },
                    );
                  } else {
                    this.props.changeInfo(this.props.projectName, this.props.name, this.props.zone, this.state.files);
                  }
                }}
                color="primary"
              >
                {this.props.isUpdate ? 'Обновить' : 'Добавить'}
              </Button>
            </DialogActions>
          </ResizableBox>
        </Dialog>
      </React.Fragment>
    );
  }
}

export default withStyles(styles)(UploadDictionaryDialog);
