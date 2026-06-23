import { Grid } from '@material-ui/core';
import { Button } from '@sds-eng/base';
import * as React from 'react';
import { useState } from 'react';

import BackupsService from '../../../services/BackupsService';
import { IBackupsFilter, IFilterCollections } from '../types';

import { FilterExtended } from './FilterExtended';
import { FilterSelect } from './FilterSelect';

interface IFilter {
  filter: IBackupsFilter | null;
  indexes: Record<string, string[]>;
  projects: string[];
  zones: string[];
  visibleFields?: string[];
  notRequired?: string[];
  hideFields?: boolean;
  filterHandler(filter: IBackupsFilter): void;
  displayError(error: string): void;
}

export const Filter: React.FC<IFilter> = ({
  filter,
  indexes,
  projects,
  zones,
  visibleFields = [],
  notRequired = [],
  hideFields = false,
  filterHandler,
  displayError,
}: IFilter) => {
  const defaultZone = zones.length === 1 ? zones[0] : null;
  const [collectionList, setCollectionList] = useState<string[]>([]);
  const [isCollectionLoading, setIsCollectionLoading] = useState(false);
  const [internalFilter, setInternalFilter] = useState<IBackupsFilter>(filter || { projectShortName: '' });

  const [fieldsVisible, setFieldsVisible] = useState(true);

  React.useEffect(() => {
    if (internalFilter.projectShortName && internalFilter.taskName && internalFilter.zoneId) {
      setIsCollectionLoading(true);
      BackupsService.requestGet(
        null,
        { projectShortName: internalFilter.projectShortName, zoneId: internalFilter.zoneId, taskName: internalFilter.taskName },
        (data: IFilterCollections | null) => {
          if (data?.readCollections) {
            const collections = [...data.readCollections, ...data.writeCollections];
            setCollectionList(collections);

            const collectionParam = internalFilter.collection;
            if (collectionParam && collections.includes(collectionParam)) {
              setInternalFilter({ ...internalFilter, collection: collectionParam });
            } else {
              if (internalFilter) {
                setInternalFilter({ ...internalFilter, collection: undefined });
              }
            }
          }
        },
        (message: string) => {
          displayError(`Ошибка при получении данных для фильтра коллекции ${message.message}`);
        },
        'collections',
        true,
      ).finally(() => setIsCollectionLoading(false));
    }
  }, [internalFilter.projectShortName, internalFilter.taskName, internalFilter.zoneId]);

  React.useEffect(() => {
    if (!internalFilter.projectShortName || !internalFilter.taskName || !internalFilter.zoneId) {
      setInternalFilter({ ...internalFilter, collection: undefined });
    }
  }, [internalFilter.projectShortName, internalFilter.taskName, internalFilter.zoneId]);

  React.useEffect(() => {
    if (hideFields && internalFilter.collection) {
      setFieldsVisible(false);
    } else {
      setFieldsVisible(true);
    }
  }, [hideFields, internalFilter.collection]);

  const applyButtonOnClick = () => {
    if (
      !internalFilter.projectShortName ||
      internalFilter.projectShortName === '' ||
      (!internalFilter.taskName && !notRequired.includes('index')) ||
      (!internalFilter.zoneId && !notRequired.includes('zone'))
    )
      return;
    filterHandler(internalFilter);
  };

  const applyDisabled =
    !internalFilter.projectShortName ||
    (!internalFilter.taskName && !notRequired.includes('index')) ||
    (!internalFilter.zoneId && !notRequired.includes('zone'));

  return (
    <div style={{ padding: '30px 20px 0' }}>
      <Grid container spacing={3} xs={12} alignItems="center">
        <Grid item xs={3}>
          <FilterSelect
            searchable
            required
            label={'Проект'}
            value={internalFilter.projectShortName}
            values={projects}
            onChange={(value) => {
              setCollectionList([]);
              setInternalFilter({
                ...internalFilter,
                projectShortName: value || undefined,
                zoneId: defaultZone,
                taskName: undefined,
                collection: undefined,
              });
            }}
          />
        </Grid>
        <Grid item xs={3}>
          <FilterSelect
            searchable
            label={'Индекс'}
            value={internalFilter.taskName || null}
            values={indexes[internalFilter.projectShortName ?? ''] ?? []}
            required={!notRequired.includes('index')}
            allowEmpty={notRequired.includes('index')}
            disabled={!internalFilter.projectShortName}
            onChange={(value) => {
              setCollectionList([]);
              setInternalFilter({ ...internalFilter, taskName: value || undefined, collection: undefined });
            }}
          />
        </Grid>
        <Grid item xs={3}>
          <FilterSelect
            label={'Зона'}
            value={internalFilter.zoneId || null}
            values={zones}
            required={!notRequired.includes('zone')}
            allowEmpty={notRequired.includes('zone')}
            disabled={zones.length === 1}
            onChange={(value) => {
              setCollectionList([]);
              setInternalFilter({ ...internalFilter, zoneId: value || undefined, collection: undefined });
            }}
          />
        </Grid>
        <Grid item xs={3}>
          <FilterSelect
            searchable
            allowEmpty
            label={'Коллекция'}
            value={internalFilter.collection || null}
            values={collectionList}
            disabled={!collectionList.length}
            loading={isCollectionLoading}
            onChange={(value) => {
              setInternalFilter({ ...internalFilter, collection: value as string });
            }}
          />
        </Grid>
        {fieldsVisible && visibleFields && (
          <FilterExtended
            backup={internalFilter.backupFilter ?? []}
            setBackup={(value) => {
              setInternalFilter({ ...internalFilter, backupFilter: value });
            }}
            corrupted={internalFilter.corrupted ?? null}
            setCorrupted={(value) => {
              setInternalFilter({ ...internalFilter, corrupted: value });
            }}
            period={{ from: internalFilter.fromFilter || null, to: filter?.toFilter || null }}
            setPeriod={(value) => {
              setInternalFilter({ ...internalFilter, fromFilter: value.from || undefined, toFilter: value.to || undefined });
            }}
            finish={internalFilter.finishFilter ?? null}
            setFinish={(value) => {
              setInternalFilter({ ...internalFilter, finishFilter: value || undefined });
            }}
            visibleFields={visibleFields}
          />
        )}
      </Grid>
      <Grid container spacing={3} xs={12} justifyContent="flex-end" style={{ paddingBottom: 30, paddingRight: 13 }}>
        <Button text="Применить" disabled={applyDisabled} style={{ marginTop: 10 }} onClick={() => applyButtonOnClick()} />
      </Grid>
    </div>
  );
};
