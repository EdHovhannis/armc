export const validateJmx = (value: any): string => {
  if (!value) return '';

  if (value.length > 1000) {
    return 'длина введенного значения не должна превышать 1000 символов';
  }

  const cleanValue = value.replace(/\s+/g, '');

  const jmxPattern = /^([a-zA-Z0-9.-]+:\d+)(,[a-zA-Z0-9.-]+:\d+)*$/;
  if (!jmxPattern.test(cleanValue)) {
    return 'Неверный формат. Используйте латиницу: host:port,host:port (без пробелов и кириллицы)';
  }
  const pairs = cleanValue.split(',');
  for (const pair of pairs) {
    const parts = pair.split(':');
    if (parts.length === 2) {
      const port = parseInt(parts[1], 10);
      if (isNaN(port) || port < 1 || port > 65535) {
        return 'Порт должен быть в диапазоне от 1 до 65535';
      }
    }
  }

  return '';
};
