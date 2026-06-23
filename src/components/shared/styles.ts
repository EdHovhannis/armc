import { CSSProperties } from '@material-ui/styles';

// Стили для компонент вывода данных квотирования
export const QUOTA_INFO_STYLES: Record<string, CSSProperties> = {
  table: {
    width: '100%',
    border: '1px solid #bdbdbd',
    borderCollapse: 'collapse',
    margin: '10px 0',
    '& td, & tr, & th': {
      border: '1px solid #bdbdbd',
    },
    '& td, & th': {
      verticalAlign: 'top',
      padding: '8px',
    },
    '& ul': {
      margin: 0,
      padding: 0,
      listStyle: 'none',
    },
  },
  limits: {
    width: '100%',
    marginTop: 10,
  },
  errorText: {
    color: '#FF0000',
  },
  infoText: {
    color: '#4CAF50',
  },
  warningText: {
    color: '#ffa500',
  },
  alertsWrapper: {
    display: 'flex',
    flexDirection: 'column',
    gap: '10px',
  },
};
