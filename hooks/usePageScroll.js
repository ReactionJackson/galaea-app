import { useCallback, useEffect, useRef, useState } from "react";
import { Keyboard, Platform } from "react-native";

export const usePageScroll = (scrollRef, headerHeight) => {
  const [keyboardHeight, setKeyboardHeight] = useState(0);
  const [hasKeyboard, setHasKeyboard] = useState(false);
  const isKeyboardVisible = useRef(false);
  const pendingElement = useRef(null);

  // Effects:

  useEffect(() => {
    const isIos = Platform.OS === "ios";
    const show = Keyboard.addListener(
      isIos ? "keyboardWillShow" : "keyboardDidShow",
      (e) => {
        isKeyboardVisible.current = true;
        setHasKeyboard(true);
        setKeyboardHeight(e.endCoordinates.height);
      },
    );
    const hide = Keyboard.addListener(
      isIos ? "keyboardWillHide" : "keyboardDidHide",
      () => {
        isKeyboardVisible.current = false;
        pendingElement.current = null;
        setHasKeyboard(false);
      },
    );
    return () => {
      show.remove();
      hide.remove();
    };
  }, []);

  // Handlers:

  const handlePerformScroll = useCallback(
    (elementRef, offset = 10) => {
      const scroll = scrollRef.current;
      const element = elementRef.current;
      if (!scroll || !element) return;
      element.measureLayout(scroll.getInnerViewRef(), (_x, y) => {
        scroll.scrollTo({
          y: Math.max(0, y - headerHeight - offset),
          animated: true,
        });
      });
    },
    [scrollRef, headerHeight],
  );

  const scrollToElement = useCallback(
    (elementRef, offset = 0) => {
      if (isKeyboardVisible.current) handlePerformScroll(elementRef, offset);
      else pendingElement.current = { elementRef, offset };
    },
    [handlePerformScroll],
  );

  const onContentSizeChange = () => {
    if (!pendingElement.current || !isKeyboardVisible.current) return;
    handlePerformScroll(
      pendingElement.current.elementRef,
      pendingElement.current.offset,
    );
  };

  return { scrollToElement, keyboardHeight, hasKeyboard, onContentSizeChange };
};
