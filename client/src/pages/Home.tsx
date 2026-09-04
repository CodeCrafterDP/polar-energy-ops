import { AIChatBox, type Message } from "@/components/AIChatBox";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { trpc } from "@/lib/trpc";
import {
  Activity,
  ArrowUpRight,
  BarChart3,
  BatteryCharging,
  Bot,
  CircleGauge,
  CloudSnow,
  Factory,
  Fuel,
  Gauge,
  LifeBuoy,
  MessageSquareText,
  Radio,
  RefreshCcw,
  Settings2,
  ShieldCheck,
  Snowflake,
  Sparkles,
  ThermometerSnowflake,
  Wind,
} from "lucide-react";
import { useMemo, useState } from "react";
import { toast } from "sonner";

const INITIAL_MESSAGES: Message[] = [
  {
    role: "system",
    content:
      "You are PolarOps, a specialist in resilient energy systems for polar research stations.",
  },
  {
    role: "assistant",
    content:
      "## Good morning, operator.\n\nI'm **PolarOps**, your station energy copilot. I can help turn harsh-weather constraints into an operating plan across:\n\n- **Load forecasting** — thermal demand, occupancy, science loads, and uncertainty bands\n- **Renewable integration** — wind/solar availability, battery dispatch, and curtailment\n- **Fuel optimization** — genset loading, reserve margins, and resupply-aware scheduling\n\nWhat would you like to investigate first?",
  },
];

const PROMPTS = [
  {
    icon: BarChart3,
    label: "Forecast tomorrow's load",
    prompt:
      "Build a practical 24-hour load forecast for a winter polar station and list the inputs I should collect.",
  },
  {
    icon: Wind,
    label: "Plan renewable dispatch",
    prompt:
      "How should I dispatch wind, solar, battery, and diesel generation during a high-wind polar day?",
  },
  {
    icon: Fuel,
    label: "Reduce fuel burn",
    prompt:
      "Give me a fuel optimization strategy for two diesel gensets when the battery is at 74% and wind is intermittent.",
  },
];

const NAV_ITEMS = [
  { label: "Energy copilot", icon: MessageSquareText },
  { label: "Forecasting", icon: BarChart3 },
  { label: "Renewable mix", icon: Wind },
  { label: "Fuel strategy", icon: Fuel },
];

