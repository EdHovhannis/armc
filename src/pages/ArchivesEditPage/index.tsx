import { FC } from 'react';

import PageWrapper from '@src/Shared/ui/PageWrapper';

import ArchivesEditContentPage from './ArchivesEditContentPage';

const ArchivesEditPage: FC = () => {
  return (
    <PageWrapper loading={false} code={200} hasAccess>
      <ArchivesEditContentPage />
    </PageWrapper>
  );
};

export default ArchivesEditPage;
