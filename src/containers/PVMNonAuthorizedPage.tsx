import { Box, Container, CssBaseline, Typography } from '@material-ui/core';
import * as React from 'react';

export default function PVMNonAuthorizedPage() {
  return (
    <Box
      sx={{
        display: 'flex',
        flexDirection: 'column',
        position: 'fixed',
        top: '35%',
        left: 'calc(50% - 276px)',
      }}
    >
      <CssBaseline />
      <Container component="main" sx={{ mt: 8, mb: 2 }} maxWidth="sm">
        <Typography variant="h3" component="h1" gutterBottom color={'primary'}>
          Вы не авторизованы
        </Typography>
        <Typography variant="h5" component="h2" gutterBottom color={'primary'}>
          {'Пожалуйста, перейдите на вкладку общей авторизации.'}
        </Typography>
      </Container>
    </Box>
  );
}
