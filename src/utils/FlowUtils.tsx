import { Typography } from '@material-ui/core';
import * as React from 'react';

import { FlowInstance, FlowOverview, FlowInstanceExtended, FlowInstanceDetailedInfo } from '../store/flow/Types';

export class FlowUtils {
  static getFlowDetailData(overview: Array<FlowOverview>, selectedRowData: any): FlowInstanceDetailedInfo[] {
    const res: FlowInstanceDetailedInfo[] = [];
    const flows = overview.filter((element) => element.id === selectedRowData.id);
    const instances = flows && flows.length !== 0 ? flows[0].instances : [];
    if (instances) {
      instances.forEach((instance) => {
        res.push({
          id: instance.id,
          zoneId: instance.zoneId,
          jobId: instance.jobId,
          version: instance.version,
          duration: instance.duration,
          status: instance.status,
          canEdit: flows[0].canEdit,
          canManageAccess: flows[0].canManageAccess,
          useGlobalConsumerGroup: flows[0].useGlobalConsumerGroup,
        });
      });
    }
    return res;
  }

  static recursiveFunctionWithZoneIdAndFlowId(
    selectedRows: FlowInstanceExtended[],
    result: any,
    prefixErrorString: string,
    fn: (id: number, zoneId: string, okCallback?, errorCallback?) => void,
    onEnd: (endData: any) => void,
  ) {
    fn(
      selectedRows[0].flowId,
      selectedRows[0].zoneId,
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
                    return (
                      <div>{error.row.flowName + '/' + error.row.projectName + ' (' + error.row.zoneId + '): ' + error.errorMsg.message + ''}</div>
                    );
                  })}
                </Typography>
              </React.Fragment>
            );
            const detailString = (
              <React.Fragment>
                <Typography variant="body2" color={'error'}>
                  {result.errors.map((error) => {
                    return (
                      <React.Fragment>
                        <div>
                          <b>{error.row.flowName + '/' + error.row.projectName + ' (' + error.row.zoneId + '): '}</b>
                        </div>
                        <div>{error.errorMsg.details}</div>
                      </React.Fragment>
                    );
                  })}
                </Typography>
              </React.Fragment>
            );
            onEnd({ success: false, error: errorString, details: detailString });
          } else {
            onEnd({ success: true });
          }
          return result;
        } else {
          return this.recursiveFunctionWithZoneIdAndFlowId(selectedRows, result, prefixErrorString, fn, onEnd);
        }
      },
      (error) => {
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
                  return (
                    <div>{error.row.flowName + '/' + error.row.projectName + ' (' + error.row.zoneId + '): ' + error.errorMsg.message + ''}</div>
                  );
                })}
              </Typography>
            </React.Fragment>
          );
          const detailString = (
            <React.Fragment>
              <Typography variant="body2" color={'error'}>
                {result.errors.map((error) => {
                  return (
                    <React.Fragment>
                      <div>
                        <b>{error.row.flowName + '/' + error.row.projectName + ' (' + error.row.zoneId + '): '}</b>
                      </div>
                      <div>{error.errorMsg.details}</div>
                    </React.Fragment>
                  );
                })}
              </Typography>
            </React.Fragment>
          );
          onEnd({ success: false, error: errorString, details: detailString });
          return result;
        } else {
          return this.recursiveFunctionWithZoneIdAndFlowId(selectedRows, result, prefixErrorString, fn, onEnd);
        }
      },
    );
  }

  static formatTime(milliseconds) {
    // TIP: to find current time in milliseconds, use:
    // var  current_time_milliseconds = new Date().getTime();

    function numberEnding(number) {
      return number > 1 ? 's' : '';
    }

    let temp = Math.floor(milliseconds / 1000);
    const years = Math.floor(temp / 31536000);
    if (years) {
      return years + ' year' + numberEnding(years);
    }
    const days = Math.floor((temp %= 31536000) / 86400);
    if (days) {
      return days + ' day' + numberEnding(days);
    }
    const hours = Math.floor((temp %= 86400) / 3600);
    if (hours) {
      return hours + ' hour' + numberEnding(hours);
    }
    const minutes = Math.floor((temp %= 3600) / 60);
    if (minutes) {
      return minutes + ' minute' + numberEnding(minutes);
    }
    const seconds = temp % 60;
    if (seconds) {
      return seconds + ' second' + numberEnding(seconds);
    }
    return 'less than a second'; //'just now' //or other string you like;
  }
}
