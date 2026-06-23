import * as React from 'react';
import { useParams } from 'react-router';

import { withNavigation, WithNavigationProps } from '../../../components/utils/withNavigation';
import { Filter, KafkaQuery, KafkaRecord } from '../../../store/kafkaViewer/Types';
import BackNavigation from '../../utils/BackNavigation';
import { Loader } from '../../utils/Loader';

import TopicRowDetailForm from './TopicRowDetailForm';
import TopicRowsForm from './TopicRowsForm';
import TopicViewerSearchForm, { TopicViewerSearchFormProps } from './TopicViewerSearchForm';

export interface TopicViewerProps extends TopicViewerSearchFormProps, WithNavigationProps {
  recordIsFetching: boolean;
}

export interface TopicViewerDispatchProps {
  fetchTopics: () => void;
  topicIdChanged: (topicId: number) => void;
  filterValueChanged: (filter: string) => void;
  filterTypeChanged: (type: string) => void;
  maxRowsChanged: (maxRows: number) => void;
  maxRowsToScanChanged: (maxRowsToScan: number) => void;
  offsetTypeChanged: (offsetType: string) => void;
  searchRequested: (topic: number, query: KafkaQuery, okCallback: (records: Array<KafkaRecord>) => void) => void;
}

const TopicViewerForm: React.FC<TopicViewerProps & TopicViewerDispatchProps> = (props) => {
  const params = useParams();
  const [records, setRecords] = React.useState<Array<KafkaRecord>>([]);
  const [selectedRecord, setSelectedRecord] = React.useState<any>('');
  const [isJSON, setIsJSON] = React.useState<boolean>(true);
  const [topicId, setTopicId] = React.useState<number>(() => {
    if (params && params.id) {
      const id = parseInt(params.id);
      props.topicIdChanged(id);
      return id;
    }
    return props.topicId;
  });

  React.useEffect(() => {
    props.fetchTopics();
  }, []);

  const constructNewFilter = (type: string, value: string): Filter => {
    if (type === 'disable') {
      return {
        type: 'true',
      };
    } else {
      return {
        type: type,
        pattern: value,
      };
    }
  };

  const handleRecordSelect = (record: string) => {
    try {
      const fixedJson = record.replace(/:\s*(\d+\.?\d*[Ee][+-]?\d+)/g, ': "$1"');
      setSelectedRecord(JSON.parse(fixedJson));
      setIsJSON(true);
    } catch (e) {
      setSelectedRecord(record);
      setIsJSON(false);
    }
  };

  const handleSearch = () => {
    if (props.topicId < 0) return;

    props.searchRequested(
      props.topicId,
      {
        maxRowsInResult: props.maxRowsInResult,
        maxRowsToScan: props.maxRowsToScan,
        offset: props.offsetType,
        filter: constructNewFilter(props.filterType, props.filterValue),
      },
      (newRecords) => {
        try {
          setRecords(newRecords);
          setIsJSON(true);
          setSelectedRecord(newRecords[0] ? JSON.parse(newRecords[0].value) : '');
        } catch (e) {
          setRecords(newRecords);
          setIsJSON(false);
          setSelectedRecord(newRecords[0] ? newRecords[0].value : '');
        }
      },
    );
  };

  return (
    <React.Fragment>
      <BackNavigation
        backString={'Список топиков'}
        titleString={'Просмотр'}
        goBackClicked={() => {
          props.navigate('/kafka/topics');
        }}
      />

      <div style={{ width: '100%', paddingBottom: 0, marginTop: 16 }}>
        <TopicViewerSearchForm
          receiveInProgress={props.receiveInProgress}
          maxRowsToScan={props.maxRowsToScan}
          filterValue={props.filterValue}
          topicId={topicId}
          maxRowsInResult={props.maxRowsInResult}
          offsetType={props.offsetType || 'EARLIEST'}
          topics={props.topics}
          filterType={props.filterType || 'contain'}
          filterValueChanged={(filter) => props.filterValueChanged(filter)}
          filterTypeChanged={(filterType) => props.filterTypeChanged(filterType)}
          topicIdChanged={(topicId) => props.topicIdChanged(topicId)}
          maxRowsChanged={(maxRows) => props.maxRowsChanged(maxRows)}
          maxRowsToScanChanged={(maxRowsToScan) => props.maxRowsToScanChanged(maxRowsToScan)}
          offsetTypeChanged={(offsetType) => props.offsetTypeChanged(offsetType)}
          searchRequested={handleSearch}
          navigate={props.navigate}
        />
      </div>
      {!props.receiveInProgress && (
        <React.Fragment>
          {!props.recordIsFetching && (
            <React.Fragment>
              <div style={{ width: '100%', marginTop: 6 }}>
                <TopicRowsForm records={records} recordSelected={handleRecordSelect} />
              </div>
              <div style={{ width: '100%', marginTop: 12 }}>
                <TopicRowDetailForm isJSON={isJSON} selectedRow={selectedRecord} />
              </div>
            </React.Fragment>
          )}
          {props.recordIsFetching && <Loader />}
        </React.Fragment>
      )}
    </React.Fragment>
  );
};

export default withNavigation(TopicViewerForm);
