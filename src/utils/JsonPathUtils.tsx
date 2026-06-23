import { createTheme, ThemeProvider, Typography } from '@material-ui/core';
import jp from 'jsonpath';
import * as React from 'react';

import { DruidConfigurationInfo, SupervisorDruidConfigurationInfo } from '../store/monitoring/Types';

export const themeJsonColor = createTheme({
  palette: {
    primary: {
      main: '#1e88e5',
    },
    secondary: {
      main: '#ea9313',
    },
  },
});

export enum Colors {
  global = '#1e88e5',
  user = '#ea9313',
}

export class JsonPathUtils {
  static createJsonWithColoredInfo(indexConfiguration?: SupervisorDruidConfigurationInfo | DruidConfigurationInfo) {
    if (!indexConfiguration) {
      return;
    }

    //create JSON from string with JSON for work with JSONpath libs
    try {
      const data = JSON.parse(indexConfiguration.supervisorSpec);

      indexConfiguration.fromUserConfiguration.forEach((value) => {
        //add colors in JSON, then we will use this value to colored line in JSON and remove it
        jp.apply(data, value, function (value) {
          return value + Colors.user;
        });
      });
      indexConfiguration.fromGlobalConfiguration.forEach((value) => {
        //add colors in JSON, then we will use this value to colored line in JSON and remove it
        jp.apply(data, value, function (value) {
          return value + Colors.global;
        });
      });

      //create JSON string with new info about colors
      const resultJsonSpec = JSON.stringify(data, null, 2).split('\n');

      return (
        <React.Fragment>
          <ThemeProvider theme={themeJsonColor}>
            {resultJsonSpec.map((value) => {
              if (value.includes(Colors.global)) {
                return (
                  <Typography key={value} variant="body2" color={'primary'}>
                    {value.replace(Colors.global, '').replace(/ /g, '\u00a0')}
                  </Typography>
                );
              } else if (value.includes(Colors.user)) {
                return (
                  <Typography key={value} variant="body2" color={'secondary'}>
                    {value.replace(Colors.user, '').replace(/ /g, '\u00a0')}
                  </Typography>
                );
              } else {
                return (
                  <Typography key={value} variant="body2">
                    <span>{value.replace(/ /g, '\u00a0')}</span>
                  </Typography>
                );
              }
            })}
          </ThemeProvider>
        </React.Fragment>
      );
    } catch (e) {
      return (
        <React.Fragment>
          <Typography variant="body2">{indexConfiguration.supervisorSpec.replace(/ /g, '\u00a0')}</Typography>
        </React.Fragment>
      );
    }
  }

  static createJsonWithCommentInfo(indexConfiguration?: SupervisorDruidConfigurationInfo | DruidConfigurationInfo): string {
    const getParsedData = (data) => {
      const jsStr = JSON.stringify(data, null, 2).split('\n');
      let result = '';
      jsStr.map((value) => {
        if (value.includes(`${Colors.global}",`)) {
          value = value.replace(`${Colors.global}",`, `",//---------глобальная---------`);
        } else if (value.includes(`${Colors.global}"`)) {
          value = value.replace(`${Colors.global}"`, `"//---------глобальная---------`);
        } else if (value.includes(`${Colors.user}",`)) {
          value = value.replace(`${Colors.user}",`, `",//<<пользовательская>>`);
        } else if (value.includes(Colors.user)) {
          value = value.replace(`${Colors.user}"`, `"//<<пользовательская>>`);
        }
        result = result.concat(value.concat('\n'));
      });
      return result;
    };
    if (!indexConfiguration) {
      return '';
    }

    const data = JSON.parse(indexConfiguration.supervisorSpec);

    //create JSON from string with JSON for work with JSONpath libs
    try {
      indexConfiguration.fromUserConfiguration.forEach((value) => {
        //add colors in JSON, then we will use this value to colored line in JSON and remove it
        jp.apply(data, value, function (value) {
          return value + Colors.user;
        });
      });
      indexConfiguration.fromGlobalConfiguration.forEach((value) => {
        //add colors in JSON, then we will use this value to colored line in JSON and remove it
        jp.apply(data, value, function (value) {
          return value + Colors.global;
        });
      });
      return getParsedData(data);
    } catch (e) {
      return getParsedData(data);
    }
  }

  static getSupervisorSpec(indexConfiguration?: DruidConfigurationInfo): string {
    if (!indexConfiguration) {
      return '';
    }

    try {
      const data = JSON.parse(indexConfiguration.supervisorSpec);
      return JSON.stringify(data, null, 2);
    } catch (e) {
      return '';
    }
  }
}
