import * as React from 'react';
import ReactTable from 'react-table';

import 'react-table/react-table.css';
import ArchiveTaskInstanceActions from '../../../containers/archive/ArchiveTaskInstanceActions';
import { ShortArchiveTaskWithRole } from '../../../store/archive/Actions';
import { ArchivalStatus, ArchiveTaskInstance, ArchiveTaskInstanceStatus } from '../../../store/archive/Types';
import SizeConverter from '../../../utils/SizeConverter';
import { LoaderInString } from '../../loader/LoaderInString';
import { LIMIT_FEATURE_SETTING_COLUMNS } from '../../shared/constants';
import { Loader } from '../../utils/Loader';
import { StatusFlag } from '../../utils/StatusFlag';

interface Props {
  fetchArchiveTaskInstanceStatuses: (archiveTaskInstanceIds: string[]) => void;
  archiveTaskInstanceStatus: {
    instance?: ArchiveTaskInstance;
    status?: ArchiveTaskInstanceStatus;
  }[];
  isLimitFeatureSettingEnabled: boolean;
  archive: ShortArchiveTaskWithRole;
}

const TABLE_FONTS = {
  fontFamily: ['Roboto', 'Helvetica', 'Arial', 'sans-serif'],
  fontSize: 12,
};

interface TableRow {
  archiveTaskInstanceId?: string;
  statusIndexingStatus: string | JSX.Element;
  zoneId: string;
  memoryUsage: string;
  maxDataRateBytesPerSec: string;
  maxSizeBytes: string;
  maxStorageTimeSec: string;
}

// используется компонент, потому что функциональный компонент будет каждый рендер обновляться и сбрасывать состояния дочерних компонентов
class ActionsCell extends React.Component<any, any> {
  render() {
    const { value } = this.props;
    if (!value) {
      return null;
    }
    const { archiveTaskInstanceId } = value;
    return <ArchiveTaskInstanceActions archiveTaskInstanceId={archiveTaskInstanceId} isZone={'click'} />;
  }
}

const TABLE_COLUMNS = [
  {
    Header: 'Зона',
    accessor: 'zoneId',
    style: TABLE_FONTS,
  },
  {
    Header: 'Статус',
    accessor: 'statusIndexingStatus',
    style: TABLE_FONTS,
  },
  {
    Header: 'Статистика памяти',
    id: 'memory usage',
    accessor: 'memoryUsage',
    style: TABLE_FONTS,
  },
  {
    Header: 'Макс.скорость записи',
    id: 'maxDataRateBytesPerSec',
    accessor: 'maxDataRateBytesPerSec',
    style: TABLE_FONTS,
  },
  {
    Header: 'Макс.размер индекса',
    id: 'maxSizeBytes',
    accessor: 'maxSizeBytes',
    style: TABLE_FONTS,
  },
  {
    Header: 'Макс.время хранения данных',
    id: 'maxStorageTimeSec',
    accessor: 'maxStorageTimeSec',
    style: TABLE_FONTS,
  },
  {
    id: 'actions',
    accessor: (value) => value,
    Cell: ActionsCell,
  },
];

class ArchiveTaskInstancesTable extends React.Component<Props> {
  constructor(props) {
    super(props);

    this.fetchMissingStatuses = this.fetchMissingStatuses.bind(this);
  }

  fetchMissingStatuses() {
    const instancesWithoutStatusIds: string[] = [];
    this.props.archiveTaskInstanceStatus.forEach(({ instance, status }) => {
      if (status?.indexing.status === ArchivalStatus.WITHOUT_RESPONSE) {
        instancesWithoutStatusIds.push(instance?.archiveTaskInstanceId as string);
      }
    });
    if (instancesWithoutStatusIds.length === 0) {
      return;
    }
    this.props.fetchArchiveTaskInstanceStatuses(instancesWithoutStatusIds);
  }

  componentDidMount() {
    this.fetchMissingStatuses();
  }

  render() {
    const { archive, archiveTaskInstanceStatus } = this.props;
    const { isLimitFeatureSettingEnabled } = this.props;
    const columns = isLimitFeatureSettingEnabled
      ? TABLE_COLUMNS
      : TABLE_COLUMNS.filter((column) => !LIMIT_FEATURE_SETTING_COLUMNS.includes(column.id || ''));

    const data: TableRow[] = [];

    archive.instances.forEach((instance, i) => {
      if (!instance) {
        return;
      }
      data.push({
        archiveTaskInstanceId: archiveTaskInstanceStatus[i]?.instance?.archiveTaskInstanceId,
        statusIndexingStatus:
          instance?.status?.indexing?.status === ArchivalStatus.WITHOUT_RESPONSE ? (
            <StatusFlag title={'Статус задачи не получен. Обратитесь к администратору'} placement={'right'} fill={'red'} />
          ) : (
            (instance?.status?.indexing?.status ?? <LoaderInString style={{ top: '6px' }} />)
          ),
        zoneId: instance.zoneId,
        memoryUsage: instance?.status?.storage
          ? `${SizeConverter.makeSizeString(SizeConverter.convertBytes(instance?.status.storage.currentSizeBytes), false)} / ${SizeConverter.makeSizeString(
              SizeConverter.convertBytes(instance?.status.storage.maxSizeBytes),
              false,
            )}`
          : '',
        maxDataRateBytesPerSec: SizeConverter.makeSizeString(SizeConverter.convertBytes(instance.maxDataRateBytesPerSec), true),
        maxSizeBytes: SizeConverter.makeSizeString(SizeConverter.convertBytes(instance.maxSizeBytes), false),
        maxStorageTimeSec: instance.maxStorageTimeSec ? `${instance.maxStorageTimeSec} сек` : '',
      });
    });

    return (
      <div>
        <ReactTable defaultPageSize={3} style={{ width: '100%' }} columns={columns} data={data} />
      </div>
    );
  }
}

export default ArchiveTaskInstancesTable;
