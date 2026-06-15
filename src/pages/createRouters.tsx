import { PVMMindProps } from '@pvm-ui/pvm-navigation';
import { createBrowserRouter } from 'react-router';

import routes from '@src/Shared/constants/routes';
import Page404WithNavigate from '@src/Shared/ui/ErrorPage/Page404WithNavigate';
import PageErrorCodeWithNavigate from '@src/Shared/ui/ErrorPage/PageErrorCodeWithNavigate';
import RouteListener from '@src/Shared/ui/RouteListener';

import CheckAccessPage from './CheckAccessPage';

interface CreateRouterProps {
  availableRoutes: PVMMindProps['availableRoutes'];
  basename: PVMMindProps['basename'];
}

export const createRouters = ({ availableRoutes, basename }: CreateRouterProps) =>
  createBrowserRouter(
    [
      {
        Component: () => <RouteListener basename={basename} />,
        children: [
          {
            Component: () => <CheckAccessPage hasAccessPage={availableRoutes.some((route) => route.route === routes.ARCHIVES)} />,
            children: [
              {
                path: routes.ARCHIVES,
                lazy: async () => {
                  const { default: ArchivesPage } = await import('./ArchivesPage');
                  return { Component: ArchivesPage };
                },
                errorElement: <PageErrorCodeWithNavigate />,
              },
            ],
          },
          {
            Component: () => <CheckAccessPage hasAccessPage={availableRoutes.some((route) => route.route === routes.ARCHIVES)} />,
            children: [
              {
                path: routes.ARCHIVES_EDIT,
                lazy: async () => {
                  const { default: ArchivesEditPage } = await import('./ArchivesEditPage');
                  return { Component: ArchivesEditPage };
                },
                errorElement: <PageErrorCodeWithNavigate />,
              },
            ],
          },
          { path: '*', element: <Page404WithNavigate /> },
        ],
      },
    ],
    { basename: basename },
  );
