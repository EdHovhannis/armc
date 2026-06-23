import Grid from '@material-ui/core/Grid';
import MenuItem from '@material-ui/core/MenuItem';
import OutlinedInput from '@material-ui/core/OutlinedInput';
import Select from '@material-ui/core/Select';
import TextField from '@material-ui/core/TextField';
import Tooltip from '@material-ui/core/Tooltip';
import { ArchiveQuota } from '@src/store/archive/Types';
import { getEnableFeatureSettingLimits } from '@src/store/featureSettings/Reducer';
import { setQuotaUnitsAction } from '@src/store/flow/Actions';
import { getQuotaUnits } from '@src/store/flow/Reducer';
import { debounce } from 'lodash';
import React, { useState, useEffect, useCallback, FC, ChangeEvent } from 'react';
import { useDispatch, useSelector } from 'react-redux';

import IndexProvider from '../../../../containers/index/IndexProvider';
import { durationUnit } from '../../../shared';
import { EstimateData } from '../types';

export interface QuotaInputPartProps {
  quota: ArchiveQuota;
  onChangedQuota(quota: ArchiveQuota): void;
  canEdit: boolean;
  onEstimate: (estimateData: EstimateData) => void;
  allowedMinSize?: string;
  initSpeed: number;
}

const QuotaInputPart: FC<QuotaInputPartProps> = (props) => {
  const dispatch = useDispatch();
  const quotaUnits = useSelector(getQuotaUnits);
  const isLimitFeatureSettingEnabled = useSelector(getEnableFeatureSettingLimits);
  const { quota = {}, canEdit, onEstimate, onChangedQuota, initSpeed, allowedMinSize } = props;

  const [maxSpeed, setMaxSpeed] = useState<number | null>(null);
  const [maxSize, setMaxSize] = useState<number | null>(null);
  const [maxTime, setMaxTime] = useState<number | null>(null);

  const onSpeedInputChange = useCallback(
    (e: ChangeEvent<{ value: string }>) => {
      const value = e.target.value;
      setMaxSpeed(value === '' ? null : parseInt(value));
      setMaxSize(null);
      setMaxTime(null);
      const bytes = value === '' ? 0 : IndexProvider.calculateBytesByDelimeter(parseInt(value), quotaUnits.speed);
      onChangedQuota({ maxStorageTimeSec: 0, maxSizeBytes: 0, maxDataRateBytesPerSec: bytes });
    },
    [onChangedQuota, quota.maxDataRateBytesPerSec, quotaUnits.speed],
  );

  const onSpeedUnitChange = useCallback(
    (e: React.ChangeEvent<{ name?: string; value: unknown }>) => {
      setMaxSpeed(IndexProvider.convertBytesToUnit(quota.maxDataRateBytesPerSec, e.target.value as string));
      dispatch(setQuotaUnitsAction({ ...quotaUnits, speed: e.target.value as string }));
    },
    [dispatch, quota.maxDataRateBytesPerSec, quotaUnits],
  );

  const debouncedCheckSize = useCallback(
    debounce((value) => {
      const bytes = IndexProvider.calculateBytesByDelimeter(value, quotaUnits.size);
      onChangedQuota({ maxDataRateBytesPerSec: quota.maxDataRateBytesPerSec, maxSizeBytes: bytes, maxStorageTimeSec: 0 });
      if (value) {
        setMaxTime(null);
        onEstimate({
          speedBytes: quota.maxDataRateBytesPerSec,
          sizeBytes: bytes,
          timeSec: null,
        });
      }
    }, 400),
    [quotaUnits.size, quota.maxDataRateBytesPerSec, onEstimate],
  );

  const onSizeChange = (e: ChangeEvent<{ value: string }>) => {
    const value = e.target.value;
    const changedMaxSize = value.trim() ? parseFloat(value) : null;
    setMaxSize(changedMaxSize);
    debouncedCheckSize(changedMaxSize);
  };

  const onSizeUnitChange = useCallback(
    (e: React.ChangeEvent<{ name?: string; value: unknown }>) => {
      const unit = e.target.value as string;
      setMaxSize(IndexProvider.convertBytesToUnit(quota.maxSizeBytes, unit));
      dispatch(setQuotaUnitsAction({ ...quotaUnits, size: unit }));
    },
    [dispatch, quota.maxSizeBytes, quotaUnits],
  );

  const debouncedCheckTime = useCallback(
    debounce((value) => {
      const valueInSec = IndexProvider.calculateTimeInSec(value, quotaUnits.time);
      onChangedQuota({ maxDataRateBytesPerSec: quota.maxDataRateBytesPerSec, maxStorageTimeSec: valueInSec, maxSizeBytes: 0 });
      if (value) {
        setMaxSize(null);
        onEstimate({
          speedBytes: quota.maxDataRateBytesPerSec,
          sizeBytes: null,
          timeSec: valueInSec,
        });
      }
    }, 400),
    [quotaUnits.time, quota.maxDataRateBytesPerSec, onEstimate],
  );

  const onTimeChange = (e: ChangeEvent<{ value: string }>) => {
    const value = e.target.value;
    const changedMaxTime = value.trim() ? parseFloat(value) : null;
    setMaxTime(changedMaxTime);
    debouncedCheckTime(changedMaxTime);
  };

  const onTimeUnitChange = useCallback(
    (e: React.ChangeEvent<{ name?: string; value: unknown }>) => {
      const unit = e.target.value as string;
      setMaxTime(IndexProvider.convertTimeToUnit(quota.maxStorageTimeSec, unit));
      dispatch(setQuotaUnitsAction({ ...quotaUnits, time: unit }));
    },
    [dispatch, quota.maxStorageTimeSec, quotaUnits],
  );

  // Установка начальных значений
  useEffect(() => {
    const speed = quota.maxDataRateBytesPerSec || initSpeed;
    onChangedQuota({
      ...quota,
      maxDataRateBytesPerSec: speed,
    });
    setMaxSpeed(IndexProvider.calculateSpeed(speed, quotaUnits.speed).value);
    setMaxSize(IndexProvider.calculateSize(quota.maxSizeBytes, quotaUnits.size).value);
    setMaxTime(IndexProvider.calculateTime(quota.maxStorageTimeSec, quotaUnits.time).value);
  }, [initSpeed]);

  // Детектим, что нужно заполнить размер или время
  useEffect(() => {
    if (quota.maxSizeBytes && !maxSize) {
      setMaxSize(IndexProvider.convertBytesToUnit(quota.maxSizeBytes, quotaUnits.size));
    }
  }, [quota.maxSizeBytes]);
  useEffect(() => {
    if (quota.maxStorageTimeSec && !maxTime) {
      setMaxTime(IndexProvider.convertTimeToUnit(quota.maxStorageTimeSec, quotaUnits.time));
    }
  }, [quota.maxStorageTimeSec]);

  return (
    <>
      <Grid direction="row" style={{ marginBottom: 10 }}>
        <TextField
          fullWidth
          disabled={!canEdit}
          error={quota.maxDataRateBytesPerSec <= 0}
          value={maxSpeed || ''}
          style={{ width: '80%' }}
          variant="outlined"
          label="Максимальная скорость записи"
          onChange={onSpeedInputChange}
        />
        <Select
          value={quotaUnits.speed}
          fullWidth
          disabled={!canEdit}
          style={{ marginLeft: '2%', width: '18%' }}
          onChange={onSpeedUnitChange}
          input={<OutlinedInput id={'adorment'} labelWidth={0} />}
        >
          {['MB/s', 'KB/s', 'B/s'].map((method) => (
            <MenuItem value={method.split('/')[0]} key={method}>
              {method}
            </MenuItem>
          ))}
        </Select>
      </Grid>
      <Grid direction="row" style={{ display: 'flex', position: 'relative', marginBottom: 44 }}>
        <Tooltip title={allowedMinSize ? `Минимальная допустимая величина максимального размера ${allowedMinSize}` : ''}>
          <TextField
            fullWidth
            disabled={!canEdit}
            error={maxSize === null || maxSize <= 0 || isNaN(maxSize)}
            value={maxSize || ''}
            style={{ width: '80%' }}
            variant="outlined"
            label="Максимальный размер индекса"
            onChange={onSizeChange}
          />
        </Tooltip>
        <Select
          value={quotaUnits.size}
          disabled={!canEdit}
          style={{ marginLeft: '2%', width: '18%' }}
          onChange={onSizeUnitChange}
          input={<OutlinedInput id={'adorment'} labelWidth={0} />}
          fullWidth
        >
          {['TB', 'GB', 'MB'].map((method, ind) => (
            <MenuItem value={method} key={ind}>
              {method}
            </MenuItem>
          ))}
        </Select>
        {isLimitFeatureSettingEnabled && (
          <div style={{ width: '100%', position: 'absolute', top: '105%', fontSize: 13 }}>Ротация по объему данных</div>
        )}
      </Grid>
      {isLimitFeatureSettingEnabled && (
        <Grid direction="row" style={{ display: 'flex' }}>
          <Tooltip title="Максимальное время хранения данных">
            <TextField
              fullWidth
              disabled={!canEdit}
              error={maxTime === null || maxTime <= 0 || isNaN(maxTime)}
              value={maxTime || ''}
              style={{ width: '80%' }}
              variant="outlined"
              label="Максимальное время хранения данных"
              onChange={onTimeChange}
            />
          </Tooltip>
          <Select
            value={quotaUnits.time}
            disabled={!canEdit}
            fullWidth
            style={{ marginLeft: '2%', width: '18%' }}
            onChange={onTimeUnitChange}
            input={<OutlinedInput id={'adorment'} labelWidth={0} />}
          >
            {durationUnit.map((unit) => (
              <MenuItem value={unit} key={unit}>
                {unit}
              </MenuItem>
            ))}
          </Select>
        </Grid>
      )}
    </>
  );
};

export default QuotaInputPart;
