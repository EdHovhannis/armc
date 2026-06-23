import { ERROR_NAME_REGEXP_STRING, NAME_REGEXP } from './Utils';

const ERROR_NAME_LENGTH = 'Вы ввели недопустимое количество символов. Разрешено использовать не менее 2 и не более 100 символов.';

export const getWarningText = (text: string): string => {
  if (text && text.length < 2) {
    return ERROR_NAME_LENGTH;
  } else if (text && text.length > 100) {
    return ERROR_NAME_LENGTH;
  } else if (text && !NAME_REGEXP.exec(text)) {
    return ERROR_NAME_REGEXP_STRING;
  }
  return '';
};
