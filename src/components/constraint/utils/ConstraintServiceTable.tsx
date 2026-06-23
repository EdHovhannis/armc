import { createTheme, IconButton, Table, TableCell, TableHead, TableRow, Tooltip, Typography } from '@material-ui/core';
import blue from '@material-ui/core/colors/blue';
import green from '@material-ui/core/colors/green';
import { ThemeProvider } from '@material-ui/core/styles';
import { Check, Clear, Edit } from '@material-ui/icons';
import * as React from 'react';

import {
  AnalyticConstraint,
  ArchiveConstraint,
  ClusterConstraint,
  CONSTRAINT_MAP,
  ConstraintType,
  FulltextConstraint,
  ProjectConstraint,
  SERVICE_MAP,
} from '../../../store/constraint/Types';
import { ConstraintUtils } from '../../../utils/ConstraintUtils';
import { Utils } from '../../../utils/Utils';

import { EditCell } from './CellEdit';

const theme = createTheme({
  palette: {
    primary: { main: green[500] },
    secondary: { main: blue[500] },
  },
  overrides: {
    MuiTableCell: {
      root: {
        padding: 4,
      },
      head: {
        color: 'rgba(0, 0, 0, 0.54)',
        fontSize: '0.75rem',
        fontWeight: 500,
        lineHeight: '1.5rem',
      },
    },
  },
});

export interface ConstraintServiceTableProps {
  displayError(errorMessage: string): any;

  isEdit(isEdit: boolean): any;

  onPatchChanges(
    type: ConstraintType,
    patch: any,
    constraint: ArchiveConstraint | AnalyticConstraint | FulltextConstraint | ProjectConstraint | ClusterConstraint,
    service?: string,
  ): any;

  constraint: ArchiveConstraint | AnalyticConstraint | FulltextConstraint | ProjectConstraint | ClusterConstraint;
  type: ConstraintType;
}

export interface ConstraintServiceTableStat {
  initConstraint: ArchiveConstraint | AnalyticConstraint | FulltextConstraint | ProjectConstraint | ClusterConstraint;
  constraint: ArchiveConstraint | AnalyticConstraint | FulltextConstraint | ProjectConstraint | ClusterConstraint;
  editService?: string;
  editConstraint?: string;
  editValue?: number;
  error?: string;
  isEdit: boolean;
}

export class ConstraintServiceTable extends React.Component<ConstraintServiceTableProps, ConstraintServiceTableStat> {
  constructor(props: ConstraintServiceTableProps) {
    super(props);
    this.state = {
      isEdit: false,
      constraint: Utils.getCopyOfElement(this.props.constraint),
      initConstraint: Utils.getCopyOfElement(this.props.constraint),
    };
  }

  static getDerivedStateFromProps(props: ConstraintServiceTableProps, state: ConstraintServiceTableStat) {
    if (props.constraint !== state.initConstraint) {
      return {
        constraint: Utils.getCopyOfElement(props.constraint),
        initConstraint: Utils.getCopyOfElement(props.constraint),
      };
    }
    return null;
  }

