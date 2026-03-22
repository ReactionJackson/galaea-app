# Galaea — App Spec

## Philosophy

Galaea is a stress-free personal journal app centred around gaming. It is explicitly **not** a game tracker, backlog manager, or progress logger. There are no streaks, completion percentages, play-time counters, or achievement systems. The core premise is: open the app, write about what's on your mind today in relation to games you're playing and gaming memories you want to keep safe. Entries are tied to when you _wrote_ them, not when you played — the journal captures your thoughts in the moment, not a historical record of sessions.

---

## Technology Stack

- **Framework:** Next.js (React) — use Next.js routing and folder conventions throughout
- **Styling:** `styled-components`
- **Animation:** `@gsap/react`
- **Deployment:** Vercel
- **Backend (initial):** `@vercel/kv` as a faked backend during early development, to be replaced with a real backend later
- **Target:** Mobile-first progressive web app — not React Native, but designed to feel native on mobile

---

## Navigation

### Bottom Navigation Bar

A fixed bottom nav bar is present on all primary views. It contains three navigation icons: Journal, Collection, and Friends. There is no dedicated create button in the nav bar — content creation is initiated via the `+` item at the end of each HSN track.

### User Avatar (Top Right)

Present on all primary views. Tapping opens a sheet containing:

- Account and profile settings
- Friends management
- Privacy settings
- Appearance preferences (light/dark mode)
- Data export

---

## Horizontal Scroll Navigation (HSN)

Both primary views share the same core navigation mechanic: a horizontally scrolling track fixed at the bottom of the screen (above the bottom nav bar). The item currently **centred** in the track determines what content loads in the main area above.

### Behaviour

- Uses CSS `scroll-snap-type: x mandatory` with `scroll-snap-align: center` on each item
- Start and end padding is calculated in JS on mount so the first and last items can reach the centre position: `paddingLeft = (trackWidth - firstItemWidth) / 2`, same for end. This matters particularly for the Collection View where items have variable widths due to differing box art aspect ratios.
- As the track scrolls, the content area above updates only when the scroll snap settles — not during the drag. Content, text colour, and the red indicator all update simultaneously at the moment the snap animation geometrically completes (detected via a RAF loop that polls until the closest item is within 2px of centre). This makes entry transition animations viable, and avoids firing image load requests for entries the user scrolls past without landing on.
- A `+` button is present as the final item in both HSN tracks. In the Journal View it creates a new day entry (see behaviour below); in the Collection View it adds a new game to the collection. Tapping it updates the main area above with a blank version of the relevant content page with all fields ready for input.

### Implementation notes (Journal View HSN)

The Journal View is implemented as a single `/journal` page with an `activeIndex` React state, not dynamic routing. Dynamic routing (`/journal/[date]`) was ruled out because `router.push()` is incompatible with the per-frame RAF scroll listener — page transitions remount components and restart image loads. Single-page state eliminates this entirely.

- Content, active text colour, and the red indicator all update together on snap settle only — not during drag. The settle moment is detected geometrically (RAF loop, 2px threshold) not via `scrollend`, which fires on pause-while-holding. `scrollend` is retained only as a trigger for trackpad/programmatic scrolls where no pointer release event fires.
- The active circle uses a `data-active` attribute managed via direct DOM writes (not JSX props) so it can be decoupled from React's render cycle and updated only at settle time
- The last-viewed entry is persisted to `localStorage` by `dayId` (not array index) and restored on mount, with the Track imperatively scrolled to the restored position via `scrollToIndex`
- "Is today?" comparisons use the user's local date, not UTC — everything in the display layer uses UTC to avoid SSR hydration mismatches, but whether an entry exists for today is a local-time question

### Journal View HSN — Date Track

- Contains circles for each date that has a journal entry — **only dates with entries appear**, not every calendar day
- Each circle shows the day number
- A static month label sits above the track, centred, and updates to reflect whichever month the currently active date belongs to
- All circles have transparent backgrounds with a 10% black border at all times — there is no per-item active colour
- A fixed red circle sits behind the scrollable track at the centre position (absolutely positioned, `z-index` below the items). Whatever circle is centred naturally inherits the red background through its transparent fill. The red circle dims and scales down while the track is moving, and grows back to full size/opacity when the snap settles.
- The centred circle's text transitions from black to white on settle (matching the red circle growing back in)

