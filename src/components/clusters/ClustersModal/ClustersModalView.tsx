import { Dialog, DialogTitle, DialogContent, TextField, FormControlLabel, Checkbox } from '@material-ui/core';
import { ClassNameMap } from '@material-ui/styles';
import * as React from 'react';

import { Loader } from '../../utils/Loader';
import { Cluster } from '../types';

import ConnectionFields from './ClustersModalParts/ConnectionFields';
import ControlButtons from './ClustersModalParts/ControlButtons';
import JmxFields from './ClustersModalParts/JmxFields';
import QuotaFields from './ClustersModalParts/QuotaFields';
import { ClustersModalTestFlight } from './ClustersModalTestFlight';

interface IClustersModalView {
  cluster: Cluster;
  validation: string[];
  visible: boolean;
  isEdit: boolean;
  classes: ClassNameMap;
  testVisible: boolean;
  loading: boolean;
  isDefault: boolean;

  changeHandler<T extends keyof Cluster>(property: T, value: Cluster[T]): void;
  saveHandler(): void;
  closeHandler(): void;
  testVisibleHandler(): void;
  bootstrapServersHandler(servers: string | undefined): void;
}

const ClustersModalView: React.FC<IClustersModalView> = ({
  cluster,
  validation,
  visible,
  isEdit,
  classes,
  testVisible,
  loading,
  isDefault,
  changeHandler,
  saveHandler,
  closeHandler,
  testVisibleHandler,
  bootstrapServersHandler,
}: IClustersModalView) => {
  return (
    <>
      {loading ? (
        <Loader />
      ) : (
        <Dialog fullWidth maxWidth="sm" open={visible}>
          <DialogTitle className={classes.title} style={{ visibility: visible ? 'visible' : 'hidden' }}>
            {!isEdit ? 'Создание' : 'Редактирование'} кластера
          </DialogTitle>
          <DialogContent>
            <form noValidate className={classes.form}>
              <TextField
                label="Название"
                value={cluster.name}
                error={validation.includes('name')}
                helperText={validation.includes('name') && 'Название обязательно для заполнения'}
                variant="outlined"
                inputProps={{ maxLength: 100 }}
                InputLabelProps={{ shrink: true }}
                onChange={(e) => changeHandler('name', e.target.value)}
              />
              <FormControlLabel
                label="Назначить кластером по умолчанию"
                control={
                  <Checkbox
                    color="primary"
                    checked={cluster.default}
                    disabled={isDefault}
                    onChange={() => changeHandler('default', !cluster.default)}
                  />
                }
              />
              <TextField disabled label="Тип кластера" value="Kafka" variant="outlined" />
              <QuotaFields quota={cluster.quota} valid={!validation.includes('partitionsNumber')} classes={classes} changeHandler={changeHandler} />
              <TextField
                multiline
                minRows={2}
                label="Описание"
                value={cluster.description}
                variant="outlined"
                error={validation.includes('description')}
                helperText={validation.includes('description') && 'Описание не может быть длиннее 1000 символов'}
                InputLabelProps={{ shrink: true }}
                onChange={(e) => changeHandler('description', e.target.value)}
                inputProps={{ maxLength: 1000 }}
              />
              <ConnectionFields
                connection={cluster.connection}
                valid={!validation.includes('bootstrapServers')}
                disabled={isEdit}
                classes={classes}
                changeHandler={changeHandler}
              />
              <JmxFields
                jmx={{ jmxPort: cluster.jmxPort, bootstrapJmx: cluster.bootstrapJmx }}
                classes={classes}
                changeHandler={changeHandler}
                valid={{
                  jmxPort: !validation.includes('jmxPort'),
                  bootstrapJmx: !validation.includes('bootstrapJmx'),
                }}
              />
            </form>
            <ControlButtons
              testDisabled={!cluster.connection.bootstrapServers?.length}
              classes={classes}
              saveHandler={saveHandler}
              closeHandler={closeHandler}
              testHandler={testVisibleHandler}
              bootstrapJmx={cluster.bootstrapJmx}
            />
          </DialogContent>
          <ClustersModalTestFlight
            connection={cluster.connection}
            visible={testVisible}
            isEdit={isEdit}
            visibleHandler={testVisibleHandler}
            bootstrapServersHandler={bootstrapServersHandler}
          />
        </Dialog>
      )}
    </>
  );
};

export default ClustersModalView;
