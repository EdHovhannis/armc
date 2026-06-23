export function getTextForConfirm(data, action) {
  const act = action === 'OFF' ? 'выключить' : 'включить';
  const parts = Object.entries(data)
    .filter(([_, services]) => services.length > 0)
    .map(([zone, services]) => `в зоне ${zone} для  ${services.join(', ')}`);

  return `Вы уверены, что хотите ${act} настройки ${parts.join(' и ')}?`;
}
