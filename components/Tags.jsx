import { AnimateHeight, AnimatedSpacer } from "@/components/AnimateHeight";
import { ThemedText } from "@/components/ThemedText";
import { Colors, Fonts } from "@/constants/theme";
import { LinearGradient } from "expo-linear-gradient";
import { forwardRef, useEffect, useImperativeHandle, useRef, useState } from "react";
import { Pressable, ScrollView, TextInput, View } from "react-native";
import Animated, {
  Easing,
  interpolateColor,
  useAnimatedStyle,
  useSharedValue,
  withTiming,
} from "react-native-reanimated";
import styled from "styled-components/native";

// ─── Constants ────────────────────────────────────────────────────────────────

const PICKER_COLORS = [
  "default", "green", "blue", "yellow", "purple",
  "red", "orange", "pink", "teal", "lime",
];
const MAX_CHARS = 24;
const FADE_DURATION = 150;
const FADE_EASING = Easing.out(Easing.quad);
const COLOR_DURATION = 200;

// ─── Styled components ────────────────────────────────────────────────────────

const Row = styled.View`
  flex-direction: row;
  align-items: center;
  gap: 8px;
`;

const TrackOuter = styled.View`
  flex: 1;
  position: relative;
  overflow: hidden;
`;

const ActiveTags = styled.View`
  flex-direction: row;
  flex-wrap: wrap;
  gap: 10px;
`;

const Tag = styled.View`
  align-items: center;
  justify-content: center;
  height: 26px;
  border-radius: 13px;
  padding: 0 10px;
  border-width: 2px;
  border-style: solid;
  ${({ color = "default" }) => `
    border-color: ${Colors.tags[color].primary};
    background-color: ${Colors.tags[color].secondary};
  `}
`;

const CircleButton = styled.View`
  width: 26px;
  height: 26px;
  border-radius: 13px;
  align-items: center;
  justify-content: center;
  border-width: 2px;
  flex-shrink: 0;
`;

const PlusCircle = styled(CircleButton)`
  border-color: ${Colors.tags.default.primary};
  background-color: ${Colors.tags.default.secondary};
`;

const CancelCircle = styled(CircleButton)`
  border-color: ${Colors.dateBorder};
`;

const SaveCircle = styled(CircleButton)`
  border-color: ${Colors.accent};
  background-color: ${Colors.accent};
`;

const ColorDot = styled.View`
  width: 22px;
  height: 22px;
  border-radius: 11px;
  ${({ color }) =>
    `background-color: ${Colors.tags[color]?.primary ?? Colors.tags.default.primary};`}
  ${({ selected }) =>
    selected ? "border-width: 2px; border-color: rgba(255,255,255,0.85);" : ""}
`;

// ─── FadeTrack ────────────────────────────────────────────────────────────────

const FadeTrack = forwardRef(function FadeTrack({ children, contentContainerStyle }, ref) {
  const leftOpacity = useSharedValue(0);
  const rightOpacity = useSharedValue(0);
  const scrollXRef = useRef(0);
  const contentWidthRef = useRef(0);
  const containerWidthRef = useRef(0);
  const scrollRef = useRef(null);

  useImperativeHandle(ref, () => ({
    scrollToStart: () => scrollRef.current?.scrollTo({ x: 0, animated: true }),
  }));

  const recompute = (scrollX) => {
    scrollXRef.current = scrollX;
    const maxScroll = contentWidthRef.current - containerWidthRef.current;
    const t = (val) => withTiming(val, { duration: FADE_DURATION, easing: FADE_EASING });

    if (maxScroll <= 2) {
      leftOpacity.value = t(0);
      rightOpacity.value = t(0);
    } else {
      leftOpacity.value = t(scrollX > 2 ? 1 : 0);
      rightOpacity.value = t(scrollX < maxScroll - 2 ? 1 : 0);
    }
  };

  const leftStyle = useAnimatedStyle(() => ({ opacity: leftOpacity.value }));
  const rightStyle = useAnimatedStyle(() => ({ opacity: rightOpacity.value }));

  const FADE_WHITE = "rgba(255,255,255,1)";
  const FADE_CLEAR = "rgba(255,255,255,0)";

  return (
    <TrackOuter>
      <ScrollView
        ref={scrollRef}
        horizontal
        decelerationRate="fast"
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={contentContainerStyle}
        style={{ width: "100%", height: 26 }}
        scrollEventThrottle={16}
        onScroll={(e) => recompute(e.nativeEvent.contentOffset.x)}
        onContentSizeChange={(w) => {
          contentWidthRef.current = w;
          recompute(scrollXRef.current);
        }}
        onLayout={(e) => {
          containerWidthRef.current = e.nativeEvent.layout.width;
          recompute(scrollXRef.current);
        }}
      >
        {children}
      </ScrollView>

      <Animated.View
        style={[
          { position: "absolute", top: 0, bottom: 0, left: 0, width: 24, pointerEvents: "none" },
          leftStyle,
        ]}
      >
        <LinearGradient
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 0 }}
          colors={[FADE_WHITE, FADE_CLEAR]}
          style={{ flex: 1 }}
        />
      </Animated.View>

      <Animated.View
        style={[
          { position: "absolute", top: 0, bottom: 0, right: 0, width: 24, pointerEvents: "none" },
          rightStyle,
        ]}
      >
        <LinearGradient
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 0 }}
          colors={[FADE_CLEAR, FADE_WHITE]}
          style={{ flex: 1 }}
        />
      </Animated.View>
    </TrackOuter>
  );
});

