import { onChangeCommonLocationEvent, onResetCommonLocationEvent } from '@pvm-ui/pvm-navigation';
import { FC, useEffect, memo } from 'react';
import { useLocation } from 'react-router';

const TITLES: Record<string, string> = {
  '/kafka': 'Топики',
  '/flow': 'Обработка',
  '/index': 'Полнотекстовый индекс',
  '/monitoring': 'Аналитический индекс',
  '/dictionary': 'Справочники',
  '/archive': 'Архив',
  '/settings': 'Настройки',
  '/projects': 'Проекты',
  '/orgs': 'Организации',
  '/groups': 'Группы',
  '/constraint': 'Ограничения',
  '/blocks': 'Блокировки',
  '/tracing': 'Трейсинг',
  '/backups/control': 'Восстановление',
  '/backups/list': 'Резервные копии',
  '/backups/tasks': 'Задачи восстановления',
  '/backups/savepoints': 'Задачи восстановления (savepoint)',
  '/backups/incidents': 'Инциденты',
};

const RouteListener: FC<{ basename: string }> = ({ basename }) => {
  const location = useLocation();

  useEffect(() => {
    const [parentPathname, title] = Object.entries(TITLES).find(([key]) => location.pathname.includes(key)) || [, '404'];
    onChangeCommonLocationEvent({ title: title, basename: basename, pathname: location.pathname, parentPathname });

    return () => {
      onResetCommonLocationEvent();
    };
  }, [location.pathname, basename]);

  return <></>;
};

export default memo(RouteListener);
