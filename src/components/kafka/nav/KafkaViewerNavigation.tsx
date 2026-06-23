import Button from '@material-ui/core/Button';
import Typography from '@material-ui/core/Typography';
import { KeyboardArrowLeft } from '@material-ui/icons';
import { Component } from 'react';
import * as React from 'react';

interface KafkaViewerNagivationProps {
  goBackClicked: () => void;
}

export default class KafkaViewerNavigation extends Component<KafkaViewerNagivationProps, any> {
  render(): React.ReactNode {
    return (
      <div style={{ display: 'flex', direction: 'row' as any, marginTop: 12 }}>
        <Typography variant={'h4'} style={{ opacity: 0.84, marginLeft: 12 }}>
          Просмотр
        </Typography>
        <Button
          color="primary"
          style={{ marginLeft: 24, marginTop: 5 }}
          onClick={() => {
            this.props.goBackClicked();
          }}
        >
          <KeyboardArrowLeft style={{ width: 18, height: 18 }} />
          <Typography style={{ marginLeft: 4 }}>Список топиков</Typography>
        </Button>
      </div>
    );
  }
}
