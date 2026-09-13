import { Colors } from "@/constants/theme";
import styled from "styled-components/native";
import { EntryContent } from "./EntryContent";

// A read-only version of a game entry for the game's own page — same
// gallery/text/tags content as GameEntry, just without its banner header
// (the page itself already shows the game's title/platform/genre once, at
// the top, so repeating it per entry would be redundant) and never editable.
const Container = styled.View`
  width: 100%;
  margin-top: 16px;
  border-radius: 15px;
  padding: 20px;
  padding-bottom: 0px;
  border: 1px solid ${Colors.border};
  background-color: ${Colors.background};
  shadow-color: ${Colors.black};
  shadow-offset: 0px 0px;
  shadow-opacity: 0.12;
  shadow-radius: 8px;
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
      />
    </Container>
  );
}
