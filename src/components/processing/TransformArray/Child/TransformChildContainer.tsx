import { Column, Icons, Localization, Options } from '@material-table/core';
import * as React from 'react';
import { useEffect, useState } from 'react';

import { useDebounce } from '../../../../hooks/useDebounce';
import { ArchiveProcessing, ArchiveSchema } from '../../../../store/archive/Types';
import { ProcessingPipeline, SchemaPipeline } from '../../../../store/pipeline/Types';
import { tableIcons } from '../../../../utils/Utils';
import * as transformHelpers from '../functions';
import { ITransformData, ITransformEvents, ITransformTableData, transformTypeNumber } from '../types';

import { TransformChildView } from './TransformChildView';

export interface ITransformChildContainer extends ITransformTableData, ITransformEvents {
  transformArrayData: ITransformTableData[];
  schema: SchemaPipeline | ArchiveSchema;
  processing: ArchiveProcessing | ProcessingPipeline;
  parentIndex: number;
  typesDictionary: Record<transformTypeNumber, string>;

  displayError(msg: string): any;
}

export const TransformChildContainer: React.FC<ITransformChildContainer> = ({
  transformArrayData,
  arrayNames: name,
  fields,
  id,
  schema,
  processing,
  displayError,
  parentIndex,
  typesDictionary,
  ...tableEvents
}: ITransformChildContainer) => {
  const [arrayNameError, setArrayNameError] = useState<string | null>(null);
  const [arrayNames, setArrayName] = useState(name.length > 0 ? name.join(', ') : '');
  const debouncedArrayName = useDebounce<string>(arrayNames, 200);

  // валидация имени массива с debounce - вынесено для оптимизация
  useEffect(() => {
    const array = arrayNames.split(', ');
    const data = [...transformArrayData];
    data[parentIndex].arrayNames = [...array];
    const error = transformHelpers.validateArrayName(array, data);

    if (!error) {
      setArrayNameError(null);
    } else {
      setArrayNameError(error);
    }
    // TODO: добавить общий стейт invalid, чтобы вываливалась ошибка при нажатии далее
    tableEvents.onEditArrayNames(id, array, parentIndex);
  }, [debouncedArrayName]);

  const columns: Column<ITransformData>[] = [
    {
      title: 'Имя поля в объектах массива',
      field: 'sourceField',
    },
    {
      title: 'Имя нового массива',
      field: 'targetArray',
    },
    {
      title: 'Тип данных',
      field: 'type',
      lookup: typesDictionary,
      initialEditValue: transformTypeNumber.STRING,
    },
  ];

  const options: Options<ITransformData> = {
    actionsColumnIndex: -1,
    paging: false,
    search: false,
    toolbar: true,
  };

  const localization: Localization = {
    toolbar: {
      searchTooltip: 'Поиск',
      searchPlaceholder: 'Найти нужное поле',
    },
    body: {
      emptyDataSourceMessage: 'Поля для массива отсутствуют',
      addTooltip: 'Добавить поле массива',
      deleteTooltip: 'Удалить поле массива',
      editTooltip: 'Редактировать',
      editRow: {
        deleteText: 'Удалить данное свойство из массива?',
        cancelTooltip: 'Отмена',
        saveTooltip: 'Подтвердить',
      },
    },
    header: {
      actions: '',
    },
  };
  const validateRow = transformHelpers.validateRow(parentIndex, schema, displayError, processing);
  const validateRows = transformHelpers.validateRows(parentIndex, schema, displayError, processing);

  const onRowAdd = ({ isNew, ...rowData }: ITransformData): Promise<void> => {
    return new Promise((resolve, reject) => {
      setTimeout(() => {
        const isValid = validateRow({ ...rowData }, transformArrayData);

        if (isValid) {
          // обработка кейса, когда добавляем новый массив и заполняем первую строку данных
          if (isNew) {
            if (rowData) {
              tableEvents.onEditField(parentIndex, 0, {
                ...rowData,
              });
            }
          } else {
            tableEvents.onAddField(id, rowData);
          }
          resolve();
        } else {
          reject();
        }
      }, 200);
    });
  };

  const onRowUpdate = (newData: ITransformData, oldData: ITransformData): Promise<void> =>
    new Promise((resolve, reject) => {
      setTimeout(() => {
        const isValid = validateRow(
          {
            ...newData,
            tableData: oldData?.tableData,
          },
          transformArrayData,
        );

        if (isValid) {
          const index = oldData?.tableData?.id as number;
          tableEvents.onEditField(parentIndex, index, newData);
          resolve();
        } else {
          reject();
        }
      }, 200);
    });

  const onBulkUpdate = (changes: { oldData: ITransformData; newData: ITransformData }[]): Promise<void> =>
    new Promise((resolve, reject) => {
      const newData = [...Object.values(changes).map((change) => change.newData)];
      const data = [...transformArrayData];
      // в случае отсутсвия изменений завершаем обработку события
      if (!newData.length) {
        resolve();
        return;
      }

      const parent = { ...data[parentIndex] };
      const fields = [...parent.fields];
      const newFields = fields.map((field) => {
        const newDataIndex = newData.findIndex((nD) => nD?.tableData?.id === field?.tableData?.id);
        const notFound = -1;
        if (newDataIndex !== notFound) {
          return newData[newDataIndex];
        } else return field;
      });

      data.splice(parentIndex, 1, { ...parent, fields: [...newFields] });
      setTimeout(() => {
        const isValid = validateRows([...newData], data);

        if (isValid) {
          tableEvents.onEditArray(id, newData);
          resolve();
        } else {
          reject();
        }
        resolve();
      }, 200);
    });

  const onRowDelete = (rowData: ITransformData): Promise<void> =>
    new Promise((resolve) => {
      const index = rowData?.tableData?.id as number;
      setTimeout(() => {
        resolve();
        tableEvents.onDeleteField(id, index);
      }, 200);
    });

  return (
    <TransformChildView
      transformArrayData={transformArrayData}
      columns={columns}
      arrayName={arrayNames}
      arrayNameError={arrayNameError}
      parentIndex={parentIndex}
      fields={fields}
      localization={localization}
      options={options}
      icons={tableIcons as Icons}
      id={id}
      onRowAdd={onRowAdd}
      onRowUpdate={onRowUpdate}
      onBulkUpdate={onBulkUpdate}
      onRowDelete={onRowDelete}
      onDeleteArray={tableEvents.onDeleteArray}
      onChangeArrayName={(name: string) => setArrayName(name)}
    />
  );
};
