import { FC } from 'react';

import PageWrapper from '@src/Shared/ui/PageWrapper';

import ArchivesContentPage from './ArchivesContentPage';

const ArchivesPage: FC = () => {
  return (
    <PageWrapper loading={false} code={200} hasAccess>
      <ArchivesContentPage />
    </PageWrapper>
  );
};

export default ArchivesPage;
