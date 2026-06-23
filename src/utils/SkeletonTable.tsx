import { Grid, Paper } from '@material-ui/core';
import { Skeleton } from '@material-ui/lab';
import * as React from 'react';

export default function SkeletonTable() {
  const renderLine = (
    <React.Fragment>
      <Grid container direction={'row'} justifyContent={'center'} style={{ marginBottom: 16, width: '100%' }}>
        <Grid item style={{ width: 'calc(33% - 16px)', margin: 8 }}>
          <Skeleton animation="wave" height={20} style={{ marginBottom: 6 }} />
          <Skeleton animation="wave" height={20} width="80%" />
        </Grid>
        <Grid item style={{ width: 'calc(33% - 16px)', margin: 8 }}>
          <Skeleton animation="wave" height={20} style={{ marginBottom: 6 }} />
          <Skeleton animation="wave" height={20} width="30%" style={{ marginBottom: 6 }} />
        </Grid>
        <Grid item justifyContent={'flex-end'} style={{ width: 'calc(33% - 16px)', margin: 8 }}>
          <Skeleton animation="wave" height={20} width="70%" style={{ marginBottom: 6 }} />
        </Grid>
      </Grid>
    </React.Fragment>
  );

  const renderHeader = (
    <React.Fragment>
      <Grid container direction={'row'} justifyContent={'center'} style={{ marginBottom: 16, width: '100%' }}>
        <Grid item style={{ width: 'calc(33% - 26px)', marginRight: 10, marginLeft: 16 }}>
          <Skeleton animation="wave" height={24} width="70%" style={{ marginBottom: 6 }} />
        </Grid>
        <Grid item style={{ width: 'calc(33% - 10px)', marginRight: 10 }}>
          <Skeleton animation="wave" height={24} width="70%" style={{ marginBottom: 6 }} />
        </Grid>
        <Grid item style={{ width: 'calc(33% - 10px)', marginRight: 10 }}>
          <Skeleton animation="wave" height={24} width="70%" style={{ marginBottom: 6 }} />
        </Grid>
      </Grid>
    </React.Fragment>
  );

  return (
    <div style={{ display: 'flex', justifyContent: 'center', marginTop: 16 }}>
      <Paper style={{ width: '80%', marginTop: 16 }}>
        <Grid container direction={'row'} justifyContent={'space-between'} style={{ marginBottom: 16, marginTop: 16, width: '100%' }}>
          <Grid item style={{ marginLeft: 16, width: '70%' }}>
            <Skeleton animation="wave" height={32} width="50%" style={{ marginBottom: 6, marginLeft: 6 }} />
          </Grid>
          <Grid item style={{ width: 'calc(30% - 28px)', marginRight: 12 }}>
            <Skeleton animation="wave" height={32} width="90%" style={{ marginBottom: 6, marginLeft: 6 }} />
          </Grid>
        </Grid>
        {renderHeader}
        {renderLine}
        {renderLine}
        {renderLine}
        {renderLine}
        {renderLine}
      </Paper>
    </div>
  );
}
