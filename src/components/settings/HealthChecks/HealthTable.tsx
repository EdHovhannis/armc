import MaterialTable from '@material-table/core';
import React from 'react';

interface ServiceRow {
  localeCompare(b: ServiceRow): number;
  id: string;
  service: string;
  zone: string;
  status: string;
  source: string;
  author: string;
  updatedAt: string;
  timeInStatus: string;
}

const transformData = (data: any[]): ServiceRow[] => {
  return data.map((item) => {
    const timeInStatus = '12 мин';

    return {
      id: `${item.service}-${item.zone}`,
      service: item.service,
      zone: item.zone.charAt(0).toUpperCase() + item.zone.slice(1).toLowerCase(),
      status: item.manualHealth,
      source: item.source.charAt(0).toUpperCase() + item.source.slice(1).toLowerCase(),
      author: item.author.charAt(0).toUpperCase() + item.author.slice(1),
      updatedAt: new Date(item.updatedAt)
        .toLocaleString('ru-RU', {
          day: '2-digit',
          month: '2-digit',
          hour: '2-digit',
          minute: '2-digit',
          second: '2-digit',
        })
        .replace(',', ''),
      timeInStatus: timeInStatus,
    };
  });
};

interface HealthTableProps {
  data: any[];
  isHealthCheckConfigsLoading: boolean;
  handleSelectRow: (rowData: any) => void;
}

const HealthTable: React.FC<HealthTableProps> = ({ data, isHealthCheckConfigsLoading, handleSelectRow }) => {
  const tableData = transformData(data).sort((a, b) => a.service.localeCompare(b.service));

  return (
    <div style={{ padding: '20px' }}>
      <MaterialTable
        isLoading={isHealthCheckConfigsLoading}
        columns={[
          {
            title: 'Сервис',
            field: 'service',
            sorting: false,
            cellStyle: {
              fontWeight: 500,
            },
          },
          {
            title: 'Зона',
            field: 'zone',
            sorting: false,
            cellStyle: {
              textTransform: 'capitalize',
            },
          },
          {
            title: 'Статус',
            field: 'status',
            sorting: false,
            render: (rowData) => (
              <span
                style={{
                  color: rowData.status === 'ON' ? '#4caf50' : '#f44336',
                  fontWeight: 600,
                }}
              >
                {rowData.status}
              </span>
            ),
          },
          {
            title: 'Источник изменений',
            field: 'source',
            sorting: false,
          },
          {
            title: 'Автор изменений',
            field: 'author',
            sorting: false,
          },
          {
            title: 'Время изменения',
            field: 'updatedAt',
            sorting: false,
          },
          {
            title: 'Время в статусе',
            field: 'timeInStatus',
            sorting: false,
          },
        ]}
        data={tableData}
        options={{
          selection: true,
          paging: false,
          search: false,
          toolbar: false,
        }}
        onSelectionChange={handleSelectRow}
        components={{
          Container: (props) => <div {...props} style={{ boxShadow: 'none' }} />,
        }}
      />
    </div>
  );
};

export default HealthTable;
