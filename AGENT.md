# mfe-armc — AGENT.md

## Обзор проекта

MFE (Micro Frontend) для просмотра и поиска архивных индексов; создания и редактирования конфигурации архивного индекса. Подключается к shell-приложению через Module Federation.

**Точка входа:** `src/index.ts` → `src/app.ts`  
**Главный компонент:** `src/pages/App.tsx` (принимает `PVMMindProps`: `basename`, `theme`, `availableRoutes`)

---

## Язык общения

Всегда отвечай и рассуждай в процессе работы на русском языке - текст ответов пользователю, объяснения, планы, ход рассуждений. Технические идентификаторы (имена файлов, переменных, команды, код) остаются как есть.

---

## Поддержка этого файла

AGENT.md - рабочая память агента по проекту. Правило: если в ходе задачи появилась или поменялась информация, которая пригодится при дальнейшей работе (расположение кода фич, паттерны, грабли библиотек, договорённости с бэком/продактом, статусы интеграции, открытые вопросы), сразу заноси её в подходящий раздел AGENT.md тем же изменением. Если правка кода делает написанное здесь неверным, исправь раздел, а не оставляй устаревшее. Не дублируй то, что очевидно из кода; фиксируй только то, что пришлось бы выяснять заново.

---

## ТехДолг / ToDo

Чек-лист того, что нужно доделать перед финальным завершением проекта. Подробный контекст по каждому пункту - у соответствующего тега `TODO(<tag>)` в коде; здесь только сводка, чтобы не потерять. Закрытый пункт - убирать отсюда.

**Ограничения (`Entities/Restriction`, `Widgets/Header/DrawerRestriction`):**

- Значения объектов в overview грузятся **по N запросов** (на каждый объект свой GET) - попросить бэк отдавать значения прямо в overview, чтобы не дудосить. `TODO(restrictions-api)`
- Единицы: подтвердить список (abyss выше недель не показывал), мес/год сейчас условные 30/365 дней (`restrictionSeconds.ts`).
- Снять fallback на моки + `mock.ts`, повесить `failData → handleErrorFx` когда бэк готов. `TODO(restrictions-api)`

**Фильтры списка (`FilterDrawer/mapFilters.ts`):** `TODO(archives-filter-api)` - подтвердить со стенда оставшиеся `field` (project/status/zone/version/диапазонные размеры) и единицы измерения диапазонов (`unit` сейчас не отправляется).

**Edit-страница (`/archives/edit`):** `TODO(archives-edit)` - читать `project`/`name` из query, определять режим редактирование/создание, грузить конфигурацию.

**Метки (`LabelsModal`, `Entities/Label`):** `TODO(labels)` - уточнить регистрозависимость у аналитика; `TODO(labels-api)` - снять fallback когда бэк готов.

**Прочие черновые интеграции** (снять fallback + повесить `handleErrorFx` при появлении бэка): `TODO(instance-api)` (добавление экземпляра, старт/стоп + статус-фетч), `TODO(archive-delete-api)` (удаление конфигурации), MOCK-тело в `Steps/api.ts` (`createSchemaFx`).

**Не реализовано:** пункты меню экземпляра кроме Старт/Стоп (offset, овердрафт, квоты, удаление - `TODO(instance-actions)`); локальный фильтр уровня 2 в заголовках столбцов.

---

## Команды

```bash
npm run start       # dev-сервер (rspack)
npm run build       # production-сборка
npm run lint        # eslint
npm run lint:fix    # eslint с автоисправлением
npm run pretty      # prettier
npm run check:tsc   # lint + tsc --noEmit
```

---

## Запуск и проверка в браузере

Приложение — remote Module Federation, **standalone не рендерится** (`app.ts` экспортирует только bridge-компоненты). Для визуальной проверки нужен **host**.

- **Host:** проект `mind-frontend` (`../mind-frontend` относительно `mfe-armc`), запуск `npm run dev` → `http://localhost:3000/`. Это оболочка для микрофронтендов с левым меню: «Процессы SberFlow», «Архивные индексы», «Координатор».
- **Этот MFE (`mfe-armc`):** запуск `npm run start` → `http://localhost:3090/`. Host подгружает его как remote по манифесту `http://localhost:3090/mf-manifest.json`.
- **Путь до приложения:** в host'е → «Архивные индексы» → «Архивы». Прямой URL: `http://localhost:3000/armc/archives` (и `/armc/archives/edit`).
- Для проверки нужны **оба** сервера: `mind-frontend` (`npm run dev`, :3000) и `mfe-armc` (`npm run start`, :3090).
- Если `:3090` не запущен → экран **«Ошибка в коде»** + в консоли `[Federation Runtime] #RUNTIME-003 Failed to get manifest`. Это незапущенный dev-сервер MFE, а не баг в коде.
- В dev бэкенд может отдавать 404/ошибки (проекты/топики/пользовательские данные) — норма при вёрстке без доступа к стенду.
- **Почему не приходят данные:** прокси хоста (`../mind-frontend/config/proxy.ts`) маршрут `/armc/armc_api` **уже содержит** (рерайт в `/coordinator/api` на хост `STAND_ABYSS` по HTTPS с клиентскими сертификатами). То есть дело не в отсутствии маршрута, а в том, что с машины вёрстки не достучаться до стенда: нет `.env` с `STAND_ABYSS`, нет сертификатов `certs/devpub.*` или нет сети/VPN до стенда. Это инфраструктура, из кода не лечится.
- **Вёрстка без стенда:** включить локальные API-моки флагом `ARMC_MOCK=true` в `.env` (см. раздел «Локальные API-моки»). Запросы к стенду подменяются фикстурами с реальными формами ответов, UI работает офлайн.

---

## Референсные проекты

- **`mfe-bamn-client`** (`../mfe-bamn-client` относительно `mfe-armc`) - соседний MFE той же платформы. Можно подсматривать сложившиеся паттерны и не изобретать своё. Например, общие обёртки `src/Features/Controllers/` (Controller react-hook-form + UI-компонент) сделаны по образцу оттуда.

---

## Старый проект abyss и обратная совместимость

Существует старый/действующий проект **abyss** - текущий прод-фронт функционала Архивных индексов. Сейчас мы переписываем этот фронт (он и есть `mfe-armc`). Бэк тоже переписывается, но **новый фронт должен сохранять обратную совместимость со старым бэком** - то есть работать и со старыми эндпоинтами/контрактами.

**Соглашение при работе с пользователем:** когда пользователь говорит «в старом проекте так» (или «в abyss так»), он приводит пример из abyss как **элемент ТЗ** - реальное поведение/эндпоинты/формы запросов, которые нужно воспроизвести. Это не «как было бы неплохо», а референс того, что должно работать. Пользователь обычно прикладывает конкретику (URL запросов, тексты модалок, порядок действий). Если из примера что-то непонятно - **уточняй вопросом**, не домысливай.

Пример снятых из abyss запросов: реальные URL стенда вида `https://platform-st.opsmon.sbt/.../abyss_api/coordinator/api/v1/internal/index/archive/...`. Полезная часть - хвост после `coordinator/api`, он и есть путь к эндпоинту (фронтовый префикс `/api/v1/internal/index` маппится в axios-путь `/v1/internal/index`, см. раздел HTTP-клиент).

### Где смотреть подробный референс в abyss

Исходники abyss лежат рядом - `../mfe-abyss` относительно `mfe-armc`. abyss на React class-компонентах + redux-thunk, поэтому фича размазана по слоям. Точки входа по функционалу Архивных индексов (от поведения к контракту):

- **`src/components/archive/`** - **главная точка входа**: презентационные компоненты и диалоги (`ArchiveOffsetDialog`, `ArchiveOverdraftDialog`, `ArchiveInstanceQuotasDialog`, таблицы экземпляров, `ArchiveTaskInstanceActions` - меню действий, форма редактора в `createArchiveParts/`). Отсюда берутся тексты модалок, валидации полей, порядок шагов, состав меню. Для «как фича выглядит и ведёт себя» этого обычно достаточно.
- **`src/services/ArchiveService.tsx`** и **`src/services/CommonService.tsx`** - **реальные HTTP-эндпоинты и тела запросов** (метод, путь, body, query). В трёх папках `archive/` эндпоинтов нет - они здесь. Нужны всегда, когда воспроизводим контракт.
- **`src/store/archive/`** - `Types.tsx` (DTO-типы ответов/запросов), `Actions.tsx` (redux-thunk: какой метод сервиса дёргается, рефетчи после действия, нотификации), `Reducer.tsx` (селекторы/форма состояния). Экшены только делегируют в `*Service`.
- **`src/containers/archive/`** - тонкие redux `connect()` (`mapStateToProps`/`mapDispatchToProps`), вспомогательно: связать колбэк компонента → экшен → метод сервиса.

Типичная трассировка контракта: компонент в `components/archive` → его контейнер в `containers/archive` (какой экшен) → `store/archive/Actions` (какой метод сервиса) → `services/ArchiveService` (URL + body).

---

## Стек технологий

| Категория       | Библиотека                                   |
| --------------- | -------------------------------------------- |
| Бандлер         | Rspack 2 (`rspack.config.dev/prod.ts`)       |
| UI-компоненты   | `@sds-eng/base`, `@sds-eng/data-grid`        |
| UI-kit (внутр.) | `@pvm-ui/kit`, `@pvm-ui/pvm-navigation`      |
| Стейт           | Effector 23 + effector-react + patronum      |
| Роутинг         | react-router 7                               |
| Формы           | react-hook-form 7                            |
| HTTP            | axios (обёрнут в `src/Shared/api/axios.ts`)  |
| Редактор кода   | ace-builds + react-ace                       |
| Таблица         | `@sds-eng/data-grid`                         |
| Виртуализация   | `@tanstack/react-virtual`                    |
| Даты            | date-fns 4, `@date-fns/tz`                   |
| CSS-утилиты     | `clsx` 2.x (условные классы)                 |
| TypeScript      | 6.x, strict mode, `noUncheckedIndexedAccess` |

---

## Архитектура (FSD — Feature Sliced Design)

Слои в порядке возрастания зависимости (нижние не импортируют верхние):

```
src/
  Shared/          # переиспользуемое: api, constants, types, ui-примитивы
  Entities/        # бизнес-сущности: Project, Topic, ActiveRow, InputFormat
  Features/        # изолированные фичи: TableView
  Widgets/         # крупные блоки UI: Header, DataGridTable, AceEditor, ArchiveEditStepper
  pages/           # страницы и роутер: App, ArchivesPage, ArchivesEditPage
```

Страницы могут иметь внутреннюю структуру для компонентов, которые слишком специфичны для Widgets:

```
pages/
  ArchivesPage/
    ArchivesTable/     # sub-компонент страницы (index.tsx, columns.tsx, StatusBadge.tsx, styles)
    Header/            # sub-компонент страницы
    mock/              # моковые данные для разработки (не для prod)
    index.tsx
    types.ts           # типы, специфичные для этой страницы
    styles.module.css
```

