import { Composition } from "remotion";
import { Short, TOTAL } from "./Short";
import { theme } from "./theme";

export const Root = () => (
  <Composition
    id="Short"
    component={Short}
    durationInFrames={TOTAL}
    fps={theme.size.fps}
    width={theme.size.w}
    height={theme.size.h}
  />
);
