# Navigation Rework Spec

Status: design in progress, nothing here is built yet unless stated otherwise. This sits alongside `spec.md` rather than replacing any of it, and covers the generalisation of the Journal `ViewTrack`/`NavigatorTrack` proof of concept into the app's whole navigation model.

## Terminology

- `ViewTrackOperator`: the single top level component wrapping the whole main part of the app (Journal and Collections both). Owns `currentTab`, and handles everything to do with moving between `ViewTrack`s: which one is currently visible, the transition itself (`transitionRows()`), and anything that ought to happen as a result of that move (the implicit edit-mode cancel on switching tabs, disabling pagination while a page is being edited, and so on). It does not own pagination within a `ViewTrack`, that's the `ViewTrack`'s own job.
- `ViewTrack`: purely the horizontal navigation mechanism already built in the proof of concept (the shared `progress`/`activeDriver` sync with its `NavigatorTrack`, the card stack transform, settling, all of it). It is completely content agnostic, it just expects a number of pages and moves between them, it has no idea what those pages actually contain.
- `JournalViewTrack`, `CollectionsViewTrack`, `ItemsViewTrack`, `AddPageViewTrack`: the actual components used around the app. Each is a thin wrapper that supplies `ViewTrack` with its own specific set of pages (Journal's day pages, Collections' own pages, a collection's items, an add-X page) and wires it to the matching `NavigatorTrack`. `ViewTrack` itself is never used directly, only through one of these.
- `NavigatorTrack`: purely the small horizontal strip mechanism used to jump between a `ViewTrack`'s pages, kept strictly to that one job now that edit mode no longer overloads it. Like `ViewTrack`, it is content agnostic, it just expects a number of selectable items.
- `JournalNavigatorTrack`, `CollectionsNavigatorTrack`, `ItemsNavigatorTrack`: the actual `NavigatorTrack`s used around the app, housed in the existing `TrackTray` along the bottom of the screen. `NavigatorTrack` itself is never used directly, only through one of these.
- `ViewPage`: a single page within a `ViewTrack`.

A given `ViewTrack` is always wired to one specific `NavigatorTrack` by hand (the `CollectionsViewTrack` always talks to the `CollectionsNavigatorTrack` for example), there is no generic pairing mechanism.

## Where this starts from

The Journal `ViewTrack`/`NavigatorTrack` proof of concept already works and is the foundation for everything below, this is what `ViewTrack`/`JournalViewTrack` and `NavigatorTrack`/`JournalNavigatorTrack` actually are under the hood:

- A shared `progress` value (a continuous float index) and an `activeDriver` flag (which side, the `ViewTrack` or the `NavigatorTrack`, is currently being dragged) keep the two in sync, whichever side is dragged drives the other.
- Pages use an "app switcher" style card stack transform, computed from `d = index - progress`: the active page sits at full size, queued pages fan out pinned to the left, the page just left slides off flat to the right.
- Overscrolling either control rubber-bands naturally on its own, without one side's overscroll leaking into and distorting the other's transform.
- The `NavigatorTrack`'s own highlight state (which day is active, condensed vs full size indicator dot) stays correct regardless of which side is doing the paginating, with no flash of the wrong day on load or on landing on a new page.

Everything below builds on this same mechanism rather than replacing it.

## Motion Style setting

A "Motion Style" toggle in settings, Immersive or Instant, for people who don't want the card stack animation.

- The setting is mirrored into a shared value, since worklets can't read React context directly.
- Immersive keeps the current stack, scale, and dimming treatment.
- Instant collapses the page style to identity (no stacking, no dimming, square corners) and makes the settle an immediate snap rather than an eased glide.
- Pagination logic itself (progress tracking, cross-side sync, settling) is identical either way, only the visual layer branches.

## `NavigatorTrack` maths for irregular items

The `NavigatorTrack` currently derives its continuous progress value with `scrollX / itemStride`, a flat division that assumes every item is the same width. Once a `NavigatorTrack` holds irregularly sized items (item cards, rather than uniform day circles), this needs to become an interpolation against the `offsets` array the `NavigatorTrack` already computes for its own snap points, so progress reflects real physical distance to the next item's centre rather than a fixed item count. The `ViewTrack` side is unaffected either way.

## The ViewTrack model

Generalises "a `ViewTrack` plus its `NavigatorTrack`" into any number of stacked, absolutely positioned `ViewTrack`s, with only one ever live and interactive outside of a transition:

- Journal: `ViewTrack` 1 is the day pages, `ViewTrack` 2 is the add-day page.
- Collections: `ViewTrack` 1 is the collection pages, `ViewTrack` 2 is either the add-collection page or the currently open collection's item pages (mutually exclusive, whichever the user is doing), `ViewTrack` 3 is the add-item page.
- Each `ViewTrack` that can host more than one alternative (like Collections' `ViewTrack` 2) needs an explicit small state for which content currently occupies it, rather than ad hoc flags.

## Transitioning between ViewTracks

A single function, `transitionRows()`, drives every `ViewTrack` change, symmetric in both directions: the `ViewTrack` losing focus fades out in place, the `ViewTrack` taking over slides up from below and grows to fill the screen, and it plays in reverse (slide down out of sight, fade in in place) when moving to a lower `ViewTrack` than a higher one.

Switching `ViewTrack`s is always triggered by a button press (add X, enter or leave a folder), never a gesture, so nothing about how dragging within a `ViewTrack` already works needs to change.

There is also an immediate, zero-animation variant of this same transition, used for two things:

- Saving from an add-X page: rather than animating back up a `ViewTrack`, the new entry is created in the `ViewTrack` above and the view jumps straight to it already sitting there, as if the user had already been browsing that `ViewTrack`.
- Switching tabs while mid-edit: since nothing is actually unmounted when switching tabs, this is a safe, instant way to also implicitly cancel any in-flight edit, fixing the current bug where edit mode gets stuck across tab switches.

## Tabs as ViewTrack-set toggles

Journal and Collections are both mounted inside one shared `ViewTrackOperator` rather than being separate screens that mount and unmount. Pressing the other tab button swaps which section's `ViewTrack`s are visible and doubles as the implicit edit-mode cancel described above. Settings remains its own separate screen.

## Edit mode

Entering edit mode does not change from how it already looks and behaves today: a page's own `NavigatorTrack` shifts up to reveal cancel and save, and pagination is disabled while editing.

The trigger changes though. Rather than tapping the already active item on the `NavigatorTrack` (today's overload, and part of what's making the `NavigatorTrack`'s gestures fragile), each editable `ViewPage` gets its own small "Edit" button pinned to the bottom of the page, inside an `AnimateHeight` container so it collapses away the moment edit mode starts and reappears once it ends. Detecting edit mode from an overscroll past the bottom of the page (mirroring pull to refresh at the top) is a nice future direction but deliberately deferred, for now the button is the entire mechanism, so short or empty pages need no special handling.

Newly, `ViewTrackOperator` disables all pagination while any page is being edited, not just within-`ViewTrack` swiping (which the `ViewTrack` already disables today) but `ViewTrack` transitions too (add buttons, entering or leaving a folder), so there is no way to accidentally page away mid edit. The one deliberate exception is pressing another tab in the bottom nav bar, which is treated as an implicit cancel rather than being blocked, exactly as already agreed for tab switching generally.

## Loading strategy for v1

The first version loads and mounts everything up front: every journal day, every collection, every item, all already present before the user interacts with anything, same principle as how Journal already works today. A slower one-off launch is an accepted trade for the app then being completely instant everywhere afterwards, with no loading state anywhere else in the app to build or reason about. Lazier per-collection loading is only worth revisiting later if that launch time turns out to be a genuine problem in practice, not decided up front.

## Steps for implementation

1. Rename and reorganise the existing proof of concept into the terminology above (the generic `ViewTrack` mechanism is pulled out of `JournalPager`, with `JournalPager` itself becoming `JournalViewTrack`, a thin wrapper supplying it with Journal's day pages; `JournalTrack` becomes `JournalNavigatorTrack`; all moved into `/views/`), a pure refactor with no behaviour change, so everything after this references the new names. The same thing needs to happen for Collections and Items.
2. Add the Motion Style setting (Immersive / Instant) end to end on the existing single Journal `ViewTrack`, this doesn't depend on anything else in this list. There should be a basic toggle in the Settings page to control this.
3. Replace edit mode's trigger with the static Edit button at the bottom of each page, keeping its current visual behaviour (`NavigatorTrack` shifting up to reveal cancel and save) exactly as is. The edit button should be visible when `!editMode`, placed inside an `AnimateHeight` component.
4. Build the generic `ViewTrackOperator` and `ViewTrack` stacking mechanism, including `transitionRows()`, proved out on Journal's own two `ViewTrack`s (days, add day) since that's the simplest real case.
5. Wire the "Add X Page" flow through that mechanism (the add button triggers a transition down, save uses the immediate mode jump into the `ViewTrack` above, cancel reverses it).
6. Fix the `NavigatorTrack`'s progress maths for irregular item widths (interpolating against `offsets` instead of dividing by a fixed stride), needed before Collections items exist.
7. Build out Collections' three `ViewTrack`s (collections, items or add collection, add item) on top of the now proven `ViewTrack` mechanism from steps 4 and 5.
8. Merge Journal and Collections into one shared `ViewTrackOperator`, wiring the bottom nav tabs to toggle which `ViewTrack` set is visible and to trigger the implicit edit cancel.
9. Add the blanket "no pagination while editing" guard at the `ViewTrackOperator` level, covering `ViewTrack` transitions as well as within-`ViewTrack` swiping, with the tab bar exception.
10. Switch on the full up-front loading strategy across Journal, every collection, and every item, and see how launch actually feels in practice.