### Collection View HSN — Games Track

- Contains box art covers for each game in the user's collection
- All covers share a fixed height; widths vary by natural aspect ratio (portrait, landscape, square) — no cropping or fixed-width slots
- The active cover is indicated by a red border; others have no border

---

## Views

### Journal View

The main area above the HSN displays one day entry at a time — whichever date is currently centred in the date track. This is a vertically scrolling area with no fixed height limit.

#### Day Entry Structure

**Header area:**

- Optional full-width header image which will be cropped to a set aspect ratio with CSS
- Date circle (matches the active circle in the HSN below)
- Subtitle: longform date + timestamp (e.g. "March 2026 · 02:43pm")
- Title: optional free-text title. If no title is set, displays the weekday name (e.g. "Saturday"). If a title is entered, the weekday name is not shown.
- Day text: optional free-text paragraph about the day in general (not tied to a specific game)
- Day tags: optional free-text tags (e.g. "Gaming Night", "Relaxing", "Games Market"). Tags are auto-lowercased on creation but will be rendered in sentence case with CSS. An autocomplete suggestion row appears during editing, showing existing tags sorted by recency.

**Game entries (0 or more per day entry):**

Each game entry is a self-contained block within the day entry, in the order they were added.

- Game bar: full-width banner showing the game's cover/screenshot image, with the game title and platform/genre overlaid (e.g. "NINTENDO SWITCH / JRPG"). Tapping this bar navigates the user to the associated game page in the collection view.
- Entry number: shown as "Entry XX" — the sequential count of all entries made for this game across all days
- Entry text: optional free-text thoughts about the game
- Entry tags: optional free-text tags (e.g. "Theory", "Funny Moment", "Quests", "Reminder"). Same autocomplete behaviour as day tags.
- Images: 0 or more images (see Image Handling)

**Creating a new day entry:**

- The `+` button in the Journal HSN is only visible when there is no entry for today (local date). If today already has an entry, the `+` is not shown — instead the user navigates to today's circle and edits the existing entry. There is exactly one entry per day.
- Tapping the `+` animates the plus icon out and fades the today's date number in — the circle transforms into a regular date circle in place. The content area above immediately shows the new entry in edit mode (editable fields, not rendered text).
- The new entry is immediately part of the entries list (not a separate "draft" state) — it is just added and placed directly into edit mode rather than view mode.
- The new entry is automatically timestamped to the current date and time — no date selection is offered.
- On the Collection View, the `+` is always present regardless of date, since there is no "one per day" constraint for adding games.

**Edit mode:**

All entries (not just new ones) are editable and can be deleted. The default state for all entries as you scroll across the HSN is view mode. Edit mode shows editable text fields, tag inputs, image management, and a delete option for the entire entry.

The mechanism for toggling edit mode on an existing entry is **TBC** — two options under consideration:

- **Long press on date circle** — normal tap navigates to that entry; long press on the active circle toggles edit mode. Hidden but discoverable over time.
- **Edit icon on the active circle** — a small pencil or ✎ that appears only on the currently active circle, sitting just above it. Tap the circle to navigate; tap the icon to edit. More immediately discoverable, no second gesture type required.

Both patterns may coexist (long press as a power-user shortcut alongside a visible affordance). Not yet designed.

**Adding a game entry to the day entry:**

- Tapping the add game button within the game bubble opens the game selection carousel — a horizontally scrolling list of all games in the collection, displayed edge-to-edge within the game entry bounds
- Tapping a game in the carousel triggers an animation that creates the basic structure of a game entry, with areas you can tap to add text etc.
- Games already added to today's entry are shown as greyed-out in the carousel
- After saving, content entry UI disappears, possibly with each item animating to 0 height in unison (TBC)

---

