import { Typography } from '@material-ui/core';
import * as React from 'react';

export function TitleWithNotify(title: string, notify?: false | string) {
  return (
    <>
      <Typography variant="h6">{title}</Typography>
      {notify && (
        <Typography variant="subtitle1" style={{ color: 'red' }}>
          {notify}
        </Typography>
      )}
    </>
  );
}
