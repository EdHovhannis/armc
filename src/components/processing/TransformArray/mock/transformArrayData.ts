import { TransformArrayData } from '../types';

export const transformArrayDataMock: TransformArrayData = [
  {
    arrayName_1: [
      {
        sourceField: 'sourceField-1',
        targetArray: 'processing-targetArray-1',
        type: 'STRING',
      },
      {
        sourceField: 'sourceField-2',
        targetArray: 'processing-targetArray-2',
        type: 'STRING',
      },
      {
        sourceField: 'sourceField-3',
        targetArray: 'processing-targetArray-3',
        type: 'STRING',
      },
      {
        sourceField: 'sourceField-4',
        targetArray: 'processing-targetArray-4',
        type: 'STRING',
      },
    ],
  },
  {
    arrayName_2: [
      {
        sourceField: 'sourceField-1',
        targetArray: 'processing-targetArray-1-1',
        type: 'STRING',
      },
      {
        sourceField: 'sourceField-2',
        targetArray: 'processing-targetArray-1-2',
        type: 'STRING',
      },
    ],
  },
];
