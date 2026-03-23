import { ThemedText } from "@/components/ThemedText";
import { Track } from "@/components/Track";

export function CollectionTrack({ children }) {
  return (
    <Track height={150} paddingLeft={100} paddingRight={80}>
      <ThemedText type="title">{children}</ThemedText>
    </Track>
  );
}
