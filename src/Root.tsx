import { Composition } from "remotion";
import { Short, ShortB, TOTAL } from "./Short";
import { Film, FILM_TOTAL } from "./film/Film";
import { theme } from "./theme";
import { RigTest } from "./film/RigTest";
import { SetTest } from "./film/SetTest";

const common = { fps: theme.size.fps, width: theme.size.w, height: theme.size.h };

export const Root = () => (
  <>
    <Composition id="Short" component={Short} durationInFrames={TOTAL} {...common} />
    <Composition id="ShortB" component={ShortB} durationInFrames={TOTAL} {...common} />
    <Composition id="Procrastination" component={Film} durationInFrames={FILM_TOTAL} {...common} />
    <Composition id="SetTest" component={SetTest as any} durationInFrames={4} defaultProps={{ which: 0 }} {...common} />
    <Composition id="RigTest" component={RigTest} durationInFrames={1} {...common} />
  </>
);