**Правило:** sub-компоненты страницы (в `PageName/ComponentName/`) — для UI, который используется только внутри одной страницы. Если компонент нужен в двух и более страницах — выносить в `Widgets/`.

**Один компонент — один файл (с ревью):** не держать несколько React-компонентов в одном файле, даже мелких вспомогательных. Каждый — в свой файл с дефолт-экспортом, prop-тип рядом. Пример из ревью: `FilterDrawerField` и `FilterDrawerRange` вынесены из `FilterDrawerBody.tsx` в отдельные файлы.

### Правило импортов (eslint `import/order`)

```
external (npm)
  → @pvm-ui/**
  → @sds-eng/**
  → @src/Shared/**
  → @src/Entities/**
  → @src/Features/**
  → @src/Widgets/**
  → @src/pages/**
  → parent/sibling/index
```

Между группами **всегда пустая строка** (`newlines-between: always`). Сортировка по алфавиту внутри группы.

### Path alias

`@src/*` → `./src/*` (настроен в `tsconfig.json` и `rspack.config`)

---

## Паттерны Effector

### Структура файлов в слайсе

- `model.ts` — stores (`$`) и events (`on`)
- `api.ts` — effects (`Fx`), `sample` для обработки ошибок

### Соглашения именования (enforced eslint)

- Store: `$camelCase` (напр. `$projects`, `$tableView`)
- Event: `onVerbNoun` (напр. `onChangeTableView`, `onUpdateUrlProxy`)
- Effect: `verbNounFx` (напр. `fetchProjectsFx`, `handleErrorFx`)

### Типичный паттерн API

`handleErrorFx` — стандартный обработчик ошибок, живёт в `src/Shared/api/model.ts`. Использовать его как `target` во всех effects — не создавать свои обработчики.

```ts
import { handleErrorFx } from '@src/Shared/api/model';
import { AxiosResponseError } from '@src/Shared/api/types';

export const fetchProjectsFx = createEffect<void, AxiosResponse<ProjectItem[]>, AxiosError<AxiosResponseError>>(async () => axios.get('/v1/...'));

sample({
  clock: fetchProjectsFx.failData,
  fn: ({ response, status }) => ({ title: 'Ошибка', status, message: response?.data.message, data: response?.data }),
  target: handleErrorFx,
});
```

### Паттерн «черновой интеграции» (эндпоинт ещё не реализован бэком)

Когда контракта на эндпоинт ещё нет, но сетевой слой нужно готовить (эталон — `src/Entities/Restriction/api.ts`):

- эффект шлёт **реальный** axios-запрос по ожидаемому пути — запрос виден в Network при отладке;
- при любой ошибке тихо возвращает мок (`try/catch` внутри эффекта) — UI остаётся рабочим;
- `failData → handleErrorFx` сознательно **не** подключается, иначе каждый рендер сыпал бы тостами об ошибках;
- над эффектами — комментарий `TODO(<фича>-api)` со списком шагов при интеграции (убрать fallback, подключить handleErrorFx, уточнить форму ответа).

При появлении реального бэка эффект переводится на стандартный «Типичный паттерн API» выше.

### Производные stores через `combine`

```ts
import { combine } from 'effector';

export const $optionsProject = combine($projects, (projects) => projects.map((p) => ({ value: p.name, label: p.name })));
```

### Отслеживание статуса effect через `patronum/status`

Используется вместо ручного `$pending` стора:

```ts
import { status } from 'patronum/status';

export const $fetchStatus = status({ effect: fetchProjectsFx });
// значения: 'initial' | 'pending' | 'done' | 'fail'
```

### Типичный паттерн store + event

```ts
export const $storeName = createStore<Type>(initialValue);
export const onChangeName = createEvent<Type>();
$storeName.on(onChangeName, (_, payload) => payload);
```

### Несколько источников у одного стора

Когда на стор завязано несколько событий/эффектов, не плодить отдельные `$store.on(...)` строки:

- одинаковый тип payload и общий обработчик - массив триггеров одним `.on`:
  ```ts
  $restrictionAll.on([fetchRestrictionAllFx.doneData, saveRestrictionAllFx.doneData], (_, payload) => payload);
  ```
- типы payload или обработчики разные - цепочка `.on(...).on(...)`:
  ```ts
  $store
    .on(onChangeName, (_, value) => value)
    .on(fetchSomethingFx.doneData, (_, response) => response.data);
  ```

### В компонентах — `useUnit` для сторов

Сторы (`$store`) читаем через `useUnit` - нужна реактивная подписка:

```ts
const value = useUnit($storeName);
```

**События и эффекты можно вызывать напрямую** - импортировать и дёргать прямо в компоненте, оборачивать в `useUnit` не нужно. Правило `effector/mandatory-scope-binding` убрано по требованию команды (2026-06-18):

```ts
import { onChangeName } from './model';
import { fetchProjectsFx } from './api';

useEffect(() => {
  fetchProjectsFx();
}, []);

const onClick = () => onChangeName(value);
```

`useUnit` для событий/эффектов больше не обязателен, но и не запрещён - существующий код с `useUnit([...])` менять не нужно. Юниты - стабильные импорты, в массив зависимостей `useEffect` их класть не требуется.

---

## UI-kit — @sds-eng

**Правило:** все UI-элементы берём из `@sds-eng/base` и `@sds-eng/data-grid`. Никогда не импортировать напрямую из `@v-uik/*` — это внутренняя зависимость kit'а.

### Как найти нужный компонент

1. Проверь список ниже
2. Если не нашёл — смотри типы: `node_modules/@sds-eng/base/dist/cjs/components/index.d.ts`
3. Для иконок — смотри файлы в `node_modules/@sds-eng/base/dist/cjs/icons/_generated/` (каждый файл = одна иконка)

### Компоненты @sds-eng/base

| Компонент                                          | Импорт                 | Ключевые пропсы                                                                                       |
| -------------------------------------------------- | ---------------------- | ----------------------------------------------------------------------------------------------------- |
| `Button`                                           | `@sds-eng/base`        | `view` (primary/secondary/negative), `size` (xs/sm/md), `icon`, `isLoading`                           |
| `Button.Icon`                                      | (sub-компонент Button) | `view`, `size` (xxs/xs/sm/md), `icon`, `aria-label`                                                   |
| `Text`                                             | `@sds-eng/base`        | `kind` — см. типографику ниже                                                                         |
| `Icon.*`                                           | `@sds-eng/base`        | `<Icon.Play size={12} />` — namespace с иконками                                                      |
| `Tooltip`                                          | `@sds-eng/base`        | `title`, `disabledArrow` (children — trigerring element)                                              |
| `TextField`                                        | `@sds-eng/base`        | `size`, `isBorderless`, `label`, `error`, `helperText`                                                |
| `Select` / `SelectNextProps`                       | `@sds-eng/base`        | `options`, `value`, `onChange`, `size`, `multiple`                                                    |
| `Autocomplete`                                     | `@sds-eng/base`        | поиск по опциям                                                                                       |
| `Checkbox`                                         | `@sds-eng/base`        | `checked`, `onChange`, `label`                                                                        |
| `Radio`                                            | `@sds-eng/base`        | `checked`, `onChange`, `value`                                                                        |
| `Switch`                                           | `@sds-eng/base`        | `checked`, `onChange`                                                                                 |
| `Drawer`                                           | `@sds-eng/base`        | `open`, `onClose`, `width`                                                                            |
| `DrawerHeader`                                     | `@sds-eng/base`        | `onClose`                                                                                             |
| `DrawerBody`                                       | `@sds-eng/base`        | контейнер контента                                                                                    |
| `DrawerFooter`                                     | `@sds-eng/base`        | футер Drawer                                                                                          |
| `Modal`                                            | `@sds-eng/base`        | `open`, `onClose`                                                                                     |
| `modal()`                                          | `@sds-eng/base`        | императивный вызов модала                                                                             |
| `ModalHeader` / `ModalBody` / `ModalFooter`        | `@sds-eng/base`        | части Modal                                                                                           |
| `notification()`                                   | `@sds-eng/base`        | toast: `notification({ title, description, status })` status: success/error/warning/info              |
| `NotificationContainer`                            | `@sds-eng/base`        | монтируется в App для показа уведомлений                                                              |
| `Stepper` / `Step`                                 | `@sds-eng/base`        | пошаговый wizard                                                                                      |
| `Tabs`                                             | `@sds-eng/base`        | вкладки                                                                                               |
| `Chip`                                             | `@sds-eng/base`        | небольшой тег/фильтр                                                                                  |
| `Badge`                                            | `@sds-eng/base`        | счётчик поверх элемента                                                                               |
| `Spinner`                                          | `@sds-eng/base`        | индикатор загрузки                                                                                    |
| `Skeleton`                                         | `@sds-eng/base`        | placeholder при загрузке                                                                              |
| `Pagination`                                       | `@sds-eng/base`        | компонент пагинации                                                                                   |
| `Divider`                                          | `@sds-eng/base`        | горизонтальный/вертикальный разделитель                                                               |
| `Card`                                             | `@sds-eng/base`        | карточка-контейнер                                                                                    |
| `List`                                             | `@sds-eng/base`        | список                                                                                                |
| `Link` / `BackLink`                                | `@sds-eng/base`        | ссылки                                                                                                |
| `Breadcrumbs`                                      | `@sds-eng/base`        | хлебные крошки                                                                                        |
| `Accordion`                                        | `@sds-eng/base`        | разворачиваемый блок                                                                                  |
| `EmptyState`                                       | `@sds-eng/base`        | заглушка пустого состояния                                                                            |
| `Tree`                                             | `@sds-eng/base`        | дерево узлов                                                                                          |
| `DatePicker` / `TimePicker`                        | `@sds-eng/base`        | выбор даты/времени                                                                                    |
| `InputNumber` / `InputPassword` / `MaskedInput`    | `@sds-eng/base`        | специализированные инпуты                                                                             |
| `Textarea`                                         | `@sds-eng/base`        | многострочный ввод                                                                                    |
| `FileUploader`                                     | `@sds-eng/base`        | загрузка файлов                                                                                       |
| `Popover`                                          | `@sds-eng/base`        | всплывающий блок у элемента                                                                           |
| `DropdownMenu`                                     | `@sds-eng/base`        | контекстное меню                                                                                      |
| `SegmentGroup` / `Segment`                         | `@sds-eng/base`        | toggle-группа (radio-button стиль): `size`, `value`, `onChange`; `<Segment value="x">Лейбл</Segment>` |
| `LabelControl`                                     | `@sds-eng/base`        | обёртка с лейблом для произвольных контролов                                                          |
| `ThemeProvider` / `createTheme` / `light` / `dark` | `@sds-eng/base`        | тема                                                                                                  |
| `DateLibAdapterProvider`                           | `@sds-eng/base`        | провайдер адаптера дат                                                                                |

### Нюансы компонентов (грабли)

