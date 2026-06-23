import React, { FC } from 'react';

export interface ITransformArrayTooltip {}

export const TransformArrayTooltip: FC<ITransformArrayTooltip> = (props: ITransformArrayTooltip) => {
  return (
    <p>
      <p>
        Преобразование массивов позволяет конвертировать массивы со вложенными объектами в простые массивы, а также задать новые наименования для
        массивов.
      </p>
      <p>В простые массивы будут преобразованы только те массивы, которые указаны в преобработчике. Не указанные массивы будут игнорироваться.</p>
      <p>Новые массивы будут автоматически добавлены в схему.</p>
      <p>Пример массива со вложенными объектами:</p>
      <p>
        {JSON.stringify(
          {
            param: [
              {
                name: 'test 1',
                value: 'sample 1',
              },
              {
                name: 'test 2',
                value: 'sample 2',
              },
            ],
          },
          null,
          '\t',
        )}
      </p>
      Пример сконвертированного массива:
      <p>
        {JSON.stringify(
          {
            anotherNameArray: ['test 1', 'test 2'],
            ExampleValue: ['sample 1', 'sample 2'],
          },
          null,
          '\t',
        )}
      </p>
    </p>
  );
};
