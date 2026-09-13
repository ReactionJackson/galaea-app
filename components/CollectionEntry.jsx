import styled from "styled-components/native";
import { EntryContent } from "./EntryContent";
import { ThemedText } from "./ThemedText";

// A read-only version of a game entry for the game's own page — same
// gallery/text/tags content as GameEntry, just without its banner header
// (the page itself already shows the game's title/platform/genre once, at
// the top, so repeating it per entry would be redundant) and never editable.
//
// No card styling here (border/background/shadow, or its own horizontal
// padding) — entries just flow down the page as a continuous list. No local
// padding means the gallery's own -20px bleed (see EntryContent) cancels
// exactly the page's outer 20px gutter, so images still run edge-to-edge
// rather than overshooting past the screen.
const Container = styled.View`
  width: 100%;
`;

// "07 September 2026 10:23pm" — day zero-padded, month spelled out, then a
// lowercase 12-hour time with no space before am/pm. None of that comes for
// free from toLocaleString, so it's built by hand rather than fighting
// Intl's formatting options for a shape it doesn't produce directly. Split
// into datePart/timePart rather than one string so the label below can give
// the date and the time different shades.
function formatEntryDate(dateString) {
  const date = new Date(dateString);
  const day = String(date.getDate()).padStart(2, "0");
  const month = date.toLocaleString("default", { month: "long" });
  const year = date.getFullYear();
  const minutes = String(date.getMinutes()).padStart(2, "0");
  const period = date.getHours() >= 12 ? "pm" : "am";
  const hour12 = date.getHours() % 12 || 12;
  return {
    datePart: `${day} ${month} ${year}`,
    timePart: `${hour12}:${minutes}${period}`,
  };
}

export function CollectionEntry({ entryId, date, text, tagIds, tags, gallery }) {
  // Entries created before this field existed fall back to "Entry XX" —
  // shouldn't come up once the seed data's backfilled, but keeps the label
  // from just going blank if a date is ever missing.
  let label;
  if (date) {
    const { datePart, timePart } = formatEntryDate(date);
    label = (
      <ThemedText type="subtitle">
        {datePart}
        <ThemedText type="subtitle" color="faded">
          {" "}
          {timePart}
        </ThemedText>
      </ThemedText>
    );
  } else {
    label = (
      <ThemedText type="subtitle" color="text">
        Entry {String(entryId).padStart(2, "0")}
      </ThemedText>
    );
  }

  return (
    <Container>
      <EntryContent
        label={label}
        editMode={false}
        text={text}
        tagIds={tagIds}
        tags={tags}
        gallery={gallery}
        // No card padding here for the -20px bleed to cancel (see
        // Container above), so the gallery runs to the true screen edge —
        // only the page's own 20px gutter needs subtracting, not 40px worth
        // of it, hence the smaller value than GameEntry's default.
        galleryHorizontalPadding={40}
      />
    </Container>
  );
}
