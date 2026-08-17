import { HeaderFade } from "@/shared/ui/HeaderFade"
import { SearchField } from "@/features/job-search"
import { FilterBar } from "@/features/job-search"

/**
 * Sticky search bar composing the search combobox with the in-field filter bar.
 * Both read and write the search store directly, so this widget only wires them
 * together and owns the sticky/fade chrome.
 */
export function SearchHeader() {
  // The top inset matches the side inset the field already has — 16 on a narrow
  // screen, where `px-4` sets the sides. From `sm` the sides grow to 32 and the
  // top stays 24: that ratio is the desktop spacing this screen was drawn with,
  // and only the phone was out of step.
  return (
    <div className="sticky top-0 z-20 -mx-4 px-4 pt-4 sm:-mx-8 sm:px-8 sm:pt-6">
      <HeaderFade />
      <SearchField filters={<FilterBar />} />
    </div>
  )
}
