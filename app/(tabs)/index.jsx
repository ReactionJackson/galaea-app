import { ThemedText } from "@/components/themed-text";
import { StyleSheet, View } from "react-native";

export default function HomeScreen() {
  return (
    <View style={styles.continer}>
      <ThemedText type="title">Journal</ThemedText>
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
