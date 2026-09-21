import { ThemedText } from "@/components/interface/ThemedText";
import styled from "styled-components/native";
import { EntryFields } from "./shared";

const Content = styled.View`
  width: 100%;
  margin-bottom: 30px;
`;

function formatEntryDate(dateString) {
  const date = new Date(dateString);
  const day = String(date.getDate()).padStart(2, "0");
  const month = date.toLocaleString("default", { month: "long" });
  const year = date.getFullYear();
  return `${day} ${month} ${year}`;
}

export function ItemEntry({
  date,
  entryNumber,
  text,
  tagIds,
  gallery,
  editable = false,
  onUpdate,
}) {
  const dateText = date ? formatEntryDate(date) : null;

  return (
    <Content>
      <ThemedText type="subtitle" style={{ marginBottom: 5 }}>
        {dateText}
        <ThemedText type="subtitle" color="faded">
          {" "}
          Entry {String(entryNumber).padStart(2, "0")}
        </ThemedText>
      </ThemedText>
      <EntryFields
        text={text}
        tagIds={tagIds}
        gallery={gallery}
        editable={editable}
        onUpdate={onUpdate}
        horizontalPadding={40}
      />
    </Content>
  );
}
