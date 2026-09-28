# Navigation Rework Summary

This branch is for refactoring `/exploration-old` files into the new `/exploration` directory on the `navigation-rework` branch. The old code was quite heavily vibe coded by Claude as I was fleshing out how the product should look and work visually, but the code became a mess. In the new directory, I'm hand coding most of the components in the correct shape and composition. Claude's job will be to assist with this rather than outright create full components, help with maths etc. We will be going through code slowly to re-create components properly with the new end goal in mind.

The main fork which has lead to this refactor was the design of a whole navigational layer between pages. Before we had three pages for Journal, Collections and Items, where we would load in new data into those components each time we needed to show a new instance of those pages. The new approach is to load all content of the app into multiple instances of these components when the app launches, so instead of one Journal page for example, we have a full array of journal pages, all loaded at once, almost like an array of cards laid out. There are systems for motion to navigagte across these rows, and up and down between the rows, as described in this spec.

Included in this overhaul was a complete rewrite of the AppContext and how data is stored and managed. This all lives within AppContext.jsx, along with the shape of each entity type in the comments at the bottom of the file.

Since I am actively using this app to create content as a user already, and since the current refactor is still in progress, I've been switching back to the `main` branch to add content in the old system, then when I'm back to `navigation-refactor` I use the migration function on the settings page to pull in that content into the new shape / storage (since the new version has a new AsyncStorage location key).

Current focus: `Page` level components refactor, currently within the Journal area.

## Terminology & Hierarchy

Below is a description of the app's core structure. One thing to note initially is that all `Page`, `Navigator` etc. files are there to drive the base functionality of the related level of the app, so the other files have to do as little work as possible and can just deal with loading in the correct content, hooking things up and any specific differences.

### Components

This isn't a specific folder but it basically covers all small parts of any gives page. Gallery, Buttons, StickyHeader etc. These have folders at the top level of `/components/` but also some within different areas when they are localised.

### Pages

Pages are any single app view that you scroll through to explore its content. This is basically a traditional app page built up with components.

- `Page`: Contains all functionality that is shared and needed by Pages.
- `JournalPage`: Contains a title, intro text and tags area, then a list of attached item entries
- `CollectionPage`: Contains the contents page for a collection of items, which shows a list of all items that work as a shortcut to jump to that item's page
- `ItemPage`: Contains a hero section and then a chronological list of all entries related to this item
- `AddXPage:` Contains the empty "create new" page, which is effectively an empty copy of the equivalent pages.

### Rows

Rows are a sequence of instances of Pages. Instead of the app having a single "Journal Page" where we load in new values in situ for each journal entry, we instead mount and render all journal pages in individual pages almost like a list of cards in a row. This is necessary for both the performance aspect of the app but also for the transitions between pages.

- `Row`: Contains all functionality shared and needed by rows, including the handling of animated transitions and hooking up Rows to Navigators.
- `JournalRow`: Contains a list of `JournalPage` pages and wires navigation up to the `JournalNavigator`.
- `CollectionsRow`: Contains a list of `CollectionPage`s and wires navigation up to the `CollectionsNavigator`.
- `ItemsRow`: Contains a list of `ItemPage`s and wires navigation up to the `ItemsNavigator`.
- `AddPageRow`: Contains a single `AddXPage`, one row for each.

### Navigators

Navigators are the horizontally scrolling components that act as a way of navigating across a row of pages.

- `Navigator`: Contains all functionality that is shared and needed by Navigators. This includes regular and irregular scroll snapping, controlling the active item, edit mode controls such as cancel, save and reorder etc.
- `JournalNavigator`: Contains a set of `DayCircle` components which each relate to a `JournalPage`. It also uses `StickyLabel`s for the year and months that appear above the day circles. The scroll-snapping has regular intervals.
- `CollectionsNavigator`: Contains a set of `CollectionCard` components which each relate to a `CollectionPage`. The scroll-snapping has regular intervals.
- `ItemsNavigator`: Contains a set of `ItemCard` components which each relate to an `ItemPage`. The scroll-snapping has irregular intervals due to each item card having a different aspect ratio.
- `LibraryNavigator`: Contains both the `CollectionsNavigator` and the `ItemsNavigator` and basically acts as a way to transition between the two navigators.
- `PickerNavigator`: Contains what is essentially the `LibraryNavigator` but with differences as it is used when adding content on a journal page, therefore it doesn't have an edit mode and has a different container.

### Spaces

Spaces are effectively app pages, though due to how the content loading and animation between content is done, we are faking the app tab navigation with spaces for collections and journal.

- `Space`: Contains all functionality that is shared and needed by Spaces. This primarily includes dealing with the transitions between rows.
- `JournalSpace`: Contains a `JournalRow` and `AddPageRow` for `AddJournalPage`.
- `CollectionsSpace`: Contains a `CollectionsRow`, an `ItemsRow`, an `AddPageRow` for `AddCollectionPage` and an `AddPageRow` for `AddItemPage`.

### Exploration

Exploration is not a folder but a single `ExplorationManager` file that lives at the very top of the stack. It deals with transitioning between spaces and dealing with cancelling edit states when doing so.

## Motion Style setting

A "Motion Style" toggle will be added to settings page. It will have "Immersive" and "Instant" modes.

- Immersive: All animations turned on for pagination and nvagiation
- Instant: Zero navigational animations, pages will just load immediately in place when navigating. Notably though, this mode will also be used at times even when in Immersive mode, for moments such as moving between an add screen into the content row without the user knowing anything has happened visually.

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
