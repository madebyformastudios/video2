import { Composition } from "remotion";
import { Short, ShortB, TOTAL } from "./Short";
import { theme } from "./theme";

const common = { durationInFrames: TOTAL, fps: theme.size.fps, width: theme.size.w, height: theme.size.h };

export const Root = () => (
  <>
    <Composition id="Short" component={Short} {...common} />
    <Composition id="ShortB" component={ShortB} {...common} />
  </>
);
