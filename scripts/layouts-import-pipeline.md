# Пайплайн работы с `layouts-import` JSON

Документ описывает порядок правок экспорта лейаутов DOOH (проект **Селлеры 4k+**, `6a8c435ac128c37f2155b905`) перед импортом в админку.

Файлы обычно лежат в `~/Downloads/` и нумеруются в скобках: `(1).json`, `(2).json`, … — каждый следующий шаг пишет в **новую** версию или перезаписывает текущую после бэкапа.

---

## Формат файла (кратко)

```json
{
  "project": { "id", "name", "layoutElements" },
  "scenes": [
    {
      "id", "canvas": { "width", "height" },
      "placement": { "id", "name" },
      "layouts": [
        {
          "id", "name", "durationSec",
          "elements": [
            { "type", "title", "properties": [{ "key", "value" }], "variants?" }
          ]
        }
      ],
      "settings": { "mode": "mono" | "split", "split?": { ... } }
    }
  ]
}
```

Типы элементов: `background`, `fade`, `wb-logo`, `discount`, `disclaimer`, **`extra-disclaimer`**.

---

## Роли файлов

| Файл | Назначение |
|------|------------|
| Prod reference | Актуальные лейауты с prod (`layouts-import-…905.json` или `(1).json`) |
| Stage working copy | Рабочая копия stage `(2).json`, `(10).json`, `(11).json` … |
| `scripts/figma-banners-14frames.json` | Экспорт 14 Figma-фреймов (split + mono MED/BAD) |
| `*.bak.json` | Бэкап перед каждым прогоном |

**Prod → stage sync** только для сцен **не** «Медиафасад». Split/long Медиафасад правится отдельно из Figma.

---

## Рекомендуемый порядок шагов

### 0. Бэкап

```bash
cp "/Users/damir/Downloads/layouts-import-6a8c435ac128c37f2155b905 (N).json" \
   "/Users/damir/Downloads/layouts-import-6a8c435ac128c37f2155b905 (N).bak.json"
```

### 1. Sync non-Медиафасад из prod

Копирует лейауты всех placement, кроме «Медиафасад», и `project.layoutElements` из prod в stage.

```bash
python3 scripts/sync-non-mediafasad.py \
  "/Users/damir/Downloads/layouts-import-6a8c435ac128c37f2155b905 (2).json" \
  "/Users/damir/Downloads/layouts-import-6a8c435ac128c37f2155b905 (1).json"
```

Аргументы: `stage.json` `prod.json`.

### 2. Пометить дубликаты и мусор

Префикс **`удалить `** в имени лейаута — сигнал удалить вручную в админке после импорта.

```bash
python3 scripts/mark-layouts-for-deletion.py \
  "/Users/damir/Downloads/layouts-import-6a8c435ac128c37f2155b905 (3).json"
```

Помечает: дубликаты по имени (оставляет один), junk (`тест`, `Лейаут по умолчанию`, …).

Опционально — скрипт для консоли браузера:

```bash
python3 scripts/generate-browser-delete-script.py "(3).json"
```

### 3. Точечное восстановление лейаутов

```bash
python3 scripts/restore-deleted-layouts.py \
  "/Users/damir/Downloads/layouts-import-6a8c435ac128c37f2155b905 (1).json" \
  "/Users/damir/Downloads/layouts-import-6a8c435ac128c37f2155b905 (5).json"
```

Аргументы: `reference.json` `target.json`. Списки `REMOVE` / `RESTORE_FROM_REF` / `COPY_IN_SCENE` правятся внутри скрипта под задачу.

### 4. Metro 1080×1920 — 4 именованных лейаута

Как у Metro 2160×3840: базовый селлер + 4 layout.

```bash
python3 scripts/fill-metro-1080-layouts.py \
  "/Users/damir/Downloads/layouts-import-6a8c435ac128c37f2155b905 (2).json" \
  "/Users/damir/Downloads/layouts-import-6a8c435ac128c37f2155b905 (6).json"
```

Добавляет: `Мелкая слева`, `Мелкая справа`, `Мелкая внизу`, `Крупная справа` (`id: ""`).

### 5. Figma export для split MED/BAD

**Вариант A** — сохранить JSON вручную в:

`scripts/figma-banners-14frames.json`

**Вариант B** — вытащить из transcript Cursor:

```bash
python3 scripts/extract-figma-14frames-from-transcript.py
```

14 фреймов: 6 long split (Океания / Сфера / Самбо × лево/право) + mono MED/BAD.

### 6. Конвертация split · МЕД / · БАД (главный шаг)

```bash
python3 scripts/convert-split-mediafasad-bad-med.py \
  scripts/figma-banners-14frames.json \
  "/Users/damir/Downloads/layouts-import-6a8c435ac128c37f2155b905 (11).json"
```

