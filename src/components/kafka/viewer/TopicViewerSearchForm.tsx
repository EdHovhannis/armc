import { Grid, Tooltip } from '@material-ui/core';
import CircularProgress from '@material-ui/core/CircularProgress';
import IconButton from '@material-ui/core/IconButton';
import Paper from '@material-ui/core/Paper';
import TextField from '@material-ui/core/TextField';
import { Add } from '@material-ui/icons';
import SearchIcon from '@material-ui/icons/Search';
import { Autocomplete } from '@material-ui/lab';
import * as React from 'react';

import KafkaAddRecordDialogContainer from '../../../containers/kafka/viewer/KafkaAddRecordDialogContainer';
import { KafkaTopic } from '../../../store/kafka/Types';
import { Loader } from '../../utils/Loader';

const OFFSETS = [
  { name: 'latest', value: 'LATEST' },
  { name: 'earliest', value: 'EARLIEST' },
];

export interface TopicViewerSearchFormProps {
  topics: Array<KafkaTopic>;
  topicId: number;
  filterType: string;
  filterValue: string;
  maxRowsInResult: number;
  maxRowsToScan: number;
  offsetType: string;
  receiveInProgress: boolean;
}

export interface TopicViewerSearchFormDispatchProps {
  topicIdChanged(topicId: number);

  filterTypeChanged(filter: string);

  filterValueChanged(filterValue: string);

  maxRowsChanged(maxRows: number);

  maxRowsToScanChanged(maxRowsToScan: number);

  offsetTypeChanged(offsetType: string);

  searchRequested();

  navigate: (property: string) => void;
}

interface TopicViewerSearchFormState {
  selectedTopic: number;
  isAddDialogOpened: boolean;
}

export default class TopicViewerSearchForm extends React.Component<
  TopicViewerSearchFormProps & TopicViewerSearchFormDispatchProps,
  TopicViewerSearchFormState
> {
  constructor(props) {
    super(props);
    this.state = {
      selectedTopic: this.props.topicId != null ? this.props.topicId : -1,
      isAddDialogOpened: false,
    };
  }

  renderSearch() {
    return (
      <React.Fragment>
        <Grid container style={{ width: '100%', marginTop: '6' }} justifyContent="center" alignItems="center" direction="row">
          <Grid item xs={12}>
            <Paper style={{ width: '100%', paddingLeft: 8 }}>
              <Grid
                container
                style={{ width: '100%', marginTop: '6' }}
                justifyContent="space-between"
                alignItems="center"
                direction="row"
                spacing={0}
              >
                <Grid item xs>
                  <Autocomplete
                    id="topic"
                    fullWidth={true}
                    options={this.props.topics}
                    defaultValue={this.props.topics.filter((topic) => topic.id === this.props.topicId)[0]}
                    getOptionLabel={(option) => option.name}
                    style={{ width: '100%', marginTop: 8 }}
                    onChange={(event, newValue: KafkaTopic) => {
                      this.props.topicIdChanged(newValue.id);
                      this.setState({ selectedTopic: newValue.id });
                      setTimeout(() => {
                        this.props.searchRequested();
                        this.props.navigate('/kafka/viewer/' + newValue.id);
                      }, 300);
                    }}
                    renderInput={(params) => <TextField {...params} label="Топик" variant="outlined" />}
                  />
                </Grid>

                <Grid item xs>
                  <Autocomplete
                    id="filter_type"
                    fullWidth={true}
                    options={['contain', 'regexp']}
                    defaultValue={this.props.filterType || 'contain'}
                    getOptionLabel={(option) => option}
                    style={{ width: '100%', marginTop: 8 }}
                    onChange={(event, newValue: string) => {
                      this.props.filterTypeChanged(newValue);
                    }}
                    renderInput={(params) => <TextField {...params} label="Filter type" variant="outlined" />}
                  />
                </Grid>
                <Grid item xs={4}>
                  <TextField
                    label="Filter Query"
                    margin="normal"
                    variant="outlined"
                    fullWidth
                    defaultValue={this.props.filterValue}
                    onChange={(e) => {
                      this.props.filterValueChanged(e.target.value);
                    }}
                  ></TextField>
                </Grid>
                <Grid item xs style={{ minWidth: 140 }}>
                  <TextField
                    label="Max rows in result"
                    margin="normal"
                    variant="outlined"
                    defaultValue={this.props.maxRowsInResult}
                    fullWidth
                    onChange={(e) => {
                      const value = parseInt(e.target.value);
                      this.props.maxRowsChanged(value);
                    }}
                  ></TextField>
                </Grid>

                <Grid item xs style={{ minWidth: 140 }}>
                  <TextField
                    label="Max rows to scan"
                    margin="normal"
                    variant="outlined"
                    defaultValue={this.props.maxRowsToScan}
                    fullWidth
                    onChange={(e) => {
                      const value = parseInt(e.target.value);
                      this.props.maxRowsToScanChanged(value);
                    }}
                  ></TextField>
                </Grid>
                <Grid item xs style={{ minWidth: 100 }}>
                  <Autocomplete
                    id="offsets"
                    fullWidth={true}
                    options={OFFSETS}
                    defaultValue={
                      OFFSETS.filter((offset) => offset.value === this.props.offsetType)[0] || {
                        name: 'latest',
                        value: 'LATEST',
                      }
                    }
                    getOptionLabel={(option) => option.name}
                    style={{ width: '100%', marginTop: 8 }}
                    onChange={(event, newValue: { name: string; value: string }) => {
                      this.props.offsetTypeChanged(newValue.value);
                    }}
                    renderInput={(params) => <TextField {...params} label="Offsets" variant="outlined" />}
                  />
                </Grid>

                <Grid item>
                  <Tooltip title={'Добавить сообщение в топик'}>
                    <IconButton
                      style={{ marginTop: 8, marginLeft: 8, marginRight: 8, width: 60 }}
                      onClick={(e) => {
                        this.setState({ isAddDialogOpened: true });
                      }}
                    >
                      <Add color="primary" fontSize={'small'} style={{ height: 30, width: 30 }} />
                    </IconButton>
                  </Tooltip>
                  <Tooltip title={'Поиск сообщений'}>
                    <IconButton
                      style={{ marginTop: 8, marginRight: 8, width: 60 }}
                      onClick={(e) => {
                        this.props.searchRequested();
                      }}
                    >
                      <SearchIcon color="primary" style={{ height: 30, width: 30 }} />
                    </IconButton>
                  </Tooltip>
                </Grid>
              </Grid>
            </Paper>
          </Grid>
        </Grid>

        <KafkaAddRecordDialogContainer
          isOpen={this.state.isAddDialogOpened}
          onAddDialogClose={() => {
            this.setState({
              isAddDialogOpened: false,
            });
          }}
          onAddCreateSuccess={() => {
            this.setState({
              isAddDialogOpened: false,
            });
          }}
          continueAdd={(isContinue) => {
            this.setState({
              isAddDialogOpened: isContinue,
            });
          }}
          topicId={this.state.selectedTopic}
        />
      </React.Fragment>
    );
  }

  render() {
    if (this.props.receiveInProgress) {
      return <Loader />;
    } else {
      return this.renderSearch();
    }
  }
}
