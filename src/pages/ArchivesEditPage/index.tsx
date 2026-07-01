import { useUnit } from 'effector-react';
import { FC } from 'react';
import { useSearchParams } from 'react-router';

import PageWrapper from '@src/Shared/ui/PageWrapper';

import { fetchArchiveConfigFx } from '@src/Entities/Archives/api';

import ArchivesEditContentPage from './ArchivesEditContentPage';

const ArchivesEditPage: FC = () => {
  const [searchParams] = useSearchParams();
  const editProject = searchParams.get('project')?.trim();
  const editName = searchParams.get('name')?.trim();
  const isEditMode = Boolean(editProject && editName);
  const isLoadingConfig = useUnit(fetchArchiveConfigFx.pending);

  return (
    <PageWrapper loading={isEditMode && isLoadingConfig} code={200} hasAccess>
      <ArchivesEditContentPage />
    </PageWrapper>
  );
};

export default ArchivesEditPage;
