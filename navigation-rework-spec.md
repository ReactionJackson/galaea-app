# Navigation Rework Spec

Status: design in progress. Journal's proof of concept (step 1, plus the RowManager compound-component pattern) is built and stable; Collections/Items are not yet ported. This sits alongside `spec.md` rather than replacing any of it, and covers the generalisation of the Journal `RowManager`/`Navigator` proof of concept into the app's whole navigation model.

## Terminology & Hierarchy

Below is a description of the app's core structure. One thing to note initially is that all `XManager` files are there to drive the base functionality of the related level of the app, so the other files have to do as little work as possible and can just deal with loading in the correct content, hooking things up and any specific differences.

### Components

This isn't a specific folder but it basically covers all small parts of any gives page. Gallery, Buttons, StickyHeader etc. These have folders at the top level of `/components/` but also some within different areas when they are localised.

### Pages

Pages are any single app view that you scroll through to explore its content. This is basically a traditional app page built up with components.

- `JournalPage`: Contains a title, intro text and tags area, then a list of attached item entries
- `CollectionPage`: Contains the contents page for a collection of items, which shows a list of all items that work as a shortcut to jump to that item's page
- `ItemPage`: Contains a hero section and then a chronological list of all entries related to this item
- `AddXPage:` Contains the empty "create new" page, which is effectively an empty copy of the equivalent pages
- `PageManager`: Contains all functionality that is shared and needed by Pages.

### Rows

Rows are a sequence of instances of Pages. Instead of the app having a single "Journal Page" where we load in new values in situ for each journal entry, we instead mount and render all journal pages in individual pages almost like a list of cards in a row. This is necessary for both the performance aspect of the app but also for the transitions between pages.

- `JournalRow`: Contains a list of `JournalPage` pages and wires navigation up to the `JournalNavigator`.
- `CollectionsRow`: Contains a list of `CollectionPage`s and wires navigation up to the `CollectionsNavigator`.
- `ItemsRow`: Contains a list of `ItemPage`s and wires navigation up to the `ItemsNavigator`.
- `AddPageRow`: Contains a single `AddXPage`, one row for each.
- `RowManager`: Contains all functionality shared and needed by rows, including the handling of animated transitions and hooking up Rows to Navigators.

### Navigators

Navigators are the horizontally scrolling components that act as a way of navigating across a row of pages.

- `JournalNavigator`: Contains a set of `DayCircle` components which each relate to a `JournalPage`. It also uses `StickyLabel`s for the year and months that appear above the day circles. The scroll-snapping has regular intervals.
- `CollectionsNavigator`: Contains a set of `CollectionCard` components which each relate to a `CollectionPage`. The scroll-snapping has regular intervals.
- `ItemsNavigator`: Contains a set of `ItemCard` components which each relate to an `ItemPage`. The scroll-snapping has irregular intervals due to each item card having a different aspect ratio.
- `LibraryNavigator`: Contains both the `CollectionsNavigator` and the `ItemsNavigator` and basically acts as a way to transition between the two navigators.
- `PickerNavigator`: Contains what is essentially the `LibraryNavigator` but with differences as it is used when adding content on a journal page, therefore it doesn't have an edit mode and has a different container.
- `NavigatorManager`: Contains all functionality that is shared and needed by Navigators. This includes regular and irregular scroll snapping, controlling the active item, edit mode controls such as cancel, save and reorder etc.

### Spaces

Spaces are effectively app pages, though due to how the content loading and animation between content is done, we are faking the app tab navigation with spaces for collections and journal.

- `JournalSpace`: Contains a `JournalRow` and `AddPageRow` for `AddJournalPage`.
- `CollectionsSpace`: Contains a `CollectionsRow`, an `ItemsRow`, an `AddPageRow` for `AddCollectionPage` and an `AddPageRow` for `AddItemPage`.
- `SpaceManager`: Contains all functionality that is shared and needed by Spaces. This primarily includes dealing with the transitions between rows.

### Exploration

Exploration is not a folder but a single `ExplorationManager` file that lives at the very top of the stack. It deals with transitioning between spaces and dealing with cancelling edit states when doing so.

## Open questions