// ─── useTagColorTransition ────────────────────────────────────────────────────
// Interpolates border, background and text colours whenever draftColor changes.
//
// All colour values are pre-resolved to plain strings and stored as shared
// values so the UI-thread worklets inside useAnimatedStyle never need to call
// any regular JS functions (which would crash the Reanimated Babel plugin).

function resolveTagPrimary(key) {
  return Colors.tags[key]?.primary ?? Colors.tags.default.primary;
}
function resolveTagSecondary(key) {
  return Colors.tags[key]?.secondary ?? Colors.tags.default.secondary;
}

function useTagColorTransition(draftColor) {
  const progress = useSharedValue(1);
  const fromBorder = useSharedValue(resolveTagPrimary(draftColor));
  const toBorder   = useSharedValue(resolveTagPrimary(draftColor));
  const fromBg     = useSharedValue(resolveTagSecondary(draftColor));
  const toBg       = useSharedValue(resolveTagSecondary(draftColor));

  useEffect(() => {
    // Snapshot current "to" as the new "from", then update target colours.
    fromBorder.value = toBorder.value;
    fromBg.value     = toBg.value;
    toBorder.value   = resolveTagPrimary(draftColor);
    toBg.value       = resolveTagSecondary(draftColor);
    progress.value   = 0;
    progress.value   = withTiming(1, { duration: COLOR_DURATION, easing: FADE_EASING });
  }, [draftColor]);

  // Worklets only read shared values and call interpolateColor — no plain JS
  // function calls, which is a hard Reanimated constraint.
  const borderStyle = useAnimatedStyle(() => ({
    borderColor:     interpolateColor(progress.value, [0, 1], [fromBorder.value, toBorder.value]),
    backgroundColor: interpolateColor(progress.value, [0, 1], [fromBg.value,     toBg.value]),
  }));

  const textStyle = useAnimatedStyle(() => ({
    color: interpolateColor(progress.value, [0, 1], [fromBorder.value, toBorder.value]),
  }));

  return { borderStyle, textStyle };
}

// ─── Tags ─────────────────────────────────────────────────────────────────────