### Collection View

The main area above the HSN displays one game at a time — whichever game cover is currently centred in the games track.

#### Game Page Structure

**Hero section:**

- Full-width background using the game's cover/screenshot art with a dark overlay for contrast
- Box art (portrait, displayed at consistent size)
- Game title
- Platform and genre (e.g. "Nintendo Switch / JRPG")
- All of the above info and images will be pulled from IGDB by default upon game creation, but it can all be replaced or edited by the user

**Info chips (between hero and timeline):**

- Total entries written for this game
- Other game info (TBC)
- Friends mechanics (TBC)
- Rate this game (5 star system or X/10 system TBC)
- Add to rankings (future feature for tier list making)

**Photo gallery:**

- A grid of all images attached to any entry for this game, across all dates

**Timeline:**

- All entries written about this game, in ascending date order (oldest at top, newest at bottom — bottom-aligned)
- Each entry shows: date, entry text, tags, images are TBC as it may be enough to just have the complete gallery list at the top
- A small "↗ view in journal" link on each entry navigates back to the Journal View, centring the relevant date in the date track and scrolling to that entry
- The timeline uses the same bottom-anchored scroll approach as the Journal View
- New entries must be made via the journal view, TBC if the game page will have an "add entry" button at the end which prompts the user to create a journal entry with auto completion (attaching this game to the post)

---

## Friends View

A vertically scrolling list of friend bubbles. There is no HSN in this view — the vertical list format is intentional, allowing all friends to be scanned at once. In practice users may only have 2–3 friends on the platform, so a horizontal navigation pattern would feel sparse and inappropriate.

### Adding Friends

Friend requests can be initiated in two places:

- A button within the Friends View itself (e.g. top right of the view)
- Via the user avatar sheet accessible from the top right corner of any primary view

The add friend flow is a simple form — search by username or share a link/code. It is not a content entry screen and does not follow the HSN `+` pattern used in the Journal and Collection views.

### Friend Bubble

Each friend is represented by a self-contained bubble in the list. The bubble has three sections: header, gaming shelf, and public content (ranking + reviews). All content shown is derived from the friend's activity in the app — no journal entries or game entries are ever exposed.

#### Header

- **Avatar** — the friend's profile image or initials circle
- **Username**
- **Last wrote indicator** — a small coloured dot (green if recent, grey if older) followed by a relative timestamp and the name of the game most recently written about (e.g. "2h ago · Trails in the Sky: FC"). This tells you what they're currently living in without revealing anything they wrote.

#### Gaming Shelf

A visual representation of the friend's game collection as physical spines on a shelf, rendered entirely in CSS with no box art images required.

**Layout:**

- The game most recently written about is placed at the leftmost position, **facing forward** (cover-on view, text centred and upright). This is the only item that would use a box art image if one is available — one image call per friend, not per game.
- All remaining games follow to the right as **spines**, ordered by most recently written about first.
- Each spine sits flush against the next with minimal gap and a subtle random lean (deterministic per user via a seeded random function, so the same user always has the same shelf layout).
- The shelf has a visible plank at the bottom with a shadow beneath it.

**Spine design by console** — all text uppercase:

| Console  | Height | Width | Body                | Text  | Badge                         |
| -------- | ------ | ----- | ------------------- | ----- | ----------------------------- |
| PS1      | 58px   | 14px  | Black               | White | None                          |
| PS2      | 74px   | 12px  | White               | Black | Black strip, "PS2" white      |
| PS3      | 74px   | 12px  | White               | Black | Black strip, "PS3" white      |
| PS4      | 74px   | 12px  | White               | Black | Black strip, "PS4" white      |
| PS5      | 80px   | 10px  | Black               | White | White strip, "PS5" black      |
| Switch   | 74px   | 7px   | Red `#e4000f`       | White | None                          |
| Switch 2 | 74px   | 7px   | Red `#c8000c`       | White | None                          |
| GBA      | 58px   | 14px  | Silver `#b0b0bc`    | Black | None                          |
| GameCube | 74px   | 12px  | Purple `#6a35b0`    | White | Black strip, "GAMECUBE" white |
| PC       | 80px   | 12px  | Dark grey `#2a2a2a` | White | Black strip, "PC" white       |
| Book     | 78px   | 18px  | Brown `#8a6a3a`     | White | None                          |

