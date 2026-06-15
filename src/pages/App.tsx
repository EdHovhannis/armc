import { GlobalSpinner, DateFnsAdapter, russianLocale } from '@pvm-ui/kit';
import { PVMMindProps } from '@pvm-ui/pvm-navigation';
import { createTheme, dark, DateLibAdapterProvider, light, ThemeProvider } from '@sds-eng/base';
import { useUnit } from 'effector-react';
import { FC, Suspense, useEffect, useLayoutEffect } from 'react';
import { RouterProvider } from 'react-router';

import { onUpdateUrlProxy } from '@src/Shared/api/axios';

import { fetchProjectsFx } from '@src/Entities/Project/api';
import { fetchTopicsFx } from '@src/Entities/Topic/api';

import { createRouters } from './createRouters';

const lightTheme = createTheme(light);
const darkTheme = createTheme(dark);

const RoutesApp: FC<PVMMindProps> = ({ basename, theme, availableRoutes }) => {
  const router = createRouters({ basename, availableRoutes });
  const [onUpdateUrlProxyFn, fetchProjects, fetchTopics] = useUnit([onUpdateUrlProxy, fetchProjectsFx, fetchTopicsFx]);

  useLayoutEffect(() => {
    onUpdateUrlProxyFn(basename);
  }, [basename, onUpdateUrlProxyFn]);

  useEffect(() => {
    fetchProjects();
    fetchTopics();
  }, [fetchProjects, fetchTopics]);

  return (
    <DateLibAdapterProvider dateAdapter={DateFnsAdapter} options={{ locale: russianLocale }}>
      <ThemeProvider theme={theme === 'light' ? lightTheme : darkTheme}>
        <Suspense fallback={<GlobalSpinner />}>
          <RouterProvider router={router} />
        </Suspense>
      </ThemeProvider>
    </DateLibAdapterProvider>
  );
};

export default RoutesApp;
