import { Button, DialogActions, DialogContent, FormControl, FormHelperText, MenuItem, Select, SelectProps, TextField } from '@material-ui/core';
import { difference } from 'lodash';
import * as React from 'react';

import { ShortArchiveTaskWithRole } from '../../../store/archive/Actions';
import { Zone } from '../../../store/zone/Types';

export interface Props {
  archiveTask: ShortArchiveTaskWithRole;
  allZones: Zone;
  onClose: () => void;
  createInstance: (zone: string, okCallback?: () => void) => void;
}

export const ArchiveTaskInstanceAddPopupForm: React.FC<Props> = (props) => {
  const { allZones, onClose, createInstance, archiveTask } = props;
  const availableToSelectZones = difference(
    allZones.availableZones,
    archiveTask.instances.map((instance) => instance.zoneId),
  );
  const [selectedZone, setSelectedZone] = React.useState(availableToSelectZones[0]);
  const onChangeZone: SelectProps['onChange'] = React.useCallback((e) => {
    setSelectedZone(e.target.value);
  }, []);
  const onCreateInstance = React.useCallback(() => {
    createInstance(selectedZone, () => {
      onClose();
    });
  }, [createInstance, selectedZone]);
  return (
    <>
      <DialogContent>
        <FormControl fullWidth style={{ marginBottom: '16px' }}>
          <TextField fullWidth disabled label="Название конфигурации" defaultValue={archiveTask.name} />
        </FormControl>
        <FormControl fullWidth>
          <Select fullWidth value={selectedZone} onChange={onChangeZone}>
            {allZones.availableZones.map((zone) => (
              <MenuItem value={zone} disabled={!availableToSelectZones.includes(zone)}>
                {zone}
              </MenuItem>
            ))}
          </Select>
          <FormHelperText>Конфигурация будет размещена в выбранной зоне</FormHelperText>
        </FormControl>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>отменить</Button>
        <Button onClick={onCreateInstance}>добавить</Button>
      </DialogActions>
    </>
  );
};
