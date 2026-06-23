import { PageErrorCode } from '@pvm-ui/kit';
import { useCommonNavigate } from '@pvm-ui/pvm-navigation';
import { FC, memo } from 'react';

const PageErrorCodeWithNavigate: FC = () => {
  const commonNavigate = useCommonNavigate();

  return <PageErrorCode onClick={() => commonNavigate('/')} onSupportClick={() => commonNavigate('/')} />;
};

export default memo(PageErrorCodeWithNavigate);
