import Typography from '@material-ui/core/Typography';
import React from 'react';

const BackupsDisabledBanner = () => {
  return (
    <Typography
      variant="body1"
      style={{
        textAlign: 'center',
        fontSize: '18px',
        fontWeight: 500,
        color: '#d32f2f',
        backgroundColor: 'rgba(244, 67, 54, 0.1)',
        border: '1px solid #ffcdd2',
        borderRadius: '8px',
        padding: '16px',
        margin: '16px 0',
        width: '100%',
      }}
    >
      Функционал резервного копирования отключен администратором
    </Typography>
  );
};

export default BackupsDisabledBanner;
