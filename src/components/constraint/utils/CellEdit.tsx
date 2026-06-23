import { Select, TextField, Tooltip } from '@material-ui/core';
import MenuItem from '@material-ui/core/MenuItem';
import { init } from 'http-proxy-middleware/dist/_handlers';
import * as React from 'react';

import IndexProvider from '../../../containers/index/IndexProvider';
import { CONSTRAINT_MAP, ConstraintValueType } from '../../../store/constraint/Types';
import { ConstraintUtils } from '../../../utils/ConstraintUtils';
import SizeConverter, { TIME_UNITS_MAP } from '../../../utils/SizeConverter';

export const EditCell = (props: {
  constraint: string;
  value: number;
  needTooltip: boolean;
  type: ConstraintValueType;
  initialValueString: string;
  setError: (error: string | undefined) => void;
  onChange(value: number): any;
  service?: string;
}) => {
  const [unit, setUnit] = React.useState(
    props.value > 0
      ? props.type === ConstraintValueType.time
        ? SizeConverter.getInitTimeUnit(SizeConverter.getTimeForConstraints(props.value)).unit
        : IndexProvider.calculateDelimiterFromBytes(props.value, false).unit
      : props.type === ConstraintValueType.time
        ? 'sec'
        : 'b',
  );
  const [initValue, setInitValue] = React.useState(
    props.value > 0
      ? props.type === ConstraintValueType.number
        ? props.value
        : props.type === ConstraintValueType.time
          ? SizeConverter.getInitTimeUnit(SizeConverter.getTimeForConstraints(props.value)).value
          : IndexProvider.calculateDelimiterFromBytes(props.value, false).value
      : 0,
  );

  switch (props.type) {
    case ConstraintValueType.number:
      return (
        <React.Fragment>
          {props.needTooltip ? (
            <Tooltip title={props.initialValueString} placement={'top-start'}>
              <TextField
                fullWidth
                error={isNaN(initValue) || !Number.isInteger(parseFloat(initValue)) || parseFloat(initValue) === 0}
                defaultValue={initValue}
                id={props.service ? props.service + '-' + props.constraint + '-edit' : props.constraint + '-edit'}
                autoFocus
                onFocus={(ev) => {
                  if (isNaN(initValue) || !Number.isInteger(parseFloat(initValue))) {
                    props.setError('Значение должно быть целым числом');
                    return;
                  } else if (initValue === 0) {
                    props.setError('Значение не может быть нулем');
                    return;
                  } else {
                    props.setError(undefined);
                  }
                }}
                onChange={(e) => {
                  if (isNaN(e.target.value) || !Number.isInteger(parseFloat(e.target.value))) {
                    props.setError('Значение должно быть целым числом');
                    return;
                  } else if (e.target.value === 0) {
                    props.setError('Значение не может быть нулем');
                    return;
                  } else {
                    props.setError(undefined);
                  }
                  setInitValue(e.target.value);
                  props.onChange(parseFloat(e.target.value));
                }}
              />
            </Tooltip>
          ) : (
            <TextField
              fullWidth
              error={isNaN(initValue) || !Number.isInteger(parseFloat(initValue)) || parseFloat(initValue) === 0}
              defaultValue={initValue}
              id={props.service ? props.service + '-' + props.constraint + '-edit' : props.constraint + '-edit'}
              autoFocus
              onFocus={(ev) => {
                if (isNaN(initValue) || !Number.isInteger(parseFloat(initValue))) {
                  props.setError('Значение должно быть целым числом');
                  return;
                } else if (initValue === 0) {
                  props.setError('Значение не может быть нулем');
                  return;
                } else {
                  props.setError(undefined);
                }
              }}
              onChange={(e) => {
                if (isNaN(e.target.value) || !Number.isInteger(parseFloat(e.target.value))) {
                  props.setError('Значение должно быть целым числом');
                  return;
                } else if (e.target.value === 0) {
                  props.setError('Значение не может быть нулем');
                  return;
                } else {
                  props.setError(undefined);
                }
                setInitValue(e.target.value);
                props.onChange(parseFloat(e.target.value));
              }}
            />
          )}
        </React.Fragment>
      );
    case ConstraintValueType.size:
      return (
        <React.Fragment>
          {props.needTooltip ? (
            <Tooltip title={props.initialValueString} placement={'top-start'}>
              <TextField
                style={{ width: '50%' }}
                defaultValue={initValue}
                error={isNaN(initValue) || !Number.isInteger(parseFloat(initValue)) || parseFloat(initValue) === 0}
                id={props.service ? props.service + '-' + props.constraint + '-edit' : props.constraint + '-edit'}
                autoFocus
                onFocus={(ev) => {
                  if (isNaN(initValue) || !Number.isInteger(parseFloat(initValue))) {
                    props.setError('Значение должно быть целым числом');
                    return;
                  } else if (initValue === 0) {
                    props.setError('Значение не может быть нулем');
                    return;
                  } else {
                    props.setError(undefined);
                  }
                }}
                onChange={(e) => {
                  setInitValue(e.target.value);
                  if (isNaN(e.target.value) || !Number.isInteger(parseFloat(e.target.value))) {
                    props.setError('Значение должно быть целым числом');
                    return;
                  } else if (e.target.value === 0) {
                    props.setError('Значение не может быть нулем');
                    return;
                  } else {
                    props.setError(undefined);
                  }
                  props.onChange(SizeConverter.calculateBytesByDelimiter(e.target.value, unit));
                }}
              />
            </Tooltip>
          ) : (
            <TextField
              style={{ width: '50%' }}
              defaultValue={initValue}
              error={isNaN(initValue) || !Number.isInteger(parseFloat(initValue)) || parseFloat(initValue) === 0}
              id={props.service ? props.service + '-' + props.constraint + '-edit' : props.constraint + '-edit'}
              autoFocus
              onFocus={(ev) => {
                if (isNaN(initValue) || !Number.isInteger(parseFloat(initValue))) {
                  props.setError('Значение должно быть целым числом');
                  return;
                } else if (initValue === 0) {
                  props.setError('Значение не может быть нулем');
                  return;
                } else {
                  props.setError(undefined);
                }
              }}
              onChange={(e) => {
                setInitValue(e.target.value);
                if (isNaN(e.target.value) || !Number.isInteger(parseFloat(e.target.value))) {
                  props.setError('Значение должно быть целым числом');
                  return;
                } else if (e.target.value === 0) {
                  props.setError('Значение не может быть нулем');
                  return;
                } else {
                  props.setError(undefined);
                }
                props.onChange(SizeConverter.calculateBytesByDelimiter(e.target.value, unit));
              }}
            />
          )}
          <Select
            value={unit}
            style={{ width: '50%' }}
            onChange={(e: any) => {
              setUnit(e.target.value);
              props.onChange(SizeConverter.calculateBytesByDelimiter(initValue, e.target.value));
            }}
          >
            {['b', 'Kb', 'Mb', 'Gb', 'Tb'].map((method, ind) => {
              return (
                <MenuItem value={method} key={ind}>
                  {method}
                </MenuItem>
              );
            })}
          </Select>
        </React.Fragment>
      );
    case ConstraintValueType.time:
      return (
        <React.Fragment>
          <Tooltip
            title={(props.needTooltip ? props.initialValueString + '. ' : '') + 'Принято, что в 1 месяце ровно 30 дней.'}
            placement={'top-start'}
          >
            <TextField
              style={{ width: '50%' }}
              defaultValue={initValue}
              error={isNaN(initValue) || !Number.isInteger(parseFloat(initValue)) || parseFloat(initValue) === 0}
              id={props.service ? props.service + '-' + props.constraint + '-edit' : props.constraint + '-edit'}
              autoFocus
              onFocus={(ev) => {
                if (isNaN(initValue) || !Number.isInteger(parseFloat(initValue))) {
                  props.setError('Значение должно быть целым числом');
                  return;
                } else if (initValue === 0) {
                  props.setError('Значение не может быть нулем');
                  return;
                } else {
                  props.setError(undefined);
                }
              }}
              onChange={(e) => {
                setInitValue(e.target.value);
                if (isNaN(e.target.value) || !Number.isInteger(parseFloat(e.target.value))) {
                  props.setError('Значение должно быть целым числом');
                  return;
                } else if (e.target.value === 0) {
                  props.setError('Значение не может быть нулем');
                  return;
                } else {
                  props.setError(undefined);
                }
                props.onChange(SizeConverter.calculateTimeByDelimiter(e.target.value, unit));
              }}
            />
          </Tooltip>
          <Select
            value={unit}
            style={{ width: '50%' }}
            onChange={(e: any) => {
              setUnit(e.target.value);
              props.onChange(SizeConverter.calculateTimeByDelimiter(initValue, e.target.value));
            }}
          >
            {['sec', 'min', 'hours', 'days', 'weeks', 'month', 'years'].map((method, ind) => {
              return (
                <MenuItem value={method} key={ind}>
                  {TIME_UNITS_MAP[method]}
                </MenuItem>
              );
            })}
          </Select>
        </React.Fragment>
      );
  }
};
