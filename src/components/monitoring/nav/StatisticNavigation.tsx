import Button from '@material-ui/core/Button';
import Typography from '@material-ui/core/Typography';
import { Add, KeyboardArrowLeft, Visibility } from '@material-ui/icons';
import { Component } from 'react';
import * as React from 'react';

interface StatisticNavigationProps {
  goBackClicked: () => void;
}

export default class StatisticNavigation extends Component<StatisticNavigationProps, any> {
  render(): React.ReactNode {
    return (
      <div style={{ display: 'flex', direction: 'row' as any, marginTop: 12 }}>
        <Typography variant={'h4'} style={{ opacity: 0.84, marginLeft: 24 }}>
          Просмотр статистики по таблицам
        </Typography>
        <Button
          color="primary"
          style={{ marginLeft: 24, marginTop: 5 }}
          onClick={() => {
            this.props.goBackClicked();
          }}
        >
          <KeyboardArrowLeft style={{ width: 18, height: 18 }} />
          <Typography style={{ marginLeft: 4 }}>Список задач</Typography>
        </Button>
      </div>
    );
  }
}
