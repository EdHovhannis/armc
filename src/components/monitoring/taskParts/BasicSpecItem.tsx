import { Grid, IconButton } from '@material-ui/core';
import Paper from '@material-ui/core/Paper';
import AddIcon from '@material-ui/icons/Add';
import DeleteIcon from '@material-ui/icons/Delete';
import * as React from 'react';

export interface SpecItemProps<T> {
  dataChanged(data: Array<T>);

  data: Array<T>;
  canEdit: boolean;
}

export interface SpecItemState<T> {
  data: Array<T>;
}

export default abstract class BasicSpecItem<T> extends React.Component<SpecItemProps<T>, SpecItemState<T>> {
  constructor(props: SpecItemProps<T>) {
    super(props);
    this.state = {
      data: props.data,
    };
  }

  abstract getContentElement(item: T, index: number): any;

  abstract getNewElement(): T;

  abstract getKeyOfElement(element: T, index: number): string;

  update() {
    this.setState({
      data: this.state.data,
    });
    this.props.dataChanged(this.state.data);
  }

  render() {
    return (
      <React.Fragment>
        <Paper style={{ padding: 12 }}>
          <Grid container justifyContent="space-between" alignItems="center" style={{ width: '100%' }} direction="column">
            {this.state.data.map((item, i) => {
              return (
                <Grid item container justifyContent="space-around" direction="row" style={{ width: '100%' }}>
                  <Grid item key={this.getKeyOfElement(item, i)} xs={11}>
                    <Grid container spacing={2} style={{ width: '100%' }} justifyContent="space-between">
                      {this.getContentElement(item, i)}
                    </Grid>
                  </Grid>
                  {this.props.canEdit && (
                    <Grid item xs={1}>
                      <IconButton
                        color="primary"
                        style={{ marginTop: 12 }}
                        onClick={() => {
                          this.state.data.splice(i, 1);
                          this.update();
                        }}
                      >
                        <DeleteIcon />
                      </IconButton>
                    </Grid>
                  )}
                </Grid>
              );
            })}
            {this.props.canEdit && (
              <IconButton
                color="primary"
                style={{ marginTop: 12, marginLeft: -16 }}
                onClick={() => {
                  this.state.data.push(this.getNewElement());
                  this.update();
                }}
              >
                <AddIcon />
              </IconButton>
            )}
          </Grid>
        </Paper>
      </React.Fragment>
    );
  }
}
