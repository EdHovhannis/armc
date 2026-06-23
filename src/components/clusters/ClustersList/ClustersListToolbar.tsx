import { createStyles, createTheme, makeStyles, Toolbar, Typography } from '@material-ui/core';
import * as React from 'react';

import ClustersListSearch, { IClustersListSearch } from './ClustersListSearch';

const ClustersListToolbar: React.FC<IClustersListSearch> = ({ search, handleSearch }: IClustersListSearch) => {
  const theme = createTheme({
    palette: {
      primary: {
        main: '#4CAF50',
      },
      secondary: {
        main: '#4CAF50',
      },
    },
  });

  const classes = makeStyles(() =>
    createStyles({
      title: {
        flex: '1 1 100%',
      },
    }),
  )();

  return (
    <Toolbar>
      <Typography className={classes.title} variant="h6" id="tableTitle" component="div">
        Кластеры
      </Typography>
      <ClustersListSearch search={search} handleSearch={handleSearch} />
    </Toolbar>
  );
};

export default ClustersListToolbar;
