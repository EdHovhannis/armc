import { Button, Tooltip } from '@sds-eng/base';
import React from 'react';
interface ClearButtonProps {
  onClick: () => void;
  icon: React.ReactNode;
  tooltip: string;
}

const ToolbarButton: React.FC<ClearButtonProps> = ({ onClick, icon, tooltip }) => {
  return (
    <Tooltip
      dropdownProps={{
        content: tooltip,
        disablePortal: false,
        placement: 'bottom',
      }}
    >
      <Button.Icon icon={icon} onClick={onClick} />
    </Tooltip>
  );
};

export default ToolbarButton;
