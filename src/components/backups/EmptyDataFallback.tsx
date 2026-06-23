import { EmptyState, NotFoundErrorIllustration } from '@sds-eng/base';
import * as React from 'react';

export const EmptyDataFallback: React.FC = () => {
  return (
    <div style={{ padding: '20px', textAlign: 'center' }}>
      <EmptyState
        image={<NotFoundErrorIllustration />}
        heading="Ничего не найдено"
        description={'Попробуйте использовать другие фильтры'}
      ></EmptyState>
    </div>
  );
};
