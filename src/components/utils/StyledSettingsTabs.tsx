import { createStyles, Theme, withStyles } from '@material-ui/core';
import Tab, { TabProps } from '@material-ui/core/Tab/Tab';
import Tabs from '@material-ui/core/Tabs/Tabs';
import * as React from 'react';

export const StyledSettingsTabs = withStyles({
  root: {
    borderBottom: '1px solid #e8e8e8',
  },
  indicator: {
    backgroundColor: '#ffffff',
  },
})(Tabs);

export const StyledSettingsTab = withStyles((theme: Theme) =>
  createStyles({
    root: {
      textTransform: 'none',
      minWidth: 72,
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
        color: '#ffffff',
        opacity: 1,
      },
      '&$selected': {
        color: '#ffffff',
        fontWeight: theme.typography.fontWeightMedium,
      },
      '&:focus': {
        color: '#ffffff',
      },
    },
    selected: {},
  }),
)((props: TabProps) => <Tab disableRipple {...props} />);
