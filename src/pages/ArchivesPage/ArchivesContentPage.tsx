import { FC } from 'react';

import DrawerRestriction from '@src/Widgets/Header/DrawerRestriction';

import ArchivesTable from './ArchivesTable';
import FilterDrawer from './FilterDrawer';
import ArchivesHeader from './Header';
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
    </div>
  );
};

export default ArchivesContentPage;
