import { Button, ButtonUploader, Icon, notification, Segment, SegmentGroup, Text, Tooltip } from '@sds-eng/base';
import { useUnit } from 'effector-react';
import { ChangeEvent, FC, useCallback } from 'react';
import { useNavigate } from 'react-router';

import routes from '@src/Shared/constants/routes';

import { createArchiveFx } from '@src/Entities/Archives/api';
import { ArchiveConfigPayload } from '@src/Entities/Archives/types';

import { SEGMENT_CONFIGURATIONS, SEGMENT_INSTANCES } from '@src/Features/TableView/constants';
import { $tableView, onChangeTableView, setRowSelection } from '@src/Features/TableView/model';
import { TableViewType } from '@src/Features/TableView/types';

import * as styles from './styles.module.css';

const readFileText = (file: File): Promise<string> =>
  new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(String(reader.result ?? ''));
    reader.onerror = () => reject(reader.error);
    reader.readAsText(file);
  });

const ArchivesHeader: FC = () => {
  const navigate = useNavigate();
  const [tableView, onChangeTableViewFn, setRowSelectionFn, createArchive] = useUnit([$tableView, onChangeTableView, setRowSelection, createArchiveFx]);

  const importArchiveConfig = useCallback(
    async (file?: File) => {
      if (!file) return;

      try {
        const config = JSON.parse(await readFileText(file)) as ArchiveConfigPayload;
        const project = config.source.kafka[0]?.project;

        if (!project) {
          notification({ title: 'В файле не указан проект источника Kafka', status: 'error' });
          return;
        }

        await createArchive({ project, body: config });
        notification({ title: 'Конфигурация импортирована', status: 'success' });
      } catch {
        notification({ title: 'Не удалось импортировать конфигурацию', status: 'error' });
      }
    },
    [createArchive],
  );

  const handleUpload = useCallback(
    (_files: unknown[], event: ChangeEvent<HTMLInputElement>) => {
      void importArchiveConfig(event.target.files?.[0]);
    },
    [importArchiveConfig],
  );

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
              onUpload={handleUpload}
            />
          </Tooltip>

          <Button size="md" icon={<Icon.Plus />} contentType="Icon" onClick={() => navigate(routes.ARCHIVES_EDIT)} />
        </div>
      </div>
    </>
  );
};

export default ArchivesHeader;
