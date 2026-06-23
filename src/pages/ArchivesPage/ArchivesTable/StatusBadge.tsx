import { Icon, Text, clsx } from '@sds-eng/base';
import { FC, ReactNode } from 'react';

import { ArchiveIndexStatus } from '../types';

import * as styles from './styles.module.css';

const STATUS_LABELS: Record<ArchiveIndexStatus, string> = {
  RUNNING: 'RUNNING',
  STOPPED: 'STOPPED',
  FAILED: 'FAILED',
  UNDEFINED: 'UNDEFINED',
  WITHOUT_RESPONSE: 'WITHOUT RESPONSE',
};

const STATUS_ICONS: Record<ArchiveIndexStatus, ReactNode> = {
  RUNNING: <Icon.Play size={12} />,
  STOPPED: <Icon.Pause size={12} />,
  FAILED: <Icon.Close size={12} />,
  UNDEFINED: <Icon.Warning size={12} />,
  WITHOUT_RESPONSE: <Icon.Info size={12} />,
};

interface StatusBadgeProps {
  status: ArchiveIndexStatus;
}

const StatusBadge: FC<StatusBadgeProps> = ({ status }) => {
  return (
    <Text as="span" kind="textSn" className={clsx(styles.statusBadge, styles[`status_${status}`])}>
      {STATUS_ICONS[status]}
      {STATUS_LABELS[status]}
    </Text>
  );
};

export default StatusBadge;
