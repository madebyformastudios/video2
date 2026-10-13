import { Composition } from "remotion";
import { Short, ShortB, TOTAL } from "./Short";
import { Procrastination, PROC_TOTAL } from "./proc/Procrastination";
import { theme } from "./theme";

const common = { fps: theme.size.fps, width: theme.size.w, height: theme.size.h };

export const Root = () => (
  <>
    <Composition id="Short" component={Short} durationInFrames={TOTAL} {...common} />
    <Composition id="ShortB" component={ShortB} durationInFrames={TOTAL} {...common} />
    <Composition id="Procrastination" component={Procrastination} durationInFrames={PROC_TOTAL} {...common} />
  </>
);
