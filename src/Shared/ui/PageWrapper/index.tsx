import { Page400, Page403, Page503, GlobalSpinner, Page500, Page520, Page502, Page504, Page401, PageErrorCode, Page404Backend } from '@pvm-ui/kit';
import { useCommonNavigate } from '@pvm-ui/pvm-navigation';
import { FC, ReactNode } from 'react';

interface PageWrapperProps {
  loading: boolean;
  hasAccess: boolean;
  code: number;
  children?: ReactNode;
}

const ErrorPage: Record<number, FC<{ onClick: () => void; active: string }>> = {
  [400]: (props) => <Page400 {...props} />,
  [401]: () => <Page401 active="Войти" onClick={() => window.location.reload()} />,
  [403]: (props) => <Page403 {...props} />,
  [404]: (props) => <Page404Backend {...props} />,
  [500]: (props) => <Page500 {...props} />,
  [502]: (props) => <Page502 {...props} />,
  [503]: (props) => <Page503 {...props} />,
  [504]: (props) => <Page504 {...props} />,
  [520]: (props) => <Page520 {...props} />,
};

const PageWrapper: FC<PageWrapperProps> = ({ loading, hasAccess, children, code }) => {
  const navigate = useCommonNavigate();

  if (loading) {
    return <GlobalSpinner />;
  }

  if (!hasAccess && code >= 400) {
    const CurrentPage = ErrorPage[code] || PageErrorCode;
    return <CurrentPage onClick={() => navigate('/')} active="Перейти на главную" />;
  }

  if (!hasAccess) {
    return <Page403 title="Ограниченный доступ" description="У Вас нет необходимых доступов для работы на странице" onClick={() => navigate('/')} />;
  }

  return children;
};

export default PageWrapper;
