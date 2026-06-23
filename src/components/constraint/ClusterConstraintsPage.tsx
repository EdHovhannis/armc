import { Paper, Typography } from '@material-ui/core';
import Grid from '@material-ui/core/Grid';
import * as React from 'react';

import {
  BasicAnalyticConstraint,
  BasicArchiveConstraint,
  BasicFulltextConstraint,
  ClusterConstraint,
  ConstraintType,
} from '../../store/constraint/Types';
import { Utils } from '../../utils/Utils';
import ConfirmDialog from '../ConfirmDialog';
import NextNavigation from '../utils/NextNavigation';
import { withNavigation, WithNavigationProps } from '../utils/withNavigation';

import { ConstraintServiceTable } from './utils/ConstraintServiceTable';

export interface ClusterConstraintsPageProps extends WithNavigationProps {
  constraint: ClusterConstraint;
  displayError: (error: string) => void;
  updateClusterConstraint: (
    constraint: BasicArchiveConstraint | BasicAnalyticConstraint | BasicFulltextConstraint,
    type: ConstraintType,
    okCallback?: () => void,
    errorCallback?: (message: string) => void,
  ) => void;
}

export interface ClusterConstraintsPageStat {
  constraint: ClusterConstraint;
  initConstraint: ClusterConstraint;
  isEdit: boolean;
  confirmSave: boolean;
  editService?: string;
  editConstraint?: string;
  editValue?: number;
}

export class ClusterConstraintsPage extends React.Component<ClusterConstraintsPageProps, ClusterConstraintsPageStat, WithNavigationProps> {
  constructor(props: ClusterConstraintsPageProps) {
    super(props);
    this.state = {
      constraint: this.props.constraint,
      initConstraint: Utils.getCopyOfElement(this.props.constraint),
      isEdit: false,
      confirmSave: false,
    };
    this.handleConfirmSaveDialogClose = this.handleConfirmSaveDialogClose.bind(this);
  }

  handleConfirmSaveDialogClose(value: string) {
    this.setState({ confirmSave: false });
    if (value === 'Ok') {
      this.props.navigate('/constraint/overloaded');
    }
  }

  render() {
    return (
      <React.Fragment>
        <NextNavigation
          nextString={'Переопределенные значения'}
          titleString={'Ограничения по умолчанию'}
          goNextClicked={() => {
            if (this.state.isEdit) {
              this.setState({ confirmSave: true });
            } else {
              this.props.navigate('/constraint/overloaded');
            }
          }}
        />
        <Grid container direction="column" justifyContent="center" alignItems="center">
          <Paper style={{ width: '95%', marginTop: 24 }}>
            <Typography variant={'h6'} style={{ opacity: 0.84, marginLeft: 24, marginTop: 12, marginBottom: 12 }}>
              Ограничения по умолчанию на кластер
            </Typography>
            <div style={{ padding: 12, width: '100%' }}>
              <ConstraintServiceTable
                isEdit={(isEdit) => {
                  this.setState({ isEdit: isEdit });
                }}
                displayError={this.props.displayError}
                onPatchChanges={(type: ConstraintType, patch: any, constraint: ClusterConstraint, service: keyof ClusterConstraint) => {
                  if (service in constraint) {
                    this.props.updateClusterConstraint(
                      constraint[service],
                      type,
                      () => {
                        this.setState({ constraint: constraint });
                      },
                      (error) => {
                        this.props.displayError(error);
                      },
                    );
                  }
                }}
                constraint={this.state.constraint}
                type={ConstraintType.cluster}
              />
            </div>
          </Paper>
        </Grid>

        <ConfirmDialog
          warningText={'Введенное Вам значение еще не сохранено. Вы уверены, что хотите перейти на другую вкладку?'}
          open={this.state.confirmSave}
          okString={'Да'}
          cancelString={'Отмена'}
          onClose={this.handleConfirmSaveDialogClose}
        />
      </React.Fragment>
    );
  }
}

export default withNavigation(ClusterConstraintsPage);
