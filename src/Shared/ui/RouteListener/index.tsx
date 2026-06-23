import { onChangeCommonLocation, onResetCommonLocation } from '@pvm-ui/pvm-navigation';
import { FC, memo, useEffect } from 'react';
import { Outlet, useLocation } from 'react-router';

import routes from '@src/Shared/constants/routes';

const TITLES: Record<string, string> = {
  [routes.ARCHIVES]: 'Архивы',
  [routes.ARCHIVES_EDIT]: 'Архивы',
};

const RouteListener: FC<{ basename: string }> = ({ basename }) => {
  const location = useLocation();

  useEffect(() => {
    onChangeCommonLocation({ title: TITLES[location.pathname] || '404', basename: basename, pathname: location.pathname });
  }, [location.pathname, basename]);

  useEffect(() => {
    return () => {
      onResetCommonLocation();
    };
  }, []);

  return <Outlet />;
};

export default memo(RouteListener);
