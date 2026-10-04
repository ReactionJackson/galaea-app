import { useState } from "react";

export const useDynamicHeight = (stubHeight) => {
  const [height, setHeight] = useState(stubHeight);

  const onLayout = (e) => {
    const next = e.nativeEvent.layout.height;
    if (next > 0 && next !== height) setHeight(next);
  };

  return { height, onLayout };
};
