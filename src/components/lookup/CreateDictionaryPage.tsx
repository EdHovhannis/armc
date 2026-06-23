import { Button, Grid, Step, StepLabel, Stepper } from '@material-ui/core';
import * as React from 'react';

import LookupService, { PAPA_CONFIG } from '../../services/LookupService';
import { DictionaryQuota } from '../../store/lookup/Types';
import { EditableProject, Project } from '../../store/project/Types';
import { Zone } from '../../store/zone/Types';
import { COLUMN_PREFIX, LookupUtils } from '../../utils/LookupUtils';

import { DictionaryQuotaEstimate } from './DictionaryQuotaEstimate';
import { NameDictionaryPart } from './createDictionaryPart/NameDictionaryPart';
import { TableInfoPart } from './createDictionaryPart/TableInfoPart';

const Papa = require('papaparse');

export interface WrongInput {
  wrongInput: boolean;
  message: string;
}

export interface CreateDictionaryPageProps {
  projects: Project[];
  editableProjects: EditableProject[];
  zones: Zone;

  displayError(message: string): void;

  displaySuccess(message: string): void;

  getDictionaryQuota(projectShortName: string, successCallback?: (quota: DictionaryQuota) => void, errorCallback?): any;

  redirect(): any;
}

export interface CreateDictionaryPageStat {
  name: string | undefined;
  projectName: string;
  projectShortName: string;
  zone: string;
  columns: any[];
  data: any[];
  activeStep: number;
  wrongInputItem: WrongInput;
  isQuotaValid: boolean;
}

export class CreateDictionaryPage extends React.Component<CreateDictionaryPageProps, CreateDictionaryPageStat> {
  steps = ['Имя справочника', 'Данные справочника'];

  constructor(props) {
    super(props);
    this.state = {
      name: undefined,
      projectName: '',
      projectShortName: '',
      zone: props.zones.defaultZone,
      columns: [],
      data: [],
      wrongInputItem: { wrongInput: false, message: '' },
      activeStep: 0,
      isQuotaValid: true,
    };
  }

  render() {
    const tableData = this.state.data.map((row) => {
      const newRow: Record<string, string> = {};
      Object.keys(row).forEach((columnName) => {
        const column = columnName.split(COLUMN_PREFIX)[1];
        if (columnName !== 'id' && column) {
          newRow[column] = row[columnName];
        }
      });
      return newRow;
    });
    const parsedTableData = Papa.unparse(tableData, PAPA_CONFIG);

    return (
      <React.Fragment>
        <Stepper activeStep={this.state.activeStep}>
          {this.steps.map((step) => (
            <Step key={step}>
              <StepLabel>{step}</StepLabel>
            </Step>
          ))}
        </Stepper>
        {this.state.activeStep === 0 && (
          <Grid container direction={'column'}>
            <NameDictionaryPart
              getDictionaryQuota={this.props.getDictionaryQuota}
              name={this.state.name || ''}
              projectName={this.state.projectName}
              zone={this.state.zone}
              zones={this.props.zones}
              projectShortName={this.state.projectShortName}
              projects={this.props.projects}
              editableProjects={this.props.editableProjects}
              wrongInputChanged={(wrongInput) => {
                this.setState((prevState) => ({ ...prevState, wrongInputItem: wrongInput }));
              }}
              nameChanged={(name) => this.setState({ name: name })}
              projectNameChanged={(projectName) => this.setState({ projectName })}
              zoneChanged={(area) => this.setState({ zone: area })}
              projectShortNameChanged={(projectShortName) => this.setState({ projectShortName: projectShortName })}
            />
          </Grid>
        )}
        {this.state.activeStep === 1 && (
          <>
            <TableInfoPart
              columns={this.state.columns}
              data={this.state.data}
              displayError={this.props.displayError}
              displaySuccess={this.props.displaySuccess}
              dataChanged={(data) => {
                this.setState({ data: data });
              }}
              columnsChange={(columns) => {
                this.setState({ columns: columns });
              }}
              wrongInputChanged={(wrongInput) => {
                this.setState({ wrongInputItem: wrongInput });
              }}
            />
            <DictionaryQuotaEstimate
              onValidChange={(isQuotaValid) => this.setState({ isQuotaValid })}
              estimateData={{
                project: this.state.projectShortName,
                name: this.state.name || '',
                zoneId: this.state.zone,
                tableData: parsedTableData,
              }}
            />
          </>
        )}
        <Grid container direction={'row'} style={{ padding: 16 }} justifyContent={'flex-end'}>
          <Button
            onClick={() => {
              this.setState({ activeStep: this.state.activeStep - 1 });
            }}
            disabled={this.state.activeStep == 0}
          >
            Назад
          </Button>
          <Button
            onClick={() => {
              if (this.state.activeStep === 0) {
                if (this.state.wrongInputItem.wrongInput) {
                  this.props.displayError(this.state.wrongInputItem.message);
                  return;
                }
                this.setState({ activeStep: this.state.activeStep + 1 });
                return;
              } else {
                if (this.state.data.length === 0) {
                  this.props.displayError('Справочник не может быть пустым.');
                  return;
                }
                const isEmptyCell = LookupUtils.checkEmptyCell(tableData);
                if (isEmptyCell.isEmpty) {
                  this.props.displayError('В колонке ' + isEmptyCell.column + ' пустое значение. В справочнике не может быть пустых значений.');
                  return;
                }
                if (!this.state.isQuotaValid) {
                  this.props.displayError('Сохранения без внесения изменений и повторной успешной валидации невозможно');
                  return;
                }
                LookupService.createDictionary(
                  this.state.projectShortName,
                  this.state.name,
                  this.state.zone,
                  parsedTableData,
                  () => {
                    this.props.redirect();
                  },
                  (msg) => {
                    this.props.displayError(msg);
                  },
                );
              }
            }}
          >
            {this.state.activeStep === 1 ? 'Готово' : 'Далее'}
          </Button>
        </Grid>
      </React.Fragment>
    );
  }
}
