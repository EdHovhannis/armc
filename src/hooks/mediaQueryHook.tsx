import useMediaQuery from '@material-ui/core/useMediaQuery';
import React from 'react';

import { MediaQuery } from './types/mediaQuery';

export const withMediaQueries = (Component: any, mediaQueries: Array<MediaQuery>) => {
  return (props: any) => {
    const queryResult = {};
    mediaQueries.forEach((query) => {
      queryResult[query.name] = useMediaQuery(query.query);
    });

    return <Component queryResult={queryResult} {...props}></Component>;
  };
};
