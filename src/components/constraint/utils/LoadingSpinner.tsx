import { Loader } from '@src/components/utils/Loader';
import React from 'react';

export const LoadingSpinner = () => {
  return (
    <div style={{ textAlign: 'center', margin: 'auto' }}>
      <Loader />
    </div>
  );
};