The face-on cover uses the same colour rules as the spine but at a wider format (approx 46–54px wide depending on console), with the title text centred horizontally and reading normally (not rotated).

#### This Year's Ranking

Shows the top 3 positions from the friend's current year tier list. Always shows exactly 3 rows — if fewer than 3 games have been ranked, empty positions show "— — —" in muted grey. No further detail is shown; tapping the section could navigate to a full tier list view in a future version.

- 🥇 Game title · score (e.g. "9/10")
- 🥈 Game title · score
- 🥉 Game title · score or "— — —"

#### Reviews

A horizontally scrolling strip of review chips, one per game the friend has reviewed. Each chip shows:

- Game title (truncated if needed)
- Score (large, in red)
- A short snippet of the review text (2 lines max, truncated)

Tapping a chip expands to the full review. Reviews are always public — this is made clear to users when writing a review.

### Public vs Private

This distinction is absolute and must be clearly communicated in the UI wherever relevant:

| Content                                         | Visibility         |
| ----------------------------------------------- | ------------------ |
| Journal entries (day text, title, tags, images) | **Always private** |
| Game entries (text, tags, images)               | **Always private** |
| Reviews                                         | **Always public**  |
| Tier list ranking                               | **Always public**  |
| Collection (game titles, consoles)              | **Always public**  |
| Last wrote indicator (game name + time)         | **Always public**  |

### Reviews (detail)

A review is a single piece of written content attached to a game, separate from journal entries. It has:

- A numeric score (1–10)
- A free-text review body (no length limit but encouraged to be concise)
- A timestamp of when it was last updated

Reviews can be updated at any time — the timestamp reflects the most recent edit. There is one review per game per user. Reviews are written from the game page in the Collection View.

### Tier List (detail)

The tier list is a manually ordered ranking of games, rebuilt year by year. It is separate from reviews and scores — a game can have a review without being in the tier list, and vice versa.

**Adding a game to the tier list:**

- Triggered from the game page in the Collection View
- Opens a full-screen view showing the current tier list as a vertically stacked list of game titles, styled similarly to game entry headers (title prominent, no text below)
- The user scrolls to find the desired position and taps between two existing items to insert the new game there
- The list supports free drag-and-drop reordering at any time

**Display:**

- Only the top 3 are shown in the friend bubble
- The full list is not currently exposed to friends beyond the top 3 — this may expand in a future version
- The list resets at the start of each calendar year, though previous years' lists are archived and viewable

**Controversy by design:** the tier list is intentionally public and opinionated. Disagreements between friends about rankings are a feature, not a problem.

---

## Image Handling

### Aspect Ratio System

Images within game entries are displayed at full width of the content area (which has 20px padding on all sides within the bubble). The image scroll track uses negative margins to break out of the content padding, allowing adjacent images to peek into the padding zone on either side — no extra padding is added for the peek effect, it is a natural consequence of the bleed:

```css
.image-scroll-track {
  margin: 0 -20px; /* bleed out to bubble edge, reclaiming the content padding */
  padding: 0 20px; /* first image starts at the content position */
  overflow-x: auto;
  scroll-snap-type: x mandatory;
}

.image-item {
  width: 100%; /* full width of the content area, not the bubble */
  flex-shrink: 0;
  scroll-snap-align: center;
  margin-right: 10px;
}
```

A single image appears full-width with no empty space beside it. Multiple images scroll horizontally with the adjacent image peeking into the padding gap on the right, signalling that more images exist.

The display height is determined by the **average aspect ratio** of all images in that entry's image set:

- Collect the aspect ratio (width ÷ height) of each image
- Average them
- Set the container height as `(1 / avgAspectRatio) * 100%` of the full width via `padding-top`
- Each image fills the container with `object-fit: cover`

