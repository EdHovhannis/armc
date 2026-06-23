import { Tooltip } from '@material-ui/core';
import * as React from 'react';
import { FC } from 'react';

interface CellTextProps {
  title: string;
}

export const CellText: FC<CellTextProps> = ({ title }) => {
  const isLong = title?.length > 24;
  return isLong ? (
    <Tooltip title={title} placement="top" interactive>
      <div
        style={{
          paddingTop: '10px',
          maxWidth: '180px',
          overflow: 'hidden',
          textOverflow: 'ellipsis',
          whiteSpace: 'nowrap',
        }}
      >
        {title}
      </div>
    </Tooltip>
  ) : (
    <span>{title}</span>
  );
};
