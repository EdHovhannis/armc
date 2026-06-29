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
import LabelsModal from './LabelsModal';
import OverDraftModal from './OverDraftModal';
import ResetZoneOverdraftModal from './ResetZoneOverdraftModal';
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
      <ResetZoneOverdraftModal />
    </div>
  );
};

export default ArchivesContentPage;
