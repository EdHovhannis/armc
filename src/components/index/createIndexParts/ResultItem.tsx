import MaterialTable, { MTableToolbar } from '@material-table/core';
import {
  Accordion,
  AccordionDetails,
  AccordionSummary,
  Checkbox,
  Chip,
  FormControl,
  FormControlLabel,
  IconButton,
  Input,
  InputLabel,
  MenuItem,
  Paper,
  Radio,
  RadioGroup,
  Select,
  TextField,
  Tooltip,
} from '@material-ui/core';
import Grid from '@material-ui/core/Grid';
import Typography from '@material-ui/core/Typography';
import { green } from '@material-ui/core/colors';
import AddIcon from '@material-ui/icons/Add';
import ExpandMoreIcon from '@material-ui/icons/ExpandMore';
import { Autocomplete } from '@material-ui/lab';
import { uniqBy } from 'lodash';
import * as React from 'react';

import {
  MessageFilterType,
  PrimaryTimeField,
  ProcessingPipeline,
  QuotaPipeline,
  SchemaPipeline,
  TypePrimaryField,
  AdvancedPipeline,
} from '../../../store/pipeline/Types';
import { PipelineUtils } from '../../../utils/PipelineUtils';
import SizeConverter from '../../../utils/SizeConverter';
import { ERROR_NAME_REGEXP_STRING, NAME_REGEXP, tableIcons, tableIconsWithInvisibleAdd } from '../../../utils/Utils';
import { ICopyFieldsSchema } from '../../processing/FieldCopy/types';
import { modifySchema } from '../../processing/FieldCopy/utils';
import AdvancedOptions from '../../utils/AdvancedOptions';
import DlqOption, { IDlqOption } from '../../utils/DlqOption';

export interface ResultItemProps {
  primaryTimeField: PrimaryTimeField;
  processing: ProcessingPipeline;
  schema: SchemaPipeline;
  resultSchemaFields: SchemaPipeline['fields'];
  resultTimestamps: ProcessingPipeline['convertTimestampParams'];
  quota: QuotaPipeline;
  labels: string[];
  defaultLateMessageRejectionPeriod?: string;
  defaultEarlyMessageRejectionPeriod?: string;

  changeLabels(labels: string[]): any;

  displayError(msg: string): any;

  changePrimaryTimeField(primaryTimeField: PrimaryTimeField): any;
  advanced: AdvancedPipeline | null;
}

export interface ResultItemState {
  type: TypePrimaryField;
  customFieldName?: string;
  labels: string[];
  label?: string;
  lateMessageRejectionPeriod?: string;
  earlyMessageRejectionPeriod?: string;
  isPrevOption?: boolean;
}

export default class ResultItem extends React.Component<ResultItemProps & IDlqOption, ResultItemState> {
  constructor(props) {
    super(props);
    this.state = {
      type:
        !this.props.processing?.convertTimestampParams && !this.props.processing?.addCurrentTimeParams
          ? TypePrimaryField.AUTOGENERATE
          : this.props.primaryTimeField
            ? this.props.primaryTimeField.type
            : TypePrimaryField.CUSTOM,
      customFieldName:
        this.props.schema?.fields?.filter((field) => field.name === this.props?.schema?.primaryTimeField?.customFieldName).length > 0
          ? this.props.schema?.primaryTimeField?.customFieldName
          : undefined,
      labels: this.props.labels || [],
      lateMessageRejectionPeriod: this.props?.primaryTimeField?.lateMessageRejectionPeriod ?? this.props?.defaultLateMessageRejectionPeriod,
      earlyMessageRejectionPeriod: this.props?.primaryTimeField?.earlyMessageRejectionPeriod ?? this.props?.defaultEarlyMessageRejectionPeriod,
    };
    if (!this.props?.primaryTimeField) {
      const primaryTimeField: PrimaryTimeField = {
        type: this.state.type,
      };
      this.props.changePrimaryTimeField(primaryTimeField);
    }
    this.handleCheck = this.handleCheck.bind(this);
    this.getAllTimeFields = this.getAllTimeFields.bind(this);
  }

