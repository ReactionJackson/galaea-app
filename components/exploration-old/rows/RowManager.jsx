import { Colors } from "@/constants/theme";
import { RowManagerContext, useRowManager } from "@/hooks/useRowManager";
import { Children, useEffect, useRef, useState } from "react";
import { useWindowDimensions } from "react-native";
import Animated, {
  Extrapolation,
  interpolate,
  scrollTo,
  useAnimatedReaction,
  useAnimatedRef,
  useAnimatedScrollHandler,
  useAnimatedStyle,
  useDerivedValue,
  useSharedValue,
  withTiming,
} from "react-native-reanimated";
import styled from "styled-components/native";

const TRANSITION_DURATION = 450;
const SWIPE_THRESHOLD = 0.4;
const LEFT_MARGIN = -15;
const LEFT_SCALE = 0.7;
const CENTRE_SCALE = 0.9;
const STACK_STEP_X = 34;
const STACK_STEP_SCALE = 0.07;
const MIN_STACK_SCALE = 0.35;
const LEFT_SCALE_START = 0.75;
const EXIT_GAP = 20;
const OVERLAY_MAX_OPACITY = 0.65;
const PAGE_RADIUS = 30;

const Container = styled.View`
  flex: 1;
  width: 100%;
  overflow: hidden;
`;

const PageOverlay = styled(Animated.View)`
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: ${Colors.black};
`;

function PagesSlot({ children }) {
  return children;
}

function NavigatorSlot({ children }) {
  return children;
}

function PageSlot({ index, children }) {
  const { pageWidth, pageHeight, displayProgress, restEmphasis } =
    useRowManager();
  const progress = displayProgress;

  const pageStyle = useAnimatedStyle(() => {
    const d = index - progress.value;
    const leftPinnedX = LEFT_MARGIN - ((1 - LEFT_SCALE) * pageWidth) / 2;

    let baseScale;
    let travelX;

    if (d <= -1) {
      const stepsBack = -1 - d;
      baseScale = Math.max(
        MIN_STACK_SCALE,
        LEFT_SCALE_START - STACK_STEP_SCALE * stepsBack,
      );
      travelX = leftPinnedX - STACK_STEP_X * stepsBack;
    } else if (d <= 0) {
      baseScale = interpolate(
        d,
        [-1, 0],
        [LEFT_SCALE_START, CENTRE_SCALE],
        Extrapolation.CLAMP,
      );
      travelX = interpolate(d, [-1, 0], [leftPinnedX, 0], Extrapolation.CLAMP);
    } else {
      baseScale = CENTRE_SCALE;
      travelX = interpolate(
        d,
        [0, 1],
        [0, CENTRE_SCALE * pageWidth + EXIT_GAP],
        Extrapolation.CLAMP,
      );
    }

    const distFactor = interpolate(
      Math.abs(d),
      [0, 0.5],
      [0, 1],
      Extrapolation.CLAMP,
    );
    const nearestFactor = 1 - distFactor * distFactor * (3 - 2 * distFactor);
    const scale =
      baseScale + (1 - baseScale) * restEmphasis.value * nearestFactor;

    const translateX = travelX - d * pageWidth;

    const borderRadius = PAGE_RADIUS * (1 - restEmphasis.value * nearestFactor);

    return { borderRadius, transform: [{ scale }, { translateX }] };
  });

  const overlayStyle = useAnimatedStyle(() => {
    const d = index - progress.value;
    const opacity = interpolate(
      d,
      [-1, 0, 1],
      [OVERLAY_MAX_OPACITY, 0, 0],
      Extrapolation.CLAMP,
    );
    return { opacity };
  });

  return (
    <Animated.View
      style={[
        {
          width: pageWidth,
          height: pageHeight,
          backgroundColor: Colors.white,
          overflow: "hidden",
        },
        pageStyle,
      ]}
    >
      {children}
      <PageOverlay style={overlayStyle} pointerEvents="none" />
    </Animated.View>
  );
}