export function Tags({
  tagIds = [],
  tags = [],
  editMode = false,
  onToggleTag = () => {},
  onAddTag = () => {},
  onUpdateTagColor = () => {},
  onReplaceTag = () => {},
}) {
  const [editRowOpen, setEditRowOpen] = useState(false);
  const [editingTagId, setEditingTagId] = useState(null);
  const [draftName, setDraftName] = useState("");
  const [draftColor, setDraftColor] = useState("default");
  const inputRef = useRef(null);
  const collectionTrackRef = useRef(null);

  const { borderStyle, textStyle } = useTagColorTransition(draftColor);
  const activeTags = tags.filter((t) => !t.archived);

  useEffect(() => {
    if (!editMode) {
      inputRef.current?.blur();
      setEditRowOpen(false);
      setEditingTagId(null);
      setDraftName("");
      setDraftColor("default");
    }
  }, [editMode]);

  // ── Handlers ────────────────────────────────────────────────────────────────

  const openEditRow = (tagId = null) => {
    if (tagId !== null) {
      const tag = tags.find((t) => t.tagId === tagId);
      setEditingTagId(tagId);
      setDraftName(tag.name);
      setDraftColor(tag.color);
    } else {
      setEditingTagId(null);
      setDraftName("");
      setDraftColor("default");
    }
    setEditRowOpen(true);
    setTimeout(() => inputRef.current?.focus(), 300);
  };

  const handleCancelEditRow = () => {
    inputRef.current?.blur();
    setEditRowOpen(false);
    setEditingTagId(null);
    setDraftName("");
    setDraftColor("default");
  };

  const handleSave = () => {
    const trimmedName = draftName.trim();
    if (!trimmedName) return;

    if (editingTagId === null) {
      onAddTag(trimmedName, draftColor);
      // New tag is prepended — scroll the collection back to the start so it's
      // immediately visible. User taps it themselves to activate it.
      setTimeout(() => collectionTrackRef.current?.scrollToStart(), 80);
    } else {
      const original = tags.find((t) => t.tagId === editingTagId);
      if (original.name !== trimmedName) {
        onReplaceTag(editingTagId, trimmedName, draftColor);
      } else if (original.color !== draftColor) {
        onUpdateTagColor(editingTagId, draftColor);
      }
    }

    inputRef.current?.blur();
    setEditRowOpen(false);
    setEditingTagId(null);
    setDraftName("");
    setDraftColor("default");
  };

  // ── Render ──────────────────────────────────────────────────────────────────

  return (
    <View>

      {/* ── Collection row ─────────────────────────────────────────────────── */}
      <AnimateHeight visible={editMode}>
        <Row>
          <Pressable onPress={() => openEditRow(null)}>
            <PlusCircle>
              <Animated.Text
                style={{
                  fontFamily: Fonts.bold,
                  fontSize: 14,
                  lineHeight: 16,
                  color: Colors.tags.default.primary,
                }}
              >
                +
              </Animated.Text>
            </PlusCircle>
          </Pressable>

          <FadeTrack ref={collectionTrackRef} contentContainerStyle={{ gap: 10 }}>
            {activeTags.map(({ tagId, name, color }, i) => {
              const active = tagIds.includes(tagId);
              const tagColor = active ? "disabled" : color;
              return (
                <Pressable
                  key={`collection-${tagId}-${i}`}
                  onPress={() => onToggleTag(tagId)}
                  onLongPress={() => openEditRow(tagId)}
                  delayLongPress={400}
                >
                  <Tag color={tagColor}>
                    <ThemedText type="tag" color={tagColor}>
                      {name}
                    </ThemedText>
                  </Tag>
                </Pressable>
              );
            })}
          </FadeTrack>
        </Row>
      </AnimateHeight>

      {/* ── Edit row ───────────────────────────────────────────────────────── */}
      <AnimateHeight visible={editRowOpen && editMode}>
        <View style={{ paddingTop: 8 }}>
          <Row>
            {/* Hidden TextInput — focused programmatically when tag is tapped */}
            <TextInput
              ref={inputRef}
              style={{ position: "absolute", opacity: 0, width: 1, height: 1 }}
              value={draftName}
              onChangeText={(text) => setDraftName(text.slice(0, MAX_CHARS))}
              returnKeyType="done"
              onSubmitEditing={handleSave}
              blurOnSubmit={false}
            />

            {/* Visible tag with animated colour transition */}
            <Pressable
              onPress={() => inputRef.current?.focus()}
              style={{ flexShrink: 0 }}
            >
              <Animated.View
                style={[
                  {
                    alignItems: "center",
                    justifyContent: "center",
                    height: 26,
                    borderRadius: 13,
                    paddingHorizontal: 10,
                    borderWidth: 2,
                  },
                  borderStyle,
                ]}
              >
                <Animated.Text
                  style={[
                    {
                      fontFamily: Fonts.bold,
                      fontSize: 12,
                      opacity: draftName ? 1 : 0.45,
                    },
                    textStyle,
                  ]}
                >
                  {draftName || "Tag name"}
                </Animated.Text>
              </Animated.View>
            </Pressable>

            {/* Colour picker */}
            <FadeTrack
              contentContainerStyle={{
                gap: 8,
                alignItems: "center",
                paddingVertical: 2,
              }}
            >
              {PICKER_COLORS.map((color) => (
                <Pressable key={color} onPress={() => setDraftColor(color)}>
                  <ColorDot color={color} selected={draftColor === color} />
                </Pressable>
              ))}
            </FadeTrack>

            {/* Cancel */}
            <Pressable onPress={handleCancelEditRow}>
              <CancelCircle>
                <Animated.Text
                  style={{
                    fontFamily: Fonts.bold,
                    fontSize: 14,
                    lineHeight: 16,
                    color: Colors.faded,
                  }}
                >
                  ×
                </Animated.Text>
              </CancelCircle>
            </Pressable>

            {/* Save */}
            <Pressable onPress={handleSave}>
              <SaveCircle>
                <Animated.Text
                  style={{
                    fontFamily: Fonts.bold,
                    fontSize: 12,
                    lineHeight: 14,
                    color: Colors.white,
                  }}
                >
                  ✓
                </Animated.Text>
              </SaveCircle>
            </Pressable>
          </Row>
        </View>
      </AnimateHeight>

      {/* ── Active tags ────────────────────────────────────────────────────── */}
      <AnimatedSpacer visible={!!tagIds.length && editMode} height={10} />
      <ActiveTags>
        {tagIds.map((id, i) => {
          const tag = tags.find((t) => t.tagId === id);
          if (!tag) return null;
          return (
            <Pressable
              key={`active-${id}-${i}`}
              onPress={() => onToggleTag(id)}
              disabled={!editMode}
            >
              <Tag color={tag.color}>
                <ThemedText type="tag" color={tag.color}>
                  {tag.name}
                </ThemedText>
              </Tag>
            </Pressable>
          );
        })}
      </ActiveTags>
    </View>
  );
}
