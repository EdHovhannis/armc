import { Chip } from '@material-ui/core';
import { green, red } from '@material-ui/core/colors';
import * as React from 'react';

interface ChipsProps {
  data: any[];
  greenOperators: string[];
  onChange(ind: number): any;
  onDelete(ind: number): any;
}

export const Chips: React.FC<ChipsProps> = ({ data, greenOperators, onChange, onDelete }: ChipsProps) => {
  return (
    <>
      {data.map((element, ind) => {
        return (
          <Chip
            id={'chip' + ind}
            key={'chip' + ind}
            label={element.text}
            onDelete={() => onDelete(ind)}
            onClick={() => onChange(ind)}
            style={{
              backgroundColor: greenOperators.includes(element.operator) ? green[300] : red[300],
              color: 'white',
              marginRight: 4,
              marginBottom: 4,
              maxWidth: '100%',
            }}
            variant={'outlined'}
          />
        );
      })}
    </>
  );
};