  render() {
    return (
      <React.Fragment>
        <ThemeProvider theme={theme}>
          <Table>
            <TableHead>
              {(this.props.type === ConstraintType.project || this.props.type === ConstraintType.cluster) && (
                <TableCell width={150}>Сервис</TableCell>
              )}
              <TableCell width={450}>Ограничения</TableCell>
              <TableCell>Значение</TableCell>
              <TableCell width={60} />
            </TableHead>
            {this.props.type === ConstraintType.project || this.props.type === ConstraintType.cluster ? (
              <React.Fragment>
                {Object.keys(this.state.constraint || {}).map((service) => {
                  const serviceConstraints =
                    this.props.type === ConstraintType.cluster ? this.state.constraint[service] : this.state.constraint[service].mergedRestrictions;
                  const inheritedConstraints =
                    this.props.type === ConstraintType.cluster
                      ? this.state.constraint[service]
                      : this.state.constraint[service].inheritedRestrictions;
                  const overwrittenConstraints =
                    this.props.type === ConstraintType.cluster ? this.state.constraint[service] : this.state.constraint[service].objectRestrictions;
                  return Object.keys(serviceConstraints || {}).map((constraint, index) => {
                    return (
                      <TableRow key={constraint}>
                        {index === 0 && (
                          <TableCell
                            size={'small'}
                            rowSpan={
                              this.props.type === ConstraintType.cluster
                                ? Object.keys(this.state.constraint[service]).length
                                : Object.keys(this.state.constraint[service].mergedRestrictions).length
                            }
                          >
                            {SERVICE_MAP[service]}
                          </TableCell>
                        )}
                        <TableCell>{CONSTRAINT_MAP[constraint]?.title}</TableCell>
                        <TableCell>
                          {this.state.isEdit && this.state.editConstraint === constraint && this.state.editService === service ? (
                            <EditCell
                              setError={(error) => {
                                this.setState({ error: error });
                              }}
                              needTooltip={this.props.type !== ConstraintType.cluster}
                              initialValueString={
                                'Значение по умолчанию для данного параметра: ' +
                                (this.props.type !== ConstraintType.cluster && inheritedConstraints[constraint] < 0
                                  ? 'отключено'
                                  : ConstraintUtils.getDataString(inheritedConstraints[constraint], CONSTRAINT_MAP[constraint]?.type))
                              }
                              constraint={constraint}
                              value={serviceConstraints[constraint]}
                              type={CONSTRAINT_MAP[constraint]?.type}
                              onChange={(value) => {
                                this.setState({ editValue: value });
                              }}
                              service={service}
                            />
                          ) : ((overwrittenConstraints && overwrittenConstraints[constraint]) ||
                              serviceConstraints[constraint] !== inheritedConstraints[constraint]) &&
                            this.props.type !== ConstraintType.cluster ? (
                            <Tooltip
                              title={
                                'Значение по умолчанию для данного параметра: ' +
                                (inheritedConstraints[constraint] < 0
                                  ? 'отключено'
                                  : ConstraintUtils.getDataString(inheritedConstraints[constraint], CONSTRAINT_MAP[constraint]?.type))
                              }
                              placement={'top-start'}
                            >
                              <Typography variant={'body2'}>
                                {serviceConstraints[constraint] < 0
                                  ? 'отключено'
                                  : ConstraintUtils.getDataString(serviceConstraints[constraint], CONSTRAINT_MAP[constraint]?.type)}
                              </Typography>
                            </Tooltip>
                          ) : (
                            <Typography style={{ opacity: this.props.type === ConstraintType.cluster ? 1 : 0.5 }} variant={'body2'}>
                              {serviceConstraints[constraint] < 0
                                ? 'отключено'
                                : ConstraintUtils.getDataString(serviceConstraints[constraint], CONSTRAINT_MAP[constraint]?.type)}
                            </Typography>
                          )}
                        </TableCell>
                        <TableCell>
                          {this.state.isEdit && this.state.editConstraint === constraint && this.state.editService === service ? (
                            <React.Fragment>
                              <IconButton
                                color={'primary'}
                                size={'small'}
                                onClick={() => {
                                  if (this.state.error) {
                                    this.props.displayError(this.state.error);
                                    return;
                                  }
                                  if (this.state.editValue) {
                                    const patch = {};
                                    patch[constraint] = this.state.editValue;
                                    const tmpConstraints = this.state.constraint;
                                    const tmpServiceConstraints = this.state.constraint[service];
                                    if (this.props.type === ConstraintType.cluster) {
                                      tmpServiceConstraints[constraint] = this.state.editValue;
                                      tmpConstraints[service] = tmpServiceConstraints;
                                      this.props.onPatchChanges(ConstraintType[service], patch, tmpConstraints, service);
                                    } else {
                                      tmpServiceConstraints.mergedRestrictions[constraint] = this.state.editValue;
                                      tmpConstraints[service] = tmpServiceConstraints;
                                      this.props.onPatchChanges(ConstraintType[service], patch, tmpConstraints);
                                    }
                                    this.props.isEdit(false);
                                    this.setState({
                                      editService: undefined,
                                      editConstraint: undefined,
                                      editValue: undefined,
                                      constraint: tmpConstraints,
                                      isEdit: false,
                                    });
                                  } else {
                                    this.props.isEdit(false);
                                    this.setState({
                                      editService: undefined,
                                      editConstraint: undefined,
                                      isEdit: false,
                                    });
                                  }
                                }}
                              >
                                <Check />
                              </IconButton>
                              <IconButton
                                color={'primary'}
                                size={'small'}
                                onClick={() => {
                                  this.props.isEdit(false);
                                  this.setState({
                                    editService: undefined,
                                    error: undefined,
                                    editConstraint: undefined,
                                    isEdit: false,
                                    editValue: undefined,
                                  });
                                }}
                              >
                                <Clear />
                              </IconButton>
                            </React.Fragment>
                          ) : (
                            <IconButton
                              style={{ marginLeft: 30 }}
                              color={'primary'}
                              size={'small'}
                              onClick={() => {
                                this.props.isEdit(true);
                                this.setState({ isEdit: true, editService: service, editConstraint: constraint });
                              }}
                            >
                              <Edit />
                            </IconButton>
                          )}
                        </TableCell>
                      </TableRow>
                    );
                  });
                })}
              </React.Fragment>
            ) : (
              <React.Fragment>
                {Object.keys(this.state.constraint.mergedRestrictions || {}).map((constraint, index) => {
                  return (
                    <TableRow key={constraint}>
                      <TableCell>{CONSTRAINT_MAP[constraint]?.title}</TableCell>
                      <TableCell>
                        {this.state.isEdit && this.state.editConstraint === constraint ? (
                          <EditCell
                            setError={(error) => {
                              this.setState({ error: error });
                            }}
                            needTooltip={this.props.type !== ConstraintType.cluster}
                            initialValueString={
                              'Значение по умолчанию для данного параметра: ' +
                              (this.state.constraint.inheritedRestrictions[constraint] < 0
                                ? 'отключено'
                                : ConstraintUtils.getDataString(
                                    this.state.constraint.inheritedRestrictions[constraint],
                                    CONSTRAINT_MAP[constraint]?.type,
                                  ))
                            }
                            constraint={constraint}
                            value={this.state.constraint.mergedRestrictions[constraint]}
                            type={CONSTRAINT_MAP[constraint]?.type}
                            onChange={(value) => {
                              this.setState({ editValue: value });
                            }}
                          />
                        ) : (this.state.constraint.objectRestrictions && this.state.constraint.objectRestrictions[constraint]) ||
                          this.state.constraint.mergedRestrictions[constraint] !== this.state.constraint.inheritedRestrictions[constraint] ? (
                          <Tooltip
                            title={
                              'Значение по умолчанию для данного параметра: ' +
                              (this.state.constraint.inheritedRestrictions[constraint] < 0
                                ? 'отключено'
                                : ConstraintUtils.getDataString(
                                    this.state.constraint.inheritedRestrictions[constraint],
                                    CONSTRAINT_MAP[constraint]?.type,
                                  ))
                            }
                            placement={'top-start'}
                          >
                            <Typography variant={'body2'}>
                              {this.state.constraint.mergedRestrictions[constraint] < 0
                                ? 'отключено'
                                : ConstraintUtils.getDataString(
                                    this.state.constraint.mergedRestrictions[constraint],
                                    CONSTRAINT_MAP[constraint]?.type,
                                  )}
                            </Typography>
                          </Tooltip>
                        ) : (
                          <Typography style={{ opacity: this.props.type === ConstraintType.cluster ? 1 : 0.5 }} variant={'body2'}>
                            {this.state.constraint.mergedRestrictions[constraint] < 0
                              ? 'отключено'
                              : ConstraintUtils.getDataString(this.state.constraint.mergedRestrictions[constraint], CONSTRAINT_MAP[constraint]?.type)}
                          </Typography>
                        )}
                      </TableCell>
                      <TableCell>
                        {this.state.isEdit && this.state.editConstraint === constraint ? (
                          <React.Fragment>
                            <IconButton
                              color={'primary'}
                              size={'small'}
                              onClick={() => {
                                if (this.state.error) {
                                  this.props.displayError(this.state.error);
                                  return;
                                }
                                if (this.state.editValue) {
                                  const patch = {};
                                  patch[constraint] = this.state.editValue;
                                  // this.props.onPatchChanges(this.props.type, patch);
                                  const tmpConstraints = this.state.constraint;
                                  tmpConstraints.mergedRestrictions[constraint] = this.state.editValue;
                                  this.props.onPatchChanges(this.props.type, patch, tmpConstraints);
                                  this.props.isEdit(false);
                                  this.setState({
                                    editConstraint: undefined,
                                    editValue: undefined,
                                    constraint: tmpConstraints,
                                    isEdit: false,
                                  });
                                } else {
                                  this.props.isEdit(false);
                                  this.setState({
                                    editConstraint: undefined,
                                    isEdit: false,
                                  });
                                }
                              }}
                            >
                              <Check />
                            </IconButton>
                            <IconButton
                              color={'primary'}
                              size={'small'}
                              onClick={() => {
                                this.props.isEdit(false);
                                this.setState({
                                  error: undefined,
                                  editConstraint: undefined,
                                  isEdit: false,
                                  editValue: undefined,
                                });
                              }}
                            >
                              <Clear />
                            </IconButton>
                          </React.Fragment>
                        ) : (
                          <IconButton
                            style={{ marginLeft: 30 }}
                            color={'primary'}
                            size={'small'}
                            onClick={() => {
                              this.props.isEdit(true);
                              this.setState({ isEdit: true, editConstraint: constraint });
                            }}
                          >
                            <Edit />
                          </IconButton>
                        )}
                      </TableCell>
                    </TableRow>
                  );
                })}
              </React.Fragment>
            )}
          </Table>
        </ThemeProvider>
      </React.Fragment>
    );
  }
}
