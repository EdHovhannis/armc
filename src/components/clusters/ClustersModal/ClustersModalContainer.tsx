import { makeStyles, createStyles, Theme } from '@material-ui/core';
import * as _ from 'lodash';
import * as React from 'react';
import { useEffect, useState } from 'react';
import { connect } from 'react-redux';

import ClusterService from '../../../services/ClusterService';
import * as notificationActions from '../../../store/notification/Actions';
import { Cluster, Connection } from '../types';

import ClustersModalView from './ClustersModalView';

interface IClustersModalContainer {
  clusterId?: number | null;
  visible: boolean;

  handleVisible(visible: boolean): void;

  getClusters(): void;
}

interface ClustersModalDispatchProps {
  displayError: (message: string) => void;
  displaySuccess: (message: string) => void;
}

const ClustersModalContainer: React.FC<IClustersModalContainer & ClustersModalDispatchProps> = ({
  clusterId,
  visible,
  handleVisible,
  getClusters,
  displayError,
  displaySuccess,
}: IClustersModalContainer & ClustersModalDispatchProps) => {
  const emptyCluster: Cluster = {
    name: null,
    description: '',
    default: false,
    quota: {
      partitionsNumber: 1,
    },
    jmxPort: null,
    bootstrapJmx: null,
    connection: {
      bootstrapServers: null,
      tls: {
        enabled: false,
        verifyHosts: false,
      },
    },
  };

  const [cluster, setCluster] = useState<Cluster>(_.cloneDeep(emptyCluster));
  const [validation, setValidation] = useState<string[]>([]);
  const [testVisible, setTestVisible] = useState<boolean>(false);
  const [loading, setLoading] = useState<boolean>(false);
  const [isEdit, setIsEdit] = useState<boolean>(clusterId !== null);
  // если кластер является дефолтным, то выставляем true и больше не изменяем стейт
  const [isDefault, setIsDefault] = useState(false);

  useEffect(() => {
    setIsEdit(clusterId !== null);

    if (clusterId) {
      setLoading(true);
      ClusterService.getCluster(
        clusterId,
        (cluster) => {
          setCluster(cluster);
          setIsDefault(cluster?.default ?? false);
        },
        (error) => {
          handleVisible(false);
          displayError(error);
        },
      ).finally(() => setLoading(false));
    }
  }, [clusterId]);

  useEffect(() => {
    // Чтобы не появлялись дефолтные значени при закрытии делаем задержку
    if (!visible) setTimeout(() => setCluster(emptyCluster), 50);
  }, [visible]);

  const changeHandler = <T extends keyof Cluster>(property: T, value: Cluster[T]) => {
    const newCluster: Cluster = cluster;

    newCluster[property] = value as Cluster[T];

    const newValidation = validation.filter((value) => value !== property);
    setValidation(newValidation);

    setCluster(newCluster);
  };

  const validateFields = (): boolean => {
    let invalidFields: string[] = [];

    if (!cluster.name) invalidFields = [...invalidFields, 'name'];
    if (cluster.description && cluster.description.length > 1000) invalidFields = [...invalidFields, 'description'];
    if (cluster.quota.partitionsNumber < 1) invalidFields = [...invalidFields, 'partitionsNumber'];
    if (!cluster.connection.bootstrapServers) invalidFields = [...invalidFields, 'bootstrapServers'];
    if (cluster.jmxPort && !(Number(cluster.jmxPort) > 1023 && Number(cluster.jmxPort) < 65536)) invalidFields = [...invalidFields, 'jmxPort'];
    if (cluster.bootstrapJmx && cluster.bootstrapJmx.length > 1000) invalidFields = [...invalidFields, 'bootstrapJmx'];

    setValidation(invalidFields);

    return invalidFields.length === 0;
  };

  const saveHandler = () => {
    if (validateFields()) {
      if (!isEdit) {
        ClusterService.createCluster(
          cluster,
          () => {
            displaySuccess('Кластер успешно сохранен');
            getClusters();
            handleVisible(false);
          },
          (error) => displayError(error),
        );
      } else if (clusterId) {
        ClusterService.editCluster(
          clusterId,
          cluster,
          () => {
            displaySuccess('Кластер успешно изменен');
            getClusters();
            handleVisible(false);
          },
          (error) => displayError(error),
        );
      }
    }
  };

  const closeHandler = () => handleVisible(false);

  const testVisibleHandler = () => setTestVisible((prev) => !prev);

  const bootstrapServersHandler = (servers: string | undefined) => {
    if (!servers) return;

    const connection: Connection = cluster.connection;
    connection.bootstrapServers = servers;
    changeHandler('connection', connection);
    displaySuccess('Брокеры были успешно подставлены');
  };

  const classes = makeStyles((theme: Theme) =>
    createStyles({
      form: {
        '& .MuiTextField-root, & .MuiSelect-select': {
          width: '100%',
          margin: '10px 0',
        },
      },
      accordion: {
        boxShadow: 'none',
        '&:before': {
          display: 'none',
        },
      },
      container: {
        padding: 15,
        marginTop: 10,
        border: `1px solid ${theme.palette.divider}`,
        borderRadius: 5,
      },
      container_jmx: {
        marginBottom: 10,
      },
      title: {
        paddingBottom: 0,
      },
      block: {
        display: 'block',
      },
      button: {
        marginRight: 10,
      },
      input: {
        '& input[type=number]': {
          '-moz-appearance': 'textfield',
        },
        '& input[type=number]::-webkit-outer-spin-button': {
          '-webkit-appearance': 'none',
          margin: 0,
        },
        '& input[type=number]::-webkit-inner-spin-button': {
          '-webkit-appearance': 'none',
          margin: 0,
        },
      },
    }),
  )();

  return (
    <ClustersModalView
      isDefault={isDefault}
      cluster={cluster}
      validation={validation}
      visible={visible}
      isEdit={isEdit}
      classes={classes}
      testVisible={testVisible}
      loading={loading}
      changeHandler={changeHandler}
      saveHandler={saveHandler}
      closeHandler={closeHandler}
      testVisibleHandler={testVisibleHandler}
      bootstrapServersHandler={bootstrapServersHandler}
    />
  );
};

const mapDispatchToProps = (dispatch: any): ClustersModalDispatchProps => {
  return {
    displayError: (message) => {
      dispatch(notificationActions.error(message));
    },
    displaySuccess: (message) => {
      dispatch(notificationActions.success(message));
    },
  };
};

export default connect(null, mapDispatchToProps)(ClustersModalContainer);
