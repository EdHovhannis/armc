import { Page404 } from '@pvm-ui/kit';
import { useCommonNavigate } from '@pvm-ui/pvm-navigation';
import { FC, memo } from 'react';

const Page404WithNavigate: FC = () => {
  const commonNavigate = useCommonNavigate();

  return <Page404 onClick={() => commonNavigate('/')} />;
};

export default memo(Page404WithNavigate);
