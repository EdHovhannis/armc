import { createStyles, Theme, withStyles } from '@material-ui/core';
import Tab, { TabProps } from '@material-ui/core/Tab/Tab';
import Tabs from '@material-ui/core/Tabs/Tabs';
import * as React from 'react';

export const StyledTabs = withStyles({
  root: {
    borderBottom: '1px solid #e8e8e8',
  },
  indicator: {
    backgroundColor: '#4CAF50',
  },
})(Tabs);

export const StyledTab = withStyles((theme: Theme) =>
  createStyles({
    root: {
      textTransform: 'none',
      minWidth: 72,
      maxWidth: '100%',
      fontWeight: theme.typography.fontWeightRegular,
      marginRight: theme.spacing(4),
      fontFamily: [
        '-apple-system',
        'BlinkMacSystemFont',
        '"Segoe UI"',
        'Roboto',
        '"Helvetica Neue"',
        'Arial',
        'sans-serif',
        '"Apple Color Emoji"',
        '"Segoe UI Emoji"',
        '"Segoe UI Symbol"',
      ].join(','),
      '&:hover': {
        color: '#4CAF50',
        opacity: 1,
      },
      '&$selected': {
        color: '#4CAF50',
        fontWeight: theme.typography.fontWeightMedium,
      },
      '&:focus': {
        color: '#4CAF50',
      },
    },
    selected: {},
  }),
)((props: TabProps) => <Tab disableRipple {...props} />);
