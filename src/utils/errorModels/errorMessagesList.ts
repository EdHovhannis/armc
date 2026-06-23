const errorMessagesList = [
  {
    message: 'User already in organization',
    translation: 'Пользователь уже состоит в организации',
  },
  {
    message: 'Organization name taken',
    translation: 'Название организации занято',
  },
  {
    message: 'Organization name is empty',
    translation: 'Название организации не заполнено',
  },
  {
    message: 'data source with the same name already exists',
    translation: 'Источник данных с таким именем уже существует',
  },
  {
    message: 'Source already exist',
    translation: 'Источник данных уже существует',
  },
  {
    message: 'Request body is missing or invalid',
    translation: 'Тело запроса отсутствует или невалидно',
  },
  {
    message: 'Cannot find spans for requested trace',
    translation: 'Невозможно найти span для запрошенного id трейса',
  },
];

export const translateMessage = (message: string) => {
  const { translation } = errorMessagesList.find(({ message: errMessage }) => errMessage === message) ?? { translation: message };

  if (translation) return translation;
};
