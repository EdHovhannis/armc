import { FC } from 'react';

import DrawerRestriction from '@src/Widgets/Header/DrawerRestriction';

import AddInstanceModal from './AddInstanceModal';
import ArchivesTable from './ArchivesTable';
import DeleteConfigModal from './DeleteConfigModal';
import DeleteInstanceModal from './DeleteInstanceModal';
import FilterDrawer from './FilterDrawer';
import ArchivesHeader from './Header';
import InstanceActionModal from './InstanceActionModal';
import InstanceOverdraftModal from './InstanceOverdraftModal';
import InstanceQuotasModal from './InstanceQuotasModal';
import LabelsModal from './LabelsModal';
import OverDraftModal from './OverDraftModal';
import ResetOffsetModal from './ResetOffsetModal';
import ResetZoneOverdraftModal from './ResetZoneOverdraftModal';
import SetOffsetModal from './SetOffsetModal';
import * as styles from './styles.module.css';

const ArchivesContentPage: FC = () => {
  return (
    <div className={styles.page}>
      <ArchivesHeader />
      <div className={styles.tableSection}>
        <ArchivesTable />
      </div>
      <DrawerRestriction />
      <FilterDrawer />
      <LabelsModal />
      <OverDraftModal />
      <AddInstanceModal />
      <DeleteConfigModal />
      <DeleteInstanceModal />
      <InstanceActionModal />
      <InstanceOverdraftModal />
      <InstanceQuotasModal />
      <ResetZoneOverdraftModal />
      <ResetOffsetModal />
      <SetOffsetModal />
    </div>
  );
};

export default ArchivesContentPage;
