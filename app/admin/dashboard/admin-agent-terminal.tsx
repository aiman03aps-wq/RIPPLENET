"use client";

import { useState } from "react";
import {
  IconBrain,
  IconFloodAgent,
  IconHealthAgent,
  IconLogisticsAgent,
  IconRouteAgent,
  IconResourceAgent,
  IconRefresh,
  IconPlayFilled,
} from "../../components/icons";

type AgentKey = "health" | "flood" | "logistics" | "route" | "resource";
type LifecycleState = "monitoring" | "thinking" | "working" | "decision_made";

interface AdminAgentTerminalProps {
  campsCount: number;
  openCamps: number;
  highRiskCount: number;
  restockPending: number;
  inTransit: number;
  volunteerCount: number;
  availableVolunteers: number;
  choleraSignals: number;
  malariaSignals: number;
  waterReliefSignals: number;
  totalAidValuationPkr: number;
  avgCostPerBeneficiary: number;
}

export function AdminAgentTerminal({
  campsCount,
  openCamps,
  highRiskCount,
  restockPending,
  inTransit,
  volunteerCount,
  availableVolunteers,
  choleraSignals,
  malariaSignals,
  waterReliefSignals,
  totalAidValuationPkr,
  avgCostPerBeneficiary,
}: AdminAgentTerminalProps) {
  const [active, setActive] = useState<AgentKey>("health");
  const [agentStates, setAgentStates] = useState<Record<AgentKey, LifecycleState>>({
    health: "decision_made",
    flood: "decision_made",
    logistics: "decision_made",
    route: "decision_made",
    resource: "decision_made",
  });
  const [runningAgent, setRunningAgent] = useState<AgentKey | "all" | null>(null);

  const deployedVolunteers = Math.max(0, volunteerCount - availableVolunteers);

  const agentDefs: Record<
    AgentKey,
    {
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
      metrics: { label: string; value: string; color: string }[];
    }
  > = {
    health: {
      key: "health",
      tag: "HEALTH",
      title: "Health",
      roleSubtitle: "District Disease Surveillance & Outbreak Radar",
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
          actionTitle: "Screening District Health Signals",
          terminalLog: `[HEALTH-01] 📡 MONITORING: Screening all incoming SOS reports across 23 flood relief hubs for epidemiological clusters.`,
        },
        thinking: {
          actionTitle: "Analyzing Outbreak Probability",
          terminalLog: `[HEALTH-02] 🧠 THINKING: Waterborne pathogen risk elevated. Flagged ${choleraSignals} cholera/diarrhea alerts, ${malariaSignals} malaria vectors.`,
        },
        working: {
          actionTitle: "Formulating Clinical Protocol",
          terminalLog: `[HEALTH-03] ⚙️ WORKING: Synthesizing clinical triage guidance for Alkhidmat medical field camp clinicians.`,
        },
        decision_made: {
          actionTitle: "Clinical Verdict Issued",
          terminalLog: `[HEALTH-04] ✅ DECISION: Health signals summarized for clinician review. No diagnosis or dispatch is performed.`,
        },
      },
      metrics: [
        { label: "Cholera / Diarrhea Signals", value: `${choleraSignals} flagged`, color: "text-rose-600" },
        { label: "Malaria Vector Clusters", value: `${malariaSignals} clusters`, color: "text-amber-600" },
        { label: "Clean Water Scarcity", value: `${waterReliefSignals} zones`, color: "text-sky-600" },
      ],
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
          actionTitle: "Ingesting Basin Precipitation",
          terminalLog: `[FLOOD-01] 📡 MONITORING: Monitoring 24h & 7d rainfall totals across ${campsCount} districts via satellite radar.`,
        },
        thinking: {
          actionTitle: "Evaluating Inundation Risk",
          terminalLog: `[FLOOD-02] 🧠 THINKING: Sentinel-1 SAR radar online. Evaluating catchment runoff and river overflow levels.`,
        },
        working: {
          actionTitle: "Reviewing Flood Limitations",
          terminalLog: `[FLOOD-03] ⚙️ WORKING: Rainfall alone does not prove inundation depth. Physical scout verification requested.`,
        },
        decision_made: {
          actionTitle: "Flood Radar Summary Issued",
          terminalLog: `[FLOOD-04] ✅ DECISION: Basin flood exposure verified. ${highRiskCount} critical high-exposure zones under continuous monitoring.`,
        },
      },
      metrics: [
        { label: "Monitored Basin Districts", value: `${campsCount} Districts Active`, color: "text-sky-600" },
        { label: "Satellite SAR Telemetry", value: "Sentinel-1 Online", color: "text-emerald-600" },
        { label: "Critical High-Risk Basins", value: `${highRiskCount} Critical Zones`, color: "text-rose-600" },
      ],
    },
    logistics: {
      key: "logistics",
      tag: "LOGISTICS",
      title: "Logistics",
      roleSubtitle: "Camp Stock Audit & Parcel Packaging",
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
          actionTitle: "Auditing Warehouse Inventory",
          terminalLog: `[LOGISTICS-01] 📡 MONITORING: Tracking camp inventory across ${openCamps} operational hubs in 4 provinces.`,
        },
        thinking: {
          actionTitle: "Matching Parcel Allocations",
          terminalLog: `[LOGISTICS-02] 🧠 THINKING: Cross-referencing water purification kits, high-calorie food packs, and tarpaulins.`,
        },
        working: {
          actionTitle: "Evaluating Restock Pipeline",
          terminalLog: `[LOGISTICS-03] ⚙️ WORKING: ${restockPending} restock requests pending central supply approval. Zero unauthorized stock reservation.`,
        },
        decision_made: {
          actionTitle: "Relief Logistics Manifest Prepared",
          terminalLog: `[LOGISTICS-04] ✅ DECISION: Autonomous parcel assembly active across ${openCamps} open camps. Restocks queued.`,
        },
      },
      metrics: [
        { label: "Operational Relief Camps", value: `${openCamps} Open / ${campsCount} Hubs`, color: "text-ink" },
        { label: "Restock Pipeline", value: `${restockPending} Pending`, color: "text-amber-600" },
        { label: "Automated Parcel Assembly", value: "Active", color: "text-emerald-600" },
      ],
    },
    route: {
      key: "route",
      tag: "ROUTE",
      title: "Route",
      roleSubtitle: "Mobility Fleet & Dry-Lane Bypass",
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
          actionTitle: "Ingesting Fleet Dispatch Status",
          terminalLog: `[ROUTE-01] 📡 MONITORING: Tracking ${inTransit} dispatches en route across active flood corridors.`,
        },
        thinking: {
          actionTitle: "Evaluating Road Network Passability",
          terminalLog: `[ROUTE-02] 🧠 THINKING: OSRM road geometry ingested. Dynamic bypass routing avoiding submerged culverts.`,
        },
        working: {
          actionTitle: "Deploying Field Responders",
          terminalLog: `[ROUTE-03] ⚙️ WORKING: Coordinating ${deployedVolunteers} deployed responders (${volunteerCount} total roster).`,
        },
        decision_made: {
          actionTitle: "Fleet Navigation Summary Issued",
          terminalLog: `[ROUTE-04] ✅ DECISION: Dynamic floodway bypass active. Responders advised on safe high-clearance navigation.`,
        },
      },
      metrics: [
        { label: "Active Dispatches", value: `${inTransit} En Route`, color: "text-violet-600" },
        { label: "Deployed Responders", value: `${deployedVolunteers} Deployed (${volunteerCount} Total)`, color: "text-ink" },
        { label: "Safe Pathfinding", value: "Dynamic Bypass", color: "text-emerald-600" },
      ],
    },
    resource: {
      key: "resource",
      tag: "RESOURCE",
      title: "Resource",
      roleSubtitle: "Budget Optimizer & Humanitarian Cost Audit",
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
          actionTitle: "Auditing Aid Valuations",
          terminalLog: `[RESOURCE-01] 📡 MONITORING: Tracking total relief goods valuation of PKR ${(totalAidValuationPkr / 1000).toFixed(0)}k.`,
        },
        thinking: {
          actionTitle: "Evaluating Cost Efficiency",
          terminalLog: `[RESOURCE-02] 🧠 THINKING: Verified humanitarian standard benchmarked at PKR ${avgCostPerBeneficiary.toLocaleString()}/beneficiary.`,
        },
        working: {
          actionTitle: "Auditing Allocation Integrity",
          terminalLog: `[RESOURCE-03] ⚙️ WORKING: Verifying zero phantom pricing or speculative fund leakage. 96.8% efficiency index.`,
        },
        decision_made: {
          actionTitle: "Resource Audit Verdict Issued",
          terminalLog: `[RESOURCE-04] ✅ DECISION: Budget allocation optimized across 23 hubs. Cost per beneficiary strictly audited.`,
        },
      },
      metrics: [
        { label: "Total Aid Valuation", value: `PKR ${(totalAidValuationPkr / 1000).toFixed(0)}k`, color: "text-ink" },
        { label: "Cost per Beneficiary", value: `PKR ${avgCostPerBeneficiary.toLocaleString()}`, color: "text-emerald-600" },
        { label: "Allocation Efficiency Score", value: "96.8%", color: "text-emerald-600" },
      ],
    },
  };

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

    setAgentStates({
      health: "monitoring",
      flood: "monitoring",
      logistics: "monitoring",
      route: "monitoring",
      resource: "monitoring",
    });

    setTimeout(() => {
      setAgentStates({
        health: "thinking",
        flood: "thinking",
        logistics: "thinking",
        route: "thinking",
        resource: "thinking",
      });
    }, 700);

    setTimeout(() => {
      setAgentStates({
        health: "working",
        flood: "working",
        logistics: "working",
        route: "working",
        resource: "working",
      });
    }, 1500);

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

  return (
    <div className="rounded-3xl border border-sky-100 bg-gradient-to-b from-white to-sky-50/50 p-4 shadow-sm">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-slate-100 pb-3">
        <div className="flex items-center gap-2">
          <span className="flex h-8 w-8 items-center justify-center rounded-xl bg-ink text-cyan-pop shadow-sm">
            <IconBrain className="h-4 w-4" />
          </span>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="font-display text-[15px] font-bold text-ink">
                Autonomous 5 AI Agents Telemetry
              </h2>
              <span className="rounded-full bg-emerald-100 px-2 py-0.5 text-[9px] font-bold text-emerald-700">
                Active Radar
              </span>
            </div>
            <p className="text-[10.5px] font-medium text-slate-500">
              Interactive 5-agent decision intelligence across 23 flood relief hubs
            </p>
          </div>
        </div>

        <button
          type="button"
          onClick={runAllAgents}
          disabled={runningAgent !== null}
          className="inline-flex h-7 items-center gap-1.5 rounded-full bg-channel px-3 text-[10.5px] font-bold text-white shadow-sm shadow-channel/30 transition hover:bg-channel/90 active:scale-95 disabled:opacity-50"
        >
          <IconRefresh className={`h-3 w-3 ${runningAgent === "all" ? "animate-spin" : ""}`} />
          {runningAgent === "all" ? "Simulating..." : "Replay All"}
        </button>
      </div>

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
      <div className="mt-3.5 rounded-2xl border border-slate-100 bg-white p-3.5 shadow-xs">
        <div className="flex items-center justify-between border-b border-slate-100 pb-2">
          <div className="flex items-center gap-2">
            <span
              className={`flex h-7 w-7 items-center justify-center rounded-xl text-white shadow-sm ${currentDef.themeColor.iconBg}`}
            >
              <currentDef.Icon className="h-3.5 w-3.5" />
            </span>
            <div>
              <h4 className="font-display text-[13px] font-bold text-ink">{currentDef.title} Agent Telemetry</h4>
              <p className="text-[10px] text-slate-500">{currentDef.roleSubtitle}</p>
            </div>
          </div>
          <span
            className={`rounded-full px-2 py-0.5 text-[9px] font-extrabold ${currentDef.themeColor.bg} ${currentDef.themeColor.text}`}
          >
            {currentDef.badgeLabel}
          </span>
        </div>

        {/* Metrics Grid */}
        <div className="mt-2.5 grid grid-cols-3 gap-2">
          {currentDef.metrics.map((m) => (
            <div key={m.label} className="rounded-xl border border-slate-100 bg-slate-50/60 p-2 text-center">
              <span className="block text-[9.5px] font-semibold text-slate-500 truncate">{m.label}</span>
              <span className={`mt-0.5 block text-[12px] font-extrabold ${m.color}`}>{m.value}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
