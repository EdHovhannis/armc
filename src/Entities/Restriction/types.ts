// Тип объекта, на который вешается ограничение.
export type RestrictionObjectType = 'PROJECT' | 'INDEX';

// Элемент overview, обогащённый значением. Бэк в overview отдаёт только список объектов
// (без значений), maxSearchTimeIntervalSec догружаем отдельным GET по каждому объекту.
// objectId: INDEX - числовой id конфигурации ("25"); PROJECT - ключ проекта ("abyss_st2").
export type RestrictionObjectItem = {
  objectType: RestrictionObjectType;
  objectId: string;
  objectName: string;
  projectKey: string;
  maxSearchTimeIntervalSec: number | null;
};

// Глобальное ограничение для всех индексов - один скаляр в секундах.
export type RestrictionAllItem = {
  maxSearchTimeIntervalSec: number;
};

// Ответ GET по конкретному объекту (index/{id} или project/{key}).
// object перекрывает inherited; merged - эффективное (object если задан, иначе inherited).
export type RestrictionObjectResponse = {
  inheritedRestrictions: { maxSearchTimeIntervalSec: number } | null;
  objectRestrictions: { maxSearchTimeIntervalSec: number } | null;
  mergedRestrictions: { maxSearchTimeIntervalSec: number } | null;
};
