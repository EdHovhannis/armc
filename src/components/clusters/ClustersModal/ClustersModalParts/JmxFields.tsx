import { Typography, TextField } from '@material-ui/core';
import { ClassNameMap } from '@material-ui/styles';
import { clsx } from '@sds-eng/base';
import { validateJmx } from '@src/components/utils/validateJmx';
import * as React from 'react';

import { Cluster } from '../../types';

interface Jmx {
  // jmx порт по умолчанию для кластера, если порт не задан в адресе в поле bootstrapJmx
  jmxPort: number | null;
  // адрес сервера (серверов) для jmx. Если на форме поле пустое, на бэк отправится null
  bootstrapJmx: string | null;
}

// для валидации полей, если надо будет проверять введенные пользователем значения
interface ValidJmx {
  [key: string]: boolean;
}

interface IJmxFields {
  // параметры для jmx
  jmx: Jmx;
  // валидация введенных значений
  valid: ValidJmx;
  // стили для контейнера с параметрами jmx
  classes: ClassNameMap;
  // обработчик для полей формы
  changeHandler<T extends keyof Cluster>(property: T, value: Cluster[T]): void;
}

// компонент отрисовывает на форме с параметрами кластера поля для jmx
const JmxFields: React.FC<IJmxFields> = ({ jmx, classes, changeHandler, valid }: IJmxFields) => {
  const value = jmx.bootstrapJmx || '';
  const localErrorText = validateJmx(jmx.bootstrapJmx || '');
  const hasError = localErrorText !== '' || valid['bootstrapJmx'] === false;

  return (
    <div className={clsx(classes.container, classes.container_jmx)}>
      <Typography>Настройка JMX</Typography>
      <TextField
        type="number"
        label="Порт JMX для кластера по умолчанию"
        className={classes.input}
        value={jmx.jmxPort ? jmx.jmxPort : ''}
        variant="outlined"
        InputLabelProps={{ shrink: true }}
        onChange={(e) => changeHandler('jmxPort', Number(e.target.value) === 0 ? null : Number(e.target.value))}
        error={!valid['jmxPort']}
        helperText={!valid['jmxPort'] && 'Номер порта должен быть в диапазоне 1024 - 65535'}
      />
      <TextField
        multiline
        minRows={2}
        label="Bootstrap JMX"
        value={value}
        variant="outlined"
        InputLabelProps={{ shrink: true }}
        onChange={(e) => {
          const cleanInput = e.target.value.replace(/\s+/g, '');
          changeHandler('bootstrapJmx', cleanInput.length === 0 ? null : cleanInput);
        }}
        error={hasError}
        helperText={hasError ? localErrorText || 'длина введенного значения не должна превышать 1000 символов' : ''}
      />
    </div>
  );
};

export default JmxFields;