**Затронутые split-сцены** (8480×864, 5280×320, 8736×1056):

| Canvas | Scene ID (лево / право) |
|--------|-------------------------|
| 8480×864 | `6a8ff6f0…` / `6a902dc4…` |
| 5280×320 | `6a8ff70d…` / `6a902d3c…` |
| 8736×1056 | `6a8ff726…` / `6a902ce3…` |

**В каждой сцене 3 лейаута:**

1. Базовый (`Океания 8480x864 - лево`) — не трогается  
2. `… · МЕД`  
3. `… · БАД`

**Правила сборки · МЕД / · БАД:**

| Элемент | Источник |
|---------|----------|
| `wb-logo`, `discount` | Из базового лейаута сцены (+ tag из Figma для скидки) |
| `disclaimer` (quantity) | x/y из базового лейаута по порядку, `align: center`, `shiftZoneTop: 60` |
| `disclaimer` (RVB, длинный) | Координаты и текст из Figma, **без** `shiftZoneTop` |
| **`extra-disclaimer`** (МЕД/БАД) | `type: extra-disclaimer`, `extraDisclaimerId`: `med-products` / `bads`, геометрия в `variants`, **`align: left`** для `- лево`, **`right`** для `- право`, без `shiftZoneTop` |

Имена лейаутов: `Океания 8480x864 - лево · МЕД`, `Сфера 5280x320 - право · БАД`, и т.д.

Существующие `id` у `· МЕД` / `· БАД` сохраняются при повторном прогоне.

### 7. Импорт в админку

1. Импорт финального `(11).json` (или последней версии).  
2. Удалить лейауты с префиксом `удалить ` в UI.  
3. Проверить превью split-сцен: базовый + MED + BAD.

---

## Проверки после конвертации

```bash
# 12 имён MED/BAD
grep -c '· МЕД\|· БАД' "(11).json"

# extra-disclaimer в variant-лейаутах
grep -c '"type": "extra-disclaimer"' "(11).json"

# align в variants (left/right на split)
grep -A2 '"key": "align"' "(11).json" | grep -E 'left|right'

# 6 сцен × 3 лейаута в split — вручную или по scene id
```

Ожидаемый вывод конвертера:

```
OK Океания 8480x864 - лево · МЕД (… elements, logos=2, extra=yes)
…
Updated 6 split scenes -> …(11).json
```

---

## Прочие скрипты

| Скрипт | Назначение |
|--------|------------|
| `convert-figma-layouts.mjs` | Ранний прототип: 6 split из `figma-banners-6frames.json` |
| `patch-mono-layouts.py` | Mono 3584×1632 и др. из test import, `align: left` |
| `copy-mono-layouts.mjs` / `export-mono-layouts.mjs` | Вспомогательные mono-операции |
| `clear-non-media-layout-ids.py` | `id: ""` у non-Медиафасад перед импортом |
| `clear-prod-layout-ids.sh` | Обнуление id на prod-экспорте |

---

## Split scene IDs и имена базовых лейаутов

```
8480x864 - лево/право  → Океания 8480x864 - …
5280x320 - лево/право  → Сфера 5280x320 - …
8736x1056 - лево/право → Самбо 8736x1056 - …
```

---

## Частые проблемы

**iCloud Downloads** — чтение больших JSON из агента/Cursor может зависать. Скрипты запускать **локально в Terminal**.

**Python 3.9** — не использовать `dict | None`; в скриптах уже `Optional[…]`.

**`dquote>` в zsh** — не вставлять большой JSON через heredoc в терминал; сохранять через TextEdit или `extract-figma-14frames-from-transcript.py`.

**Не путать типы дисклеймеров:**

- Обычный **`disclaimer`** — quantity, RVB-текст.  
- **`extra-disclaimer`** — только МЕД/БАД с `variants` и `extraDisclaimerId`.

**Mono 3008×480 MED/BAD** — в `convert-split-mediafasad-bad-med.py` пока **не** обрабатывается (только long split canvas).

---

## Типовой полный прогон (кратко)

```bash
cd "/Users/damir/Documents/Job Board Interface Skeleton"

# 1. Sync prod → stage
python3 scripts/sync-non-mediafasad.py "(2).json" "(1).json"

# 2. Mark junk/duplicates (если нужно)
python3 scripts/mark-layouts-for-deletion.py "(3).json"

# 3. Restore / fill metro (по необходимости)
python3 scripts/fill-metro-1080-layouts.py "(2).json" "(6).json"

# 4. Figma
python3 scripts/extract-figma-14frames-from-transcript.py

# 5. Split MED/BAD
cp "(10).json" "(11).bak.json"
python3 scripts/convert-split-mediafasad-bad-med.py \
  scripts/figma-banners-14frames.json \
  "(11).json"
```

После этого — импорт `(11).json` и ручная чистка `удалить `.