- `TrackStack` (in `NavigatorManager.jsx`): the old flip-between-Collections-and-Items picker mechanism, still under its old name. It currently drives the Collections screen directly (`app/(tabs)/collections.jsx` uses `ItemPage`/`CollectionPage` plus `NavigatorManager`/`TrackStack` straight, not through `CollectionsRow`/`ItemsRow` at all) and is reused separately for the journal entry's item-picker (`PickerNavigator`). Needs a decision: fold it into `CollectionsRow`/`ItemsRow` and `ExplorationManager`'s `transitionRows()`, or keep it a separate reusable component under a new name.
- `NavigatorManager.jsx` currently bundles two unrelated things in one file: the generic bottom edit-controls bar (cancel/save/reorder, shown during edit mode) and the unrelated `TrackStack` picker flip mechanism above. Worth splitting once the `TrackStack` question above is settled.

## Where this starts from

The Journal `RowManager`/`Navigator` proof of concept already works and is the foundation for everything below, this is what `RowManager`/`JournalRow` and `Navigator`/`JournalNavigator` actually are under the hood:

- A shared `progress` value (a continuous float index) and an `activeDriver` flag (which side, the `RowManager` or the `Navigator`, is currently being dragged) keep the two in sync, whichever side is dragged drives the other.
- Pages use an "app switcher" style card stack transform, computed from `d = index - progress`: the active page sits at full size, queued pages fan out pinned to the left, the page just left slides off flat to the right.
- Overscrolling either control rubber-bands naturally on its own, without one side's overscroll leaking into and distorting the other's transform.
- The `Navigator`'s own highlight state (which day is active, condensed vs full size indicator dot) stays correct regardless of which side is doing the paginating, with no flash of the wrong day on load or on landing on a new page.

Everything below builds on this same mechanism rather than replacing it.

## Motion Style setting

A "Motion Style" toggle in settings, Immersive or Instant, for people who don't want the card stack animation.

- The setting is mirrored into a shared value, since worklets can't read React context directly.
- Immersive keeps the current stack, scale, and dimming treatment.
- Instant collapses the page style to identity (no stacking, no dimming, square corners) and makes the settle an immediate snap rather than an eased glide.
- Pagination logic itself (progress tracking, cross-side sync, settling) is identical either way, only the visual layer branches.

## `Navigator` maths for irregular items

The `Navigator` currently derives its continuous progress value with `scrollX / itemStride`, a flat division that assumes every item is the same width. Once a `Navigator` holds irregularly sized items (item cards, rather than uniform day circles), this needs to become an interpolation against the `offsets` array the `Navigator` already computes for its own snap points, so progress reflects real physical distance to the next item's centre rather than a fixed item count. The `RowManager` side is unaffected either way.

## The Row model

Generalises "a `Row` plus its `Navigator`" into any number of stacked, absolutely positioned `Row`s, with only one ever live and interactive outside of a transition:

