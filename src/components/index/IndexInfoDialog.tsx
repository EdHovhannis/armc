import MaterialTable, { MTableToolbar } from '@material-table/core';
import { Accordion, AccordionDetails, AccordionSummary, Checkbox, FormControl, Input, InputLabel } from '@material-ui/core';
import Button from '@material-ui/core/Button';
import Dialog from '@material-ui/core/Dialog';
import DialogActions from '@material-ui/core/DialogActions';
import DialogContent from '@material-ui/core/DialogContent';
import DialogTitle from '@material-ui/core/DialogTitle';
import Grid from '@material-ui/core/Grid';
import MenuItem from '@material-ui/core/MenuItem';
import Paper from '@material-ui/core/Paper';
import Select from '@material-ui/core/Select';
import Typography from '@material-ui/core/Typography';
import { createStyles, withStyles } from '@material-ui/core/styles';
import ExpandMoreIcon from '@material-ui/icons/ExpandMore';
import * as React from 'react';
import Draggable from 'react-draggable';
import { ResizableBox } from 'react-resizable';

import { MessageFilterType, Pipeline, TypePrimaryField } from '../../store/pipeline/Types';
import { PipelineUtils } from '../../utils/PipelineUtils';
import SizeConverter from '../../utils/SizeConverter';
import { tableIcons, tableIconsWithInvisibleAdd } from '../../utils/Utils';

const LOCALIZATION = {
  toolbar: {
    searchTooltip: 'Поиск',
    searchPlaceholder: 'Найти нужное поле',
  },
};

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
    <Draggable handle="#draggable-dialog-info-index" cancel={'[class*="MuiDialogContent-root"]'}>
      <Paper {...props} />
    </Draggable>
  );
}

export interface IndexInfoDialogProps {
  pipeline: Pipeline;
  backupCount: number;
  close(): any;
}

export interface IndexInfoDialogStat {}

class IndexInfoDialog extends React.Component<IndexInfoDialogProps, IndexInfoDialogStat> {
  constructor(props) {
    super(props);
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
          <ResizableBox width={910} height={956} className={classes.resizable}>
            <DialogTitle style={{ cursor: 'move' }} id="draggable-dialog-title">
              Общая информация об индексе <b>{this.props.pipeline.name}</b>
            </DialogTitle>
            <DialogContent>
              <Grid direction={'column'} style={{ marginLeft: 16, width: 'calc(100%-32px)' }}>
                <Grid direction={'row'}>
                  <Grid item direction={'column'}>
                    <Typography variant="body2" display="block" style={{ marginTop: 10, width: '100%', fontSize: '15px' }}>
                      Проект: {this.props.pipeline.projectShortName}
                    </Typography>
                    <Typography variant="body2" display="block" style={{ marginTop: 10, width: '100%', fontSize: '15px' }}>
                      Источники данных:
                      <ul>
                        {this.props.pipeline.sources.kafka.map((source, i) => (
                          <li key={i}>{`${source.projectShortName}/${source.topicName}`}</li>
                        ))}
                      </ul>
                    </Typography>
                    <Typography variant="body2" display="block" style={{ marginTop: 10, width: '100%', fontSize: '15px' }}>
                      Размер индекса: {SizeConverter.makeSizeString(SizeConverter.convertBytes(this.props.pipeline.quota.maxSizeBytes), false)}
                    </Typography>
                    <Typography variant="body2" display="block" style={{ marginTop: 10, marginBottom: 10, width: '100%', fontSize: '15px' }}>
                      Скорость записи:{' '}
                      {SizeConverter.makeSizeString(SizeConverter.convertBytes(this.props.pipeline.quota.maxDataRateBytesPerSec), true)}
                    </Typography>
                    <Typography variant="body2" display="block" style={{ marginBottom: 10, width: '100%', fontSize: '15px' }}>
                      Основное время:{' '}
                      {this.props.pipeline.schema.primaryTimeField.type === TypePrimaryField.AUTOGENERATE
                        ? 'время записи в хранилище'
                        : this.props.pipeline.schema.primaryTimeField.customFieldName}
                    </Typography>

                    <Typography variant="body2" display="block" style={{ marginBottom: 10, width: '100%', fontSize: '15px' }}>
                      Стратегия: {this.props.pipeline.recoveryStrategy}
                    </Typography>
                    <Typography variant="body2" display="block" style={{ marginBottom: 10, width: '100%', fontSize: '15px' }}>
                      Количество бэкапов: {this.props.backupCount}
                    </Typography>
                    <Typography variant="body2" display="block" style={{ marginBottom: 10, width: '100%', fontSize: '15px' }}>
                      Количество коллекций: {this.props.pipeline.collectionCount}
                    </Typography>

                    <Typography variant="body2" display="block" style={{ marginBottom: 10, width: '100%', fontSize: '15px' }}>
                      {this.props.pipeline.processing?.flattenJsonParam != null
                        ? 'Вложенные поля в JSON будут разложены'
                        : 'Вложенные поля в JSON раскладываться не будут.'}
                      {this.props.pipeline.processing?.flattenJsonParam != null &&
                        (this.props.pipeline.processing?.flattenJsonParam?.excludedFromFlatteningFields.length === 0
                          ? '.'
                          : `, кроме полей "${this.props.pipeline.processing?.flattenJsonParam?.excludedFromFlatteningFields.join('", "')}"`)}
                    </Typography>
                  </Grid>

                  <Typography>
                    <h4>Схема индекса</h4>
                  </Typography>
                  {this.props.pipeline.schema.fields && this.props.pipeline.schema.fields.length !== 0 ? (
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
                          data={PipelineUtils.getResultFields(this.props.pipeline.schema.fields, this.props.pipeline?.processing?.transformArray)}
                          localization={LOCALIZATION}
                        />
                      </AccordionDetails>
                    </Accordion>
                  ) : null}
                  {this.props.pipeline.schema.dynamicFields && this.props.pipeline.schema.dynamicFields?.length !== 0 ? (
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
                            this.props.pipeline.schema.dynamicFields
                              ? this.props.pipeline.schema.dynamicFields.map((data) => {
                                  return data;
                                })
                              : []
                          }
                          localization={LOCALIZATION}
                        />
                      </AccordionDetails>
                    </Accordion>
                  ) : null}

