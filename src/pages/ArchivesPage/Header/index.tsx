import { Button, ButtonUploader, Icon, Segment, SegmentGroup, Text, Tooltip } from '@sds-eng/base';
import { useUnit } from 'effector-react';
import { FC } from 'react';
import { useNavigate } from 'react-router';

import routes from '@src/Shared/constants/routes';

import { SEGMENT_CONFIGURATIONS, SEGMENT_INSTANCES } from '@src/Features/TableView/constants';
import { $tableView, onChangeTableView, setRowSelection } from '@src/Features/TableView/model';
import { TableViewType } from '@src/Features/TableView/types';

import * as styles from './styles.module.css';

const ArchivesHeader: FC = () => {
  const navigate = useNavigate();
  const [tableView, onChangeTableViewFn, setRowSelectionFn] = useUnit([$tableView, onChangeTableView, setRowSelection]);

  return (
    <>
      <div className={styles.archiveHeaderWrapper}>
        <Text as="h2" kind="h3b">
          Архивные индексы
        </Text>

        <div className={styles.archiveHeaderControls}>
          <SegmentGroup
            size="md"
            value={tableView}
            onChange={(value) => {
              onChangeTableViewFn(value as TableViewType);
              setRowSelectionFn({});
            }}
          >
            <Segment value={SEGMENT_CONFIGURATIONS}>Конфигурации</Segment>
            <Segment value={SEGMENT_INSTANCES}>Экземпляры</Segment>
          </SegmentGroup>
          <Tooltip
            dropdownProps={{
              content: 'Импортировать конфигурациюиз файла',
              placement: 'top',
            }}
          >
            <ButtonUploader
              className={styles.archiveHeaderButtonUploader}
              components={{ Icon: Icon.Download }}
              size="md"
              view="secondary"
              onUpload={(files, e) => console.log(files, e)}
            />
          </Tooltip>

          <Button size="md" icon={<Icon.Plus />} contentType="Icon" onClick={() => navigate(routes.ARCHIVES_EDIT)} />
        </div>
      </div>
    </>
  );
};

export default ArchivesHeader;
