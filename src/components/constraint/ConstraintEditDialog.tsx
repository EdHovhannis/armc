import { Button, Dialog, DialogActions, DialogContent, DialogTitle, Grid, withStyles } from '@material-ui/core';
import Paper from '@material-ui/core/Paper';
import { createStyles } from '@material-ui/core/styles';
import * as React from 'react';
import Draggable from 'react-draggable';
import { ResizableBox } from 'react-resizable';

import BackendProvider from '../../services/BackendProvider';
import {
  AnalyticConstraint,
  ArchiveConstraint,
  ClusterConstraint,
  ConstraintType,
  FulltextConstraint,
  ProjectConstraint,
} from '../../store/constraint/Types';
import { ConstraintUtils } from '../../utils/ConstraintUtils';
import { Utils } from '../../utils/Utils';
import ConfirmDialog from '../ConfirmDialog';

import { ConstraintServiceTable } from './utils/ConstraintServiceTable';

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
    <Draggable handle="#draggable-dialog-constraint-edit" cancel={'[class*="MuiDialogContent-root"]'}>
      <Paper {...props} />
    </Draggable>
  );
}

export interface ConstraintEditDialogProps {
  close(): any;

  displayError(errorMessage: string): any;

  onPatch(type: ConstraintType, patch: any, constraintResult: ArchiveConstraint | AnalyticConstraint | FulltextConstraint | ProjectConstraint): any;

  constraint: ArchiveConstraint | AnalyticConstraint | FulltextConstraint | ProjectConstraint;
  type: ConstraintType;
  title: string;
}

export interface ConstraintEditDialogStat {
  initConstraint: ArchiveConstraint | AnalyticConstraint | FulltextConstraint | ProjectConstraint;
  constraint: ArchiveConstraint | AnalyticConstraint | FulltextConstraint | ProjectConstraint;
  isConstraintEdit: boolean;
  confirmSave: boolean;
  confirmRedirectToDefault: boolean;
  confirmClose: boolean;
}

class ConstraintEditDialog extends React.Component<ConstraintEditDialogProps, ConstraintEditDialogStat> {
  constructor(props) {
    super(props);
    this.state = {
      constraint: this.props.constraint,
      initConstraint: Utils.getCopyOfElement(this.props.constraint),
      confirmSave: false,
      isConstraintEdit: false,
      confirmRedirectToDefault: false,
      confirmClose: false,
    };
    this.handleConfirmSaveDialogClose = this.handleConfirmSaveDialogClose.bind(this);
    this.handleConfirmRedirectToDefaultDialogClose = this.handleConfirmRedirectToDefaultDialogClose.bind(this);
    this.handleConfirmCloseDialogClose = this.handleConfirmCloseDialogClose.bind(this);
  }

  static getDerivedStateFromProps(props, state) {
    if (props.constraint !== state.initConstraint) {
      return {
        constraint: props.constraint,
        initConstraint: Utils.getCopyOfElement(props.constraint),
      };
    }
  }

  handleConfirmCloseDialogClose(value) {
    this.setState({ confirmClose: false });
    if (value === 'Ok') {
      this.props.close();
    }
  }

  handleConfirmSaveDialogClose(value) {
    this.setState({ confirmSave: false });
    if (value === 'Ok') {
      this.props.close();
    }
  }

  handleConfirmRedirectToDefaultDialogClose(value) {
    this.setState({ confirmRedirectToDefault: false });
    if (value === 'Ok') {
      window.open(BackendProvider.abyssProxyPath + '/constraint', '_blank');
    }
  }

  render() {
    const { classes } = this.props;
    return (
      <React.Fragment>
        <Dialog
          open={true}
          onClose={(e) => {
            this.setState({ confirmClose: true });
          }}
          maxWidth={false}
          PaperComponent={PaperComponent}
          aria-labelledby="draggable-dialog-constraint-edit"
        >
          <ResizableBox
            width={this.props.type === ConstraintType.project ? 1200 : 1025}
            height={'sss'}
            // height={this.props.type === ConstraintType.project? 660 : this.props.type === ConstraintType.archive? 290 : 405}
            className={classes.resizable}
          >
            <DialogTitle style={{ cursor: 'move' }} id="draggable-dialog-constraint-edit">
              <Grid container direction="row" justifyContent="space-between" alignItems="center">
                <Grid item>{this.props.title}</Grid>
                <Grid item>
                  <Button
                    color={'primary'}
                    variant={'text'}
                    onClick={(event) => {
                      this.setState({ confirmRedirectToDefault: true });
                    }}
                  >
                    Изменить значения по умолчанию
                  </Button>
                </Grid>
              </Grid>
            </DialogTitle>

            <DialogContent>
              <ConstraintServiceTable
                onPatchChanges={(type, patch, constraint) => {
                  this.props.onPatch(type, patch, constraint);
                }}
                isEdit={(isEdit) => {
                  this.setState({ isConstraintEdit: isEdit });
                }}
                displayError={this.props.displayError}
                constraint={this.state.constraint}
                type={this.props.type}
              />
            </DialogContent>
            <DialogActions style={{ marginTop: 6 }}>
              <Button
                onClick={(e) => {
                  if (this.state.isConstraintEdit) {
                    this.setState({ confirmSave: true });
                    return;
                  }
                  this.props.close();
                }}
                color="primary"
              >
                Закрыть
              </Button>
            </DialogActions>
          </ResizableBox>
        </Dialog>

        <ConfirmDialog
          warningText={'Введенное Вам значение еще не подтверждено. Вы уверены, что хотите закрыть диалоговое окно?'}
          open={this.state.confirmSave}
          okString={'Да'}
          cancelString={'Отмена'}
          onClose={this.handleConfirmSaveDialogClose}
        />

        <ConfirmDialog
          warningText={
            this.state.isConstraintEdit
              ? 'Введенное Вам значение еще не подтверждено. Вы уверены, что хотите перейти на вкладку с ограничениями по умолчанию?'
              : 'Для изменения значений по умолчанию, Вы должны перейти на другую страницу. Страница откроется в новой вкладке.' +
                'Вы уверены, что хотите открыть страницу с ограничениями по умолчанию?'
          }
          open={this.state.confirmRedirectToDefault}
          okString={'Да'}
          cancelString={'Отмена'}
          onClose={this.handleConfirmRedirectToDefaultDialogClose}
        />

        <ConfirmDialog
          warningText={'Вы уверены, что хотите закрыть окно?'}
          open={this.state.confirmClose}
          okString={'Да'}
          cancelString={'Отмена'}
          onClose={this.handleConfirmCloseDialogClose}
        />
      </React.Fragment>
    );
  }
}

export default withStyles(styles)(ConstraintEditDialog);
