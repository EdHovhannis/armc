import { Icon, Text, clsx } from '@sds-eng/base';
import { ComponentPropsWithoutRef, ReactNode, forwardRef } from 'react';

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

interface StatusBadgeProps extends Omit<ComponentPropsWithoutRef<'span'>, 'onCopy'> {
  status: ArchiveIndexStatus;
  clickable?: boolean;
}

const StatusBadge = forwardRef<HTMLElement, StatusBadgeProps>(({ status, clickable, className, ...rest }, ref) => (
  <Text
    as="span"
    ref={ref}
    kind="textSn"
    className={clsx(styles.statusBadge, styles[`status_${status}`], clickable && styles.statusBadgeClickable, className)}
    {...rest}
  >
    {STATUS_ICONS[status]}
    {STATUS_LABELS[status]}
  </Text>
));

StatusBadge.displayName = 'StatusBadge';

export default StatusBadge;