- **`notification` — функция, а не объект с методами.** Статус задаётся пропом: `notification({ title, description, status })`, где `status: 'success' | 'error' | 'warning' | 'info'`. Методов `.success()/.error()` нет. Возвращает id; есть `notification.close(id)` / `notification.closeAll()`. Для тоста из effector — оборачивать вызов в эффект.
- **`ModalHeader` закрывается иначе, чем `DrawerHeader`.** У `DrawerHeader` есть `onClose`, а у `ModalHeader` — **нет**: кнопка закрытия включается через `showCloseButton` + `closeButtonProps={{ onClick }}`.
- **Полноширинный `Select`.** v-uik `Select` (combobox) по умолчанию по ширине контента. Растягивать — flex-обёрткой `flex: 1; min-width: 0` (как `.filterDrawerValueField` в `FilterDrawer`). `limitByWidth` делает ширину выпадашки равной ширине селекта. (`InputNumber.fullWidth` помечен deprecated — не полагаться на него.)
- **Размер контролов по умолчанию — `md`.** Дизайнер (Люба) рисует ~80% макетов в `md`, поэтому новые `TextField`/`Select`/`InputNumber` ставить `size="md"` (или дефолт `md` у обёрток `Controllers/`), если макет явно не требует `sm`. `sm` оставлен точечно - например inline-поля схемы в `SchemaFields`/`StepSchema` (`EditableFields`, `AccordionWithSearch`).

### Типографика (Text `kind`)

```
Заголовки:  displaySb, h1b, h2b, h3b, h4b, h5b, h6b
Тело:       bodyL, bodyM, bodyS, bodyXS, bodyXXS
Светлое:    bodyLightL, bodyLightM, bodyLightS, bodyLightXS, bodyLightXXS
Текст:      textLb, textMb, textSb, textXSb  (bold)
            textLn, textMn, textSn, textXSn  (normal)
```

### Иконки

```tsx
import { Icon } from '@sds-eng/base';

<Icon.Refresh />
<Icon.Play size={12} />
<Icon.Close />
<Icon.Filter />
<Icon.WarningFill />
<Icon.MenuKebab />
<Icon.ColumnThree />
<Icon.Add />
<Icon.Clear />
```

Полный список иконок: `node_modules/@sds-eng/base/dist/cjs/icons/_generated/` — каждый `.d.ts` файл = имя иконки.

### @sds-eng/data-grid

