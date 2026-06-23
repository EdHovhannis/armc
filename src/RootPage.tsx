import MomentUtils from '@date-io/moment';
import { createTheme, ThemeProvider } from '@material-ui/core';
import CssBaseline from '@material-ui/core/CssBaseline';
import blue from '@material-ui/core/colors/blue';
import green from '@material-ui/core/colors/green';
import { MuiPickersUtilsProvider } from '@material-ui/pickers';
import { PVMMindProps } from '@pvm-ui/pvm-navigation';
import React, { Suspense, useLayoutEffect } from 'react';
import { Provider } from 'react-redux';
import { BrowserRouter, Routes, Route } from 'react-router';
import { PersistGate } from 'redux-persist/integration/react';

import { LoadingSpinner } from './components/constraint/utils/LoadingSpinner';
import App from './containers/App';
import StatusSnackBar from './containers/StatusSnackBar';
import BackendProvider from './services/BackendProvider';
import { persistor, store } from './store/Store';
import RouteListener from './utils/RouteListener';

const theme = createTheme({
  palette: {
    primary: { main: green[500] },
    secondary: { main: blue[500] },
  },
  overrides: {
    MuiTableCell: {
      head: {
        color: 'rgba(0, 0, 0, 0.54)',
        fontSize: '0.75rem',
        fontWeight: 500,
        lineHeight: '1.5rem',
      },
    },
  },
});

export const RootPage: React.FC<PVMMindProps> = (props) => {
  const { basename } = props;

  useLayoutEffect(() => {
    BackendProvider.base_path = basename;
  }, [basename]);

  return (
    <BrowserRouter basename={basename}>
      <RouteListener basename={basename} />
      <Provider store={store}>
        <PersistGate loading={null} persistor={persistor}>
          <ThemeProvider theme={theme}>
            <MuiPickersUtilsProvider utils={MomentUtils}>
              <CssBaseline />
              <Routes>
                <Route
                  path="/*"
                  element={
                    <Suspense fallback={<LoadingSpinner />}>
                      <App basename={basename} />
                    </Suspense>
                  }
                />
              </Routes>
              <StatusSnackBar maxSnack={4} />
            </MuiPickersUtilsProvider>
          </ThemeProvider>
        </PersistGate>
      </Provider>
    </BrowserRouter>
  );
};