  componentDidMount(): void {
    const { type, customFieldName, lateMessageRejectionPeriod, earlyMessageRejectionPeriod } = this.state;
    let primaryTimeField: PrimaryTimeField = { type };

    if (type === TypePrimaryField.CUSTOM) {
      primaryTimeField = {
        type,
        customFieldName,
        lateMessageRejectionPeriod,
        earlyMessageRejectionPeriod,
      };
    }
    this.props.changePrimaryTimeField(primaryTimeField);
  }

  getAllTimeFields(): string[] {
    const fields: string[] = [];
    if (this.props.processing.addCurrentTimeParams) {
      this.props.processing.addCurrentTimeParams.forEach((value) => {
        fields.push(value.toField);
      });
    }
    if (this.props.processing.convertTimestampParams) {
      this.props.processing.convertTimestampParams.forEach((value) => {
        fields.push(value.field);
      });
    }
    return fields.map((option) => option);
  }

  handleCheck(event) {
    if (event.target.value === TypePrimaryField.AUTOGENERATE) {
      const primaryTimeField: PrimaryTimeField = {
        type: event.target.value,
      };
      this.props.changePrimaryTimeField(primaryTimeField);
    } else {
      const primaryTimeField: PrimaryTimeField = {
        type: event.target.value,
        customFieldName: this.state.customFieldName,
        earlyMessageRejectionPeriod: this.state.earlyMessageRejectionPeriod,
        lateMessageRejectionPeriod: this.state.lateMessageRejectionPeriod,
      };
      this.props.changePrimaryTimeField(primaryTimeField);
    }
    this.setState({
      type: event.target.value,
    });
  }

