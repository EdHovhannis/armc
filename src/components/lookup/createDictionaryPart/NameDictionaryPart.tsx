import { Grid, TextField, Tooltip } from '@material-ui/core';
import { Autocomplete } from '@material-ui/lab';
import { debounce, DebouncedFunc } from 'lodash';
import * as React from 'react';

import LookupService from '../../../services/LookupService';
import { DictionaryQuota } from '../../../store/lookup/Types';
import { EditableProject, Project } from '../../../store/project/Types';
import { Zone } from '../../../store/zone/Types';
import { NAME_REGEXP } from '../../../utils/Utils';
import { getWarningText } from '../../../utils/getWarningText';
import { WrongInput } from '../CreateDictionaryPage';

interface NameDictionaryPartProps {
  name: string;
  projectName: string;
  zone: string;
  zones: Zone;
  projectShortName: string;
  projects: Array<Project>;
  editableProjects: EditableProject[];

  wrongInputChanged(wrongInput: WrongInput);

  getDictionaryQuota(projectShortName: string, successCallback?: (quota: DictionaryQuota) => void, errorCallback?): any;

  nameChanged(name: string): any;

  projectNameChanged(projectName: string): any;

  zoneChanged(area: string): any;

  projectShortNameChanged(projectShortName: string): any;
}

export class NameDictionaryPart extends React.Component<NameDictionaryPartProps> {
  private handleCheckDirectoryNameQuotaDebounced: DebouncedFunc<any> = debounce(() => {});
  constructor(props) {
    super(props);
    this.props.wrongInputChanged(this.checkWrongInput(this.props.projectShortName, this.props.name, this.props.zone));
    this.handleCheckDirectoryNameQuotaDebounced = debounce(this.handleCheckDirectoryName.bind(this), 300);
  }

  checkWrongInput(projectShortName, name, zone): WrongInput {
    const wrongInput: WrongInput = {
      wrongInput: false,
      message: '',
    };

    if (name === null || name === undefined || name === '' || getWarningText(name)) {
      wrongInput.wrongInput = true;
      if (getWarningText(name)) {
        wrongInput.message = getWarningText(name);
        return wrongInput;
      }
      wrongInput.message = 'Не введено название спраочника';
      return wrongInput;
    }

    if (!NAME_REGEXP.exec(name)) {
      wrongInput.wrongInput = true;
      wrongInput.message = 'Введеное имя не валидно. Вы ввели недопустимые символы.';
      return wrongInput;
    }

    if (projectShortName === null || projectShortName === undefined || projectShortName === '') {
      wrongInput.wrongInput = true;
      wrongInput.message = 'Проект не выбран';
      return wrongInput;
    }

    this.props.getDictionaryQuota(
      projectShortName,
      (quota) => {
        if (quota.maxSizeBytes < 0) {
          wrongInput.wrongInput = true;
          wrongInput.message = 'Квоты на данный проект нет';
          return wrongInput;
        }
      },
      (error) => {
        wrongInput.wrongInput = true;
        wrongInput.message = 'Квоты на данный проект нет';
        return wrongInput;
      },
    );

    if (zone === null || zone === undefined || zone === '') {
      wrongInput.wrongInput = true;
      wrongInput.message = 'Зона не выбрана';
      return wrongInput;
    }

    LookupService.getDictionaryId(
      projectShortName,
      name,
      zone,
      () => {
        wrongInput.wrongInput = true;
        wrongInput.message = 'Справочник с таким именем уже существует.';
        return wrongInput;
      },
      () => {},
    );

    return wrongInput;
  }

  handleCheckDirectoryName(value) {
    this.props.wrongInputChanged(this.checkWrongInput(this.props.projectShortName, value, this.props.zone));
  }
  render() {
    const zones = this.props.zones.availableZones || [];
    const defZone = this.props.zone === '' ? this.props.zones.defaultZone : this.props.zone;
    const { name } = this.props;
    const nameHelperText = getWarningText(name);
    const availableProjects = this.props.projects.filter((project) =>
      this.props.editableProjects.some((editableProject) => editableProject.name === project.shortName),
    );
    return (
      <React.Fragment>
        <Grid container direction={'row'} justifyContent={'center'}>
          <TextField
            autoFocus={this.props.name?.length > 0}
            fullWidth
            variant={'outlined'}
            value={this.props.name}
            label="Название справочника"
            style={{ width: 'calc(100% - 100px)', marginTop: 10 }}
            onChange={(e) => {
              const value = e.target.value.trim();
              this.props.nameChanged(value);
              this.handleCheckDirectoryNameQuotaDebounced(value);
            }}
            error={!!nameHelperText}
            helperText={nameHelperText}
          />
        </Grid>
        <Grid container direction={'row'} justifyContent={'center'}>
          <Autocomplete
            id="project"
            options={availableProjects}
            defaultValue={availableProjects.find((project) => project.shortName === this.props.projectShortName)}
            getOptionLabel={(option) => option.name}
            style={{ marginTop: 16, width: 'calc(100% - 100px)' }}
            onChange={(event, newValue: Project) => {
              this.props.projectNameChanged(newValue.name);
              this.props.projectShortNameChanged(newValue.shortName);
              this.props.wrongInputChanged(this.checkWrongInput(newValue.shortName, this.props.name, this.props.zone));
            }}
            renderInput={(params) => <TextField {...params} label="Проект" variant="outlined" />}
          />
        </Grid>
        <Grid container direction={'row'} justifyContent={'center'}>
          <Autocomplete
            id="zones"
            options={zones}
            defaultValue={defZone}
            getOptionLabel={(option) => option}
            style={{ marginTop: 16, width: 'calc(100% - 100px)' }}
            onChange={(event, newValue: string) => {
              this.props.zoneChanged(newValue);
              this.props.wrongInputChanged(this.checkWrongInput(this.props.projectShortName, this.props.name, newValue));
            }}
            renderInput={(params) => <TextField {...params} label="Зона" variant="outlined" />}
          />
        </Grid>
      </React.Fragment>
    );
  }
}