- Journal: `Row` 1 is the day pages, `Row` 2 is the add-day page.
- Collections: `Row` 1 is the collection pages, `Row` 2 is either the add-collection page or the currently open collection's item pages (mutually exclusive, whichever the user is doing), `Row` 3 is the add-item page.
- Each `Row` that can host more than one alternative (like Collections' `Row` 2) needs an explicit small state for which content currently occupies it, rather than ad hoc flags.

## Transitioning between Rows

A single function, `transitionRows()`, drives every `Row` change, symmetric in both directions: the `Row` losing focus fades out in place, the `Row` taking over slides up from below and grows to fill the screen, and it plays in reverse (slide down out of sight, fade in in place) when moving to a lower `Row` than a higher one.

Switching `Row`s is always triggered by a button press (add X, enter or leave a folder), never a gesture, so nothing about how dragging within a `Row` already works needs to change.

There is also an immediate, zero-animation variant of this same transition, used for two things:

- Saving from an add-X page: rather than animating back up a `Row`, the new entry is created in the `Row` above and the view jumps straight to it already sitting there, as if the user had already been browsing that `Row`.
- Switching tabs while mid-edit: since nothing is actually unmounted when switching tabs, this is a safe, instant way to also implicitly cancel any in-flight edit, fixing the current bug where edit mode gets stuck across tab switches.

## Tabs as Row-set toggles

Journal and Collections are both mounted inside one shared `ExplorationManager` rather than being separate screens that mount and unmount. Pressing the other tab button swaps which section's `Row`s are visible and doubles as the implicit edit-mode cancel described above. Settings remains its own separate screen.

## Edit mode

Entering edit mode does not change from how it already looks and behaves today: a page's own `Navigator` shifts up to reveal cancel and save, and pagination is disabled while editing.

The trigger changes though. Rather than tapping the already active item on the `Navigator` (today's overload, and part of what's making the `Navigator`'s gestures fragile), each editable `Page` gets its own small "Edit" button pinned to the bottom of the page, inside an `AnimateHeight` container so it collapses away the moment edit mode starts and reappears once it ends, owned generically by `PageManager` rather than each `Page` reimplementing it. Detecting edit mode from an overscroll past the bottom of the page (mirroring pull to refresh at the top) is a nice future direction but deliberately deferred, for now the button is the entire mechanism, so short or empty pages need no special handling.

Newly, `ExplorationManager` disables all pagination while any page is being edited, not just within-`Row` swiping (which the `Row` already disables today) but `Row` transitions too (add buttons, entering or leaving a folder), so there is no way to accidentally page away mid edit. The one deliberate exception is pressing another tab in the bottom nav bar, which is treated as an implicit cancel rather than being blocked, exactly as already agreed for tab switching generally.

## Loading strategy for v1

The first version loads and mounts everything up front: every journal day, every collection, every item, all already present before the user interacts with anything, same principle as how Journal already works today. A slower one-off launch is an accepted trade for the app then being completely instant everywhere afterwards, with no loading state anywhere else in the app to build or reason about. Lazier per-collection loading is only worth revisiting later if that launch time turns out to be a genuine problem in practice, not decided up front.

## Steps for implementation

1. Rename and reorganise the existing proof of concept into the terminology above, a pure refactor with no behaviour change, so everything after this references the new names. **Journal side: done** (`RowManager` is the generic compound-component mechanism, `JournalRow`/`JournalNavigator`/`JournalPage` are its thin wrappers, all moved into `/components/exploration/`). **Collections/Items side: not done** — `CollectionsRow`, `ItemsRow`, and `AddPageRow` are still empty stubs, and `app/(tabs)/collections.jsx` still runs on the old, unrenamed `TrackStack`/`NavigatorManager` + `ItemPage`/`CollectionPage` wiring directly, with its own local `editMode = !!itemDraft` flag rather than going through a `Row` at all. Finishing this step means building `CollectionsRow`/`ItemsRow` as thin wrappers the same way `JournalRow` is, resolving the `TrackStack` open question above, and reconciling Collections' local `editMode` flag with the single global `editMode` via `useApp()` established elsewhere.
2. Add the Motion Style setting (Immersive / Instant) end to end on the existing single Journal `Row`, this doesn't depend on anything else in this list. There should be a basic toggle in the Settings page to control this.
3. Replace edit mode's trigger with the static Edit button at the bottom of each page, keeping its current visual behaviour (`Navigator` shifting up to reveal cancel and save) exactly as is. The edit button should be visible when `!editMode`, placed inside an `AnimateHeight` component, owned by `PageManager`.
4. Build the generic `ExplorationManager` and `RowManager` stacking mechanism, including `transitionRows()`, proved out on Journal's own two `Row`s (days, add day) since that's the simplest real case.
5. Wire the "Add X Page" flow through that mechanism (the add button triggers a transition down, save uses the immediate mode jump into the `Row` above, cancel reverses it).
6. Fix the `Navigator`'s progress maths for irregular item widths (interpolating against `offsets` instead of dividing by a fixed stride), needed before Collections items exist.
7. Build out Collections' three `Row`s (collections, items or add collection, add item) on top of the now proven `Row` mechanism from steps 4 and 5.
8. Merge Journal and Collections into one shared `ExplorationManager`, wiring the bottom nav tabs to toggle which `Row` set is visible and to trigger the implicit edit cancel.
9. Add the blanket "no pagination while editing" guard at the `ExplorationManager` level, covering `Row` transitions as well as within-`Row` swiping, with the tab bar exception.
10. Switch on the full up-front loading strategy across Journal, every collection, and every item, and see how launch actually feels in practice.
