import { Button, DialogContent, DialogTitle, Table, TableBody, TableCell, TableContainer, TableHead, TableRow } from '@material-ui/core';
import Dialog from '@material-ui/core/Dialog';
import * as React from 'react';

export const DetailsDialog: React.FC<{
  modal: any;
  setModal: (value: any) => void;
}> = ({ modal, setModal }) => {
  return (
    <Dialog fullWidth open={!!modal}>
      <DialogTitle style={{ marginBottom: -15 }}>Savepoints details</DialogTitle>
      <DialogContent>
        <div>ID: {modal.id ?? ''}</div>
        <div>Создан: {modal.createdAt ?? ''}</div>
        <div>Имя: {modal.savepointName ?? ''}</div>

        <TableContainer style={{ margin: '10px 0', maxHeight: 200 }}>
          <Table size="small">
            <TableHead>
              <TableRow>
                <TableCell>partition</TableCell>
                <TableCell>offset</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {modal?.kafkaOffsets?.map((row) => (
                <TableRow key={row.partition}>
                  <TableCell>{row.partition}</TableCell>
                  <TableCell>{row.offset}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>

        <div style={{ textAlign: 'right' }}>
          <Button onClick={() => setModal(false)}>Закрыть</Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};
