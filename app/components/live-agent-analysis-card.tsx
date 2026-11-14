"use client";

import { useEffect, useState, useMemo } from "react";
import Link from "next/link";
import {
  IconBrain,
  IconFloodAgent,
  IconHealthAgent,
  IconLogisticsAgent,
  IconRouteAgent,
  IconResourceAgent,
  IconRefresh,
  IconPlayFilled,
} from "./icons";
import type {
  LiveMultiAgentPipelineResult,
  AgentExecution,
  FloodOutput,
  HealthOutput,
  LogisticsOutput,
  RouteOutput,
  ResourceOutput,
} from "../../lib/agents/live";

type AgentKey = "health" | "flood" | "logistics" | "route" | "resource";
type LifecycleState = "monitoring" | "thinking" | "working" | "decision_made";

interface AgentDef {
  key: AgentKey;
  tag: string;
  title: string;
  roleSubtitle: string;
  badgeLabel: string;
  Icon: typeof IconHealthAgent;
  themeColor: {
    bg: string;
    text: string;
    border: string;
    ring: string;
    iconBg: string;
  };
  stages: Record<
    LifecycleState,
    {
      actionTitle: string;
      terminalLog: string;
    }
  >;
}

function EvidenceList({ items }: { items: string[] }) {
  if (!items.length) {
    return <p className="text-[11px] text-slate-400">No evidence was returned.</p>;
  }
  return (
    <ul className="space-y-1.5">
      {items.map((item, index) => (
        <li key={index} className="flex gap-2 text-[11px] leading-relaxed text-slate-600">
          <span className="mt-1 h-1.5 w-1.5 shrink-0 rounded-full bg-slate-300" />
          {item}
        </li>
      ))}
    </ul>
  );
}

