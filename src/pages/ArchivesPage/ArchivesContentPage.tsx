import { FC } from 'react';

import DrawerRestriction from '@src/Widgets/Header/DrawerRestriction';

import AddInstanceModal from './AddInstanceModal';
import ArchivesTable from './ArchivesTable';
import DeleteConfigModal from './DeleteConfigModal';
import FilterDrawer from './FilterDrawer';
import ArchivesHeader from './Header';
import LabelsModal from './LabelsModal';
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
      <AddInstanceModal />
      <DeleteConfigModal />
    </div>
  );
};

export default ArchivesContentPage;
