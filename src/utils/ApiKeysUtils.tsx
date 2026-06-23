import { Typography } from '@material-ui/core';
import * as React from 'react';

import { APIkeyInfo } from '../store/apiKeys/Types';

export class ApiKeysUtils {
  static recursiveFunction(
    selectedRows: APIkeyInfo[],
    result: any,
    prefixErrorString: string,
    fn: (user: string, okCallback?, errorCallback?) => void,
    onEnd: (endData: any) => void,
  ) {
    fn(
      selectedRows[0].user,
      () => {
        result.success.push(selectedRows[0]);
        selectedRows.splice(0, 1);
        if (selectedRows.length === 0) {
          if (result.errors.length > 0) {
            const errorString = (
              <React.Fragment>
                <Typography variant={'h5'} style={{ marginBottom: 4 }}>
                  <b>{prefixErrorString}</b>
                </Typography>
                <Typography variant="subtitle1">
                  {result.errors.map((error) => {
                    return <div>пользователь {error.row.user + ': ' + error.errorMsg.message + ''}</div>;
                  })}
                </Typography>
              </React.Fragment>
            );
            const errorDetailsString = (
              <React.Fragment>
                <Typography variant="body2" color={'error'}>
                  {result.errors.map((error) => {
                    return (
                      <React.Fragment>
                        <div>
                          <b>{error.row.user + ':'}</b>
                        </div>
                        <div>{error.errorMsg.details}</div>
                      </React.Fragment>
                    );
                  })}
                </Typography>
              </React.Fragment>
            );
            onEnd({ success: false, error: errorString, details: errorDetailsString });
          } else {
            onEnd({ success: true });
          }
          return result;
        } else {
          return this.recursiveFunction(selectedRows, result, prefixErrorString, fn, onEnd);
        }
      },
      (error: { message: string; details?: string }) => {
        result.errors.push({ row: selectedRows[0], errorMsg: error });
        selectedRows.splice(0, 1);
        if (selectedRows.length === 0) {
          const errorString = (
            <React.Fragment>
              <Typography variant={'h5'} style={{ marginBottom: 4 }}>
                <b>{prefixErrorString}</b>
              </Typography>
              <Typography variant="subtitle1">
                {result.errors.map((error) => {
                  return <div>пользователь {error.row.user + ': ' + error.errorMsg.message + ''}</div>;
                })}
              </Typography>
            </React.Fragment>
          );
          const errorDetailsString = (
            <React.Fragment>
              <Typography variant="body2" color={'error'}>
                {result.errors.map((error) => {
                  return (
                    <React.Fragment>
                      <div>
                        <b>{error.row.user + ':'}</b>
                      </div>
                      <div>{error.errorMsg.details}</div>
                    </React.Fragment>
                  );
                })}
              </Typography>
            </React.Fragment>
          );
          onEnd({ success: false, error: errorString, details: errorDetailsString });
          return result;
        } else {
          return this.recursiveFunction(selectedRows, result, prefixErrorString, fn, onEnd);
        }
      },
    );
  }
}
