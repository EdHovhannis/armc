import { Button, Grid, makeStyles, createStyles } from '@material-ui/core';
import { useEffect, useState, useMemo, useCallback } from 'react';
import { useDispatch, useSelector } from 'react-redux';

import { ApplicationState } from '../../../store/Store';
import { fetchHealthCheckConfig, updateHealthCheckConfig } from '../../../store/config/Actions';
import ConfirmDialog from '../../ConfirmDialog';

import HealthTable from './HealthTable';
import { getTextForConfirm } from './helpers';

const useStyles = makeStyles(() =>
  createStyles({
    titleAndActions: {
      position: 'sticky',
      marginBottom: '20px',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      width: '100%',
      top: '-10px',
      background: '#ffffff;',
      zIndex: 2,
    },
  }),
);

export const HealthCheckSettings = () => {
  const classes = useStyles();
  const dispatch = useDispatch();
  const healthCheckConfigs = useSelector((state: ApplicationState) => state.config);
  const { healthCheckConfigData, healthCheckConfigZones, isHealthCheckConfigsLoading } = healthCheckConfigs;

  const stableZones = useMemo(() => {
    if (!healthCheckConfigZones) return [];
    return [...healthCheckConfigZones].sort((a, b) => String(a).localeCompare(String(b)));
  }, [healthCheckConfigZones]);

  const [serviceByZone, setServiceByZone] = useState<any>({});
  const [prevkeys, setPrevKeys] = useState<any>(null);

  if (stableZones !== prevkeys) {
    setPrevKeys(stableZones);
    setServiceByZone(Object.fromEntries(stableZones.map((k) => [k, []])));
  }

  const [changeSetting, setChangeSettingDialogOpen] = useState({
    isDialogOpen: false,
    health: '',
  });

  useEffect(() => {
    dispatch(fetchHealthCheckConfig());
  }, [dispatch]);

  const handleSelectRow = useCallback((rowData: any) => {
    console.log('rowData', rowData);
    const result = rowData.reduce((acc, item) => {
      const zoneKey = item.zone.toUpperCase();

      if (!acc[zoneKey]) {
        acc[zoneKey] = [];
      }

      acc[zoneKey].push(item.service);

      return acc;
    }, {});
    setServiceByZone(result);
  }, []);

  // const handleSelectAll = useCallback(
  //   (zone: string) => {
  //     setServiceByZone((prevServiceByZone: any) => {
  //       if (healthCheckConfigData.length === prevServiceByZone[zone]?.length) {
  //         return {
  //           ...prevServiceByZone,
  //           [zone]: [],
  //         };
  //       }
  //       return {
  //         ...prevServiceByZone,
  //         [zone]: healthCheckConfigData.map((item: any) => item.rowType),
  //       };
  //     });
  //   },
  //   [healthCheckConfigData],
  // );

  const handleChangeSetting = (value: string) => {
    if (value === 'Ok') {
      dispatch(updateHealthCheckConfig(serviceByZone, changeSetting.health));
    }
    setChangeSettingDialogOpen({ isDialogOpen: false, health: '' });
  };

  const isDisable = !Object.values(serviceByZone).some((arr: any) => arr.length > 0);

  return (
    <div style={{ position: 'relative' }}>
      <Grid style={{ padding: 40 }}>
        <div className={classes.titleAndActions}>
          <h3 style={{ flex: 1 }}>Управление состоянием здоровья сервисов</h3>
          <Grid container direction="row" style={{ flex: 1, justifyContent: 'flex-end', gap: 16 }}>
            <Button
              onClick={() => setChangeSettingDialogOpen({ isDialogOpen: true, health: 'ON' })}
              disabled={isDisable}
              variant="outlined"
              style={{ color: isDisable ? 'grey' : 'green', borderColor: isDisable ? 'grey' : 'green' }}
            >
              Включить
            </Button>
            <Button
              onClick={() => setChangeSettingDialogOpen({ isDialogOpen: true, health: 'OFF' })}
              disabled={isDisable}
              variant="outlined"
              style={{ color: isDisable ? 'grey' : 'red', borderColor: isDisable ? 'grey' : 'red' }}
            >
              Выключить
            </Button>
          </Grid>
        </div>
        <HealthTable data={healthCheckConfigData} isHealthCheckConfigsLoading={isHealthCheckConfigsLoading} handleSelectRow={handleSelectRow} />
      </Grid>
      <ConfirmDialog
        warningText={getTextForConfirm(serviceByZone, changeSetting.health)}
        open={changeSetting.isDialogOpen}
        okString={'Да'}
        cancelString={'Отмена'}
        onClose={handleChangeSetting}
      />
    </div>
  );
};
