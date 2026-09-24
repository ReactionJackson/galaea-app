import { resolveEntryGalleryPairs, useApp } from "@/context/AppContext";
import { deleteDroppedImages } from "@/utils/images";

// Generic app-wide edit mode dispatches, shared by any Navigator's
// NavigatorManager: entering edit mode, cancelling a draft (discarding
// anything added since), and saving one (discarding anything the draft
// removed). Each Navigator wires these into whatever it uses to detect
// when they should fire.

export function useEditModeActions() {
  const { state, dispatch } = useApp();

  const onEnterEdit = () => dispatch({ type: "ENTER_EDIT" });

  const onCancelEdit = () => {
    if (state.draft) {
      for (const { draftGallery, storedGallery } of resolveEntryGalleryPairs(
        state.items,
        state.draft.items,
      )) {
        deleteDroppedImages(draftGallery, storedGallery);
      }
    }
    dispatch({ type: "CANCEL_EDIT" });
  };

  const onSaveEdit = () => {
    for (const { draftGallery, storedGallery } of resolveEntryGalleryPairs(
      state.items,
      state.draft?.items ?? [],
    )) {
      deleteDroppedImages(storedGallery, draftGallery);
    }
    dispatch({ type: "SAVE_EDIT" });
  };

  return { onEnterEdit, onCancelEdit, onSaveEdit };
}
