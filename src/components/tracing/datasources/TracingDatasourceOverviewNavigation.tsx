import Button from '@material-ui/core/Button';
import Typography from '@material-ui/core/Typography';
import { Add, Visibility } from '@material-ui/icons';
import { Component } from 'react';
import * as React from 'react';

interface TracingOverviewNavigationProps {
  openSearchClicked: () => void;
  openGraphClicked: () => void;
  createClicked: () => void;
  canCreate: boolean;
}

export default class TracingDatasourceOverviewNavigation extends Component<TracingOverviewNavigationProps, any> {
  render() {
    const { canCreate } = this.props;
    return (
      <div style={{ display: 'flex', direction: 'row' as any, marginTop: 12 }}>
        <Typography variant={'h4'} style={{ opacity: 0.84, marginLeft: 24 }}>
          Трейсинг
        </Typography>
        <Button
          color="primary"
          style={{ marginLeft: 24, marginTop: 5 }}
          onClick={(e) => {
            this.props.openSearchClicked();
          }}
        >
          <Visibility style={{ width: 18, height: 18 }} />
          <Typography style={{ marginLeft: 4 }}>Перейти к поиску</Typography>
        </Button>
        {canCreate && (
          <Button
            color="primary"
            style={{ marginLeft: 12, marginTop: 5 }}
            onClick={(e) => {
              this.props.createClicked();
            }}
          >
            <Add />
            <Typography style={{ marginLeft: 4 }}>Создать</Typography>
          </Button>
        )}
      </div>
    );
  }
}
