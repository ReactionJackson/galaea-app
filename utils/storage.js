import AsyncStorage from "@react-native-async-storage/async-storage";

// Bump this if the persisted shape ever changes incompatibly — old data
// under the previous key is just ignored rather than crashing on load.
const STORAGE_KEY = "galaea/state/v2";

// Only the actual content — journal days, collection items, tags — is
// persisted. Everything else in app state (which day's on screen, whether
// you're mid-edit) is session/navigation state: it should fall back to its
// normal defaults on a fresh launch rather than resuming a half-finished
// edit, so it's never part of what gets saved or loaded here.
export async function loadPersistedState() {
  try {
    const raw = await AsyncStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

export async function savePersistedState(persistable) {
  try {
    await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(persistable));
  } catch {
    // Best-effort — a failed save shouldn't crash the app.
  }
}