export default function Home() {
  const [messages, setMessages] = useState<Message[]>(INITIAL_MESSAGES);
  const [activeNav, setActiveNav] = useState("Energy copilot");
  const chatMutation = trpc.ai.chat.useMutation();

  const userMessages = useMemo(
    () => messages.filter(message => message.role !== "system"),
    [messages],
  );

  const handleSendMessage = (content: string) => {
    const nextMessages: Message[] = [
      ...messages,
      { role: "user", content },
    ];
    setMessages(nextMessages);
    chatMutation.mutate(
      {
        messages: nextMessages
          .filter(message => message.role !== "system")
          .map(message => ({
            role: message.role as "user" | "assistant",
            content: message.content,
          })),
      },
      {
        onSuccess: response => {
          setMessages(current => [
            ...current,
            { role: "assistant", content: response.content },
          ]);
        },
        onError: () => {
          setMessages(current => [
            ...current,
            {
              role: "assistant",
              content:
                "I couldn't reach the station intelligence service just now. Please retry in a moment; no control action was taken.",
            },
          ]);
          toast.error("PolarOps is temporarily unavailable");
        },
      },
    );
  };

  const handleReset = () => {
    setMessages(INITIAL_MESSAGES);
    toast.success("Conversation reset");
  };

  return (
    <div className="min-h-screen overflow-x-hidden bg-[#eef4fb] text-[#102847]">
      <div className="flex min-h-screen">
        <aside className="hidden w-[254px] shrink-0 flex-col border-r border-white/10 bg-[#092342] text-white lg:flex">
          <div className="flex h-[86px] items-center gap-3 border-b border-white/10 px-6">
            <div className="flex size-10 items-center justify-center rounded-2xl bg-[#84d8f4] text-[#092342] shadow-[0_0_0_6px_rgba(132,216,244,0.12)]">
              <Snowflake className="size-5" strokeWidth={2.2} />
            </div>
            <div>
              <p className="text-[15px] font-semibold tracking-[-0.02em]">PolarOps</p>
              <p className="mt-0.5 text-[10px] uppercase tracking-[0.2em] text-[#91b7d8]">Energy intelligence</p>
            </div>
          </div>

          <div className="flex-1 px-4 py-7">
            <p className="px-3 text-[10px] font-semibold uppercase tracking-[0.2em] text-[#7399bd]">Workspace</p>
            <nav className="mt-3 space-y-1.5" aria-label="Workspace navigation">
              {NAV_ITEMS.map(item => {
                const Icon = item.icon;
                const isActive = item.label === activeNav;
                return (
                  <button
                    key={item.label}
                    type="button"
                    onClick={() => setActiveNav(item.label)}
                    className={`group flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-left text-[13px] transition-all duration-200 ${
                      isActive
                        ? "bg-white/[0.12] text-white shadow-[inset_3px_0_0_#84d8f4]"
                        : "text-[#9bbbd7] hover:bg-white/[0.07] hover:text-white"
                    }`}
                  >
                    <Icon className={`size-4 ${isActive ? "text-[#84d8f4]" : "text-[#6d98bf]"}`} />
                    <span>{item.label}</span>
                    {isActive && <ArrowUpRight className="ml-auto size-3.5 text-[#84d8f4]" />}
                  </button>
                );
              })}
            </nav>

            <div className="mt-10 rounded-2xl border border-white/10 bg-white/[0.06] p-4">
              <div className="flex items-center gap-2 text-[#b7dbef]">
                <Radio className="size-4 text-[#84d8f4]" />
                <span className="text-xs font-semibold">Station link</span>
              </div>
              <p className="mt-3 text-[12px] leading-5 text-[#8caecc]">Demo telemetry is active. Answers are planning guidance, not live control commands.</p>
              <div className="mt-4 flex items-center gap-2 text-[11px] text-[#84d8f4]">
                <span className="size-1.5 rounded-full bg-[#84d8f4] shadow-[0_0_0_4px_rgba(132,216,244,0.12)]" />
                Secure workspace
              </div>
            </div>
          </div>

          <div className="border-t border-white/10 p-4">
            <button type="button" onClick={() => toast.info("Support channel is available in the station handbook.")} className="flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-left text-[12px] text-[#9bbbd7] transition-colors hover:bg-white/[0.07] hover:text-white">
              <LifeBuoy className="size-4 text-[#6d98bf]" />
              Station handbook
            </button>
            <button type="button" onClick={() => toast.info("Settings are illustrative in this prototype.")} className="mt-1 flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-left text-[12px] text-[#9bbbd7] transition-colors hover:bg-white/[0.07] hover:text-white">
              <Settings2 className="size-4 text-[#6d98bf]" />
              Workspace settings
            </button>
          </div>
        </aside>

        <main className="min-w-0 flex-1">
          <header className="flex h-[86px] items-center justify-between border-b border-[#d9e6f1] bg-white/80 px-5 backdrop-blur md:px-9">
            <div className="flex items-center gap-3 lg:hidden">
              <div className="flex size-9 items-center justify-center rounded-xl bg-[#092342] text-[#84d8f4]"><Snowflake className="size-4" /></div>
              <span className="text-sm font-semibold text-[#092342]">PolarOps</span>
            </div>
            <div className="hidden min-w-0 md:block">
              <p className="truncate text-[11px] font-semibold uppercase tracking-[0.2em] text-[#7693ad]">Station operations / {activeNav}</p>
              <p className="mt-1 text-sm text-[#45627c]">A decision layer for resilient power in the high north.</p>
            </div>
            <div className="ml-auto flex items-center gap-2.5 md:gap-4">
              <div className="hidden items-center gap-2 rounded-full border border-[#d9e6f1] bg-white px-3 py-2 text-[11px] font-medium text-[#52718c] sm:flex">
                <CloudSnow className="size-3.5 text-[#459dc5]" />
                Ny-Ålesund · 78.9° N
              </div>
              <div className="flex items-center gap-2 rounded-full bg-[#e9f7f4] px-3 py-2 text-[11px] font-semibold text-[#287a67]">
                <span className="size-1.5 rounded-full bg-[#35b690]" />
                <span className="hidden sm:inline">Operations online</span>
                <span className="sm:hidden">Online</span>
              </div>
              <div className="flex size-9 items-center justify-center rounded-full bg-[#d9eff8] text-xs font-bold text-[#146187]">AM</div>
            </div>
          </header>

          <div className="mx-auto max-w-[1500px] px-5 py-6 md:px-9 md:py-8">
            <section className="relative overflow-hidden rounded-[26px] bg-[#0b2b50] px-6 py-7 text-white shadow-[0_20px_50px_rgba(11,43,80,0.15)] md:px-9 md:py-8">
              <div className="absolute -right-12 -top-24 size-72 rounded-full border border-[#75cde8]/20" />
              <div className="absolute -right-2 -top-14 size-52 rounded-full border border-[#75cde8]/15" />
              <div className="absolute bottom-0 right-[24%] size-32 rounded-full bg-[#2d8db8]/10 blur-3xl" />
              <div className="relative z-10 max-w-[650px]">
                <div className="flex items-center gap-2 text-[#8edcf4]">
                  <Sparkles className="size-4" />
                  <span className="text-[11px] font-semibold uppercase tracking-[0.22em]">Polar station copilot</span>
                </div>
                <h1 className="mt-4 max-w-[590px] text-[30px] font-semibold leading-[1.07] tracking-[-0.04em] md:text-[42px]">Operational clarity for remote power systems.</h1>
                <p className="mt-4 max-w-[560px] text-sm leading-6 text-[#b3d0e5] md:text-[15px]">Ask grounded questions about forecasts, renewables, or fuel strategy. PolarOps translates extreme-weather constraints into a plan your team can review.</p>
              </div>
              <div className="relative z-10 mt-8 grid max-w-[750px] grid-cols-1 gap-2.5 sm:grid-cols-3">
                <Metric label="Forecast confidence" value="94.6%" trend="↑ 2.1% vs. last run" />
                <Metric label="Renewable contribution" value="61%" trend="↑ 8% this season" />
                <Metric label="Fuel autonomy" value="18.4 d" trend="At current reserve" />
              </div>
            </section>

            <div className="mt-6 grid gap-6 xl:grid-cols-[minmax(0,1fr)_310px]">
              <section className="min-w-0 rounded-[24px] border border-[#d9e6f1] bg-white shadow-[0_12px_40px_rgba(38,83,121,0.06)]">
                <div className="flex flex-col gap-3 border-b border-[#e6eef5] px-5 py-4 sm:flex-row sm:items-center sm:justify-between md:px-6">
                  <div className="flex items-center gap-3">
                    <div className="flex size-9 items-center justify-center rounded-xl bg-[#e6f7fc] text-[#2383ad]"><Bot className="size-4" /></div>
                    <div>
                      <h2 className="text-sm font-semibold text-[#123454]">Ask PolarOps</h2>
                      <p className="mt-0.5 text-[11px] text-[#7a94aa]">Context-aware guidance for your next shift</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge variant="outline" className="border-[#c6e7f2] bg-[#f3fbfe] text-[10px] font-semibold text-[#3287ac]">Knowledge base ready</Badge>
                    <Button type="button" variant="ghost" size="icon" onClick={handleReset} className="size-8 rounded-lg text-[#7290a8] hover:bg-[#edf6fb] hover:text-[#1b6388]" aria-label="Reset conversation"><RefreshCcw className="size-3.5" /></Button>
                  </div>
                </div>
                <div className="p-3 md:p-4">
                  <AIChatBox
                    messages={messages}
                    onSendMessage={handleSendMessage}
                    isLoading={chatMutation.isPending}
                    height="min(52vh, 500px)"
                    placeholder="Ask about load, wind, batteries, or fuel…"
                    emptyStateMessage="Start a conversation with the station copilot"
                    className="border-0 bg-[#f8fbfe] shadow-none"
                    suggestedPrompts={PROMPTS.map(prompt => prompt.label)}
                  />
                </div>
                <div className="border-t border-[#e6eef5] px-5 py-4 md:px-6">
                  <div className="flex items-center gap-2 text-[10px] font-semibold uppercase tracking-[0.18em] text-[#8ba5b9]"><Sparkles className="size-3 text-[#56b9d9]" /> Try a focused question</div>
                  <div className="mt-3 grid gap-2 sm:grid-cols-3">
                    {PROMPTS.map(prompt => {
                      const Icon = prompt.icon;
                      return (
                        <button key={prompt.label} type="button" onClick={() => handleSendMessage(prompt.prompt)} disabled={chatMutation.isPending} className="group flex items-center gap-2.5 rounded-xl border border-[#dceaf3] bg-[#fbfdff] px-3 py-2.5 text-left text-xs font-medium text-[#45637c] transition-all duration-200 hover:-translate-y-0.5 hover:border-[#9bd8eb] hover:bg-[#f1fbfe] disabled:cursor-not-allowed disabled:opacity-60">
                          <Icon className="size-3.5 shrink-0 text-[#3295bb]" />
                          <span className="leading-4">{prompt.label}</span>
                          <ArrowUpRight className="ml-auto size-3 shrink-0 text-[#9db5c7] transition-transform group-hover:-translate-y-0.5 group-hover:translate-x-0.5" />
                        </button>
                      );
                    })}
                  </div>
                </div>
              </section>

              <aside className="space-y-6">
                <section className="rounded-[24px] border border-[#d9e6f1] bg-white p-5 shadow-[0_12px_40px_rgba(38,83,121,0.05)]">
                  <div className="flex items-start justify-between">
                    <div>
                      <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-[#8ba4b8]">Station pulse</p>
                      <h2 className="mt-1 text-lg font-semibold tracking-[-0.03em] text-[#123454]">Concordia field unit</h2>
                    </div>
                    <div className="flex size-8 items-center justify-center rounded-xl bg-[#eaf7fb] text-[#3a9cc0]"><Activity className="size-4" /></div>
                  </div>
                  <div className="mt-5 rounded-2xl bg-[#f2f8fc] px-3 py-3">
                    <div className="flex items-center justify-between text-[10px] font-semibold uppercase tracking-[0.15em] text-[#7f9aae]"><span>24h demand profile</span><span className="text-[#3b9bc0]">Live demo</span></div>
                    <svg className="mt-3 h-[82px] w-full" viewBox="0 0 260 82" role="img" aria-label="Illustrative 24-hour demand profile">
                      <defs>
                        <linearGradient id="pulseFill" x1="0" x2="0" y1="0" y2="1"><stop offset="0" stopColor="#65c7e5" stopOpacity="0.28" /><stop offset="1" stopColor="#65c7e5" stopOpacity="0" /></linearGradient>
                      </defs>
                      <path d="M0,58 C16,55 19,49 32,51 S52,69 64,57 S78,31 91,42 S105,55 118,42 S136,20 149,32 S166,51 178,39 S198,28 211,34 S228,18 244,28 S252,22 260,24 L260,82 L0,82 Z" fill="url(#pulseFill)" />
                      <path d="M0,58 C16,55 19,49 32,51 S52,69 64,57 S78,31 91,42 S105,55 118,42 S136,20 149,32 S166,51 178,39 S198,28 211,34 S228,18 244,28 S252,22 260,24" fill="none" stroke="#42a9cb" strokeLinecap="round" strokeWidth="2.5" />
                      <path d="M0,72 H260" stroke="#d5e6f0" strokeDasharray="3 4" />
                    </svg>
                    <div className="flex justify-between text-[10px] text-[#9ab0c0]"><span>00:00</span><span>12:00</span><span>24:00</span></div>
                  </div>
                  <div className="mt-4 divide-y divide-[#edf2f6]">
                    <PulseRow icon={ThermometerSnowflake} label="Thermal load" value="186 kW" detail="−12% vs. baseline" tone="blue" />
                    <PulseRow icon={Wind} label="Wind availability" value="82%" detail="Icing risk: low" tone="green" />
                    <PulseRow icon={BatteryCharging} label="Battery state" value="74%" detail="4.8 h usable" tone="purple" />
                    <PulseRow icon={Factory} label="Genset reserve" value="2.8 MW" detail="N+1 ready" tone="orange" />
                  </div>
                </section>

                <section className="rounded-[24px] bg-[#dff3fa] p-5">
                  <div className="flex items-center gap-2 text-[#1e789b]"><ShieldCheck className="size-4" /><span className="text-[11px] font-bold uppercase tracking-[0.15em]">Operator note</span></div>
                  <p className="mt-3 text-[13px] leading-5 text-[#315b73]">Keep a conservative reserve through darkness windows. PolarOps will surface assumptions before recommendations.</p>
                  <button type="button" onClick={() => handleSendMessage("What reserve margin should a polar station maintain during a 10-day darkness window?")} className="mt-4 flex items-center gap-1 text-xs font-semibold text-[#1a6c8d] hover:text-[#104e68]">Ask about reserve margins <ArrowUpRight className="size-3.5" /></button>
                </section>
              </aside>
            </div>

            <footer className="flex flex-col gap-2 py-7 text-[11px] text-[#8aa2b5] sm:flex-row sm:items-center sm:justify-between">
              <span>PolarOps v0.1 · Illustrative station telemetry</span>
              <span className="flex items-center gap-1.5"><CircleGauge className="size-3.5" /> Built for planning, review, and resilient decisions</span>
            </footer>
          </div>
        </main>
      </div>
    </div>
  );
}

function Metric({ label, value, trend }: { label: string; value: string; trend: string }) {
  return (
    <div className="rounded-2xl border border-white/10 bg-white/[0.08] px-4 py-3.5 backdrop-blur-sm">
      <p className="text-[10px] font-semibold uppercase tracking-[0.16em] text-[#8db1cc]">{label}</p>
      <div className="mt-2 flex items-end justify-between gap-2"><span className="text-2xl font-semibold tracking-[-0.04em] text-white">{value}</span><span className="pb-0.5 text-[10px] text-[#8edcf4]">{trend}</span></div>
    </div>
  );
}

function PulseRow({ icon: Icon, label, value, detail, tone }: { icon: typeof Gauge; label: string; value: string; detail: string; tone: "blue" | "green" | "purple" | "orange" }) {
  const toneClasses = {
    blue: "bg-[#e8f6fb] text-[#2d91b8]",
    green: "bg-[#e8f7f2] text-[#2c9a7c]",
    purple: "bg-[#f1edfb] text-[#8061b0]",
    orange: "bg-[#fff3e8] text-[#cf813d]",
  };
  return (
    <div className="flex items-center gap-3 py-3">
      <div className={`flex size-8 shrink-0 items-center justify-center rounded-xl ${toneClasses[tone]}`}><Icon className="size-3.5" /></div>
      <div className="min-w-0 flex-1"><p className="text-xs font-medium text-[#58738a]">{label}</p><p className="mt-0.5 truncate text-[10px] text-[#9aafbf]">{detail}</p></div>
      <span className="text-sm font-semibold text-[#183b5b]">{value}</span>
    </div>
  );
}
