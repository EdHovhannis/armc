import { Typography } from '@material-ui/core';
import * as React from 'react';

import { ERROR_500_MESSAGE } from '../containers/App';

import { ERROR_CODE } from './errorModels/errorCodes';
import { translateMessage } from './errorModels/errorMessagesList';
import { ERROR_TYPE } from './errorModels/errorTypes';
import extractErrorMessage from './errorModels/extractErrorMessage';

export interface Error {
  detail: string;
  error: string;
  errorCode: string;
  errorType: ERROR_TYPE;
  message: string;
  path: string;
  status: number;
  timestamp: string;
}

export interface ErrorMsg {
  message: {
    message: string;
    details?: JSX.Element;
  };
  details?: JSX.Element;
}
export class ErrorHandling {
  static getErrorMessage(
    error: Error,
    projectString: string,
    indexString: string,
    groupString: string,
    userString: string,
    topicName: string,
  ): string | undefined {
    if (error.message && (error.status === undefined || !ERROR_CODE[error.errorCode as keyof typeof ERROR_CODE])) {
      return translateMessage(error.message);
    }
    const errorMessage = ERROR_CODE[error.errorCode as keyof typeof ERROR_CODE]
      .replace(' %p', projectString)
      .replace(' %i', indexString)
      .replace(' %g', groupString)
      .replace(' %u', userString)
      .replace(' %t', topicName);

    if (error.errorCode === 'ABYSS_UNKNOWN_ERROR') {
      if (error.detail.includes('TopicAuthorizationException')) {
        return 'Ошибка авторизации при обращении к брокеру Kafka.';
      }
      if (error.message === 'Unknown error in kafka operation transaction') {
        return 'Неизвестная ошибка в транзакции операции Kafka.';
      }
      if (error.message === 'Internal Kafka execution error' && error.status === 500) {
        return extractErrorMessage(error.detail, error.message);
      }
    }
    if (error.errorCode === 'ABYSS_KAFKA_CLUSTER_IS_INVALID' && error.detail && error.errorType === ERROR_TYPE.INVALID_REQUEST) {
      return extractErrorMessage(error.detail, error.message);
    }

    if (ERROR_TYPE[error.errorType] === ERROR_TYPE.ABYSS_INTERNAL) {
      const errorMes = errorMessage ?? error.errorCode;
      return ERROR_500_MESSAGE + ' Код ошибки: ' + errorMes;
    }
    // errorMessage и error.message могут быть "пустой строкой"
    return errorMessage ?? error.message ?? 'Код ошибки неизвестен.';
  }

  static async handleError(
    result: any,
    error_502_str: string,
    projectString = '',
    indexString = '',
    groupString = '',
    userString = '',
    topicName = '',
  ): Promise<ErrorMsg> {
    try {
      const data: Error = result instanceof Response ? await result.json() : result;
      const msg = ErrorHandling.getErrorMessage(data, projectString, indexString, groupString, userString, topicName);
      return {
        message: {
          message: msg ?? 'Код ошибки неизвестен.',
          details: ErrorHandling.getDetailedError(data, msg),
        },
        details: ErrorHandling.getDetailedError(data, msg),
      };
    } catch (e) {
      if (result.status === 401) {
        return { message: { message: 'Вы не авторизованы.' } };
      } else {
        return { message: { message: error_502_str } };
      }
    }
  }

  static getDetailedError(error?: Error, message?: string) {
    if (error) {
      return (
        <React.Fragment>
          <Typography color={'error'} variant={'body2'}>
            detail: {error.detail}
          </Typography>
          <Typography color={'error'} variant={'body2'}>
            error: {error.error}
          </Typography>
          <Typography color={'error'} variant={'body2'}>
            errorCode: {error.errorCode}
          </Typography>
          <Typography color={'error'} variant={'body2'}>
            errorType: {error.errorType}
          </Typography>
          <Typography color={'error'} variant={'body2'}>
            message: {error.message}
          </Typography>
          <Typography color={'error'} variant={'body2'}>
            status: {error.status}
          </Typography>
          <Typography color={'error'} variant={'body2'}>
            path: {error.path}
          </Typography>
          <Typography color={'error'} variant={'body2'}>
            timestamp: {error.timestamp}
          </Typography>
        </React.Fragment>
      );
    } else {
      return (
        <Typography color={'error'} variant={'body2'}>
          error: {message}
        </Typography>
      );
    }
  }
}
