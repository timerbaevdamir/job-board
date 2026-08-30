import type { ReactNode } from "react"
import {
  Drawer,
  DrawerClose,
  DrawerContent,
  DrawerHeader,
  DrawerTitle,
} from "@/shared/ui/Drawer"
import { Cell } from "@/shared/ui/Cell"
import { ICON_BUTTON } from "@/shared/ui/iconButton"
import { useSnackbar } from "@/shared/ui/Snackbar"
import { useTheme } from "@/features/theme"
import { useLayoutMode } from "@/shared/lib/useLayoutMode"
import { cn } from "@/shared/lib/cn"
import {
  BellIcon,
  FileTextIcon,
  InfoIcon,
  MapPinIcon,
  MoonIcon,
  SupportIcon,
  XIcon,
} from "@/shared/ui/icons"

/** Round icon well for a cell's leading slot — the dev-kit pattern. */
function Well({ children }: { children: ReactNode }) {
  return (
    <span className="flex size-10 shrink-0 items-center justify-center rounded-full bg-chip text-foreground">
      {children}
    </span>
  )
}

/** Inset cell list — the same object as "Может быть интересно" and the dev kit. */
function Group({ caption, children }: { caption?: string; children: ReactNode }) {
  return (
    <section className="flex flex-col">
      {caption && (
        <h3 className="px-3 pb-2 pt-5 text-sm leading-5 text-muted">
          {caption}
        </h3>
      )}
      <div className="flex flex-col rounded-3xl bg-surface-muted p-2">
        {children}
      </div>
    </section>
  )
}

/** Divider inset to align with the cell text and icon. */
function Divider() {
  return <span aria-hidden className="mx-3 h-px bg-border" />
}

/**
 * The theme switch drawn as a trailing control. The row itself toggles too
 * (`as="div"` with an `onClick`), so this stops propagation — otherwise one
 * tap would travel through both handlers and cancel itself out.
 */
function Switch({
  checked,
  onToggle,
}: {
  checked: boolean
  onToggle: () => void
}) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      aria-label="Тёмная тема"
      onClick={(event) => {
        event.stopPropagation()
        onToggle()
      }}
      className={cn(
        "flex h-7 w-12 shrink-0 cursor-pointer items-center rounded-full p-1 transition-colors",
        checked ? "bg-brand" : "bg-border-strong",
      )}
    >
      <span
        className={cn(
          "block size-5 rounded-full bg-white shadow-sm transition-transform",
          checked && "translate-x-5",
        )}
      />
    </button>
  )
}

/**
 * The "Ещё" menu: settings and secondary destinations, one cell per row.
 * A phone gets a bottom sheet, wider screens a panel from the left edge —
 * the same split the city picker uses, for the same reason.
 *
 * The theme row is live; the destinations that have no screen yet say so
 * through the snackbar rather than pretending to open something.
 */
export function MoreMenu({
  open,
  onOpenChange,
}: {
  open: boolean
  onOpenChange: (open: boolean) => void
}) {
  const onPhone = useLayoutMode() === "mobile"
  const { theme, toggleTheme } = useTheme()
  const { show } = useSnackbar()

  const inDevelopment = (label: string) => () => {
    // The sheet would paint over the toast (both sit at the same z-index),
    // so leave first — the same way picking a city closes its drawer.
    onOpenChange(false)
    show({
      title: "Раздел в разработке",
      subtitle: `«${label}» появится позже`,
    })
  }

  return (
    <Drawer
      open={open}
      onOpenChange={onOpenChange}
      swipeDirection={onPhone ? "down" : "left"}
    >
      <DrawerContent>
        <div className="relative z-10 shrink-0 bg-surface">
          <DrawerHeader
            action={
              <DrawerClose aria-label="Закрыть" className={cn("-mr-1", ICON_BUTTON)}>
                <XIcon className="size-5" />
              </DrawerClose>
            }
          >
            <DrawerTitle>Ещё</DrawerTitle>
          </DrawerHeader>
        </div>

        <div className="scroll-area flex min-h-0 flex-1 flex-col gap-1 overflow-y-auto px-4 pb-8">
          <Group>
            <Cell
              as="div"
              onClick={toggleTheme}
              className="cursor-pointer transition-colors hover:bg-chip"
              start={
                <Well>
                  <MoonIcon className="size-5" />
                </Well>
              }
              label="Тёмная тема"
              end={<Switch checked={theme === "dark"} onToggle={toggleTheme} />}
            />
          </Group>

          <Group caption="Настройки">
            <Cell
              onClick={inDevelopment("Уведомления")}
              start={
                <Well>
                  <BellIcon className="size-5" />
                </Well>
              }
              label="Уведомления"
              chevron
            />
            <Divider />
            <Cell
              onClick={inDevelopment("Регион поиска")}
              start={
                <Well>
                  <MapPinIcon className="size-5" />
                </Well>
              }
              label="Регион поиска"
              end={
                <span className="shrink-0 text-sm leading-5 text-muted">
                  Москва
                </span>
              }
              chevron
            />
            <Divider />
            <Cell
              onClick={inDevelopment("Моё резюме")}
              start={
                <Well>
                  <FileTextIcon className="size-5" />
                </Well>
              }
              label="Моё резюме"
              chevron
            />
          </Group>

          <Group caption="Помощь">
            <Cell
              onClick={inDevelopment("Поддержка")}
              start={
                <Well>
                  <SupportIcon className="size-5" />
                </Well>
              }
              label="Поддержка"
              chevron
            />
            <Divider />
            <Cell
              onClick={inDevelopment("О сервисе")}
              start={
                <Well>
                  <InfoIcon className="size-5" />
                </Well>
              }
              label="О сервисе"
              sublabel="Версия 1.0"
              chevron
            />
          </Group>
        </div>
      </DrawerContent>
    </Drawer>
  )
}