  render() {
    const chips: Array<any> = [];
    this.state.labels?.map((label, ind) => {
      chips.push(
        <Chip
          id={'label' + ind}
          label={label}
          onDelete={() => {
            this.state.labels.splice(this.state.labels.indexOf(label), 1);
            this.setState({ labels: this.state.labels });
            this.props.changeLabels(this.state.labels);
          }}
          style={{ backgroundColor: green[300], color: 'white', marginRight: 4, marginBottom: 4, maxWidth: '100%' }}
          variant={'outlined'}
        />,
      );
    });
    const allTimeFields = this.getAllTimeFields();
    return (
      <React.Fragment>
        <Grid direction={'column'} style={{ marginLeft: 16, width: 'calc(100%-32px)' }}>
          <Grid direction={'row'}>
            <Grid item direction={'column'} style={{ margin: 10 }}>
              <Typography variant="body2" display="block" style={{ margin: 10, marginTop: 10, width: '100%', fontSize: '15px' }}>
                Размер индекса: {SizeConverter.makeSizeString(SizeConverter.convertBytes(this.props.quota.maxSizeBytes), false)}
              </Typography>
              <Typography variant="body2" display="block" style={{ margin: 10, marginBottom: 10, width: '100%', fontSize: '15px' }}>
                Скорость записи: {SizeConverter.makeSizeString(SizeConverter.convertBytes(this.props.quota.maxDataRateBytesPerSec), true)}
              </Typography>
              <Typography variant="body2" display="block" style={{ margin: 10, marginBottom: 10, width: '100%', fontSize: '15px' }}>
                {this.props.processing.flattenJsonParam != null
                  ? 'Вложенные поля в JSON будут разложены'
                  : 'Вложенные поля в JSON раскладываться не будут.'}
                {this.props.processing.flattenJsonParam != null &&
                  (this.props.processing.flattenJsonParam?.excludedFromFlatteningFields.length === 0
                    ? '.'
                    : `, кроме полей "${this.props.processing.flattenJsonParam?.excludedFromFlatteningFields.join('", "')}"`)}
              </Typography>
            </Grid>
            <Typography>
              <h4>Основное время </h4>
            </Typography>
            <Paper style={{ width: '100%', marginTop: 12 }}>
              <Grid container direction={'row'}>
                <Grid item style={{ width: '40%', margin: 10 }}>
                  <FormControl component="fieldset">
                    <RadioGroup aria-label="primaryTimeField" name="typePrimaryTimeField" value={this.state.type} onChange={this.handleCheck}>
                      <Tooltip
                        title={
                          !this.props.processing?.convertTimestampParams && !this.props.processing?.addCurrentTimeParams
                            ? 'В вашей схеме нет ни одного поля с типом "date"'
                            : ''
                        }
                      >
                        <FormControlLabel
                          value={TypePrimaryField.CUSTOM}
                          disabled={!allTimeFields.length}
                          control={<Radio color={'primary'} />}
                          label="использовать поле из схемы"
                        />
                      </Tooltip>
                      <FormControlLabel
                        value={TypePrimaryField.AUTOGENERATE}
                        control={<Radio color={'primary'} />}
                        label="использовать время записи в хранилище"
                      />
                    </RadioGroup>
                  </FormControl>
                </Grid>
                {!(!this.props.processing?.convertTimestampParams && !this.props.processing?.addCurrentTimeParams) && (
                  <Grid item style={{ width: '50%', marginTop: 10 }}>
                    <Autocomplete
                      disabled={this.state.type === TypePrimaryField.AUTOGENERATE}
                      id="timeForPrimaryTimeFields"
                      style={{ width: '90%' }}
                      defaultValue={this.state.customFieldName}
                      options={allTimeFields}
                      getOptionLabel={(option) => option}
                      renderOption={(option) => option}
                      onChange={(e, newValue: string) => {
                        const primaryTimeField: PrimaryTimeField = {
                          type: this.state.type,
                          customFieldName: newValue,
                          lateMessageRejectionPeriod: this.state.lateMessageRejectionPeriod,
                          earlyMessageRejectionPeriod: this.state.earlyMessageRejectionPeriod,
                        };
                        this.props.changePrimaryTimeField(primaryTimeField);
                        this.setState({
                          customFieldName: newValue,
                        });
                      }}
                      renderInput={(params) => (
                        <TextField
                          {...params}
                          variant="outlined"
                          label="Поле из схемы"
                          placeholder="Выберите поле времени"
                          margin="normal"
                          fullWidth
                        />
                      )}
                    />
                    {this.state.type !== TypePrimaryField.AUTOGENERATE && (
                      <Grid item style={{ marginTop: 8, width: '90%' }}>
                        <Tooltip title={'Укажите максимальный временной промежуток для сообщения в прошлом'} placement={'top-start'}>
                          <TextField
                            variant="outlined"
                            label="Допустимый диапазон времени в сообщении (прошлое)"
                            defaultValue={this.state.lateMessageRejectionPeriod}
                            value={this.state.lateMessageRejectionPeriod}
                            onChange={(e) => {
                              const primaryTimeField: PrimaryTimeField = {
                                type: this.state.type,
                                customFieldName: this.state.customFieldName,
                                lateMessageRejectionPeriod: e.target.value,
                                earlyMessageRejectionPeriod: this.state.earlyMessageRejectionPeriod,
                              };
                              this.setState({
                                lateMessageRejectionPeriod: e.target.value,
                              });
                              this.props.changePrimaryTimeField(primaryTimeField);
                            }}
                            fullWidth
                          />
                        </Tooltip>
                      </Grid>
                    )}
                    {this.state.type !== TypePrimaryField.AUTOGENERATE && (
                      <Grid item style={{ marginTop: 8, marginBottom: 10, width: '90%' }}>
                        <Tooltip title={'Укажите максимальный временной промежуток для сообщения в будущем'} placement={'top-start'}>
                          <TextField
                            variant="outlined"
                            label="Допустимый диапазон времени в сообщении (будущее)"
                            defaultValue={this.state.earlyMessageRejectionPeriod}
                            value={this.state.earlyMessageRejectionPeriod}
                            onChange={(e) => {
                              const primaryTimeField: PrimaryTimeField = {
                                type: this.state.type,
                                customFieldName: this.state.customFieldName,
                                lateMessageRejectionPeriod: this.state.lateMessageRejectionPeriod,
                                earlyMessageRejectionPeriod: e.target.value,
                              };
                              this.setState({
                                earlyMessageRejectionPeriod: e.target.value,
                              });
                              this.props.changePrimaryTimeField(primaryTimeField);
                            }}
                            fullWidth
                          />
                        </Tooltip>
                      </Grid>
                    )}
                  </Grid>
                )}
              </Grid>
            </Paper>
            <Typography>
              <h4>Dead Letter Queue</h4>
            </Typography>
            <Paper style={{ width: '100%', marginTop: 12, padding: 20 }}>
              <DlqOption
                topics={this.props.topics}
                value={this.props.value}
                onChange={this.props.onChange}
                getOptionLabel={this.props.getOptionLabel}
              />
            </Paper>
            <Typography>
              <h4>Метки </h4>
            </Typography>
            <Paper style={{ width: '100%', marginTop: 12 }}>
              <Grid container direction={'column'}>
                <Grid item style={{ width: '100%', marginLeft: 20, marginRight: 20, marginTop: 20 }}>
                  {chips}
                </Grid>
                <Grid container direction={'row'}>
                  <Grid item style={{ width: 'calc(100% - 78px)', marginLeft: 20, marginBottom: 10 }}>
                    <React.Fragment>
                      {!NAME_REGEXP.exec(this.state.label) ? (
                        <Tooltip placement="bottom-start" title={ERROR_NAME_REGEXP_STRING}>
                          <TextField
                            autoFocus={this.state.label?.length > 0}
                            margin="dense"
                            id="label"
                            label="Метка"
                            error={!NAME_REGEXP.exec(this.state.label) && this.state.label !== ''}
                            onChange={(e) => {
                              if (e.target.value === '') {
                                this.setState({ label: undefined });
                              } else {
                                this.setState({ label: e.target.value.trim() });
                              }
                            }}
                            value={this.state.label}
                            fullWidth
                          />
                        </Tooltip>
                      ) : (
                        <TextField
                          autoFocus={this.state.label?.length > 0}
                          margin="dense"
                          id="label"
                          label="Метка"
                          error={!NAME_REGEXP.exec(this.state.label) && this.state.label !== ''}
                          onChange={(e) => {
                            if (e.target.value === '') {
                              this.setState({ label: undefined });
                            } else {
                              this.setState({ label: e.target.value.trim() });
                            }
                          }}
                          value={this.state.label}
                          fullWidth
                        />
                      )}
                    </React.Fragment>
                  </Grid>
                  <Grid item style={{ marginTop: 10, marginRight: 10 }}>
                    <IconButton
                      onClick={(e) => {
                        if (this.state.label === '' || !this.state.label) {
                          this.props.displayError('Новая метка не введена');
                          return;
                        }
                        if (!NAME_REGEXP.exec(this.state.label)) {
                          this.props.displayError('Введеная метка не валидна. Вы ввели недопустимые символы. ');
                          return;
                        }
                        if (this.state.labels.includes(this.state.label)) {
                          this.props.displayError('Такая метка уже существует.');
                          return;
                        }
                        this.state.labels.push(this.state.label);
                        this.props.changeLabels(this.state.labels);
                        this.setState({ labels: this.state.labels, label: '' });
                      }}
                      color="primary"
                    >
                      <AddIcon />
                    </IconButton>
                  </Grid>
                </Grid>
              </Grid>
            </Paper>
            {this.props.advanced && (
              <>
                <Typography>
                  <h4>Параметры составного индекса</h4>
                </Typography>
                <Paper style={{ width: '100%', marginTop: 12, padding: 20 }}>
                  <AdvancedOptions advanced={this.props.advanced} />
                </Paper>
              </>
            )}
            <Typography>
              <h4>Схема индекса</h4>
            </Typography>
            {this.props.schema.fields && this.props.schema.fields.length !== 0 ? (
              <Accordion defaultExpanded={true} style={{ width: '100%' }}>
                <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                  <Typography>Данные</Typography>
                </AccordionSummary>
                <AccordionDetails>
                  <MaterialTable
                    icons={tableIcons}
                    style={{ width: '100%' }}
                    title="Поля данных"
                    options={{
                      search: true,
                      paging: false,
                      showTitle: false,
                      actionsColumnIndex: -1,
                      header: true,
                      toolbarButtonAlignment: 'left',
                      searchFieldAlignment: 'left',
                    }}
                    columns={[
                      { title: 'Поле', field: 'name' },
                      {
                        title: 'Тип поля',
                        field: 'fieldType',
                        lookup: PipelineUtils.getIndexTypes(),
                        initialEditValue: 'STRING',
                      },
                      {
                        title: 'Подтип',
                        field: 'subType',
                        lookup: PipelineUtils.getIndexSubTypes(true),
                        initialEditValue: 'STRING',
                      },
                    ]}
                    data={modifySchema(
                      this.props.resultSchemaFields as unknown as ICopyFieldsSchema[],
                      this.props.processing.copyAuditParams?.copyAuditParamsSpecs ?? [],
                      false,
                    )}
                    localization={{
                      toolbar: {
                        searchTooltip: 'Поиск',
                        searchPlaceholder: 'Найти нужное поле',
                      },
                    }}
                  />
                </AccordionDetails>
              </Accordion>
            ) : null}
            {this.props.schema.dynamicFields && this.props.schema.dynamicFields?.length !== 0 ? (
              <Accordion defaultExpanded={true} style={{ width: '100%' }}>
                <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                  <Typography>Динамические поля</Typography>
                </AccordionSummary>
                <AccordionDetails>
                  <MaterialTable
                    icons={tableIcons}
                    style={{ width: '100%' }}
                    title="Динамическе поля"
                    options={{
                      search: true,
                      paging: false,
                      showTitle: false,
                      actionsColumnIndex: -1,
                      header: true,
                      toolbarButtonAlignment: 'left',
                      searchFieldAlignment: 'left',
                    }}
                    columns={[
                      { title: 'Поле', field: 'name' },
                      {
                        title: 'Тип поля',
                        field: 'fieldType',
                        lookup: {
                          STRING: 'string',
                          TEXT: 'text',
                          INT: 'int',
                          DOUBLE: 'double',
                          LONG: 'long',
                          UUID: 'uuid',
                          BOOLEAN: 'boolean',
                        },
                        initialEditValue: 'TEXT',
                      },
                    ]}
                    data={
                      this.props.schema.dynamicFields
                        ? this.props.schema.dynamicFields.map((data) => {
                            return data;
                          })
                        : []
                    }
                    localization={{
                      toolbar: {
                        searchTooltip: 'Поиск',
                        searchPlaceholder: 'Найти нужное поле',
                      },
                    }}
                  />
                </AccordionDetails>
              </Accordion>
            ) : null}

            {this.props.processing.messageFilter && (
              <Accordion defaultExpanded={false} style={{ width: '100%', margin: 6 }}>
                <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                  <Typography>Фильтрация сообщений</Typography>
                </AccordionSummary>
                <AccordionDetails>
                  <Grid container justifyContent="space-between" alignItems="center" style={{ width: '100%' }} direction="column">
                    <Grid container justifyContent="space-between" alignItems="center" style={{ width: '100%' }} direction="row">
                      <Grid item style={{ width: '50%' }}>
                        <FormControl style={{ marginLeft: '2%', width: '98%' }}>
                          <InputLabel id="select-type-conditions">Логическое объединение фильтров </InputLabel>
                          <Select
                            labelId="select-type-conditions"
                            label={'Логическое объединение фильтров'}
                            disabled
                            defaultValue={this.props.processing.messageFilter.condition.type}
                            fullWidth
                            input={<Input />}
                          >
                            {[MessageFilterType.AND, MessageFilterType.OR].map((unit, ind) => {
                              return (
                                <MenuItem value={unit} key={ind}>
                                  {unit}
                                </MenuItem>
                              );
                            })}
                          </Select>
                        </FormControl>
                      </Grid>
                      <Grid item style={{ width: '50%' }}>
                        <FormControl style={{ marginLeft: '2%', width: '98%' }}>
                          <InputLabel id="select-type-dlq">Обработка сообщений, непрошедших фильтрацию </InputLabel>
                          <Select
                            labelId="select-type-dlq"
                            defaultValue={this.props.processing.messageFilter.dlqEnabled ? 'Отправлять в DLQ' : 'Игнорировать'}
                            value={this.props.processing.messageFilter.dlqEnabled ? 'Отправлять в DLQ' : 'Игнорировать'}
                            fullWidth
                            disabled
                            input={<Input />}
                          >
                            {['Игнорировать', 'Отправлять в DLQ'].map((unit, ind) => {
                              return (
                                <MenuItem value={unit} key={ind}>
                                  {unit}
                                </MenuItem>
                              );
                            })}
                          </Select>
                        </FormControl>
                      </Grid>
                    </Grid>
                    <MaterialTable
                      icons={tableIconsWithInvisibleAdd}
                      style={{ width: '100%', margin: 6 }}
                      title="Processing Fields"
                      components={{
                        Toolbar: (props) => <MTableToolbar {...props} actions={props.actions.filter((a) => a.tooltip !== 'Add')} />,
                      }}
                      options={{
                        search: false,
                        paging: false,
                        showTitle: false,
                        actionsColumnIndex: -1,
                        header: true,
                        toolbarButtonAlignment: 'left',
                        searchFieldAlignment: 'left',
                      }}
                      columns={[
                        {
                          title: 'Имя поля',
                          field: 'field',
                        },
                        {
                          title: 'Значение',
                          field: 'value',
                        },
                        {
                          title: 'Тип проверки',
                          field: 'type',
                        },
                        {
                          title: 'Инверсия условия',
                          field: 'inverted',
                          render: (data) => {
                            return <Checkbox disabled={true} checked={data.inverted} />;
                          },
                        },
                      ]}
                      data={
                        this.props.processing.messageFilter
                          ? this.props.processing.messageFilter?.condition.conditions.map((data) => {
                              return data;
                            })
                          : []
                      }
                      localization={{
                        body: {
                          emptyDataSourceMessage: 'Условий фильтрации нет',
                          addTooltip: 'Добавить',
                          deleteTooltip: 'Удалить',
                          editTooltip: 'Редактировать',
                          editRow: {
                            deleteText: 'Вы уверены, что хотите удалить условие фильтрации?',
                            cancelTooltip: 'Отмена',
                            saveTooltip: 'Подтвердить',
                          },
                        },
                        header: {
                          actions: '',
                        },
                      }}
                    />
                  </Grid>
                </AccordionDetails>
              </Accordion>
            )}

            {this.props.processing.convertTimestampParams && this.props.processing.convertTimestampParams.length !== 0 ? (
              <Accordion defaultExpanded={true} style={{ width: '100%' }}>
                <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                  <Typography>Даты</Typography>
                </AccordionSummary>
                <AccordionDetails>
                  <MaterialTable
                    icons={tableIcons}
                    style={{ width: '100%' }}
                    title="Даты"
                    options={{
                      search: true,
                      paging: false,
                      showTitle: false,
                      actionsColumnIndex: -1,
                      header: true,
                      searchFieldAlignment: 'left',
                    }}
                    columns={[
                      { title: 'Поле времени', field: 'field', editable: 'never', width: '10%' },
                      {
                        title: 'Исходный формат времени',
                        field: 'inputFormats',
                        render: (data) => <Typography> {data.inputFormats.join(', ')} </Typography>,
                      },
                      {
                        title: 'Исходная временная зона',
                        field: 'inputTimezone',
                      },
                      {
                        title: 'Требуемая временная зона',
                        field: 'outputTimezone',
                      },
                      {
                        field: 'outputFormat',
                        hidden: true,
                      },
                    ]}
                    data={uniqBy(this.props.resultTimestamps, 'field') ?? []}
                    localization={{
                      toolbar: {
                        searchTooltip: 'Поиск',
                        searchPlaceholder: 'Найти нужное поле',
                      },
                    }}
                  />
                </AccordionDetails>
              </Accordion>
            ) : null}
            {this.props.processing.copyFieldParams && this.props.processing.copyFieldParams.length !== 0 ? (
              <Accordion defaultExpanded={true} style={{ width: '100%' }}>
                <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                  <Typography>Поля, созданные копированием других</Typography>
                </AccordionSummary>
                <AccordionDetails>
                  <MaterialTable
                    icons={tableIcons}
                    style={{ width: '100%' }}
                    title="КопиФилды"
                    options={{
                      search: true,
                      paging: false,
                      showTitle: false,
                      actionsColumnIndex: -1,
                      header: true,
                      searchFieldAlignment: 'left',
                    }}
                    columns={[
                      {
                        title: 'Имя поля',
                        field: 'toFields',
                      },
                      {
                        title: 'Поле для копирования',
                        field: 'fromField',
                      },
                    ]}
                    data={
                      this.props.processing.copyFieldParams
                        ? this.props.processing.copyFieldParams.map((data) => {
                            return data;
                          })
                        : []
                    }
                    localization={{
                      toolbar: {
                        searchTooltip: 'Поиск',
                        searchPlaceholder: 'Найти нужное поле',
                      },
                    }}
                  />
                </AccordionDetails>
              </Accordion>
            ) : null}
            {this.props.processing.addCurrentTimeParams && this.props.processing.addCurrentTimeParams.length !== 0 ? (
              <Accordion defaultExpanded={true} style={{ width: '100%' }}>
                <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                  <Typography>Поля с датой заполнения</Typography>
                </AccordionSummary>
                <AccordionDetails>
                  <MaterialTable
                    icons={tableIcons}
                    style={{ width: '100%' }}
                    title="Даты"
                    options={{
                      search: true,
                      paging: false,
                      showTitle: false,
                      actionsColumnIndex: -1,
                      header: true,
                      searchFieldAlignment: 'left',
                    }}
                    columns={[
                      { title: 'Поле времени', field: 'toField', editable: 'never', width: '10%' },
                      {
                        title: 'Требуемый формат времени',
                        field: 'timeFormat',
                      },
                      {
                        title: 'Требуемая временная зона',
                        field: 'timezone',
                      },
                    ]}
                    data={
                      this.props.processing.addCurrentTimeParams
                        ? this.props.processing.addCurrentTimeParams.map((node) => {
                            return node;
                          })
                        : []
                    }
                    localization={{
                      toolbar: {
                        searchTooltip: 'Поиск',
                        searchPlaceholder: 'Найти нужное поле',
                      },
                    }}
                  />
                </AccordionDetails>
              </Accordion>
            ) : null}
            {this.props.processing.generateUuidParams && this.props.processing.generateUuidParams.length !== 0 ? (
              <Accordion defaultExpanded={true} style={{ width: '100%' }}>
                <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                  <Typography>Уникальные id</Typography>
                </AccordionSummary>
                <AccordionDetails>
                  <MaterialTable
                    icons={tableIcons}
                    style={{ width: '100%' }}
                    title="КопиФилды"
                    options={{
                      search: true,
                      paging: false,
                      showTitle: false,
                      actionsColumnIndex: -1,
                      header: true,
                      searchFieldAlignment: 'left',
                    }}
                    columns={[
                      {
                        title: 'Имя поля',
                        field: 'toField',
                      },
                    ]}
                    data={
                      this.props.processing.generateUuidParams
                        ? this.props.processing.generateUuidParams.map((data) => {
                            return data;
                          })
                        : []
                    }
                    localization={{
                      toolbar: {
                        searchTooltip: 'Поиск',
                        searchPlaceholder: 'Найти нужное поле',
                      },
                    }}
                  />
                </AccordionDetails>
              </Accordion>
            ) : null}
          </Grid>
        </Grid>
      </React.Fragment>
    );
  }
}
