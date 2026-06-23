import { Badge, createUseStyles, Icon } from '@sds-eng/base';
import React from 'react';

interface IFilterIconProps {
  content?: React.ReactNode;
}

const FilterIcon: React.FC<IFilterIconProps> = ({ content }) => {
  const useStyles = createUseStyles({
    dot: {
      height: '8px !important',
    },
  });
  const classes = useStyles();
  return (
    <Badge stroke={false} classes={{ dot: classes.dot }} content={content} dot>
      <Icon.Filter />
    </Badge>
  );
};

export default FilterIcon;
