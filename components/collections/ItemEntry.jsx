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
  const minutes = String(date.getMinutes()).padStart(2, "0");
  const period = date.getHours() >= 12 ? "pm" : "am";
  const hour12 = date.getHours() % 12 || 12;
  return {
    datePart: `${day} ${month} ${year}`,
    timePart: `${hour12}:${minutes}${period}`,
  };
}

export function ItemEntry({
  date,
  text,
  tagIds,
  gallery,
  editable = false,
  onUpdate,
}) {
  const { datePart, timePart } = date ? formatEntryDate(date) : {};

  return (
    <Content>
      <ThemedText type="subtitle" style={{ marginBottom: 5 }}>
        {datePart}
        <ThemedText type="subtitle" color="faded">
          {" "}
          {timePart}
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
