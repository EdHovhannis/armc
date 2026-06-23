import { Button, Dialog, DialogActions, DialogContent, DialogTitle, TextField, Grid, Typography } from '@material-ui/core';
import { Autocomplete } from '@material-ui/lab';
import * as React from 'react';
import { useState, useEffect } from 'react';
import { useDispatch } from 'react-redux';

import CommonService from '../../../services/CommonService';
import * as notificationActions from '../../../store/notification/Actions';
import { Loader } from '../../utils/Loader';
import { IOffsetDialogProps } from '../types';

export interface SourceConsumerGroup {
  sourceConsumerGroupId?: string;
  topicName: string;
  projectName: string;
}
export interface DataForSet {
  [key: number | string]: {
    displayName?: string;
    id?: string;
  }[];
}

const consumerOrZoneOptions = [
  { displayName: 'Consumer group', id: 'consumergroup' },
  { displayName: 'Зона', id: 'zone' },
];

export const OffsetDialog: React.FC<IOffsetDialogProps> = (props) => {
  const { open, handleClose, offsetData, urlForSaveOffset, name, project, indexType, zoneId } = props;
  const dispatch = useDispatch();
  useEffect(() => {
    if (offsetData.length) {
      const defaultData = offsetData.map((item) => {
        const parseNames = item.topicName.split('.');
        return {
          sourceConsumerGroupId: '',
          topicName: parseNames[1],
          projectName: parseNames[0],
        };
      });
      setConsumerData(defaultData);
    }
  }, [offsetData.length]);

  const [consumerZoneValue, setConsumerZoneValue] = useState({
    index: {
      displayName: '',
      id: '',
    },
  });
  const [consumerValue, setConsumerValue] = useState({
    index: {
      displayName: '',
      id: '',
    },
  });
  const [dataForSet, setDataForSet] = useState<DataForSet | null>(null);
  const [isLoading, setLoading] = useState(false);
  const [consumerData, setConsumerData] = useState<SourceConsumerGroup[]>([]);
  const [isValuesSelectDisable, setValuesSelectDisable] = useState<boolean>(false);
  const [isConfirmDialog, setConfirmDialog] = useState<boolean>(false);

  const handleSetOffset = async () => {
    setLoading(true);
    const filteredConsumerData = consumerData.filter((item) => item.sourceConsumerGroupId);
    CommonService.saveOffsetData(
      { urlForSaveOffset, consumerData: filteredConsumerData },
      (res) => dispatch(notificationActions.success(res)),
      (message) => dispatch(notificationActions.error(message)),
    ).finally(() => {
      setLoading(false);
      handleClose();
    });
  };

  const getValue = (value: { displayName: string; id: string }, currentIndex: number) => {
    let payloadValue: string | undefined = value?.id;
    if (consumerZoneValue[currentIndex].id === 'zone') {
      payloadValue = offsetData[currentIndex].consumerGroups.find(
        (cgroup) => cgroup.indexName === name && cgroup.projectName === project && cgroup.type === indexType && cgroup.zoneId === value?.id,
      )?.consumerGroup.name;
      if (!payloadValue) {
        setValuesSelectDisable(true);
        dispatch(notificationActions.error('Не удалось найти соответствующую группу'));
      }
    }
    return payloadValue;
  };

  return (
    <Dialog open={open} onClose={handleClose} aria-labelledby="form-dialog-title" fullWidth maxWidth="lg" style={{ overflow: 'auto' }}>
      {!isConfirmDialog ? (
        <DialogTitle id="form-dialog-title">Установка offset</DialogTitle>
      ) : (
        <>
          {isConfirmDialog && isLoading ? (
            <Loader />
          ) : (
            <DialogTitle id="form-dialog-title">{`Подтверждаете установку offset для экземпляра ${name} в зону ${zoneId} ?`}</DialogTitle>
          )}
        </>
      )}
      {!isConfirmDialog && (
        <DialogContent>
          {!offsetData.length ? (
            <Loader />
          ) : (
            <>
              {offsetData.map((item, currentIndex) => (
                <Grid
                  key={currentIndex}
                  container
                  spacing={1}
                  style={{
                    border: '1px solid gray',
                    borderRadius: '6px',
                    padding: '8px 16px',
                    marginTop: '16px',
                  }}
                >
                  <Grid spacing={1} style={{ width: '100%' }}>
                    <TextField
                      fullWidth
                      margin="normal"
                      variant="outlined"
                      id="datasourceName"
                      label="Имя источника данных/Топика"
                      value={item.topicName}
                      disabled
                    />
                  </Grid>
                  <Grid spacing={1} style={{ width: '100%' }}>
                    <TextField
                      fullWidth
                      margin="normal"
                      variant="outlined"
                      id="datasourceName"
                      label="Имя текущей consumer group"
                      value={item.currentConsumerGroup?.displayName}
                      disabled
                    />
                  </Grid>
                  <Grid spacing={1} style={{ width: '100%' }}>
                    <Typography>Копировать из:</Typography>
                  </Grid>
                  <Grid spacing={1} style={{ width: '100%' }}>
                    <Autocomplete
                      id={'сonsumer-group-zone'}
                      options={consumerOrZoneOptions}
                      getOptionLabel={(option) => option.displayName}
                      renderInput={(params) => (
                        <TextField {...params} fullWidth margin="normal" variant="outlined" id="datasourceName" label="Consumer group/Зона" />
                      )}
                      onChange={(e, value) => {
                        const getDataForSet = () => {
                          if (value?.id === 'consumergroup') {
                            setValuesSelectDisable(false);
                            return offsetData[currentIndex].consumerGroups.map((item) => {
                              return {
                                displayName: `${item.type}_${item.consumerGroup.displayName}`,
                                id: item.consumerGroup.name,
                              };
                            });
                          }
                          return offsetData[currentIndex].zoneIds.map((item) => {
                            return {
                              displayName: item,
                              id: item,
                            };
                          });
                        };
                        setConsumerValue({
                          index: {
                            displayName: '',
                            id: '',
                          },
                        });
                        const cleanConsumerData = consumerData.map((item, i) => {
                          if (currentIndex === i) {
                            return {
                              ...item,
                              sourceConsumerGroupId: '',
                            };
                          }
                          return item;
                        });
                        setConsumerData(cleanConsumerData);

                        setConsumerZoneValue({
                          ...consumerZoneValue,
                          [currentIndex]: value,
                        });

                        setDataForSet({
                          ...dataForSet,
                          [currentIndex]: getDataForSet(),
                        });
                      }}
                      value={consumerZoneValue[currentIndex] ?? consumerZoneValue.index}
                    />
                  </Grid>
                  <Grid spacing={1} style={{ width: '100%' }}>
                    <Autocomplete
                      id={'setted-value'}
                      options={dataForSet?.[currentIndex] ?? []}
                      getOptionLabel={(options: any) => options.displayName}
                      disabled={dataForSet && dataForSet[currentIndex] && !isValuesSelectDisable ? false : true}
                      onChange={(_, value: { displayName: string; id: string }) => {
                        const updatedConsumerData = consumerData.map((item, i) => {
                          if (currentIndex === i) {
                            return {
                              ...item,
                              sourceConsumerGroupId: getValue(value, currentIndex),
                            };
                          }
                          return item;
                        });
                        setConsumerValue({
                          ...consumerValue,
                          [currentIndex]: {
                            displayName: value?.displayName,
                            id: value?.id,
                          },
                        });
                        setConsumerData(updatedConsumerData);
                      }}
                      renderInput={(params) => (
                        <TextField {...params} fullWidth margin="normal" variant="outlined" id="datasourceName" label="Устанавливаемое значение" />
                      )}
                      value={consumerValue[currentIndex] ?? consumerValue.index}
                    />
                  </Grid>
                </Grid>
              ))}
            </>
          )}
        </DialogContent>
      )}
      {!isConfirmDialog ? (
        <DialogActions>
          <Button
            onClick={() => setConfirmDialog(true)}
            color="default"
            disabled={!consumerData.some((item) => item.sourceConsumerGroupId) || !offsetData.length}
          >
            Установить
          </Button>
          <Button onClick={handleClose} color="primary">
            Отмена
          </Button>
        </DialogActions>
      ) : (
        <DialogActions>
          <Button onClick={handleSetOffset} color="default">
            Подтвердить
          </Button>
          <Button onClick={() => setConfirmDialog(false)} color="primary">
            Отмена
          </Button>
        </DialogActions>
      )}
    </Dialog>
  );
};
