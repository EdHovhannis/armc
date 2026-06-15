import { GlobalSpinner, DateFnsAdapter, russianLocale } from '@pvm-ui/kit';
import { PVMMindProps } from '@pvm-ui/pvm-navigation';
import { createTheme, dark, DateLibAdapterProvider, light, ThemeProvider } from '@sds-eng/base';
import { useUnit } from 'effector-react';
import { FC, Suspense, useEffect, useLayoutEffect } from 'react';
import { RouterProvider } from 'react-router';

import { onUpdateUrlProxy } from '@src/Shared/api/axios';

import { fetchFeatureFlagFx } from '@src/Entities/FeatureFlags/api';
import {
  FEATURE_SETTINGS_LIMITS_FEATURE,
  FEATURE_SETTINGS_LIMITS_SETTING,
  FEATURE_SETTINGS_LIMITS_VALIDATION_STRICT_FEATURE,
  FEATURE_SETTINGS_LIMITS_VALIDATION_STRICT_SETTING,
} from '@src/Entities/FeatureFlags/constants';
import { fetchProjectsFx } from '@src/Entities/Project/api';
import { fetchTopicsFx } from '@src/Entities/Topic/api';

import { createRouters } from './createRouters';

const lightTheme = createTheme(light);
const darkTheme = createTheme(dark);

const RoutesApp: FC<PVMMindProps> = ({ basename, theme, availableRoutes }) => {
  const router = createRouters({ basename, availableRoutes });
  const [onUpdateUrlProxyFn, fetchProjects, fetchTopics, fetchFeatureFlag] = useUnit([
    onUpdateUrlProxy,
    fetchProjectsFx,
    fetchTopicsFx,
    fetchFeatureFlagFx,
  ]);

  useLayoutEffect(() => {
    onUpdateUrlProxyFn(basename);
  }, [basename, onUpdateUrlProxyFn]);

  useEffect(() => {
    fetchProjects();
    fetchTopics();
    fetchFeatureFlag({ setting: FEATURE_SETTINGS_LIMITS_SETTING, feature: FEATURE_SETTINGS_LIMITS_FEATURE });
    fetchFeatureFlag({ setting: FEATURE_SETTINGS_LIMITS_VALIDATION_STRICT_SETTING, feature: FEATURE_SETTINGS_LIMITS_VALIDATION_STRICT_FEATURE });
  }, [fetchProjects, fetchTopics, fetchFeatureFlag]);

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
