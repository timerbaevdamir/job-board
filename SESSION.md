# Сессия UI — конец августа 2026

Краткая выжимка правок по вакансиям, откликам и оболочке. Токены Mapbox в файл не класть: только `VITE_MAPBOX_ACCESS_TOKEN` в `.env`.

## Карта адреса

Живая карта в блоке «Адрес» на вакансии: Mapbox `streets-v12` (не satellite). Пин без белой обводки, якорь снизу. Под картой отступ адреса **16px** (`p-4`).

Нормализация токена: лишний префикс `pk.` снимается (`pk.pk.ey…` → `pk.ey…`). Сам токен в репозиторий не писать.

- `src/widgets/job-detail/ui/AddressMap.tsx`
- `src/shared/lib/geocodeAddress.ts`
- `src/shared/lib/geocodeAddress.test.ts`

## Отзывы

Карточки уже: на телефоне ~72% ширины (выглядывает следующая). Дата внизу. Кнопка «Оставить отзыв» убрана, остался чип «Все отзывы».

- `src/widgets/job-detail/ui/ReviewsSection.tsx`

## Контакты и логотипы

Карточка контактов: `rounded-[28px]` / `md:rounded-[20px]`. PNG-логотипы в `public/logos/` (Яндекс, Авито, Stripe, T-Bank, Skyeng, Самокат, vc.ru). На тайле — внутреннее кольцо 8% (`inset shadow`).

- `src/widgets/job-detail/ui/JobDetailView.tsx`
- `src/entities/job/ui/JobCard.tsx`
- `src/widgets/job-detail/ui/CompanyCard.tsx`
- `src/entities/appeal/ui/AppealLogo.tsx`
- `public/logos/*`

## Заглушки разделов

«Сохранённые», «Активность», «Профиль» — тихий empty state («Раздел в разработке»), иконка из `PRIMARY_NAV`.

- `src/pages/placeholder/ui/PlaceholderPage.tsx`
- `src/shared/config/navigation.tsx`
- `src/shared/lib/router.ts`

## Вопрос работодателю

Композер в одну строку: поле + кнопка отправки, чипы-подсказки снизу.

- `src/widgets/job-detail/ui/AskEmployer.tsx`

## Чат откликов

Как список вакансий: `NavStack` — список → тред → вакансия с info. На телефоне без выбранного треда по умолчанию. TabBar в треде и на вакансии из чата скрыт. Анимация info → вакансия — та же phase-машина, что у вакансий.

- `src/pages/appeals/ui/AppealsPage.tsx`
- `src/shared/ui/NavStack.tsx`
- `src/shared/lib/showTabBar.ts`
- `src/widgets/app-shell/ui/AppShell.tsx`

Логотипы в списке/хедере чата + переименования части компаний в моках (Самокат, Skyeng, vc.ru, «Компания Самолет», «Золотое Яблоко» и др.).

- `src/entities/appeal/ui/AppealLogo.tsx`
- `src/entities/appeal/api/mock.ts`
- `src/entities/job/api/mock.ts`

## Пузыри сообщений

16px padding (`px-4 py-3`), на мобилке шире (`max-w-[80%]`, `md:max-w-[72%]`). Время внизу справа (float). Входящие — инициалы в круге. В композере чипы (вложение + резюме). У приглашения — заголовок (`title`). Зазор имени и роли.

- `src/widgets/appeal-chat/ui/AppealChat.tsx`
- `src/entities/appeal/model/types.ts`

## Рекомендации и активность

Карточки рекомендаций и «Моя активность»: радиус `rounded-[20px]`.

- `src/widgets/discovery-panel/ui/DiscoveryPanel.tsx`
- `src/shared/config/recommendations.ts`

## Снекбар

На телефоне 16px над TabBar; если бара нет (тред / вакансия из чата) — 16px над home indicator.

- `src/shared/ui/Snackbar.tsx`
- `src/shared/lib/showTabBar.ts`
- `src/shared/ui/Snackbar.dom.test.tsx`

## Прочее

Один раз оболочка агента Cursor подвисла — не повторять, просто перезапустить чат.
