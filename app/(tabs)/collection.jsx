import { ThemedText } from "@/components/themed-text";
import { StyleSheet, View } from "react-native";

export default function CollectionScreen() {
  return (
    <View style={styles.continer}>
      <ThemedText type="title">Collection</ThemedText>
    </View>
  );
}

const styles = StyleSheet.create({
  continer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
});
