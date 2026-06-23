import Grid from '@material-ui/core/Grid';
import { Text } from '@sds-eng/base';
import { ZoneSelector } from '@src/components/backups/ZoneSelector';
import * as React from 'react';

interface IPageHeader {
  title: string;
  zones: string[];
  selectedZone: string | null;
  onZoneChanged: (zone: string | null) => void;
}

export const PageHeader: React.FC<IPageHeader> = ({ title, zones, selectedZone, onZoneChanged }: IPageHeader) => {
  return (
    <Grid container wrap={'nowrap'} alignItems="center" justifyContent="space-between" style={{ padding: '16px 0 16px' }}>
      <Grid item>
        <Text kind={'h4b'} style={{ opacity: 0.84, fontSize: '24px', fontWeight: 600 }}>
          {title}
        </Text>
      </Grid>
      <Grid item style={{ minWidth: 352 }}>
        <ZoneSelector
          label={'Выберите зону'}
          zones={zones}
          selectedZone={selectedZone}
          onSelectedZoneChanged={(value: string | null) => {
            onZoneChanged(value);
          }}
        />
      </Grid>
    </Grid>
  );
};