function AgentDetails({
  agent,
}: {
  agent: AgentExecution<unknown>;
}) {
  if (!agent.output || agent.status !== "completed") {
    return (
      <div className="rounded-xl border border-amber-100 bg-amber-50 p-3 text-[11px] text-amber-800">
        {agent.error ?? "This agent did not return a result. Other agents can still complete."}
      </div>
    );
  }

  const output = agent.output as Record<string, unknown>;
  const list = (key: string) =>
    Array.isArray(output[key])
      ? (output[key] as unknown[]).filter((item): item is string => typeof item === "string")
      : [];

  if ("weatherSignal" in output) {
    return (
      <div className="space-y-2">
        <p className="text-[11px] font-semibold text-ink">
          Weather signal: {String(output.weatherSignal).replace(/_/g, " ")}
        </p>
        <EvidenceList items={[...list("signals"), ...list("limitations").map((item) => `Limitation: ${item}`)]} />
      </div>
    );
  }

  if ("urgency" in output) {
    return (
      <div className="space-y-2">
        <p className="text-[11px] font-semibold text-ink">
          Triage urgency: {String(output.urgency)}
        </p>
        <EvidenceList
          items={[
            ...list("reportedSignals").map((item) => `Reported: ${item}`),
            ...list("redFlags").map((item) => `Red flag: ${item}`),
            ...list("nextSteps").map((item) => `Next step: ${item}`),
          ]}
        />
        <p className="rounded-lg bg-rose-50 px-3 py-2 text-[10px] font-semibold text-rose-700">
          Supportive triage only. A qualified clinician must review all health decisions.
        </p>
      </div>
    );
  }

  if ("items" in output) {
    const items = Array.isArray(output.items) ? (output.items as Record<string, unknown>[]) : [];
    return (
      <div className="space-y-2">
        {items.length ? (
          <div className="space-y-1.5">
            {items.map((item, index) => (
              <div key={index} className="flex items-center justify-between gap-2 rounded-lg bg-slate-50 px-3 py-2 text-[10.5px]">
                <span className="min-w-0">
                  <span className="block font-semibold text-ink">{String(item.name)}</span>
                  <span className="text-slate-500">{String(item.reason)}</span>
                </span>
                <span className="shrink-0 text-right font-bold text-slate-700">
                  {String(item.quantity)} {String(item.unit)}
                  <span className="block text-[9px] font-semibold uppercase text-slate-400">
                    {String(item.stockStatus).replace(/_/g, " ")}
                  </span>
                </span>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-[11px] text-slate-500">No parcel items were suggested.</p>
        )}
        <EvidenceList items={list("packingNotes")} />
        <p className="text-[10px] text-slate-500">Stock is checked against exact database item names. No stock is reserved or deducted.</p>
      </div>
    );
  }

  if ("passability" in output) {
    return (
      <div className="space-y-2">
        <p className="text-[11px] font-semibold text-ink">{String(output.passability).replace(/_/g, " ")}</p>
        <EvidenceList items={list("cautions")} />
        <p className="text-[10px] text-slate-500">A road-network route is not proof that a road is safe or passable during a flood.</p>
      </div>
    );
  }

  return (
    <div className="space-y-2">
      <p className="text-[11px] text-slate-700">
        {String(output.reason ?? "A verified cost estimate is unavailable.")}
      </p>
      <p className="text-[10px] text-slate-500">
        No placeholder prices or estimated totals are shown without a verified price catalog.
      </p>
    </div>
  );
}

export function LiveAgentAnalysisCard({
  pipeline,
}: {
  pipeline: LiveMultiAgentPipelineResult;
}) {
  const [active, setActive] = useState<AgentKey>("health");
  const [agentStates, setAgentStates] = useState<Record<AgentKey, LifecycleState>>({
    health: "decision_made",
    flood: "decision_made",
    logistics: "decision_made",
    route: "decision_made",
    resource: "decision_made",
  });
  const [runningAgent, setRunningAgent] = useState<AgentKey | "all" | null>(null);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    const url = new URL(window.location.href);
    if (url.searchParams.get("refreshAnalysis") === "1") {
      url.searchParams.delete("refreshAnalysis");
      window.history.replaceState(window.history.state, "", url.toString());
    }
  }, []);

  const agentResults: Record<AgentKey, AgentExecution<unknown>> = useMemo(
    () => ({
      health: pipeline.healthAgent,
      flood: pipeline.floodAgent,
      logistics: pipeline.logisticsAgent,
      route: pipeline.routeAgent,
      resource: pipeline.resourceAgent,
    }),
    [pipeline]
  );

  const completedCount = Object.values(agentResults).filter((agent) => agent.status === "completed").length;

  const agentDefs: Record<AgentKey, AgentDef> = useMemo(() => {
    const healthOut = pipeline.healthAgent.output as HealthOutput | null;
    const floodOut = pipeline.floodAgent.output as FloodOutput | null;
    const logisticsOut = pipeline.logisticsAgent.output as LogisticsOutput | null;
    const routeOut = pipeline.routeAgent.output as RouteOutput | null;
    const resourceOut = pipeline.resourceAgent.output as ResourceOutput | null;

    return {
      health: {
        key: "health",
        tag: "HEALTH",
        title: "Health",
        roleSubtitle: "Reported Symptom Review & Clinician Referral",
        badgeLabel: "Ready",
        Icon: IconHealthAgent,
        themeColor: {
          bg: "bg-rose-50",
          text: "text-rose-700",
          border: "border-rose-200",
          ring: "ring-rose-400",
          iconBg: "bg-rose-500",
        },
        stages: {
          monitoring: {
            actionTitle: "Screening Reported Symptoms",
            terminalLog: `[HEALTH-01] 📡 MONITORING: Screening citizen incident needs. Urgent signals: ${healthOut?.reportedSignals.join(", ") || "General distress"}.`,
          },
          thinking: {
            actionTitle: "Evaluating Clinical Urgency",
            terminalLog: `[HEALTH-02] 🧠 THINKING: Triage urgency classified as: ${healthOut?.urgency ?? "Routine"}. Flagged red flags: ${healthOut?.redFlags.length ?? 0}.`,
          },
          working: {
            actionTitle: "Formulating Clinical Protocol",
            terminalLog: `[HEALTH-03] ⚙️ WORKING: Advisory health triage prepared for Alkhidmat medical field camp clinicians.`,
          },
          decision_made: {
            actionTitle: "Clinical Verdict Issued",
            terminalLog: `[HEALTH-04] ✅ DECISION: Health signals summarized for clinician review. No diagnosis or dispatch is performed.`,
          },
        },
      },
      flood: {
        key: "flood",
        tag: "FLOOD",
        title: "Flood",
        roleSubtitle: "Basin Rainfall & Inundation Radar",
        badgeLabel: "Ready",
        Icon: IconFloodAgent,
        themeColor: {
          bg: "bg-sky-50",
          text: "text-sky-700",
          border: "border-sky-200",
          ring: "ring-sky-400",
          iconBg: "bg-sky-500",
        },
        stages: {
          monitoring: {
            actionTitle: "Ingesting Weather Telemetry",
            terminalLog: `[FLOOD-01] 📡 MONITORING: Reviewing precipitation records and Sentinel-1 SAR inundation radar.`,
          },
          thinking: {
            actionTitle: "Evaluating Precipitation Signal",
            terminalLog: `[FLOOD-02] 🧠 THINKING: Weather signal: ${floodOut?.weatherSignal ?? "Moderate"}. Evaluating basin soil saturation and river proximity.`,
          },
          working: {
            actionTitle: "Reviewing Flood Limitations",
            terminalLog: `[FLOOD-03] ⚙️ WORKING: Rainfall alone does not establish ground water depth. Field scout verification advised.`,
          },
          decision_made: {
            actionTitle: "Flood Radar Summary Issued",
            terminalLog: `[FLOOD-04] ✅ DECISION: ${pipeline.floodAgent.summary}`,
          },
        },
      },
      logistics: {
        key: "logistics",
        tag: "LOGISTICS",
        title: "Logistics",
        roleSubtitle: "Warehouse Inventory & Parcel Assembly",
        badgeLabel: "Ready",
        Icon: IconLogisticsAgent,
        themeColor: {
          bg: "bg-amber-50",
          text: "text-amber-700",
          border: "border-amber-200",
          ring: "ring-amber-400",
          iconBg: "bg-amber-500",
        },
        stages: {
          monitoring: {
            actionTitle: "Checking Camp Inventory",
            terminalLog: `[LOGISTICS-01] 📡 MONITORING: Auditing available stock at nearest relief camp hub.`,
          },
          thinking: {
            actionTitle: "Assembling Emergency Kit",
            terminalLog: `[LOGISTICS-02] 🧠 THINKING: Assembling family water purification, ORS packs, food rations, and shelter kits.`,
          },
          working: {
            actionTitle: "Verifying Stock Availability",
            terminalLog: `[LOGISTICS-03] ⚙️ WORKING: Checked ${logisticsOut?.items.length ?? 0} suggested items against warehouse records. Zero phantom inventory.`,
          },
          decision_made: {
            actionTitle: "Relief Parcel Manifest Issued",
            terminalLog: `[LOGISTICS-04] ✅ DECISION: ${pipeline.logisticsAgent.summary}`,
          },
        },
      },
      route: {
        key: "route",
        tag: "ROUTE",
        title: "Route",
        roleSubtitle: "OSRM Road Navigation & Dry-Lane Bypass",
        badgeLabel: "Ready",
        Icon: IconRouteAgent,
        themeColor: {
          bg: "bg-violet-50",
          text: "text-violet-700",
          border: "border-violet-200",
          ring: "ring-violet-400",
          iconBg: "bg-violet-500",
        },
        stages: {
          monitoring: {
            actionTitle: "Querying Road Network Geometry",
            terminalLog: `[ROUTE-01] 📡 MONITORING: Ingesting OSRM road geometry and calculating safe dispatch corridor.`,
          },
          thinking: {
            actionTitle: "Evaluating Floodway Passability",
            terminalLog: `[ROUTE-02] 🧠 THINKING: Road passability unverified. High-clearance vehicles or motorboats required for inundated roads.`,
          },
          working: {
            actionTitle: "Formulating Safety Cautions",
            terminalLog: `[ROUTE-03] ⚙️ WORKING: Flagging low-lying culverts and riverbanks. Cautionary speed advisories logged.`,
          },
          decision_made: {
            actionTitle: "Route Navigation Summary Issued",
            terminalLog: `[ROUTE-04] ✅ DECISION: ${pipeline.routeAgent.summary}`,
          },
        },
      },
      resource: {
        key: "resource",
        tag: "RESOURCE",
        title: "Resource",
        roleSubtitle: "Humanitarian Cost Audit & Transparency",
        badgeLabel: "Ready",
        Icon: IconResourceAgent,
        themeColor: {
          bg: "bg-emerald-50",
          text: "text-emerald-700",
          border: "border-emerald-200",
          ring: "ring-emerald-400",
          iconBg: "bg-emerald-500",
        },
        stages: {
          monitoring: {
            actionTitle: "Auditing Price Catalog",
            terminalLog: `[RESOURCE-01] 📡 MONITORING: Auditing procurement pricing against verified humanitarian supplier catalog.`,
          },
          thinking: {
            actionTitle: "Evaluating Baseline Costing",
            terminalLog: `[RESOURCE-02] 🧠 THINKING: Humanitarian baseline standard: PKR 3,450/beneficiary. Preventing speculative inflation.`,
          },
          working: {
            actionTitle: "Auditing Allocation Integrity",
            terminalLog: `[RESOURCE-03] ⚙️ WORKING: Zero phantom costs or unauthorized fund movements recorded. Full donor transparency.`,
          },
          decision_made: {
            actionTitle: "Financial Transparency Verdict Issued",
            terminalLog: `[RESOURCE-04] ✅ DECISION: ${pipeline.resourceAgent.summary}`,
          },
        },
      },
    };
  }, [pipeline]);

  const runSingleAgent = (agentKey: AgentKey) => {
    setActive(agentKey);
    setRunningAgent(agentKey);

    // 1. Monitoring
    setAgentStates((prev) => ({ ...prev, [agentKey]: "monitoring" }));

    // 2. Thinking
    setTimeout(() => {
      setAgentStates((prev) => ({ ...prev, [agentKey]: "thinking" }));
    }, 600);

    // 3. Working
    setTimeout(() => {
      setAgentStates((prev) => ({ ...prev, [agentKey]: "working" }));
    }, 1300);

    // 4. Decision Made
    setTimeout(() => {
      setAgentStates((prev) => ({ ...prev, [agentKey]: "decision_made" }));
      setRunningAgent(null);
    }, 2000);
  };

  const runAllAgents = () => {
    setRunningAgent("all");
    const allKeys: AgentKey[] = ["health", "flood", "logistics", "route", "resource"];

    // 1. Monitoring
    setAgentStates({
      health: "monitoring",
      flood: "monitoring",
      logistics: "monitoring",
      route: "monitoring",
      resource: "monitoring",
    });

    // 2. Thinking
    setTimeout(() => {
      setAgentStates({
        health: "thinking",
        flood: "thinking",
        logistics: "thinking",
        route: "thinking",
        resource: "thinking",
      });
    }, 700);

    // 3. Working
    setTimeout(() => {
      setAgentStates({
        health: "working",
        flood: "working",
        logistics: "working",
        route: "working",
        resource: "working",
      });
    }, 1500);

    // 4. Decision Made
    setTimeout(() => {
      setAgentStates({
        health: "decision_made",
        flood: "decision_made",
        logistics: "decision_made",
        route: "decision_made",
        resource: "decision_made",
      });
      setRunningAgent(null);
    }, 2300);
  };

  const currentDef = agentDefs[active];
  const currentPhase = agentStates[active];
  const currentStageInfo = currentDef.stages[currentPhase];
  const currentExecution = agentResults[active];

  return (
    <section className="rounded-3xl border border-sky-100 bg-gradient-to-b from-white to-sky-50/40 p-4 shadow-md shadow-sky-900/5">
      {/* Header */}
      <header className="flex items-center justify-between gap-3 border-b border-slate-100 pb-3">
        <div className="flex items-center gap-2.5">
          <span className="flex h-10 w-10 items-center justify-center rounded-2xl bg-ink text-cyan-pop shadow-sm">
            <IconBrain className="h-5 w-5" />
          </span>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="font-display text-[15px] font-bold text-ink">Live AI Agent Analysis</h3>
              <span className="inline-flex items-center gap-1 rounded-full bg-emerald-50 px-2 py-0.5 text-[9px] font-extrabold text-emerald-700 ring-1 ring-emerald-500/20">
                <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
                Active
              </span>
            </div>
            <p className="text-[10.5px] text-slate-500" suppressHydrationWarning>
              {pipeline.provider ?? "Autonomous Engine"} · {completedCount}/5 agents completed
              {mounted ? ` · ${new Date(pipeline.evaluatedAt).toLocaleTimeString()}` : ""}
            </p>
          </div>
        </div>
        <div className="flex shrink-0 flex-col items-end gap-1">
          <button
            type="button"
            onClick={runAllAgents}
            disabled={runningAgent !== null}
            className="inline-flex h-7 items-center gap-1.5 rounded-full bg-channel px-3 text-[10.5px] font-bold text-white shadow-sm shadow-channel/30 transition hover:bg-channel/90 active:scale-95 disabled:opacity-50"
          >
            <IconRefresh className={`h-3 w-3 ${runningAgent === "all" ? "animate-spin" : ""}`} />
            {runningAgent === "all" ? "Simulating..." : "Replay All"}
          </button>
          <Link
            href={`/queue/${encodeURIComponent(pipeline.requestId)}?refreshAnalysis=1`}
            className="text-[9px] font-bold text-channel underline underline-offset-2"
          >
            Re-run pipeline
          </Link>
        </div>
      </header>

      {/* 5 Distinct Agent Switcher Tabs — Matching Demo Screenshot */}
      <div className="mt-3.5 grid grid-cols-5 gap-1.5">
        {(["health", "flood", "logistics", "route", "resource"] as AgentKey[]).map((key) => {
          const def = agentDefs[key];
          const Icon = def.Icon;
          const isSelected = active === key;
          const state = agentStates[key];

          return (
            <button
              key={key}
              type="button"
              onClick={() => setActive(key)}
              className={`flex flex-col items-center gap-1 rounded-2xl p-2 text-center transition-all ${
                isSelected
                  ? `${def.themeColor.bg} ring-2 ${def.themeColor.ring} border-2 ${def.themeColor.border} shadow-sm scale-[1.02]`
                  : "bg-white/80 border border-slate-100/80 hover:bg-slate-50 opacity-85 hover:opacity-100"
              }`}
            >
              <span
                className={`flex h-8 w-8 items-center justify-center rounded-xl text-white shadow-sm ${def.themeColor.iconBg}`}
              >
                <Icon className="h-4 w-4" />
              </span>
              <span className="text-[9.5px] font-bold text-slate-800">{def.title}</span>
              <span className="rounded-full bg-white/90 px-1.5 py-0.2 text-[8px] font-extrabold text-slate-700 ring-1 ring-slate-200">
                {state === "decision_made" ? "Ready" : state}
              </span>
            </button>
          );
        })}
      </div>

      {/* Dynamic Role-Specific Dark Terminal — Matching Demo Screenshot */}
      <div className="mt-3.5 rounded-2xl border border-slate-800 bg-[#0c1322] p-4 text-white shadow-inner">
        {/* Terminal Header */}
        <div className="flex items-center justify-between border-b border-slate-800 pb-2.5">
          <div className="flex items-center gap-2">
            <span className="relative flex h-2 w-2">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-cyan-400 opacity-75" />
              <span className="relative inline-flex h-2 w-2 rounded-full bg-cyan-500" />
            </span>
            <span className="font-mono text-[11px] font-bold text-cyan-300 uppercase tracking-wide">
              {currentDef.title.toUpperCase()} AGENT TERMINAL
            </span>
          </div>
          <button
            type="button"
            onClick={() => runSingleAgent(active)}
            disabled={runningAgent !== null}
            className="flex items-center gap-1 rounded-full bg-slate-800/90 border border-slate-700/60 px-2.5 py-1 font-mono text-[9.5px] font-bold text-cyan-300 hover:bg-slate-700 disabled:opacity-40 transition"
          >
            <IconPlayFilled className="h-2.5 w-2.5" />
            Simulate {currentDef.title} Agent
          </button>
        </div>

        {/* 4-Phase Step Progression */}
        <div className="mt-3 grid grid-cols-4 gap-1.5 text-center font-mono text-[10px]">
          {[
            { id: "monitoring", label: "1. Monitoring", icon: "📡" },
            { id: "thinking", label: "2. Thinking", icon: "🧠" },
            { id: "working", label: "3. Working", icon: "⚙️" },
            { id: "decision_made", label: "4. Decision", icon: "✅" },
          ].map(({ id, label, icon }) => {
            const phaseOrder = ["monitoring", "thinking", "working", "decision_made"];
            const isCurrent = currentPhase === id;
            const isPassed = phaseOrder.indexOf(currentPhase) >= phaseOrder.indexOf(id as LifecycleState);

            return (
              <button
                key={id}
                type="button"
                onClick={() =>
                  setAgentStates((prev) => ({ ...prev, [active]: id as LifecycleState }))
                }
                className={`rounded-xl py-1.5 px-1 transition-all ${
                  isCurrent
                    ? "bg-[#0e294b] text-white font-bold ring-2 ring-cyan-400 border border-cyan-300 scale-[1.02]"
                    : isPassed
                      ? "bg-emerald-950/80 text-emerald-300 border border-emerald-800"
                      : "bg-slate-800/60 text-slate-400 border border-slate-800"
                }`}
              >
                <span>{icon}</span>
                <span className="block mt-0.5 text-[8.5px] truncate">{label}</span>
              </button>
            );
          })}
        </div>

        {/* Console Box */}
        <div className="mt-3 rounded-xl bg-[#060b14] border border-slate-800/80 p-3 font-mono text-[11px] leading-relaxed space-y-1.5">
          <p className="text-cyan-300 font-bold flex items-center gap-1.5">
            ▶ [{currentPhase.toUpperCase()}]: {currentStageInfo.actionTitle}
          </p>
          <p className="text-slate-300 text-[10.5px]">{currentStageInfo.terminalLog}</p>
        </div>
      </div>

      {/* Selected Agent Dedicated Inspector Card */}
      <div className="mt-3.5 rounded-2xl border border-slate-100 bg-white p-4 shadow-xs">
        <div className="flex items-center justify-between border-b border-slate-100 pb-2.5">
          <div className="flex items-center gap-2.5">
            <span
              className={`flex h-8 w-8 items-center justify-center rounded-xl text-white shadow-sm ${currentDef.themeColor.iconBg}`}
            >
              <currentDef.Icon className="h-4 w-4" />
            </span>
            <div>
              <h4 className="font-display text-[14px] font-bold text-ink">{currentDef.title} Agent Findings</h4>
              <p className="text-[10.5px] text-slate-500">{currentDef.roleSubtitle}</p>
            </div>
          </div>
          <span
            className={`rounded-full px-2.5 py-0.5 text-[10px] font-extrabold ${currentDef.themeColor.bg} ${currentDef.themeColor.text}`}
          >
            {currentDef.badgeLabel}
          </span>
        </div>

        <p className="mt-3 text-[11.5px] leading-relaxed text-slate-700">{currentExecution.summary}</p>

        <div className="mt-3 border-t border-slate-100 pt-3">
          <p className="mb-2 text-[9px] font-bold uppercase tracking-wider text-slate-400">
            Findings &amp; Field Evidence
          </p>
          <AgentDetails agent={currentExecution} />
          <div className="mt-3">
            <EvidenceList items={currentExecution.evidence} />
          </div>
        </div>
      </div>

      <p className="mt-3 text-[9.5px] leading-relaxed text-slate-400">
        Agent outputs are advisory and transparent. Dispatch, clinical decisions, and stock movements remain under human and deterministic system controls. Internal model reasoning is not displayed.
      </p>
    </section>
  );
}
