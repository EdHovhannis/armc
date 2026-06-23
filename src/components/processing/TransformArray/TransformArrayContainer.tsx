import * as React from 'react';
import { FC, useEffect, useState } from 'react';

import { ARCHIVE_TYPES, ArchiveProcessing, ArchiveSchema } from '../../../store/archive/Types';
import { ProcessingPipeline, SchemaPipeline } from '../../../store/pipeline/Types';

import { TransformArrayView } from './TransformArrayView';
import * as transformHelpers from './functions';
import { findIndex, getTransformTableData } from './functions';
import { ITransformData, ITransformTableData, TransformArrayData } from './types';

export interface ITransformArrayContainer {
  data?: TransformArrayData;
  processing: ProcessingPipeline | ArchiveProcessing;
  schema: SchemaPipeline | ArchiveSchema;
  typesDictionary: Record<string, string>;

  processingChanged(processing: ProcessingPipeline): any;

  displayError(msg: string): any;
}

export const TransformArrayContainer: FC<ITransformArrayContainer> = ({
  data = [],
  schema,
  processing,
  typesDictionary,
  processingChanged,
  displayError,
}: ITransformArrayContainer) => {
  // преобразуем TransformArrayData -> ITransformTableData[]
  const [tableData, setTableData] = useState<ITransformTableData[]>(() => getTransformTableData(data));
  // если преобразование массивов изменилось, то для всех подтипом не равных ARCHIVE_TYPES.DATE очищаем format
  const convertToProcessing = (data: ITransformTableData[]): TransformArrayData => {
    return data.map((d) => ({
      sourceArrays: d.arrayNames,
      targetConfig: d.fields.map((target) => ({
        ...target,
        format: target.type === ARCHIVE_TYPES.DATE ? target.format : undefined,
      })),
    }));
  };

  useEffect(() => {
    if (processing) {
      const isEmpty = !tableData.length;
      processingChanged({
        ...processing,
        transformArray: isEmpty ? undefined : [...convertToProcessing([...tableData])],
      });
    }
  }, [tableData]);

  const onDeleteArray = (id: number) => {
    const parentIndex = findIndex(id, tableData);
    const data = [...tableData];
    data.splice(parentIndex, 1);
    setTableData([...data]);
  };

  const onDeleteField = (id: number, index: number): void => {
    const data = [...tableData];
    const parentIndex = findIndex(id, data);

    const parent = { ...data[parentIndex] };

    const fields = [...parent.fields];
    // удаляем элемент с индексом index из массива fields
    fields.splice(index, 1);
    // обновляем fields с учетом удаленного элемента
    parent.fields = fields;

    // заменяем parent
    data.splice(parentIndex, 1, parent);

    setTableData([...data]);
  };

  const onAddField = (id: number, newData: ITransformData) => {
    const data = [...tableData];
    const parentIndex = findIndex(id, data);

    const parent = { ...data[parentIndex] };

    parent.fields = [...parent.fields].concat({ ...newData, id: +transformHelpers.nanoid(4) });
    // заменяем parent
    data.splice(parentIndex, 1, parent);
    setTableData([...data]);
  };

  const onAddArray = () => {
    const data = [...tableData];

    // добавляем новый массив с пустой строкой
    setTableData(
      data.concat({
        id: +transformHelpers.nanoid(5),
        arrayNames: [],
        fields: [
          {
            targetArray: '',
            sourceField: '',
            type: 'STRING',
            tableData: { id: 0, editing: 'add' },
            isNew: true,
            id: +transformHelpers.nanoid(4),
          },
        ],
      }),
    );
  };

  const onEditField = (parentIndex: number, index: number, newData: ITransformData) => {
    const data = [...tableData];
    const parent = { ...data[parentIndex] };

    const fields = [...parent.fields];
    // удаляем элемент с индексом index из массива fields
    fields.splice(index, 1, { ...newData });
    // обновляем fields с учетом удаленного элемента
    parent.fields = fields;

    // заменяем parent
    data.splice(parentIndex, 1, parent);

    setTableData([...data]);
  };

  const onEditArray = (id: number, newData: ITransformData[]) => {
    const data = [...tableData];

    const parentIndex = findIndex(id, data);

    const parent = { ...data[parentIndex] };
    const fields = [...parent.fields];
    const changes = [...newData];

    changes.forEach(({ tableData, ...data }) => {
      if (tableData) {
        fields.splice(tableData.id, 1, { ...data });
      }
    });

    // обновляем fields с учетом обновленных элементов
    parent.fields = fields;

    // заменяем parent
    data.splice(parentIndex, 1, parent);

    setTableData([...data]);
  };

  const onEditArrayNames = (id: number, arrayNames: string[], parentIndex: number) => {
    const data = [...tableData];

    data[parentIndex].arrayNames = arrayNames;
    setTableData([...data]);
  };

  return (
    <TransformArrayView
      data={tableData}
      displayError={displayError}
      schema={schema}
      processing={processing}
      typesDictionary={typesDictionary}
      onDeleteArray={onDeleteArray}
      onDeleteField={onDeleteField}
      onAddField={onAddField}
      onAddArray={onAddArray}
      onEditField={onEditField}
      onEditArray={onEditArray}
      onEditArrayNames={onEditArrayNames}
    />
  );
};