export function RowManager({
  itemsCount,
  startIndex,
  scrollEnabled = true,
  children,
}) {
  let pagesNode = null;
  let navigatorNode = null;
  Children.forEach(children, (child) => {
    if (!child) return;
    if (child.type === RowManager.Pages) pagesNode = child.props.children;
    else if (child.type === RowManager.Navigator)
      navigatorNode = child.props.children;
  });

  const { width: pageWidth } = useWindowDimensions();
  const [pageHeight, setPageHeight] = useState(0);
  const rowManagerRef = useAnimatedRef();
  const progress = useSharedValue(Math.max(0, startIndex));
  const activeDriver = useSharedValue(null);
  const restEmphasis = useSharedValue(1);
  const dragOrigin = useSharedValue(0);

  const setDriver = (side) => {
    "worklet";
    activeDriver.value = side;
    dragOrigin.value = Math.round(progress.value);
    restEmphasis.value = withTiming(0, { duration: TRANSITION_DURATION });
  };

  const setProgress = (value) => {
    "worklet";
    progress.value = value;
  };

  const settleDriver = (side) => {
    "worklet";
    if (activeDriver.value === side) {
      const delta = progress.value - dragOrigin.value;
      const sign = Math.sign(delta);
      const absDelta = Math.abs(delta);
      const wholeSteps = Math.floor(absDelta);
      const frac = absDelta - wholeSteps;
      const extra = frac > SWIPE_THRESHOLD ? 1 : 0;
      const target = dragOrigin.value + sign * (wholeSteps + extra);
      activeDriver.value = null;
      progress.value = withTiming(target, { duration: TRANSITION_DURATION });
      restEmphasis.value = withTiming(1, { duration: TRANSITION_DURATION });
    }
  };

  const isCoasting = useSharedValue(false);

  const scrollHandler = useAnimatedScrollHandler({
    onBeginDrag: () => {
      isCoasting.value = false;
      setDriver("top");
    },
    onScroll: (event) => {
      if (activeDriver.value === "top") {
        setProgress(event.contentOffset.x / pageWidth);
      }
    },
    onMomentumBegin: () => {
      isCoasting.value = true;
    },
    onMomentumEnd: () => {
      isCoasting.value = false;
      settleDriver("top");
    },
  });

  useAnimatedReaction(
    () =>
      isCoasting.value && activeDriver.value === "top" ? progress.value : null,
    (value, previousValue) => {
      if (value === null) return;
      const previous = previousValue ?? value;
      const stillMoving = Math.abs(value - previous) > 0.002;
      const offWholeNumber = Math.abs(value - Math.round(value)) > 0.01;
      if (stillMoving || offWholeNumber) return;
      isCoasting.value = false;
      settleDriver("top");
    },
  );

  const maxProgress = itemsCount - 1;

  const displayProgress = useDerivedValue(() => {
    if (activeDriver.value === "top") return progress.value;
    return Math.min(Math.max(progress.value, 0), maxProgress);
  });

  useAnimatedReaction(
    () => displayProgress.value,
    (value) => {
      if (activeDriver.value !== "top") {
        scrollTo(rowManagerRef, value * pageWidth, 0, false);
      }
    },
  );

  const hasPositionedRef = useRef(false);
  useEffect(() => {
    if (hasPositionedRef.current || startIndex === -1 || pageHeight === 0) {
      return;
    }
    hasPositionedRef.current = true;
    rowManagerRef.current?.scrollTo({
      x: startIndex * pageWidth,
      y: 0,
      animated: false,
    });
    setProgress(startIndex);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [startIndex, pageWidth, pageHeight]);

  const handle = {
    progress,
    activeDriver,
    setDriver,
    setProgress,
    settleDriver,
    displayProgress,
    restEmphasis,
    pageWidth,
    pageHeight,
  };

  return (
    <RowManagerContext.Provider value={handle}>
      <Container onLayout={(e) => setPageHeight(e.nativeEvent.layout.height)}>
        {pageHeight > 0 && (
          <Animated.ScrollView
            ref={rowManagerRef}
            horizontal
            snapToInterval={pageWidth}
            decelerationRate="fast"
            showsHorizontalScrollIndicator={false}
            scrollEnabled={scrollEnabled}
            onScroll={scrollHandler}
            scrollEventThrottle={16}
          >
            {Children.map(pagesNode, (page, index) => (
              <PageSlot key={page.key ?? index} index={index}>
                {page}
              </PageSlot>
            ))}
          </Animated.ScrollView>
        )}
      </Container>
      {navigatorNode}
    </RowManagerContext.Provider>
  );
}

RowManager.Pages = PagesSlot;
RowManager.Navigator = NavigatorSlot;