This means a set of 4:3 images displays at 4:3 (uncropped), a set of 16:9 images displays at 16:9 (uncropped), and mixed sets find a reasonable middle ground, perhaps with a preference to the most common aspect-ratio if there is a single outlier for example.

### Lightbox

Tapping any image opens a full-screen lightbox with the image displayed at its natural aspect ratio, padded with a darkened background overlay.

---

## Tags

- Fully freeform — no predefined tag list
- Auto-lowercased on save to prevent duplicates (e.g. "Quests" and "quests" become "quests")
- Two types exist visually but not structurally:
  - **Regular tags** — plain text pill (e.g. "theory", "grinding")
  - **Person tags** — created by typing `@username`, displayed with a small avatar initial. Currently TBC — journal entries are strictly private and never shared, so notifying another person via a tag may not be applicable here. Person tags may reappear in a different context (e.g. friends view) in a future version.
- During editing, a horizontally scrolling row of existing tags appears below the tag input, sorted by recency. A sticky "new tag +" affordance anchors the left of this row. Tapping an existing tag in the list adds it to the entry and greys it out in the row of existing tags. Tapping it again removes it from the entry and the colour returns to the existing tag item.
- Tags are used for filtering/search. Tapping a tag on a saved entry shows a toast: "Search for '[tag]'?" — confirming opens a search/filter panel. TBC where this filter and searching functionality will appear, version 1 of the app will have tags as a purely static piece of information.

---

## Data Model

The data is split into two separate lists rather than a single nested structure. This keeps the two views (Journal and Collection) as clean lenses on the same underlying data without duplication.

A **dayEntry** groups all info for a given date: `{ dayId, date (auto timestamp), title, text, tags, headerImage, games: [{ gameId, entryId }] }`. The `games` array contains only references — no game data is stored here directly.

A **game** owns its own entries: `{ gameId, title, platform, genre, cover, entries: [{ text, tags?, gallery? }] }`. Each item in `entries[]` is a piece of writing about that game on a specific day. `entryId` in a dayEntry reference is the index into this array. Tags and gallery are optional per entry. The `cover` field is a screenshot or artwork image used as a background — not box art. Box art is pulled from IGDB and used separately in the Collection View hero.

A **gameEntry** is resolved at render time by joining a `{ gameId, entryId }` reference against the `games` list — `game.entries[entryId]` — rather than stored in denormalised form. This join is done via a `resolveGameEntry()` helper.

The Journal View queries: _all dayEntries, sorted by date._
The Collection View queries: _all entries for a given gameId, sorted by date (constructed from `game.entries[]` with date inferred from the dayEntry that references each one)._

Both views are different lenses on the same underlying data.

---

## Scroll Architecture

Both the Journal View and Collection View use a bottom-anchored feed:

```css
.feed {
  display: flex;
  flex-direction: column-reverse;
  overflow-y: auto;
  overflow-anchor: none;
}

.scroll-anchor {
  height: 0;
  overflow-anchor: auto; /* keeps bottom in view as content grows */
}
```

The `scroll-anchor` div is the **first child** of the feed (rendered at visual bottom due to `column-reverse`). New items are **prepended** to the data array (newest at index 0) so they render at the visual bottom. Height growth (typing, adding images) pushes content upward naturally with no JS scroll correction.

The iOS keyboard appearing reduces the viewport height. Because content is bottom-anchored, the active textarea remains in view. On focus, `overflow-anchor: auto` moves to a wrapper around the active textarea so the input (not the feed bottom) stays in view as the entry grows taller than the viewport.

---

## Textarea (Entry Text Input)

```css
textarea {
  resize: none;
  overflow-y: auto;
  min-height: 1lh;
  max-height: 12lh;
  field-sizing: content; /* auto-grows with content, no JS needed */
}
```

A JS fallback runs only if `CSS.supports('field-sizing', 'content')` returns false:

```js
el.style.overflowY = "hidden";
el.style.height = "auto";
el.style.height = el.scrollHeight + "px";
el.style.overflowY = "auto";
```
