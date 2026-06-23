import { Typography } from '@material-ui/core';
import * as React from 'react';

interface IPageTitle {
  title: string;
  variant?: 'h1' | 'h2' | 'h3' | 'h4' | 'h5' | 'h6';
}

export const PageTitle: React.FC<IPageTitle> = ({ title, variant }: IPageTitle) => {
  return (
    <Typography variant={variant ?? 'h4'} style={{ opacity: 0.84, marginLeft: 24 }}>
      {title}
    </Typography>
  );
};
