import Button from '@material-ui/core/Button';
import Typography from '@material-ui/core/Typography';
import { Add, Visibility } from '@material-ui/icons';
import { Component } from 'react';
import * as React from 'react';

interface AllTasksNavigationProps {
  openStatisticClicked: () => void;
}

export default class AllTasksNavigation extends Component<AllTasksNavigationProps, any> {
  render() {
    return (
      <div style={{ display: 'flex', direction: 'row' as any, marginTop: 12 }}>
        <Typography variant={'h4'} style={{ opacity: 0.84, marginLeft: 24 }}>
          Список аналитических индексов
        </Typography>
        <Button
          color="primary"
          style={{ marginLeft: 24, marginTop: 5 }}
          onClick={(e) => {
            this.props.openStatisticClicked();
          }}
        >
          <Visibility style={{ width: 18, height: 18 }} />
          <Typography style={{ marginLeft: 4 }}>Статистика по таблицам</Typography>
        </Button>
      </div>
    );
  }
}
