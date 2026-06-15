import { Drawer, DrawerHeader } from '@sds-eng/base';
import { useUnit } from 'effector-react';
import { FC } from 'react';

import { $headerOpenRestrictionDrawer, onChangeHeaderOpenRestrictionDrawer } from '../model';

import DrawerRestrictionBody from './DrawerRestrictionBody';

const DrawerRestriction: FC = () => {
  const [open, onChangeHeaderOpenRestrictionDrawerFn] = useUnit([$headerOpenRestrictionDrawer, onChangeHeaderOpenRestrictionDrawer]);
  return (
    <Drawer open={open} onClose={() => onChangeHeaderOpenRestrictionDrawerFn(false)} width={1000}>
      <DrawerHeader onClose={() => onChangeHeaderOpenRestrictionDrawerFn(false)}>Ограничения</DrawerHeader>
      <DrawerRestrictionBody />
    </Drawer>
  );
};

export default DrawerRestriction;
