import { FC, memo } from 'react';
import { Outlet } from 'react-router';

import Page404WithNavigate from '@src/Shared/ui/ErrorPage/Page404WithNavigate';

interface CheckAccessPageProps {
  hasAccessPage: boolean;
}

const CheckAccessPage: FC<CheckAccessPageProps> = ({ hasAccessPage }) => {
  if (hasAccessPage) {
    return <Outlet />;
  }

  return <Page404WithNavigate />;
};

export default memo(CheckAccessPage);
