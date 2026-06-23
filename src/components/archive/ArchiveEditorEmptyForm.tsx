import { Typography } from '@material-ui/core';
import Button from '@material-ui/core/Button';
import Grid from '@material-ui/core/Grid';
import * as React from 'react';

interface ArchiveEditorFormProps {
  message: string;
  captionButton: string;
  redirect(): any;
}

class ArchiveEditorEmptyForm extends React.Component<ArchiveEditorFormProps> {
  constructor(props) {
    super(props);
  }

  render() {
    return (
      <React.Fragment>
        <Grid container direction={'row'} style={{ padding: 16 }} justifyContent={'flex-start'}>
          <Grid item>
            <Typography variant="h6" color="primary">
              {this.props.message}
            </Typography>
          </Grid>
        </Grid>
        <Grid container direction={'row'} style={{ padding: 16 }} justifyContent={'flex-end'}>
          <Grid item>
            <Button
              onClick={() => {
                this.props.redirect();
              }}
            >
              {this.props.captionButton}
            </Button>
          </Grid>
        </Grid>
      </React.Fragment>
    );
  }
}

export default ArchiveEditorEmptyForm;