Форк [material-react-table v3](https://github.com/KevinVandy/material-react-table/tree/v3), переведённый на `@sds-eng/base`.

```tsx
import { DataGrid, DataGridColumnDef, DataGridTableInstance, ShowHideColumnsMenu } from '@sds-eng/data-grid';

const columns: DataGridColumnDef<MyRow>[] = [
  { accessorKey: 'name', header: 'Имя', size: 200, Cell: ({ cell }) => <Text kind="bodyS">{cell.getValue<string>()}</Text> },
];

<DataGrid
  data={rows}
  columns={columns}
  getRowId={(row) => row.id}
  layoutMode="semantic"
  enableStickyHeader
  enableRowSelection
  enablePagination
  enableTopToolbar
  enableBottomToolbar
  renderTopToolbar={({ table }) => <MyToolbar table={table} />}
  initialState={{ pagination: { pageSize: 20, pageIndex: 0 } }}
  localization={{ rowsPerPage: 'записей на странице' }}
/>;
```

#### Ширина колонок и контролов в ячейках

- В `layoutMode="grid"` колонки растягиваются по `flex-grow`, равному их `size`; `grow: true | false` в колонке — переопределение per-column.
- Контент ячейки оборачивается в `<span>` с `flex-grow: 0` (сжимается по контенту). Чтобы контрол (`Select`/`Input`) занял всю ширину колонки — растянуть эту обёртку:
  ```tsx
  // в колонке:
  tableBodyCellProps: { className: styles.myStretchCell },
  ```
  ```css
  .myStretchCell > * {
    flex: 1;
    min-width: 0;
  }
  ```

---

## Формы — react-hook-form

Все формы верстаются с использованием `react-hook-form 7`. Никакого локального `useState` для значений полей.

### Типичный паттерн формы

```tsx
import { useForm, Controller } from 'react-hook-form';

import { TextField } from '@sds-eng/base';

type FormValues = {
  name: string;
  count: number;
};

const {
  control,
  handleSubmit,
  formState: { errors },
} = useForm<FormValues>({
  defaultValues: { name: '', count: 0 },
});

const onSubmit = handleSubmit((data) => {
  // отправка данных
});
```

### Интеграция с @sds-eng/base через Controller

Компоненты `@sds-eng/base` (TextField, Select, Checkbox и др.) не реализуют стандартный `ref` от react-hook-form — подключать через `<Controller>`:

```tsx
<Controller
  name="name"
  control={control}
  rules={{ required: 'Обязательное поле' }}
  render={({ field, fieldState }) => <TextField {...field} label="Имя" error={!!fieldState.error} helperText={fieldState.error?.message} />}
/>
```

### Правила

- В `render` у `Controller` спредить в UI-компонент **весь** `field` (`{...field}`) — там кроме value/onChange есть onBlur, ref и др., которые нужны react-hook-form. Свои переопределения (`value`, обёрнутый `onChange`) ставить после спреда.
- `defaultValues` всегда задавать явно — иначе поля будут `undefined` до первого изменения
- Валидацию описывать в `rules` внутри `<Controller>` или через `resolver` (yup/zod)
- `formState.errors` читать через деструктуризацию из `useForm`, не пробрасывать вручную
- **Динамические имена полей** (`useFieldArray`, шаблонные пути вида `` `x.${i}.field` ``): использовать `useFormContext()` **без** generic — типизированный `useFormContext<T>()` ругается на такие пути (см. `StepInputData`). Значения читать/кастить вручную.

### Общие обёртки Controller (`src/Features/Controllers/`)

Готовые связки `Controller` + UI-компонент `@sds-eng/base`, работают через `useFormContext()` (форму оборачивать в `FormProvider`). Перед тем как писать свой `<Controller>` инлайном — проверить, не подходит ли одна из них. Везде спредится весь `field`, `name` — путь до поля формы (в т.ч. динамический).

| Обёртка                    | UI-компонент      | Значение в форме          |
| -------------------------- | ----------------- | ------------------------- |
| `ControllerSelectSingle`   | `Select`          | строка-значение опции     |
| `ControllerSelectMultiple` | `Select multiple` | массив строк-значений     |
| `ControllerTextField`      | `TextField`       | строка                    |
| `ControllerInputNumber`    | `InputNumber`     | число (принимает `rules`) |

Используются в `FilterDrawer` (фильтры) и `DrawerRestriction` (ограничения). Слишком специфичные контролы (виртуализированный Select с исключением выбранных — `EntitySelectCell`) остаются инлайн.

---

## Стили (CSS Modules)

Стили описываются в `styles.module.css` рядом с компонентом и импортируются как `import * as styles from './styles.module.css'`.

**Правило именования классов:** имя класса должно начинаться с camelCase-имени компонента/папки, к которому относится файл стилей — чтобы по имени класса было понятно, чьё оно. Без обобщённых имён вроде `.wrapper`, `.row`, `.cell`.

```css
/* src/Widgets/Header/DrawerRestriction/styles.module.css */
.drawerRestrictionIntervalCell { ... }   /* ✅ префикс drawerRestriction */
.drawerRestrictionFooter { ... }

/* ❌ так нельзя — нет принадлежности к компоненту */
.intervalCell { ... }
.footer { ... }
```

Так уже сделано в проекте: `filterDrawer*` (`FilterDrawer`), `archiveStep*` (`Steps`). При создании/изменении стилей соблюдать этот префикс и обновлять все `className={styles.*}` в компонентах.

---

## Стиль кода

- Переменные внутри колбеков и функций называть понятно и конкретно: `option` вместо `o`, `selected` вместо `v`, `item` вместо `i`. Однобуквенные имена допустимы только там, где это общепринятое соглашение (`e` для события). Код должен читаться без усилий.

### Форматирование (Prettier) - писать код сразу в формате

Чтобы после `npm run pretty` не оставалось правок, набирать код уже по `.prettierrc`. Ключевое - **`printWidth: 150`**: не разбивать JSX-детей, атрибуты, аргументы функций и массивы на несколько строк, пока строка укладывается в 150 символов. Частая ошибка - по привычке к узкому (80/100) printWidth разбивать то, что влезает в одну строку (например, текст внутри `<Text>...</Text>`).

| Настройка        | Значение | На что влияет при наборе                                        |
| ---------------- | -------- | --------------------------------------------------------------- |
| `printWidth`     | 150      | перенос на новую строку только при превышении 150 символов      |
| `singleQuote`    | true     | одинарные кавычки в JS/TS (в JSX-атрибутах - двойные)           |
| `semi`           | true     | точки с запятой обязательны                                     |
| `trailingComma`  | all      | висячая запятая в любых многострочных списках/аргументах        |
| `tabWidth`       | 2        | отступ 2 пробела                                                |
| `bracketSpacing` | true     | пробелы внутри фигурных скобок: `{ foo }`                       |

### Линтер (ESLint) - что чинится, а что нет

- `check:tsc` (= `lint` + `tsc --noEmit`) - это **pre-push** гейт. Запускает обычный `lint` **без `--fix`**: ничего не исправляет, только падает с ошибкой. Причём `lint` идёт **первым** - пока он не пройдёт, `tsc` не стартует (ошибок типов не увидишь). Чтобы починить автофиксимое - отдельно `npm run lint:fix`. Порядок при проверке своего кода: сначала `lint:fix`, потом `check:tsc`.
- **Автофиксом (`lint:fix`) чинится в основном `import/order`** - порядок групп и пустые строки между ними (см. раздел про импорты). На это можно положиться, но лучше писать сразу правильно.
- **НЕ чинится автофиксом - писать руками, иначе упадёт commit/push:**
  - `react-hooks/exhaustive-deps` (**error**, не warning) - в массив зависимостей `useEffect/useCallback/useMemo` включать все используемые значения;
  - `@typescript-eslint/no-explicit-any` (**error**) - никаких `any`;
  - `@typescript-eslint/no-unused-vars` (**error**) - убирать неиспользуемые переменные и импорты;
  - `eqeqeq` (**error**) - только `===` / `!==`;
  - `@typescript-eslint/no-shadow`, `no-underscore-dangle` (кроме служебного `_` в колбэках effector), `no-param-reassign` (мутировать props параметра можно, переназначать сам параметр - нет), `no-plusplus` (кроме афтемента в `for`);
  - effector naming (`$store` / `onEvent` / `effectFx`) - **error**, см. раздел Effector.

---

## Комментарии в коде

- Стараемся не оставлять комментариев вообще.  Не пересказывать то, что и так видно из кода. Комментировать только TODO или места которые в дальнейшем нужно доработать или исправить. Можешь спрашивать меня оставить ли комментарий про неочевидное: причину решения, ограничение, костыль.
- Комментарии которые не относятся к TODO можешь смело удалять.
- Однострочные, начинаются с `//`. JSDoc-блоки `/** ... */` не использовать.
- Язык — простой и человеческий, как пишет middle-разработчик коллегам: коротко, по делу, без канцелярита и формальных оборотов.
- Точку в конце иногда не ставить — комментарий должен выглядеть так, будто его оставил живой человек, а не сгенерировала машина.
- Не упоминать в комментариях AGENT.md - это внутренний документ агента, в коде ему не место.
- По возможности не использовать длинное тире '—', кавычки-ёлочки «» и другие маркеры, по которым видно сгенерированный нейросетью текст. Использовать то, что есть на клавиатуре: дефис '-', кавычки ' и ". Касается кода, комментариев, коммитов и документации.

```ts
// TODO(restrictions-api): попросить отдавать пачкой

// ❌ так не надо:
/** Данный метод осуществляет получение списка ограничений. */
```

---

## HTTP-клиент (`src/Shared/api/`)

### `axios.ts`

- Базовый URL формируется динамически: `basename + '/armc_api'`
- Обновляется через event `onUpdateUrlProxy(basename)` при монтировании `App` (`useLayoutEffect`)
- Заголовок `timezone` проставляется автоматически

**Соглашение по URL в эффектах (с ревью):** путь эндпоинта писать **строкой прямо в вызове** axios, не выносить в константу-базу вида `const X_URL = '/v1/...'` и не собирать через `` `${X_URL}/...` ``. Причина - грепаемость: поиск по хвосту пути (основной приём в проекте, см. раздел про abyss) должен находить полный путь в месте вызова, а константа его разрывает. DRY-выгода тут не перевешивает. (Старые `INSTANCE_URL`/`LABELS_URL` в `Entities/Instance`/`Label` - наследие, при правке инлайнить.)

### `model.ts` — `handleErrorFx`

Единый обработчик ошибок для всех API-эффектов. Под капотом вызывает `showErrorNotification` из `@pvm-ui/kit` и `getInfoNotificationError` из `@pvm-ui/pvm-core` для форматирования сообщения по HTTP-статусу.

### `types.ts` — переиспользуемые типы

Всегда брать отсюда, не объявлять заново:

```ts
import { AxiosResponseError, APIPageableFetchType, CommonSortingParams, SortDirection } from '@src/Shared/api/types';
```

| Тип                    | Назначение                                                        |
| ---------------------- | ----------------------------------------------------------------- |
| `AxiosResponseError`   | Тип тела ошибки от бэкенда (error, message, path, status, ...)    |
| `APIPageableFetchType` | Spring Data Page-ответ (totalPages, totalElements, pageable, ...) |
| `CommonSortingParams`  | Параметры запроса: `{ page, size, sort: { columnName, sort } }`   |
| `SortDirection`        | `'asc' \| 'desc'`                                                 |

### Локальные API-моки (`src/Shared/api/mock/`)

Для вёрстки на машинах без доступа к стенду (типичная ситуация: нет сети/VPN/сертификатов, а заодно недоступен и npm-registry, так что `axios-mock-adapter` не поставить). Поэтому перехват **самодельный**, без внешних зависимостей.

- **Включение:** `ARMC_MOCK=true` в `.env`. Флаг прокидывается через `dotenv` → `DefinePlugin` как глобальный `__ARMC_MOCK__` (объявлен в `@types/global.d.ts`). В prod-конфиге всегда `false`.
- **Как работает:** в `axios.ts` под `if (__ARMC_MOCK__)` динамически импортируется `setupApiMock` (динамический импорт — чтобы моки и фикстуры не попадали в prod-бандл). Он вешает request-интерсептор: для совпавших по `config.url` путей подменяет `config.adapter` и возвращает фикстуру; несовпавшие запросы идут штатным адаптером (в прокси хоста).
- **Фикстуры** (`mock/fixtures.ts`) — реальные ответы стенда, снятые через прокси (2026-06-16): список конфигураций (доведён до 31 для пагинации), проекты, топики, ограничения, feature-flag. У одного экземпляра (`rust2`) версия намеренно разведена с конфигом — проверить оранжевую иконку обновления версии.
- **Маршруты** (`mock/index.ts`, массив `routes`): `archive/list/paginated` (с пагинацией по params), `archive/list/page-count`, `archive/task/project/{p}/name/{n}/config` (экспорт), `project/list`, `source/kafka/topics`, `archive/restrictions`, `archive/restrictions/overview`, `feature-settings/value`. Добавлять новые эндпоинты — туда же.
- **Проверка на стенде:** просто убрать/закомментировать `ARMC_MOCK` и пересобрать — пойдут реальные запросы.

---

## Контракт бэкенда (OpenAPI)

Снапшот OpenAPI 3.1 спецификации сервиса **coordinator** (v7.0.101, получен 2026-06-10):

- `docs/api/coordinator-internal.openapi.json` — internal API (вызовы между сервисами; UI ходит в него через шлюз).

**Маппинг путей:** фронтовый путь = `/api/v1/internal/index` + путь из спеки. Пример: `POST /api/v1/internal/index/archive/task/zone/{zoneId}/instance/overdraft/reset/all` → в спеке `POST /archive/task/zone/{zoneId}/instance/overdraft/reset/all`.

При написании DTO-типов и эффектов сверяться с контрактом (схемы — в `components.schemas`, формат тела ошибки — в `components.responses`).

> ⚠️ Эндпоинтов **Ограничений** (`/archive/restrictions*`) в OpenAPI-снапшоте нет, но весь контракт (overview, значение/PATCH/DELETE по индексу и проекту, глобальное) подтверждён реальными запросами со стенда - см. «Форма управления Ограничениями». Эффекты с тихим fallback на моки для dev-офлайна (см. «Паттерн „черновой интеграции"»). Реализация - `src/Entities/Restriction`.

---

## @pvm-ui — внутренний kit

### `@pvm-ui/kit`

| Утилита / компонент     | Назначение                                                            |
| ----------------------- | --------------------------------------------------------------------- |
| `showErrorNotification` | Показать toast-уведомление об ошибке                                  |
| `GlobalSpinner`         | Полноэкранный спиннер загрузки (используется в `<Suspense fallback>`) |
| `DateFnsAdapter`        | Адаптер date-fns для `DateLibAdapterProvider`                         |
| `russianLocale`         | Русская локаль для DateFnsAdapter                                     |

### `@pvm-ui/pvm-core`

| Утилита                    | Назначение                                                |
| -------------------------- | --------------------------------------------------------- |
| `getInfoNotificationError` | Форматирует title/description уведомления по HTTP-статусу |

### `@pvm-ui/pvm-navigation`

| Утилита             | Назначение                                                          |
| ------------------- | ------------------------------------------------------------------- |
| `PVMMindProps`      | Тип пропсов MFE-компонента (`basename`, `theme`, `availableRoutes`) |
| `useCommonNavigate` | Навигация с учётом MFE basename                                     |

---

## Shared UI-компоненты (`src/Shared/ui`)

Переиспользуемые UI-примитивы, которые нужно использовать вместо написания своих:

### PageWrapper

Обёртка для всех страниц. Обрабатывает состояния загрузки, ошибок HTTP и отсутствия доступа.

```tsx
import { PageWrapper } from '@src/Shared/ui/PageWrapper';

// Все страницы оборачиваются в PageWrapper:
export const MyPage = () => (
  <PageWrapper>
    <MyContent />
  </PageWrapper>
);
```

Автоматически показывает страницы ошибок для кодов: 400, 401, 403, 404, 500, 502, 503, 504, 520.

### VirtualizedList

Виртуализированный список опций для `Select` с большим количеством элементов (сотни/тысячи). Использует `@tanstack/react-virtual`.

```tsx
import { components } from '@src/Shared/ui/VirtualizedList';
import { Select } from '@sds-eng/base';

<Select
  options={largeOptionsList}
  components={components} // подключает виртуализацию
  value={value}
  onChange={onChange}
/>;
```

Используется когда `options` содержит >50 элементов (например, список топиков Kafka).

### ErrorPage

Компоненты для отображения страниц ошибок с навигацией. Используются внутри `PageWrapper`, прямой вызов не нужен — `PageWrapper` автоматически подбирает нужную страницу по HTTP-статусу.

```ts
// src/Shared/ui/ErrorPage/
Page404WithNavigate; // 404 с кнопкой "Вернуться"
PageErrorCodeWithNavigate; // Универсальная страница ошибки по коду
```

### RouteListener

Обёртка для маршрутов: отслеживает смену `location` и обновляет навигационный стор через `onChangeCommonLocation` / `onResetCommonLocation`. Используется в `createRouters()`, вставлять в маршруты вручную не нужно.

### AccordionComponent / AccordionWithSearch

Обёртки над `Accordion` из `@sds-eng/base` со стрелкой слева и стилями проекта. `AccordionComponent` - просто заголовок + контент; `AccordionWithSearch` - в заголовок встроен поиск (`search` / `onChangeSearch`, `TextField` с `Icon.Search`). Использовать для разворачиваемых блоков вместо прямого `Accordion` (пример - `StepSchema`).

### ActiveCell

Набор кнопок действий для редактируемой строки/ячейки: режим просмотра - `Edit` (+ опц. `Delete`), режим редактирования - `Checkmark` (по `canSave`) + `Close`. Пропсы-колбэки `onEdit/onClose/onRemove/onSave`. Состояние edit/view хранит вызывающий.

### EditableFields

`EditableInputField` и `EditableSelectField` - поле, которое в режиме `edit` показывает `TextField`/`Select`, иначе - текст. Для inline-редактирования в таблицах/гридах (пример - `SchemaFields`).

### ConfirmDeleteModal

Презентационная модалка подтверждения удаления (Modal + header + текст + футер «Отмена»/«Удалить» с `view="negative"`). Логику удаления и стор открытия не содержит - всё через пропсы: `open`, `title`, `description` (строка или ReactNode), `onClose`, `onConfirm`, опц. `loading` (крутилка на кнопке удаления), `confirmLabel`/`cancelLabel`, `width` (дефолт 480). Использовать для любого подтверждения удаления вместо своей вёрстки Modal. Уже на нём: `DeleteConfigModal` (удаление конфигурации, ведёт `deleteArchiveFx` сам) и `DeleteRestrictionModal` (удаление ограничения, делегирует через `onConfirm` в форму грида). Сторы/эффекты остаются на стороне вызывающего - различаются по семантике.

### ConfirmModal

Презентационная модалка подтверждения **не-удаляющего** действия (старт/стоп экземпляра и т.п.). То же, что `ConfirmDeleteModal`, но кнопка действия нейтральная (`confirmView` по умолчанию `primary`, можно `negative`) и дефолтные подписи «Да»/«Нет» (`confirmLabel`/`cancelLabel`). Пропсы: `open`, `title`, `description` (строка или ReactNode), `onClose`, `onConfirm`, опц. `loading`, `confirmLabel`, `cancelLabel`, `confirmView`, `width` (дефолт 480). Стор открытия и эффект - на стороне вызывающего. Уже на нём: `InstanceActionModal` (подтверждение старт/стоп экземпляра).

---

## Роутинг

Маршруты в `src/Shared/constants/routes.ts`. Роутер создаётся функцией `createRouters()` с lazy-загрузкой страниц. Доступ к маршрутам проверяется через `availableRoutes` из shell.

```ts
// src/Shared/constants/routes.ts
ARCHIVES = '/archives'; // список архивных индексов
ARCHIVES_EDIT = '/archives/edit'; // создание / редактирование
```

Доступ к маршруту проверяется компонентом `CheckAccessPage` (в `src/pages/`): если маршрут отсутствует в `availableRoutes`, рендерится 404.

---

## Бизнес-логика

### Контекст

MFE является частью платформы Platform V Monitor (MIND). В рамках рефакторинга монолитный компонент LGDB разделяется на функциональные домены: метрики, оперативные логи, **архивные логи** (данный MFE), трейсы и др. MFE реализует управление компонентом Archive Management (Archive Indexing).

### Термины

| Термин                            | Определение                                                                               |
| --------------------------------- | ----------------------------------------------------------------------------------------- |
| Конфигурация архивного индекса    | Именованный шаблон задачи индексации. Идентифицируется парой `project + taskName`.        |
| Экземпляр конфигурации (instance) | Конкретный запущенный/остановленный экземпляр конфигурации в конкретной **зоне**.         |
| Зона                              | Среда выполнения (инфраструктурный сегмент), в которой развёрнут экземпляр.               |
| Овердрафт скорости                | Временное превышение квоты скорости записи для экземпляра.                                |
| Ограничение (restriction)         | Максимальный временной интервал поиска по архивному индексу. Управляется администратором. |
| АС / Инсталляция АС               | Автоматизированная система и её конкретное развёртывание в контуре эксплуатации.          |

### Страницы и их функции

#### `/archives` — Список конфигураций архивных индексов

Две вкладки таблицы:

- **Конфигурации** — сгруппированы по названию конфигурации (строка группы → раскрывается список экземпляров)
- **Зоны** — сгруппированы по зонам (группировка меняется пользователем)

Что можно делать на странице:

- Поиск (Конфигурации: по названию конфигурации, ключу проекта; Зоны: + зона, статус, статистика памяти)
- Фильтрация — **двухуровневая**:
  - Уровень 1 (глобальный, бэк): Название, Проект, Статус, Метки, Зона, Версия, Скорость обработки, Макс. скорость записи, Макс. размер индекса, Макс. время хранения данных. Операторы: `is`, `is not`, `in`, `not in`, `>=`, `=`, `<=`. Влияет на запрос к БД.
  - Уровень 2 (локальный, фронт): фильтр в заголовке столбца, оператор `in`. Применяется к уже загруженным данным. При изменении глобального фильтра локальные сбрасываются.
- Сортировка (Зоны: по всем столбцам; Конфигурации: по умолчанию — алфавитно, числа первыми)
- Обновить статусы и статистику
- Сбросить овердрафт скорости по зоне → `POST /api/v1/internal/index/archive/task/zone/{zoneId}/instance/overdraft/reset/all`
- Создать конфигурацию → `POST /api/v1/internal/index/archive/task/project/{project}/config`
- Импортировать конфигурацию из JSON-файла → тот же эндпоинт

**Действия над конфигурацией** (из меню строки):
| Действие | API |
|----------|-----|
| Метки | `POST /api/v1/index/archive/task/project/{project}/name/{taskName}/label/{label}` |
| Просмотреть/редактировать | `GET /PUT /api/v1/internal/index/archive/task/project/{project}/name/{taskName}/config` |
| Ограничения | `PATCH /api/v1/internal/index/archive/restrictions/index/{indexId}` |
| Добавить экземпляр | `POST /api/v1/internal/index/archive/task/project/{project}/name/{taskName}/zone/{zoneId}/instance` |
| Экспорт | `GET /api/v1/internal/index/archive/task/project/{project}/name/{taskName}/config` |
| Удалить | `DELETE /api/v1/internal/index/archive/task/project/{project}/name/{taskName}/config` |
| Показать/скрыть экземпляры | локальное переключение |

**Действия над экземпляром** (из меню строки экземпляра):
| Действие | API |
|----------|-----|
| Обновить статус | `GET …/zone/{zoneId}/instance/status` |
| Старт | `POST …/zone/{zoneId}/instance/resume` |
| Стоп | `POST …/zone/{zoneId}/instance/suspend` |
| Установить offset | `POST …/zone/{zoneId}/instance/setOffsets` |
| Сбросить offset | `POST …/zone/{zoneId}/instance/reset` |
| Овердрафт скорости | `POST …/zone/{zoneId}/instance/overdraft` |
| Переопределить квоты | `POST /api/v2/index/archive/task/project/{project}/quota/estimate` + `PUT …/zone/{zoneId}/instance/quotas` |
| Удалить | `DELETE …/zone/{zoneId}/instance` |
| Обновить версию экземпляра | `PUT …/zone/{zoneId}/instance` (иконка оранжевая; показывается если версия экземпляра ≠ версии конфигурации) |

**Иконка овердрафта**:

- Зелёная — овердрафт активен («Скорость обработки увеличена на N %»)
- Оранжевая — овердрафт ограничен («Максимальный процент овердрафта»)
- Красная — овердрафт невозможен («Измените конфигурацию экземпляра»)

**Массовые действия над экземплярами** (через чекбоксы вкладки Зоны): старт, стоп, сбросить овердрафт, удалить.

**Статусы экземпляра**: `RUNNING` | `STOPPED` | `FAILED` | `UNDEFINED` | `WITHOUT_RESPONSE`

> По контракту (`docs/api/coordinator-internal.openapi.json`, `ArchiveIndexingStatusDto`) бэк возвращает `RUNNING | FAILED | STOPPED | UNDEFINED` — статуса `UNKNOWN` нет. `WITHOUT_RESPONSE` — фронтовый статус (бэк не ответил).

**API страницы при загрузке**:

- `GET /api/v1/internal/index/archive/list` — список конфигураций с экземплярами (query-параметры фильтра ниже)
- `GET /api/v1/internal/index/archive/list/paginated?pageSize&pageNumber` — постраничный список конфигураций (используется таблицей; `pageNumber` с 1). Реализация - `Entities/Archives/api.ts` (`fetchArchivesFx`). Форма ответа - `ArchiveConfiguration[]` (тип в `Entities/Archives/types.ts`); т.к. эндпоинта нет в OpenAPI, контракт держится только этим типом. Ключевое: `instances`, `labels` опциональны и часто отсутствуют; `maxStorageTimeSec` может быть `null`; занятый/выделенный размер - в `instances[].status.storage`
- `GET /api/v1/internal/index/archive/list/page-count?pageSize&pageNumber` — число страниц. Трюк: при `pageSize=1` число страниц == общему числу конфигураций, фронт так и получает total для пагинации (`fetchArchivesCountFx`). Этих двух эндпоинтов нет в OpenAPI-снапшоте - проверены вручную через прокси хоста
- `GET /api/v1/internal/project/list` — список проектов
- `GET /api/v1/internal/zones` — список зон
- `GET /api/v1/internal/index/archive/task/overdraft/config` — конфигурация овердрафта
- `POST /api/v1/internal/index/archive/zone/{zoneId}/getAllStatuses` — статусы экземпляров зоны

**Query-параметры фильтра для `GET /api/v1/internal/index/archive/list`**:

| Параметр                  | Тип        | Описание                               |
| ------------------------- | ---------- | -------------------------------------- |
| `projects`                | `string[]` | Список ключей проектов                 |
| `names`                   | `string[]` | Список названий конфигураций           |
| `labels`                  | `string[]` | Список меток                           |
| `zones`                   | `string[]` | Список зон (`PRIMARY`, `SECONDARY`)    |
| `statuses`                | `string[]` | Статусы экземпляров                    |
| `configVersion`           | `string`   | Версия конфигурации                    |
| `processingSpeedOperator` | `string`   | Оператор (`>=`, `<=`, `=`)             |
| `processingSpeedValue`    | `number`   | Значение скорости обработки (%)        |
| `maxWriteSpeedFrom`       | `number`   | Мин. макс. скорость записи             |
| `maxWriteSpeedTo`         | `number`   | Макс. макс. скорость записи            |
| `maxWriteSpeedUnit`       | `string`   | Единица: `B/s`, `KB/s`, `MB/s`, `GB/s` |
| `maxIndexSizeFrom`        | `number`   | Мин. макс. размер индекса              |
| `maxIndexSizeTo`          | `number`   | Макс. макс. размер индекса             |
| `maxIndexSizeUnit`        | `string`   | Единица: `B`, `KB`, `MB`, `GB`         |
| `maxRetentionFrom`        | `number`   | Мин. макс. время хранения              |
| `maxRetentionTo`          | `number`   | Макс. макс. время хранения             |
| `maxRetentionUnit`        | `string`   | Единица: `сек`, `мин`, `ч`, `дн`       |

> Операторы для полей `IN/NOT_IN` передаются отдельными параметрами-суффиксами (уточнить у бэка при интеграции).

---

#### `/archives/edit` — Форма создания/редактирования конфигурации

Пользователь может переходить между разделами в произвольном порядке (не wizard со строгой последовательностью). Разделы:

| Раздел              | Поля                                                                                                                                                                                        |
| ------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Название архива     | **Название** (латиница, 0-9, `-_.,` — обязательное); **Проект** (выпадающий список, обязательное)                                                                                           |
| Входные данные      | **Источник данных** (топики Kafka, KAFKA_TOPIC VIEW, мультивыбор, + кнопка «Добавить источник»); **Сообщения из источника** (превью); **Формат данных** (JSON / Avro / Binary); **Flatten** |
| Сопоставление полей | маппинг полей                                                                                                                                                                               |
| Параметры           | **Макс. скорость записи**, **Макс. размер индекса**, **Макс. время хранения данных** + ед. измерения                                                                                        |
| Квоты               | поля квот                                                                                                                                                                                   |

API: `POST /api/v1/internal/index/archive/task/project/{project}/config` (создание)

---

#### Форма управления Ограничениями

Точка входа: `MIND → Archive Service MFE → Архивные индексы → Ограничения`. Только **Администратор**.

Три вкладки (наша вёрстка - **общий Drawer с вкладками**, не как в abyss, где это разрозненные модалки):

- **По индексу** → построчный грид ограничений по индексам (`objectType: INDEX` из overview).
- **По проекту** → построчный грид по проектам (`objectType: PROJECT` из overview).
- **Все индексы** → одно глобальное значение (вершина наследования, в overview не входит).

**Ограничение = один скаляр `maxSearchTimeIntervalSec` (целые секунды).** Единица измерения (секунды…годы) - **чисто фронтовая**: нужна только чтобы ввести/показать значение, по проводам уходят и приходят **секунды**. Конвертация - `src/Shared/lib/format/restrictionSeconds.ts` (`valueUnitToSeconds` / `secondsToValueUnit`; показ берёт наибольшую единицу, делящую нацело: 518400 → 6 дней, 1209600 → 2 недели).

**Подтверждённый контракт (реальные запросы со стенда abyss):**

- **Список** - `GET …/archive/restrictions/overview` → плоский массив объектов c ограничениями (без значений): `{ objectType: 'PROJECT'|'INDEX'; objectId; objectName; projectKey }`. `objectId`: для INDEX - **числовой id конфигурации** (`"25"`), для PROJECT - **ключ проекта** (`shortName`, `"abyss_st2"`). После каждого save/delete - **обязательный рефетч overview**.
- **Значение объекта** - overview значений не отдаёт, под каждый объект отдельный `GET …/restrictions/index/{id}` или `…/restrictions/project/{key}` → `{ inheritedRestrictions, objectRestrictions, mergedRestrictions }`. `object` перекрывает `inherited`; `merged` = эффективное (object если задан, иначе inherited). Когда своего ограничения нет - `objectRestrictions: null`, `merged === inherited`. **Берём `merged`.** Наследование цепочкой: индекс ← свой проект ← глобальное.
- **Сохранение** - `PATCH` по тому же пути объекта, body `{ maxSearchTimeIntervalSec }`. **Удаление** - `DELETE` по тому же пути.
- **Все индексы** - `GET/PATCH …/restrictions` → `{ maxSearchTimeIntervalSec }`.

**Реализация (`Entities/Restriction`):** `fetchRestrictionsTableFx` тянет overview + догружает значение по каждому объекту (N запросов, `TODO` попросить бэк отдавать пачкой) → `$restrictionsTable`, производные `$restrictionsByIndex`/`$restrictionsByProject` (фильтр по `objectType`). Опции «По индексу» - `$optionsArchiveConfig` из `$archives` (`value = id`, `label = "проект / имя"`); «По проекту» - `project/list` (`value = shortName`, `label = name`). Префилл при выборе сущности - `fetchObjectRestrictionFx({ type, id })` (берёт `merged`), пропускает уже загруженные из overview значения (`loadedIds`), чтобы не дёргать лишние запросы.

**Поведение «Сохранить»** (осознанные решения, не менять без продакта):

- кнопка действует **только на активную вкладку**, диффом: PATCH только новых/изменённых строк (`buildPatchItems`);
- Drawer после сохранения **не закрывается**; успех - тост + рефетч overview.

**Удаление** (`DeleteRestrictionModal` + `Icon.Delete`): корзина → **подтверждение** → `DELETE` **сразу** + рефетч overview (значения правок при этом батчатся отдельно на «Сохранить»). Для **несохранённой** новой строки (объекта ещё нет в overview) корзина просто убирает строку из формы, без DELETE и без модалки.

**Преселект из kebab конфигурации** - `$restrictionPreselectIndexId`: открывает «По индексу», если этого индекса ещё нет в overview - добавляет для него строку **в конец списка** (значение подтянет префилл). Эта строка подсвечена фоном (цвет ховера `surfaceSecondaryHover`) - `RestrictionGrid` вешает класс `drawerRestrictionHighlightRow` через `tableBodyRowProps` на строку, у которой `entity === preselectIndexId`.

**Открытые вопросы / TODO** по ограничениям - в разделе «ТехДолг / ToDo» вверху файла (N запросов за значениями, единицы, снятие моков-fallback).

---

### DTO-типы API

Типы ответов, возвращаемых бэкендом (для TypeScript-интерфейсов):

#### ArchiveIndexTaskStatusDto

По контракту (`docs/api/coordinator-internal.openapi.json`):

```ts
interface ArchiveIndexTaskStatusDto {
  indexing?: {
    status: 'RUNNING' | 'FAILED' | 'STOPPED' | 'UNDEFINED';
  };
  storage?: {
    currentSizeBytes: number; // текущий размер индекса
    maxSizeBytes: number; // лимит размера
  };
}
```

#### ArchiveSetOffsetRequestDto

Используется при `POST …/instance/setOffsets` (установить offset):

```ts
interface ArchiveSetOffsetRequestDto {
  offsets: Array<{
    topics: string[]; // список Kafka-топиков
    consumerGroups: string[]; // список consumer-групп
    offset: number;
  }>;
}
```

#### ArchiveSchemaFieldTypesInfoDto

Поле схемы индекса (используется при маппинге полей):

```ts
interface ArchiveSchemaFieldTypesInfoDto {
  name: string;
  type: string;
  subType?: string;
}
```

#### Операции с метками (Labels)

Полный CRUD для меток конфигурации. Пути по контракту (`archive-service-label-controller` в `docs/api/coordinator-internal.openapi.json`) - с фронтовым префиксом `/api/v1/internal/index`, т.е. в axios `/v1/internal/index` + путь из спеки:

```
GET    /archive/index/project/{projectShortName}/name/{indexName}/labels        — получить все метки (getLabels)
POST   /archive/index/project/{projectShortName}/name/{indexName}/label/{label} — добавить метку (createLabel)
PUT    /archive/index/project/{projectShortName}/name/{indexName}/labels        — заменить все метки, body string[] (updateLabels)
DELETE /archive/index/project/{projectShortName}/name/{indexName}/labels        — удалить все метки (deleteLabels)
DELETE /archive/index/project/{projectShortName}/name/{indexName}/label/{label} — удалить конкретную метку (deleteLabel)
```

> Путь именно `/archive/index/project/...` (двойной сегмент `index` после префикса), не `/archive/task/project/...`. `projectShortName` = ключ проекта, `indexName` = название конфигурации.

#### API v2 — квоты экземпляра

```
POST /api/v2/index/archive/task/project/{project}/quota/estimate  — оценить квоты (перед PUT quotas)
PUT  /api/v1/internal/index/archive/task/project/{project}/name/{taskName}/zone/{zoneId}/instance/quotas — применить квоты
```

#### Получение схемы полей (для сопоставления полей в редакторе)

```
GET /api/v2/index/archive/task/project/{project}/name/{name}/schema/fields  — поля схемы индекса
```

---

### Ролевая модель

Правило: если прав нет — точка входа не отображается; если права есть, но условия не выполнены — точка входа показывается задизабленной.

| Операция                                     | Необходимые права                                          |
| -------------------------------------------- | ---------------------------------------------------------- |
| Просмотр списка конфигураций                 | `ARCHIVE_INDEX: VIEW`                                      |
| Создание / импорт конфигурации               | `ARCHIVE_INDEX: EDIT` + `FLOW: EDIT` + `KAFKA_TOPIC: VIEW` |
| Просмотр конфигурации                        | `ARCHIVE_INDEX: VIEW` + `FLOW: VIEW`                       |
| Редактирование конфигурации                  | `ARCHIVE_INDEX: EDIT` + `FLOW: EDIT` + `KAFKA_TOPIC: VIEW` |
| Удаление конфигурации                        | `ARCHIVE_INDEX: EDIT` + `FLOW: EDIT` + `KAFKA_TOPIC: VIEW` |
| Метки                                        | `ARCHIVE_INDEX: EDIT` + `FLOW: EDIT`                       |
| Экспорт                                      | `ARCHIVE_INDEX: EDIT/VIEW` + `FLOW: EDIT/VIEW`             |
| Добавить экземпляр                           | `ARCHIVE_INDEX: EDIT` + `FLOW: EDIT`                       |
| Удалить экземпляр                            | `ARCHIVE_INDEX: EDIT` + `FLOW: EDIT/VIEW`                  |
| Старт/Стоп/Offset/Квоты/Овердрафт экземпляра | `ARCHIVE_INDEX: EDIT` + `FLOW: EDIT`                       |
| Управление Ограничениями                     | Администратор                                              |

---

## Реализация фич (карта кода)

Карта "где живёт код фичи и что в нём ещё заглушка". Бизнес-описание лежит в разделе "Бизнес-логика", здесь только реализация.

### Drawer фильтров (`/archives`, глобальный фильтр уровня 1)

- **Код:** `src/pages/ArchivesPage/FilterDrawer/` - `index.tsx` (Drawer-обёртка, useForm, футер), `FilterDrawerBody.tsx` (сборка тела фильтра), `FilterDrawerField.tsx` (строка фильтра: заголовок + селект оператора + контрол значения), `FilterDrawerRange.tsx` (диапазон от-до + единица), `model.ts`, `types.ts`. Опции операторов/статусов/единиц - в `src/Shared/constants/filters.ts`, типы операторов (`SelectOperator`, `IsOperator`, `CompareOperator`) - в `src/Shared/types/filter.ts`.
- **Стейт:** в effector `$filterDrawerOpen` (открыт/закрыт) и `$appliedArchiveFilters` (применённый фильтр в формате запроса) + события `onApplyArchiveFilters` / `onResetArchiveFilters` - всё в `model.ts`. Значения полей живут в react-hook-form (`FilterFormValues`), форма пробрасывается через `FormProvider`. Открывается событием `onChangeFilterDrawerOpen(true)` из тулбара `ArchivesTable`, монтируется в `ArchivesContentPage`.
- **Структура поля:** заголовок + Select оператора + контрол значения; три вида контролов - мультиселект, одиночный select/текст, диапазон "от - до" + единица измерения. Связка Controller + контрол - общие компоненты `src/Features/Controllers/` (`ControllerSelectSingle`, `ControllerSelectMultiple`, `ControllerTextField`), работают через `useFormContext()` без generic.
- **Формат запроса:** generic `filters=JSON([{field, op, values}])` (тип `ArchiveFilter` в `Entities/Archives/api.ts`), один и тот же параметр летит в `/archive/list/paginated` и `/page-count`. Подтверждено реальными запросами со стенда по полю `name` все 4 select-оператора: IS = `eq`, IS NOT = `isNot`, IN = `in`, NOT IN = `notIn`. op'ы вербальные camelCase, не сокращённые (`isNot`/`notIn`, не `ne`/`nin`). Несколько условий по одному полю летят отдельными объектами в массиве. **Это не плоские query-параметры**, как ошибочно описано в таблице параметров `GET /archive/list` в "Бизнес-логике" (та таблица для интеграции неактуальна).
- **Маппинг формы → запрос:** `FilterDrawer/mapFilters.ts` (`mapFormToArchiveFilters`). Подтверждены: `field:name` + все 4 select-оператора (IS=eq, IS NOT=isNot, IN=in, NOT IN=notIn); Скорость обработки = `field:maxOverdraftPercent` + операторы сравнения `ge`/`le`/`eq` (короткие ge/le, не gte/lte); Метки = `field:label` (ед.ч., не `labels`). Остальные field (project/status/zone/version/maxSizeBytes/...) - предположение, помечено `TODO(archives-filter-api)`. Диапазоны from/to → gte/lte; единицы измерения (unit) пока **не конвертируются и не отправляются**.
- **Поток данных:** submit → `mapFormToArchiveFilters` → `onApplyArchiveFilters` → стор → `ArchivesTable` читает `$appliedArchiveFilters`, мёржит со строкой поиска (search остаётся `{field:nameLike, op:like}`) и шлёт в `fetchArchivesFx`/`fetchArchivesCountFx`. Смена фильтра сбрасывает пагинацию на 1-ю страницу. Reset (`onResetArchiveFilters`) чистит стор.
- **Персистентность фильтра в URL** (решение команды - расшаривание отфильтрованной ссылки; localStorage сознательно не используем, источник один): источник истины - стор `$appliedArchiveFilters`, URL `?filters=JSON([...])` - слой поверх него. Синхронизацию держит хук `ArchivesTable/useArchiveFiltersSync.ts`: на маунте восстанавливает фильтр из URL через `onApplyArchiveFilters`; на каждое изменение стора пишет **весь массив** в URL (`setSearchParams`, replace), пустой фильтр убирает параметр. В URL лежит именно массив `ArchiveFilter[]`, не одиночный объект. Чистый URL (без `?filters=`) открывается без фильтра. Не плодить второй источник (отдельный `fetchArchives` по `searchParams`, localStorage и т.п.) - всё идёт через один стор и один fetch-эффект.
- **Плашки-чипы применённого фильтра** - `ArchivesTable/ArchivesFilterChips.tsx`, рендерятся из `$appliedArchiveFilters` (один `Tag` на условие, подписи field/op - карты `FIELD_LABELS`/`OP_LABELS` в файле). Крестик чипа убирает одно условие (`onApplyArchiveFilters` без него), "Сбросить все" - `onResetArchiveFilters`. Монтируются в `ArchivesTableToolBar` над строкой поиска.
- **Drill-down** (клик по числу экземпляров в строке конфигурации, `InstancesCountLink` в `columns.tsx`): применяет фильтр `{field:'name', op:'eq', values:[имя]}` через тот же `onApplyArchiveFilters` + переключает вкладку на Экземпляры. Дальше серверная фильтрация конфигов оставляет в выдаче инстансы только этой конфигурации - **отдельного клиентского механизма (`$rowId`) для этого нет, не возвращать**.
- **Options:** Ключ проекта в фильтре - из `$archiveFilterValues` (`fetchArchivesFiltersFx` → `/archive/list/filter-values`). На edit-странице проекты - `$optionsProject` (`Entities/Project`), грузятся в `StepIndexName` (`fetchProjectsFx` при маунте шага). Топики Kafka - `$optionsTopic` (`Entities/Topic`), грузятся в `StepInputData` (`fetchTopicsFx` при маунте шага). Опции «По индексу» в дравере ограничений - `$optionsArchiveConfig` из текущего `$archives` (постраничный список таблицы). Метки - оператор только `IN`/`NOT IN` (`IN_NOT_IN_OPERATOR_OPTIONS`). Статус/Зона - константы из `Shared/constants/filters.ts`.
- **Не сделано:** локальный фильтр уровня 2 в заголовках столбцов выключен (`enableColumnFilters={false}`), поэтому сброс уровня 2 при применении уровня 1 пока не нужен; единицы измерения диапазонов.

### Список конфигураций (`/archives`, таблица)

- **Код:** `src/pages/ArchivesPage/ArchivesTable/` - `index.tsx` переключает по `$tableView` (`SEGMENT_INSTANCES` / `SEGMENT_CONFIGURATIONS` из `Features/TableView`) между `ArchivesInstanceTable` (вкладка Зоны) и `ArchiveConfigurationTable` (вкладка Конфигурации). Колонки - `columns.tsx`.
- **Меню действий конфигурации** (kebab в колонке `actions` таблицы Конфигураций) - `ConfigurationActionsCell.tsx`. Первое в проекте использование `DropdownMenu` + `DropdownMenuItem` из `@sds-eng/base` (обёртка над `@v-uik/dropdown`): триггер - `children`, пункты - в `content`; открытие по `action="click"` (своё состояние не нужно), разделители групп - `<Divider />`. Грабли: у `DropdownMenuItem` проп `closeMenuOnClick` по умолчанию `false` - без него меню не закрывается по клику на пункт, ставить явно. Состав по макету: Редактировать / Метки, Ограничения / Экспорт / + экземпляр / Удалить. Реально подключены: Редактировать (`useNavigate` из `react-router` → `ARCHIVES_EDIT` c query-параметрами `?project={projectKey}&name={configuration}` через `createSearchParams`; именно `useNavigate`, а не `useCommonNavigate` - последний для навигации вне MFE и не подставляет basename `/armc`. Edit-страница эти параметры пока **не читает** - `TODO(archives-edit)`: на `/archives/edit` прочитать project/name из search и подгрузить конфигурацию; наличие params = режим редактирования, отсутствие = создание), Ограничения (`onOpenRestrictionDrawerForConfig(String(row.id))` из `Widgets/Header/model` - открывает дравер на вкладке «По индексу» с преселектом этой конфигурации по `id`; преселект живёт в сторе `$restrictionPreselectIndexId`, сбрасывается на закрытии/открытии общей кнопкой шапки), Метки, + экземпляр и Удалить (см. ниже), Экспорт.
- **Меню действий экземпляра** (kebab в таблице Зоны) - `InstanceActionsCell.tsx`. Состав по макету: Старт/Стоп / Установить offset, Сбросить offset / Овердрафт / Переопределить квоты / Удалить. Подключён только **Старт/Стоп**: пункт один, зависит от `row.instanceStatus` - `RUNNING` → «Стоп» (`Icon.Pause`, action `suspend`), любой другой статус → «Старт» (`Icon.Play`, action `resume`). Пункт Старт/Стоп **скрыт при `instanceStatus === 'WITHOUT_RESPONSE'`** (статус неизвестен, `isStatusKnown`). При **открытии меню** (`DropdownMenu onStateChange`, open=true) дёргается `fetchInstanceStatusFx` для актуализации статуса строки. Клик по Старт/Стоп открывает `InstanceActionModal` (`src/pages/ArchivesPage/InstanceActionModal/`) - подтверждение через общий `ConfirmModal` (кнопки «Да»/«Отмена» через `cancelLabel="Отмена"`, текст «Вы уверены что, хотите запустить/остановить экземпляр архива {project}/{name}/{zone}?»). Стор открытия `$instanceActionModal` (`{ row, action } | null`) + `onOpenInstanceActionModal` / `onCloseInstanceActionModal`, reset на close и на `resumeInstanceFx.done`/`suspendInstanceFx.done`, тост «Экземпляр запущен/остановлен». Сетевой слой - `Entities/Instance/api.ts`: `resumeInstanceFx` (POST `.../instance/resume`) / `suspendInstanceFx` (POST `.../instance/suspend`), оба черновой паттерн с тихим fallback - `TODO(instance-api)`. После `.done` через `sample`, а также при открытии меню дёргается `fetchInstanceStatusFx` (GET `.../instance/status`) - результат обновляет `status.indexing.status` нужного экземпляра в сторе `$archives` по `instance.id` (реакция-`.on` в `Entities/Archives/model.ts`). У `fetchInstanceStatusFx` параметр `fallbackStatus` - что вернуть в офлайн-fallback: после действия ожидаемый (resume→RUNNING, suspend→STOPPED), при рефетче по открытию меню - текущий `row.instanceStatus` (чтобы строка не менялась без бэка). Остальные пункты меню - `TODO(instance-actions)`. Ролевую модель (видимость/дизейбл по правам) пока не трогаем - отложено до общей ролевой модели.
  - **Контракты остальных пунктов `TODO(instance-actions)`** (сняты со стенда, пути в axios-форме). Все экземплярные пути - база `/v1/internal/index/archive/task/project/{project}/name/{taskName}/zone/{zoneId}/instance`. После любого изменяющего действия - рефетч списка (`fetchArchivesFx` + при необходимости `fetchInstanceStatusFx`):
    - **Сбросить offset** - простое подтверждение (`ConfirmModal`) → `POST .../instance/reset` (без тела). Текст: «Вы уверены что, хотите сбросить офсет для архива {project}/{name}/{zone}?».
    - **Удалить** - ✅ реализовано, см. «Окно удаления экземпляра» ниже.
    - **Овердрафт** - отдельный Drawer/Modal с полем «Процент увеличения скорости обработки». Максимум = `min(overdraftConfig.maxOverdraftPercent, instance.metadata.maxAvailableOverdraft)`. Для подписи «Максимальная скорость обработки» нужен `maxDataRateBytesPerSec` из конфигурации (`GET .../name/{taskName}/config`), считается как `maxDataRateBytesPerSec * (1 + 0.01 * percent)`. Текущее значение - `GET .../instance/overdraft`. Изменить: подтверждение → `POST .../instance/overdraft` body `{ overdraftPercent: number }` (текст «Вы уверены, что хотите изменить скорость обработки экземпляра {project} / {name} ({zone})?»). Сбросить: подтверждение → `POST .../instance/overdraft/reset` (без тела) (текст «...сбросить скорость обработки... до значения по умолчанию?»). Иконка-индикатор овердрафта в строке (зелёная/оранжевая/красная) описана в разделе «Бизнес-логика».
    - **Переопределить квоты** - Modal «Переопределение квот экземпляра», доступен только при включённом feature-флаге лимитов (`$isLimitFeatureSettingEnabled`, `Entities/FeatureFlags`). Поля квот: `maxSizeBytes`, `maxDataRateBytesPerSec`, `maxStorageTimeSec` (дефолты из экземпляра). Оценка перед сохранением: `POST /v2/index/archive/task/project/{project}/quota/estimate` body `{ name: taskName, quotaEstimateRequestClientDto: { maxSizeBytes, maxDataRateBytesPerSec, maxStorageTimeSec } }`. Сохранение: `PUT .../instance/quotas?maxSizeBytes={n}&maxDataRateBytesPerSec={n}&maxStorageTimeSec={n}` - **параметры в query, тела нет**. Расчётные таблицы квот уже есть в `Features/Limits/ui` (`LimitsInfo`/`LimitsProjectInfo`), эффекты эстимейта - в `Entities/Limits`.
    - **Установить offset** - самый сложный пункт, отдельный Modal с копированием consumer group. Данные диалога: `GET /v1/internal/flow/offset/project/{project}/task/{taskName}/zone/{zoneId}?businessTask=ARCHIVING` (внимание: путь `flow/offset`, не `index/archive`) → массив записей по топикам, у каждой `topicName`, `currentConsumerGroup`, `consumerGroups[]` (с `zoneId`/`type`/`consumerGroup`), `zoneIds[]`. Если данных нет или у записи пустые `consumerGroups` - показать ошибку «Отсутствуют источники данных для offset» и не открывать. В UI на каждый топик выбирается «Копировать из: Consumer group | Зона» + конкретное значение (для Зоны маппинг в `consumerGroup.name` по совпадению indexName/projectName/type/zoneId). Сохранение: `POST .../instance/setOffsets` body - массив выбранных записей `[{ sourceConsumerGroupId, topicName, projectName }]` (только те, где задан `sourceConsumerGroupId`). Перед POST - экран подтверждения «Подтверждаете установку offset для экземпляра {name} в зону {zone}?».
- **Экспорт конфигурации** (пункт «Экспорт») - `exportArchiveConfigFx({ project, taskName })` в `Entities/Archives/api.ts`: GET `.../task/project/{project}/name/{taskName}/config`, в компоненте ответ скачивается файлом `{taskName}.json` утилитой `downloadJson` (`src/Shared/lib/downloadJson.ts`, Blob + клик по временной ссылке). Реальный эндпоинт (тот же GET config для просмотра/редактирования), поэтому стандартный паттерн API с `handleErrorFx` (не «черновой» fallback): экспорт - действие по клику, тост при ошибке уместен; в компоненте `.catch(() => undefined)` чтобы не было unhandled rejection. Для офлайн-проверки под `ARMC_MOCK` - фикстура `archiveConfigFixture` + роут `.../name/.../config` в `Shared/api/mock` (name подставляется из URL запроса).
- **Окно меток** (пункт «Метки») - `src/pages/ArchivesPage/LabelsModal/` (`index.tsx` - Modal, `model.ts` - стор открытия). Состояние открытия: стор `$labelsModalRow` + `onOpenLabelsModal(row)` / `onCloseLabelsModal`; закрывается на close и на `addLabelFx.done`. Метки - чипы `Tag closable` + инпут (добавление по Enter, trim + дедуп), форма react-hook-form (`labels`, `newLabel`). Крестик на чипе → `deleteLabelFx` (DELETE `.../label/{label}`). «Сохранить» → `addLabelFx` (POST, только новая метка из инпута). Рефетч таблицы - `refetchLastArchives` в `Entities/Archives/model.ts`: сразу по `addLabelFx.done`; по закрытию модалки (`onCloseLabelsModal` → `labelsModalClosed`) если были удаления (`$labelsDirty` на `deleteLabelFx.done`, сброс на `labelsModalOpened`). Сетевой слой - `Entities/Label/api.ts`: `addLabelFx`, `deleteLabelFx`, `handleErrorFx` на fail.
- **Окно добавления экземпляра** (пункт «+ экземпляр») - `src/pages/ArchivesPage/AddInstanceModal/` (`index.tsx` - Modal, `model.ts` - стор открытия). Тот же паттерн, что у LabelsModal: стор `$addInstanceModalRow` + `onOpenAddInstanceModal(row)` / `onCloseAddInstanceModal`, закрытие на close и на `addInstanceFx.done`, тост «Экземпляр добавлен». Поля: read-only `TextField` с названием конфигурации (`row.configuration`) и `Select` зоны через `ControllerSelectSingle` (опции - константа `ZONE_OPTIONS` из `Shared/constants/filters.ts`, дефолт `PRIMARY`; форма в `FormProvider`). Сетевой слой - `Entities/Instance/api.ts`: `addInstanceFx({ project, taskName, zoneId })` (POST `.../zone/{zoneId}/instance` без тела), черновой паттерн с тихим fallback - `TODO(instance-api)`. Монтируется в `ArchivesContentPage`.
- **Доступность пункта «Удалить»:** пункт показывается всегда, но **дизейблится у конфигураций с экземплярами** (`row.instancesCount > 0`) - конфигурацию нельзя удалить, пока у неё есть инстансы. В задизейбленном виде висит `Tooltip` с пояснением (по правилу ролевой модели «есть права, но условия не выполнены - точка входа задизейблена, не скрыта»). Логика - в `ConfigurationActionsCell.tsx`.
- **Окно удаления конфигурации** (пункт «Удалить») - `src/pages/ArchivesPage/DeleteConfigModal/` (`index.tsx` - Modal-подтверждение, `model.ts` - стор открытия). Тот же паттерн: стор `$deleteConfigModalRow` + `onOpenDeleteConfigModal(row)` / `onCloseDeleteConfigModal`, закрытие на close и на `deleteArchiveFx.done`, тост «Архив удалён». Текст подтверждения: «Вы уверены что, хотите удалить архив {projectKey}/{configuration}? Его будет невозможно восстановить.» (имя архива = `project/taskName`, как в abyss). Кнопка удаления - `view="negative"`. Сетевой слой - `deleteArchiveFx` в `Entities/Archives/api.ts` (DELETE `.../project/{project}/name/{taskName}/config`), черновой паттерн с тихим fallback - `TODO(archive-delete-api)`. **После удаления список перезапрашивается:** в `Entities/Archives/model.ts` запоминаются параметры последней загрузки (`$lastFetchArchivesParams` / `$lastFetchCountFilters` через `.on(fetchArchivesFx, ...)`), и по `deleteArchiveFx.done` повторно дёргаются `fetchArchivesFx` (та же страница) + `fetchArchivesCountFx` - воспроизводит поведение abyss (после DELETE летят `archive/list/paginated` и `archive/list/page-count`). Монтируется в `ArchivesContentPage`.
- **Окно удаления экземпляра** (пункт «Удалить» в меню экземпляра) - `src/pages/ArchivesPage/DeleteInstanceModal/` (`index.tsx` - подтверждение, `model.ts` - стор открытия). Паттерн как у `DeleteConfigModal`: стор `$deleteInstanceModalRow` (`ArchiveInstanceView | null`) + `onOpenDeleteInstanceModal(row)` / `onCloseDeleteInstanceModal`, закрытие на close и на `deleteInstanceFx.done`, тост «Экземпляр удалён». Текст: «Вы уверены что, хотите удалить архив {projectName}/{configName}/{zoneId}? Его будет невозможно восстановить.», кнопка `view="negative"` (общий `ConfirmDeleteModal`). Сетевой слой - `Entities/Instance/api.ts`: `deleteInstanceFx({ project, taskName, zoneId })` (DELETE `.../zone/{zoneId}/instance` без тела), черновой паттерн с тихим fallback - `TODO(instance-api)`. **После удаления** по `deleteInstanceFx.done` рефетчится только `fetchArchivesFx` (та же страница; число конфигураций не меняется, поэтому `fetchArchivesCountFx` не дёргаем) - `sample` в `Entities/Archives/model.ts`. Пункт меню привязан в `InstanceActionsCell.tsx`, модалка монтируется в `ArchivesContentPage`. (Массовое удаление по чекбоксам - отдельно, `deleteArchivesInstancesFx` в тулбаре.)
- **Статус:** данные из `../mock/` (`archiveIndexesMock`, `archiveConfigurationsMock`), без бэка.

### Форма создания/редактирования (`/archives/edit`)

- **Код:** `src/pages/ArchivesEditPage/ArchivesEditContentPage.tsx` - одна общая `useForm` на все шаги, проброшена через `FormProvider`; шаги переключаются по `$stepperIndex` из `Widgets/ArchiveEditStepper`. Шаги (`Steps/`): 0 `StepIndexName`, 1 `StepInputData`, 2 `StepLimits`, 3 `StepSchema`, 4 `StepPreprocessing`. `Steps/api.ts` - `createSchemaFx` (с MOCK-телом).
- **Стор edit-страницы:** `ArchivesEditPage/model.ts` - `$archiveEditName`, `$archiveEditProjectShortName` (синхронизируются из `StepIndexName` через `onChangeArchiveEditName` / `onChangeArchiveEditProjectShortName`); используются в `StepLimits` для POST estimate.
- **Initial state формы (создание):** `ArchivesEditPage/constants.ts` (`ARCHIVE_EDIT_DEFAULT_VALUES`) + тип `ArchivesEditPage/types.ts` (`ArchiveEditFormValues`). Одна `useForm` на все шаги в `ArchivesEditContentPage`. Динамические поля шага «Название»: `name`; селект проекта пишет в `projectShortName`, `projectName` подставляется из `$optionsProject`; `availableQuota` - из `fetchCurrentProjectLimitsFx` → `$currentProjectLimits`. UI-флаги abyss (activeStep, confirmDialog*, waitForTaskCreation и т.п.) в форму не входят.
- **Валидация «Далее»:** `Steps/Footer.tsx` + `lib/formValidation.ts` - шаг 0: name + project; шаг 1: все `source.kafka[]` с project+name; шаг 2: все три поля `quota.*` заполнены числом.
- **Estimate квот:** `StepLimits` - debounce 500ms после изменения скорости + (размер или время хранения) + `$archiveEditProjectShortName` + `source.kafka` → `fetchCurrentEstimateFx` POST `/v2/index/archive/task/project/{projectShortName}/quota/estimate`, body `{ name, quotaEstimateRequestClientDto }` (`name: null` при создании, `name` из query при редактировании; `maxStoreDurationSec`/`maxSizeBytes` - null для незаполненного поля). На сервер скорость и размер уходят в **байтах**, время хранения - в **секундах** (`quotaUnits.ts`). Ответ estimate: незаполненное поле автозаполняется (время из `maxStoreDurationSec`, размер из `maxSizeBytes` если был пуст). Параллельно тот же payload (без project/sources) → `fetchCurrentOverdraftEstimateFx` POST `/v1/internal/index/archive/task/overdraft/estimate` (без MOCK-тела). Warnings/blockers → сторы `$currentEstimateWarnings`/`$currentEstimateBlockers`, остальное estimate → `$currentProjectEstimate`. `estimateBySize` в сторе = `params.maxStoreDurationSec === null`.
- **Лимиты проекта:** `fetchCurrentProjectLimitsFx` (`GET /v1/index/archive/quota/project/{project}`) дёргается в `StepIndexName` при выборе проекта → `$currentProjectLimits` → `LimitsProjectInfo` (current/max скорость и размер). `LimitsInfo` - таблица расчёта Flink из `$currentProjectEstimate`.
- **StepSchema:** `useFieldArray('schema.fields')` + поиск; список фильтруется **внутри `.map`** (не до него), чтобы сохранить индексы массива для react-hook-form. Поля редактируются через `SchemaFields` (см. ниже).
- **Статус:** черновик, есть `console.log` и MOCK-запросы; формы значений не интегрированы с бэком.

### SchemaFields (`src/Features/SchemaFields/`)

Редактируемые строки схемы для `StepSchema`: `MainFields` (имя/тип/подтип), `DateFields` (поле даты + формат), плюс `AuditMessage`, `CopyFields`, `FilterMessage`. Используют `ActiveCell` + `EditableFields` из `Shared/ui`.

### Лимиты и квоты (`Entities/Limits`, `Features/Limits/ui`)

- **`Entities/Limits`:** эффекты `fetchCurrentProjectLimitsFx` (`GET /v1/index/archive/quota/project/{project}`), `fetchCurrentEstimateFx` (`POST /v2/.../quota/estimate`), `fetchCurrentOverdraftEstimateFx` (`POST /v1/internal/.../overdraft/estimate`, тело - квота в байтах/секундах). Стандартный паттерн API с `handleErrorFx`.
- **`Features/Limits/ui`:** `LimitsInfo`, `LimitsProjectInfo` - таблицы расчёта квот/лимитов (используются в `StepLimits`).

### Feature-флаги (`Entities/FeatureFlags`)

- `fetchFeatureFlagFx` - `GET /v1/feature-settings/value` с параметрами `{ feature, setting, project? }`. Стор `$featureFlags` - `Map`, ключ = `feature + setting + (project | 'GLOBAL')`. Производный `$isLimitFeatureSettingEnabled` проверяет включённость фичи лимитов. Ключи фич/настроек - в `constants.ts` (`FEATURE_SETTINGS_LIMITS_*`, `FEATURE_FLAG_GLOBAL`).

---

## Окружение

- `.env` — порт dev-сервера (по умолчанию `3090`)
- `.npmrc` — токен для private npm registry
- Node.js 22+
- Husky: pre-commit → lint-staged, pre-push → `check:tsc`
