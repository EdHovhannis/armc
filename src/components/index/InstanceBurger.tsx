import { IconButton } from '@material-ui/core';
import Menu from '@material-ui/core/Menu';
import MenuItem from '@material-ui/core/MenuItem';
import MenuIcon from '@material-ui/icons/Menu';
import { MENU_TYPE } from '@src/components/index/types';
import { User } from '@src/store/auth/Types';
import { OverdraftConfig } from '@src/store/overdraft/Types';
import { IndexOverviewDataNew } from '@src/utils/IndexUtils';
import * as React from 'react';

interface InstanceBurgerProps {
  data: IndexOverviewDataNew;
  displayError: (error: string) => void;
  user: User;
  isAdmin: boolean;
  isLimitFeatureSettingEnabled: boolean;
  countInstance: number;
  fulltextOverdraftConfig: OverdraftConfig;
  onClose: (
    type: MENU_TYPE,
    name: string,
    projectShortName: string,
    id?: number,
    canEditLabel?: boolean,
    zoneId?: string,
    overdraftPercent?: number,
    maxAvailableOverdraft?: number,
    rowData?: IndexOverviewDataNew,
  ) => void;
}

export const InstanceBurger = (props: InstanceBurgerProps) => {
  const [anchorEl, setAnchorEl] = React.useState<HTMLElement | null>(null);
  const { isLimitFeatureSettingEnabled, data, isAdmin, onClose, countInstance, fulltextOverdraftConfig } = props;

  const canRun = (data.flowActions.includes('EDIT') && data.indexActions.includes('EDIT')) || isAdmin;

  const handleClick = (event: React.MouseEvent<HTMLElement>) => setAnchorEl(event.currentTarget);
  const handleClose = () => setAnchorEl(null);

  return (
    <>
      <IconButton onClick={handleClick} aria-controls={'simple-menu'} id={'id' + data.id} size={'small'} color={'primary'}>
        <MenuIcon />
      </IconButton>
      <Menu id="simple-menu" anchorEl={anchorEl} keepMounted open={Boolean(anchorEl)} onClose={handleClose}>
        {canRun && (
          <MenuItem
            onClick={() => {
              onClose(MENU_TYPE.offset, data.name, data.project, undefined, undefined, undefined, undefined, undefined, data);
              handleClose();
            }}
          >
            Установить offset
          </MenuItem>
        )}
        {canRun && (
          <MenuItem
            disabled={data.status === 'RUNNING'}
            onClick={() => {
              onClose(MENU_TYPE.start, data.name, data.project, undefined, undefined, data.zoneId);
              handleClose();
            }}
          >
            Старт
          </MenuItem>
        )}
        {canRun && (
          <MenuItem
            disabled={data.status === 'STOPPED'}
            onClick={() => {
              onClose(MENU_TYPE.stop, data.name, data.project, undefined, undefined, data.zoneId);
              handleClose();
            }}
          >
            Стоп
          </MenuItem>
        )}
        {isAdmin && (
          <MenuItem
            disabled={data.maxAvailableOverdraft === 0}
            onClick={() => {
              onClose(
                MENU_TYPE.overdraft,
                data.name,
                data.project,
                undefined,
                undefined,
                data.zoneId,
                data.overdraftPercent,
                data.maxAvailableOverdraft,
              );
              handleClose();
            }}
          >
            Овердрафт скорости
          </MenuItem>
        )}
        {isAdmin && (
          <MenuItem
            onClick={() => {
              onClose(MENU_TYPE.rotation, data.name, data.project, undefined, undefined, data.zoneId);
              handleClose();
            }}
          >
            Запуск ротации
          </MenuItem>
        )}
        {canRun && (
          <MenuItem
            onClick={() => {
              onClose(MENU_TYPE.delete, data.name, data.project, undefined, undefined, data.zoneId);
              handleClose();
            }}
          >
            <div style={{ color: 'red', display: 'inline-flex' }}>Удалить</div>
          </MenuItem>
        )}
        {canRun && isLimitFeatureSettingEnabled && (
          <MenuItem
            onClick={() => {
              onClose(MENU_TYPE.redefine, data.name, data.project, undefined, undefined, undefined, undefined, undefined, data);
              handleClose();
            }}
          >
            Переопределить квоты экземпляра
          </MenuItem>
        )}
      </Menu>
    </>
  );
};