                  {this.props.pipeline.processing?.messageFilter && (
                    <Accordion defaultExpanded={true} style={{ width: '100%' }}>
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
                                  defaultValue={this.props.pipeline.processing.messageFilter.condition.type}
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
                                  defaultValue={this.props.pipeline.processing.messageFilter.dlqEnabled ? 'Отправлять в DLQ' : 'Игнорировать'}
                                  value={this.props.pipeline.processing.messageFilter.dlqEnabled ? 'Отправлять в DLQ' : 'Игнорировать'}
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
                              this.props.pipeline.processing.messageFilter
                                ? this.props.pipeline.processing.messageFilter?.condition.conditions.map((data) => {
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

                  {this.props.pipeline.processing?.convertTimestampParams && this.props.pipeline.processing?.convertTimestampParams.length !== 0 ? (
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
                          data={
                            this.props.pipeline.processing?.convertTimestampParams
                              ? this.props.pipeline.processing?.convertTimestampParams.map((node) => {
                                  return node;
                                })
                              : []
                          }
                          localization={LOCALIZATION}
                        />
                      </AccordionDetails>
                    </Accordion>
                  ) : null}
                  {this.props.pipeline.processing?.copyFieldParams && this.props.pipeline.processing?.copyFieldParams.length !== 0 ? (
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
                            this.props.pipeline.processing?.copyFieldParams
                              ? this.props.pipeline.processing?.copyFieldParams.map((data) => {
                                  return data;
                                })
                              : []
                          }
                          localization={LOCALIZATION}
                        />
                      </AccordionDetails>
                    </Accordion>
                  ) : null}
                  {this.props.pipeline.processing?.addCurrentTimeParams && this.props.pipeline.processing?.addCurrentTimeParams.length !== 0 ? (
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
                            this.props.pipeline.processing?.addCurrentTimeParams
                              ? this.props.pipeline.processing?.addCurrentTimeParams.map((node) => {
                                  return node;
                                })
                              : []
                          }
                          localization={LOCALIZATION}
                        />
                      </AccordionDetails>
                    </Accordion>
                  ) : null}
                  {this.props.pipeline.processing?.generateUuidParams && this.props.pipeline.processing?.generateUuidParams.length !== 0 ? (
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
                            this.props.pipeline.processing?.generateUuidParams
                              ? this.props.pipeline.processing?.generateUuidParams.map((data) => {
                                  return data;
                                })
                              : []
                          }
                          localization={LOCALIZATION}
                        />
                      </AccordionDetails>
                    </Accordion>
                  ) : null}
                </Grid>
              </Grid>
            </DialogContent>
            <DialogActions style={{ marginTop: 6 }}>
              <Button onClick={() => this.props.close()} color="primary">
                Закрыть
              </Button>
            </DialogActions>
          </ResizableBox>
        </Dialog>
      </React.Fragment>
    );
  }
}

export default withStyles(styles)(IndexInfoDialog);
