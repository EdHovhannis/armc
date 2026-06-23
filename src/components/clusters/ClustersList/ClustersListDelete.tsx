import { Button, Dialog, DialogContent, DialogTitle, Grid } from '@material-ui/core';
import * as React from 'react';

interface IClustersListDelete {
  visible: boolean;
  onConfirm(): void;
  onCancel(id: null): void;
}

const ClustersListDelete: React.FC<IClustersListDelete> = ({ visible, onConfirm, onCancel }: IClustersListDelete) => {
  return (
    <Dialog fullWidth open={visible}>
      <DialogTitle>Вы уверены что хотите удалить кластер?</DialogTitle>
      <DialogContent>
        <Grid container justifyContent="flex-end">
          <Grid item style={{ marginRight: 4 }}>
            <Button variant="outlined" color="primary" onClick={() => onConfirm()}>
              Удалить
            </Button>
          </Grid>
          <Grid item>
            <Button variant="outlined" color="primary" onClick={() => onCancel(null)}>
              Отмена
            </Button>
          </Grid>
        </Grid>
      </DialogContent>
    </Dialog>
  );
};

export default ClustersListDelete;
