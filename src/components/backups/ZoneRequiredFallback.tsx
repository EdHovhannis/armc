import { AddIllustration, EmptyState } from '@sds-eng/base';
import * as React from 'react';

export const ZoneRequiredFallback: React.FC = () => {
  return (
    <div style={{ padding: '20px', textAlign: 'center' }}>
      <EmptyState image={<AddIllustration />} heading="Выберите зону"></EmptyState>
    </div>
  );
};
