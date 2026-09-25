import { JournalNavigator } from "@/components/exploration/navigators/JournalNavigator";
import { JournalPage } from "@/components/exploration/pages/JournalPage";
import { RowManager } from "@/components/exploration/rows/RowManager";
import { useApp } from "@/context/AppContext";

// Main Component:

export function JournalRow() {
  // State and Constants:

  const { state, activeEntry } = useApp();
  const startIndex = Math.max(
    0,
    state.entries.findIndex((e) => e.dayId === activeEntry.dayId),
  );

  // Render:

  return (
    <RowManager itemsCount={state.entries.length} startIndex={startIndex}>
      <RowManager.Pages>
        {state.entries.map((entry) => (
          <JournalPage key={entry.dayId} entry={entry} />
        ))}
      </RowManager.Pages>
      <RowManager.Navigator>
        <JournalNavigator />
      </RowManager.Navigator>
    </RowManager>
  );
}
