import { z } from "zod";
import { COOKIE_NAME } from "@shared/const";
import { getSessionCookieOptions } from "./_core/cookies";
import { invokeLLM } from "./_core/llm";
import { systemRouter } from "./_core/systemRouter";
import { publicProcedure, router } from "./_core/trpc";

const polarOpsSystemPrompt = `You are PolarOps, an expert energy-management copilot for remote polar research stations.

Your job is to answer questions about load forecasting, renewable-energy integration, microgrid dispatch, battery strategy, generator scheduling, and fuel optimization under extreme polar conditions. Be practical, concise, and technically clear. Organize answers with short headings and bullets when useful.

Always reason about polar constraints such as long darkness, icing and snow accumulation, low-temperature battery derating, wind-turbine cut-out or icing risk, fuel logistics, generator warm-up and minimum-load limits, maintenance windows, thermal loads, communications outages, and the need for redundant power. When a question lacks site-specific data, state the assumptions and recommend the measurements or operational inputs needed to improve the answer. Distinguish planning guidance from a control command. Never invent sensor readings, weather forecasts, or station policies. Encourage verification by the station energy lead before changing live dispatch settings.

Use SI units and UTC when relevant. The interface may show illustrative demo telemetry for a generic polar station; do not treat it as a live control system. Give an actionable next step at the end of most answers.`;

const chatMessageSchema = z.object({
  role: z.enum(["user", "assistant"]),
  content: z.string().min(1).max(8000),
});

export function fallbackAnswer(question: string) {
  const normalized = question.toLowerCase();
  if (normalized.includes("fuel") || normalized.includes("genset") || normalized.includes("diesel")) {
    return `## Fuel optimization starting point

For a generic polar station, keep the online genset(s) in their efficient loading band rather than chasing every short renewable fluctuation. A practical sequence is:

- Hold a conservative spinning-reserve margin for the largest credible step load and cold-start uncertainty.
- Use the battery to absorb fast wind changes and cover short peaks; avoid deep discharge when low temperatures can reduce usable capacity.
- Run the most efficient genset near its preferred load band, and bring the second unit online before minimum-load or reserve limits are breached.
- Schedule deferrable science loads, battery charging, and water heating into periods of high renewable availability.

**Inputs to confirm:** generator fuel curves, minimum stable load, battery temperature and state-of-charge, wind ramp history, and days of fuel autonomy. Validate any dispatch change with the station energy lead.`;
  }
  if (normalized.includes("wind") || normalized.includes("solar") || normalized.includes("renewable")) {
    return `## Renewable dispatch pattern

Treat renewable power as forecastable energy plus a ramp-risk envelope. Prioritize direct station load first, then charge the battery when state-of-charge and temperature allow, and curtail only after reserve and battery limits are protected.

- Apply icing and cut-out derates to wind availability instead of using nameplate power.
- In darkness windows, value wind forecast confidence and battery headroom more than peak renewable contribution.
- Keep a genset online when forecast error, battery derating, or resupply constraints could threaten continuity.
- Re-forecast on a short rolling horizon after major wind ramps or weather-front changes.

**Next step:** collect 15-minute renewable output, nacelle or panel condition, battery temperature, and curtailment flags for at least four weeks.`;
  }
  return `## A practical load-forecast frame

Start with a 24-hour forecast at 15-minute or hourly resolution, then add an uncertainty band for polar conditions. Separate the load into thermal, accommodation, science, comms, water and waste, battery charging, and maintenance categories.

Use these inputs:

- Outdoor temperature, wind chill, wind speed, solar elevation, and darkness-window status.
- Occupancy, scheduled science activity, comms windows, water production, and maintenance plans.
- Recent feeder or generator readings, including peak demand, ramp rate, and recurring heater cycles.
- Renewable forecast, battery state-of-charge and temperature, generator availability, and required reserve.

Start with a conservative high-side scenario for dispatch planning, then update it as measured demand arrives. This is planning guidance; verify assumptions against station telemetry before changing live settings.`;
}

export const appRouter = router({
  system: systemRouter,
  auth: router({
    me: publicProcedure.query(opts => opts.ctx.user),
    logout: publicProcedure.mutation(({ ctx }) => {
      const cookieOptions = getSessionCookieOptions(ctx.req);
      ctx.res.clearCookie(COOKIE_NAME, { ...cookieOptions, maxAge: -1 });
      return { success: true } as const;
    }),
  }),

  ai: router({
    chat: publicProcedure
      .input(z.object({ messages: z.array(chatMessageSchema).min(1).max(24) }))
      .mutation(async ({ input }) => {
        const lastQuestion = input.messages[input.messages.length - 1]?.content ?? "";
        try {
          const response = await Promise.race([
            invokeLLM({
              model: "gpt-5-mini",
              messages: [
                { role: "system", content: polarOpsSystemPrompt },
                ...input.messages,
              ],
              reasoning: { effort: "low" },
            }),
            new Promise<never>((_, reject) =>
              setTimeout(() => reject(new Error("LLM response timeout")), 7000),
            ),
          ]);
          const content = response.choices?.[0]?.message?.content;
          if (typeof content === "string" && content.trim().length > 0) {
            return { content };
          }
        } catch (error) {
          console.warn("[PolarOps] Falling back to local guidance:", error);
        }
        return { content: fallbackAnswer(lastQuestion) };
      }),
  }),
});

export type AppRouter = typeof appRouter;
