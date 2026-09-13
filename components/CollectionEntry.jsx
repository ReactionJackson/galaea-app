import styled from "styled-components/native";
import { EntryContent } from "./EntryContent";

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

export function CollectionEntry({ entryId, text, tagIds, tags, gallery }) {
  return (
    <Container>
      <EntryContent
        entryNumber={entryId}
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
