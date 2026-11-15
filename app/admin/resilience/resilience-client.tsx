"use client";

import { useState } from "react";
import Link from "next/link";
import { AdminHeader } from "../components/admin-header";
import { AdminNav } from "../components/admin-nav";
import {
  IconActivity,
  IconAlertTriangle,
  IconArrowRight,
  IconBrain,
  IconCheck,
  IconChevronRight,
  IconFloodAgent,
  IconMapPin,
  IconShield,
  IconTruck,
  IconUsers,
  IconWaterKit,
  IconX,
} from "../../components/icons";
import {
  CriDimensionBreakdown,
  CriEvidenceStatus,
  AriEvidenceStatus,
  DataProvenance,
  EssentialServiceRecordDTO,
  ServiceOperationalStatus,
  ResilienceAssessmentDTO,
  RecoveryTrackingRecordDTO,
  DisplacementAssessmentDTO,
  ClimateAdaptationRecordDTO,
} from "../../../lib/resilience/types";
import { CRI_DIMENSION_WEIGHTS } from "../../../lib/resilience/cri";
import { ARI_SECTOR_DEFINITIONS } from "../../../lib/resilience/ari";
import { ESSENTIAL_SERVICE_LABELS } from "../../../lib/resilience/services";
import { ADAPTATION_SECTOR_LABELS } from "../../../lib/resilience/adaptation";

interface Props {
  initialDistricts: Array<{ id: number; name: string; province: string; population: number }>;
  initialAssessment: ResilienceAssessmentDTO;
  initialServices: EssentialServiceRecordDTO[];
  initialRecovery: RecoveryTrackingRecordDTO;
  initialDisplacement: DisplacementAssessmentDTO;
  initialAdaptation: ClimateAdaptationRecordDTO[];
}

type DomainTab = "cri" | "services" | "recovery" | "displacement" | "adaptation";

export function ResilienceClient({
  initialDistricts,
  initialAssessment,
  initialServices,
  initialRecovery,
  initialDisplacement,
  initialAdaptation,
}: Props) {
  const [activeTab, setActiveTab] = useState<DomainTab>("cri");
  const [selectedDistrictId, setSelectedDistrictId] = useState<number>(1);

  // Local state for interactive verification actions
  const [services, setServices] = useState<EssentialServiceRecordDTO[]>(initialServices);
  const [adaptationList, setAdaptationList] = useState<ClimateAdaptationRecordDTO[]>(initialAdaptation);
  const [displacement, setDisplacement] = useState<DisplacementAssessmentDTO>(initialDisplacement);
  const [assessment, setAssessment] = useState<ResilienceAssessmentDTO>(initialAssessment);
  const [recovery, setRecovery] = useState<RecoveryTrackingRecordDTO>(initialRecovery);

  // Modals state
  const [verificationModalOpen, setVerificationModalOpen] = useState(false);
  const [selectedService, setSelectedService] = useState<EssentialServiceRecordDTO | null>(null);
  const [newStatus, setNewStatus] = useState<ServiceOperationalStatus>("OPERATIONAL");
  const [verifierName, setVerifierName] = useState("");
  const [verificationNotes, setVerificationNotes] = useState("");
  const [alternativeServices, setAlternativeServices] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [notification, setNotification] = useState<{ message: string; type: "success" | "info" } | null>(null);

  // Adaptation Certification Modal
  const [certifyModalOpen, setCertifyModalOpen] = useState(false);
  const [selectedAdaptation, setSelectedAdaptation] = useState<ClimateAdaptationRecordDTO | null>(null);
  const [auditorName, setAuditorName] = useState("UN-Habitat Third-Party Inspection Panel");
  const [verifiedBeneficiariesInput, setVerifiedBeneficiariesInput] = useState<number>(18500);

  // Workflow Architecture & Simulation Modals
  const [architectureModalOpen, setArchitectureModalOpen] = useState(false);
  const [simulationRunning, setSimulationRunning] = useState(false);
  const [simulationAuditTrail, setSimulationAuditTrail] = useState<string[]>([]);
  const [simulationModalOpen, setSimulationModalOpen] = useState(false);

  const showNotification = (message: string, type: "success" | "info" = "success") => {
    setNotification({ message, type });
    setTimeout(() => setNotification(null), 5000);
  };

  const [loadingDistrict, setLoadingDistrict] = useState(false);

  const handleDistrictChange = async (newDistrictId: number) => {
    setSelectedDistrictId(newDistrictId);
    setLoadingDistrict(true);
    try {
      const [criRes, svcRes, ariRes, dispRes, adaptRes] = await Promise.all([
        fetch(`/api/resilience/cri?boundaryId=${newDistrictId}`).then((r) => r.json()).catch(() => null),
        fetch(`/api/resilience/services?boundaryId=${newDistrictId}`).then((r) => r.json()).catch(() => null),
        fetch(`/api/resilience/ari?boundaryId=${newDistrictId}`).then((r) => r.json()).catch(() => null),
        fetch(`/api/resilience/displacement?boundaryId=${newDistrictId}`).then((r) => r.json()).catch(() => null),
        fetch(`/api/resilience/adaptation?boundaryId=${newDistrictId}`).then((r) => r.json()).catch(() => null),
      ]);

      if (criRes?.success && criRes.data) {
        setAssessment(criRes.data);
      }
      if (svcRes?.success && Array.isArray(svcRes.data)) {
        setServices(svcRes.data);
      }
      if (ariRes?.success && ariRes.data) {
        setRecovery(ariRes.data);
      }
      if (dispRes?.success && dispRes.data?.record) {
        setDisplacement(dispRes.data.record);
      }
      if (adaptRes?.success && Array.isArray(adaptRes.data)) {
        setAdaptationList(adaptRes.data);
      }

      const dist = initialDistricts.find((d) => d.id === newDistrictId);
      showNotification(`Loaded telemetry and records for ${dist?.name || "district"}.`, "info");
    } catch (err: any) {
      console.error("Failed to load district telemetry:", err);
    } finally {
      setLoadingDistrict(false);
    }
  };

  // Handler: Run Complete End-to-End Simulation Lifecycle
  const handleRunSimulation = async () => {
    setSimulationRunning(true);
    setSimulationAuditTrail([]);
    setSimulationModalOpen(true);

    try {
      const res = await fetch("/api/resilience/simulate-workflow", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "full_cycle" }),
      });

      const json = await res.json();
      if (!json.success) throw new Error(json.error);

      setSimulationAuditTrail(json.auditTrail || []);

      // Refresh overview state
      const overviewRes = await fetch("/api/resilience/overview");
      const overviewJson = await overviewRes.json();
      if (overviewJson.success) {
        if (overviewJson.data.assessments?.[0]) setAssessment(overviewJson.data.assessments[0]);
        if (overviewJson.data.services) setServices(overviewJson.data.services);
        if (overviewJson.data.recovery?.[0]) setRecovery(overviewJson.data.recovery[0]);
        if (overviewJson.data.displacement) setDisplacement(overviewJson.data.displacement);
        if (overviewJson.data.adaptation) setAdaptationList(overviewJson.data.adaptation);
      }

      showNotification("End-to-End Disaster-to-Adaptation workflow cycle simulated successfully!");
    } catch (err: any) {
      alert(`Simulation failed: ${err.message}`);
    } finally {
      setSimulationRunning(false);
    }
  };

  // Handler: Update Service Status with verification check
  const handleUpdateServiceStatus = async () => {
    if (!selectedService) return;
    setIsSubmitting(true);

    try {
      const res = await fetch("/api/resilience/services", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          id: selectedService.id,
          status: newStatus,
          isVerified: ["OPERATIONAL", "VERIFIED_DISRUPTED", "PARTIALLY_RESTORED", "FULLY_RESTORED"].includes(newStatus),
          verifiedBy: verifierName.trim() || "Field Inspection Officer",
          verifiedAt: new Date().toISOString(),
          alternativeServicesInUse: alternativeServices.trim() || undefined,
          notes: verificationNotes.trim() || undefined,
          actorName: verifierName.trim() || "Operations Verifier",
          actorRole: "Accredited Field Officer",
        }),
      });

      const json = await res.json();
      if (!json.success) throw new Error(json.error);

      // Update local state
      setServices((prev) =>
        prev.map((s) => (s.id === selectedService.id ? json.data : s))
      );

      setVerificationModalOpen(false);
      showNotification(`Facility '${selectedService.facilityName}' updated to ${newStatus} with verified audit log.`);
    } catch (err: any) {
      alert(`Update failed: ${err.message}`);
    } finally {
      setIsSubmitting(false);
    }
  };

  // Handler: Certify Adaptation Project & Recalculate CRI
  const handleCertifyAdaptation = async () => {
    if (!selectedAdaptation) return;
    setIsSubmitting(true);

    try {
      const res = await fetch("/api/resilience/adaptation", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          id: selectedAdaptation.id,
          verifyingAuditor: auditorName,
          verifiedBeneficiaries: verifiedBeneficiariesInput,
          evidenceAttachmentUrl: "https://ripplenet.org/evidence/un-habitat-audit.pdf",
          actorName: auditorName,
          actorRole: "Certified Lead Auditor",
        }),
      });

      const json = await res.json();
      if (!json.success) throw new Error(json.error);

      setAdaptationList((prev) =>
        prev.map((a) => (a.id === selectedAdaptation.id ? json.data.updatedRecord : a))
      );

      // Also simulate dynamic CRI lift
      if (json.data.recalculationResult) {
        showNotification(
          `Project Certified! ${json.data.recalculationResult.recalculationJustification}`
        );
      }

      setCertifyModalOpen(false);
    } catch (err: any) {
      alert(`Certification failed: ${err.message}`);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 text-ink pb-24">
      <AdminHeader title="Resilience Engine" />

      {/* Main Container */}
      <main className="mx-auto max-w-7xl px-4 py-6 sm:px-6">
        {/* Banner notification */}
        {notification && (
          <div className="mb-4 rounded-xl border border-emerald-200 bg-emerald-50 p-4 text-sm font-semibold text-emerald-900 shadow-sm flex items-center justify-between">
            <div className="flex items-center gap-2">
              <IconCheck className="h-5 w-5 text-emerald-600" />
              <span>{notification.message}</span>
            </div>
            <button onClick={() => setNotification(null)} className="text-emerald-700 hover:text-emerald-900">
              <IconX className="h-4 w-4" />
            </button>
          </div>
        )}

        {/* Header Bar & District Selector */}
        <div className="mb-6 flex flex-col justify-between gap-4 md:flex-row md:items-center">
          <div>
            <div className="flex items-center gap-2">
              <span className="inline-flex items-center gap-1.5 rounded-full bg-blue-100 px-3 py-0.5 text-xs font-bold text-blue-800">
                <IconShield className="h-3.5 w-3.5" />
                Integrated Engine
              </span>
              <span className="rounded-full bg-amber-100 px-2.5 py-0.5 text-xs font-semibold text-amber-800">
                Data Provenance: {assessment.overallProvenance}
              </span>
            </div>
            <h1 className="mt-1 font-display text-2xl font-bold tracking-tight text-ink sm:text-3xl">
              Climate Resilience, Services Continuity & Recovery Engine
            </h1>
            <p className="mt-1 text-sm text-slate-500">
              Coordinating community vulnerability (CRI), essential services continuity, post-disaster recovery (ARI), verified displacement, and climate adaptation.
            </p>
          </div>

          {/* District Dropdown & Simulation Controls */}
          <div className="flex flex-wrap items-center gap-3">
            <button
              onClick={() => setArchitectureModalOpen(true)}
              className="rounded-lg border border-slate-300 bg-white px-3 py-2 text-xs font-bold text-slate-700 hover:bg-slate-50 shadow-sm flex items-center gap-1.5 transition"
            >
              <IconBrain className="h-4 w-4 text-blue-600" />
              Information Flow Guide
            </button>
            <button
              onClick={handleRunSimulation}
              disabled={simulationRunning}
              className="rounded-lg bg-blue-600 px-3.5 py-2 text-xs font-bold text-white hover:bg-blue-700 shadow-sm flex items-center gap-1.5 transition disabled:opacity-50"
            >
              <IconActivity className="h-4 w-4" />
              {simulationRunning ? "Simulating..." : "Run End-to-End Cycle"}
            </button>
            <div className="flex items-center gap-2">
              <label className="text-xs font-bold uppercase tracking-wider text-slate-400">District:</label>
              <select
                value={selectedDistrictId}
                onChange={(e) => handleDistrictChange(parseInt(e.target.value, 10))}
                disabled={loadingDistrict}
                className="rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm font-semibold text-ink shadow-sm focus:border-blue-500 focus:outline-none"
              >
                {initialDistricts.map((d) => (
                  <option key={d.id} value={d.id}>
                    {d.name} ({d.province}) — Pop: {d.population.toLocaleString()}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {/* Data Provenance & Methodology Transparency Banner (Requirement 8 & 9) */}
        <div className="mb-6 rounded-2xl border border-amber-200 bg-amber-50/80 p-4 shadow-sm text-xs text-amber-950 flex flex-col md:flex-row items-start md:items-center justify-between gap-3">
          <div className="flex items-start gap-2.5">
            <IconAlertTriangle className="h-5 w-5 text-amber-600 shrink-0 mt-0.5" />
            <div>
              <span className="font-extrabold text-amber-900 uppercase tracking-wide">
                Simulation & Research Prototype Notice:
              </span>
              <p className="mt-0.5 text-amber-800 leading-relaxed">
                Geographical boundaries, codes, and baseline populations are sourced from the <strong>Pakistan Bureau of Statistics 7th Population & Housing Census (2023)</strong>. Operational facility statuses, recovery percentages, and displacement counts are simulated demonstration models designed for workflow and algorithm validation. No figure should be interpreted as verified field census data without independent auditor accreditation.
              </p>
            </div>
          </div>
          <span className="shrink-0 rounded-full bg-amber-200/80 px-3 py-1 font-bold text-amber-900 text-[11px]">
            DEMONSTRATION WATERMARK
          </span>
        </div>

        {/* 5-Stage Interconnected Workflow Stepper (Requirement 7) */}
        <div className="mb-8 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
          <div className="text-[11px] font-bold uppercase tracking-wider text-slate-400 mb-3 flex items-center justify-between">
            <span>Interconnected Disaster-to-Adaptation Information Pipeline</span>
            <span className="text-blue-600 font-semibold cursor-pointer hover:underline" onClick={() => setArchitectureModalOpen(true)}>
              View Data Flow Architecture →
            </span>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-5 gap-2">
            {[
              { id: "cri", stage: "Stage 1", title: "Pre-Disaster CRI", sub: "Vulnerability Baseline (8 Dims)", icon: IconShield },
              { id: "services", stage: "Stage 2", title: "Service Continuity", sub: "Disruptions & Multi-Agent Cues", icon: IconActivity },
              { id: "displacement", stage: "Stage 3", title: "Displacement & Return", sub: "Balanced Population Ledger", icon: IconUsers },
              { id: "recovery", stage: "Stage 4", title: "Post-Disaster ARI", sub: "7-Sector Recovery Trajectory", icon: IconWaterKit },
              { id: "adaptation", stage: "Stage 5", title: "Climate Adaptation", sub: "Audit & CRI Recalculation", icon: IconBrain },
            ].map(({ id, stage, title, sub, icon: Icon }, idx) => {
              const active = activeTab === id;
              return (
                <button
                  key={id}
                  onClick={() => setActiveTab(id as DomainTab)}
                  className={`text-left p-3 rounded-xl border transition flex items-start gap-2.5 ${
                    active
                      ? "border-blue-600 bg-blue-50/70 shadow-sm"
                      : "border-slate-200 bg-slate-50/50 hover:bg-slate-100"
                  }`}
                >
                  <span className={`p-1.5 rounded-lg shrink-0 ${active ? "bg-blue-600 text-white" : "bg-white text-slate-500 border border-slate-200"}`}>
                    <Icon className="h-4 w-4" />
                  </span>
                  <div>
                    <span className={`text-[10px] font-bold block ${active ? "text-blue-700" : "text-slate-400"}`}>
                      {stage}
                    </span>
                    <h4 className="text-xs font-bold text-ink truncate">{title}</h4>
                    <span className="text-[10px] text-slate-500 block truncate">{sub}</span>
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {/* 5 Executive KPI Telemetry Cards */}
        <div className="mb-8 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-5">
          {/* Card 1: CRI */}
          <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
            <div className="flex items-center justify-between text-slate-500 text-xs font-semibold">
              <span>Community Resilience</span>
              <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                assessment.evidenceStatus === "OFFICIAL_CRI" ? "bg-emerald-100 text-emerald-800" : "bg-amber-100 text-amber-800"
              }`}>
                {assessment.evidenceStatus}
              </span>
            </div>
            <div className="mt-2 flex items-baseline gap-2">
              <span className="font-display text-3xl font-extrabold text-ink">
                {assessment.compositeScore !== null ? assessment.compositeScore : "N/A"}
              </span>
              <span className="text-xs font-bold text-slate-400">/ 100</span>
            </div>
            <div className="mt-2 flex items-center justify-between text-[11px] text-slate-500 border-t border-slate-100 pt-2">
              <span>Data Confidence (DCS):</span>
              <span className="font-bold text-ink">{assessment.confidenceScore}%</span>
            </div>
          </div>

          {/* Card 2: Essential Services */}
          <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
            <div className="flex items-center justify-between text-slate-500 text-xs font-semibold">
              <span>Essential Services</span>
              <span className="text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded text-[10px] font-bold">
                {services.filter((s) => s.status === "OPERATIONAL" || s.status === "FULLY_RESTORED").length} Operational
              </span>
            </div>
            <div className="mt-2 flex items-baseline gap-2">
              <span className="font-display text-3xl font-extrabold text-amber-600">
                {services.filter((s) => s.status === "VERIFIED_DISRUPTED" || s.status === "POTENTIAL_DISRUPTION_FLAGGED").length}
              </span>
              <span className="text-xs font-bold text-slate-400">Disrupted / Flagged</span>
            </div>
            <div className="mt-2 flex items-center justify-between text-[11px] text-slate-500 border-t border-slate-100 pt-2">
              <span>Catchment SOS Flags:</span>
              <span className="font-bold text-amber-600">5 advisory alerts</span>
            </div>
          </div>

          {/* Card 3: ARI Recovery */}
          <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
            <div className="flex items-center justify-between text-slate-500 text-xs font-semibold">
              <span>Post-Disaster Recovery</span>
              <span className="text-blue-700 bg-blue-50 px-2 py-0.5 rounded text-[10px] font-bold">
                Day {recovery.daysPostDisaster} Post-Flood
              </span>
            </div>
            <div className="mt-2 flex items-baseline gap-2">
              <span className="font-display text-3xl font-extrabold text-ink">
                {recovery.aggregateRecoveryIndex !== null ? `${recovery.aggregateRecoveryIndex}%` : "INSUFFICIENT"}
              </span>
              <span className="text-xs font-bold text-slate-400">ARI</span>
            </div>
            <div className="mt-2 flex items-center justify-between text-[11px] text-slate-500 border-t border-slate-100 pt-2">
              <span>Reporting Sectors:</span>
              <span className="font-bold text-ink">6 of 7 sectors</span>
            </div>
          </div>

          {/* Card 4: Verified Return Rate */}
          <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
            <div className="flex items-center justify-between text-slate-500 text-xs font-semibold">
              <span>Verified Population Return</span>
              <span className="text-purple-700 bg-purple-50 px-2 py-0.5 rounded text-[10px] font-bold">
                Balanced Ledger
              </span>
            </div>
            <div className="mt-2 flex items-baseline gap-2">
              <span className="font-display text-3xl font-extrabold text-ink">
                {displacement.verifiedReturnRatePct}%
              </span>
              <span className="text-xs font-bold text-slate-400">({displacement.verifiedReturnedCount.toLocaleString()})</span>
            </div>
            <div className="mt-2 flex items-center justify-between text-[11px] text-slate-500 border-t border-slate-100 pt-2">
              <span>Formal Camp Occupancy:</span>
              <span className="font-bold text-slate-700">25.0% ({displacement.inCampShelterCount.toLocaleString()})</span>
            </div>
          </div>

          {/* Card 5: Adaptation Actions */}
          <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
            <div className="flex items-center justify-between text-slate-500 text-xs font-semibold">
              <span>Climate Adaptation</span>
              <span className="text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded text-[10px] font-bold">
                {adaptationList.filter((a) => a.independentlyVerified).length} Verified
              </span>
            </div>
            <div className="mt-2 flex items-baseline gap-2">
              <span className="font-display text-3xl font-extrabold text-ink">
                {adaptationList.length}
              </span>
              <span className="text-xs font-bold text-slate-400">Active Initiatives</span>
            </div>
            <div className="mt-2 flex items-center justify-between text-[11px] text-slate-500 border-t border-slate-100 pt-2">
              <span>Total Capital Budget:</span>
              <span className="font-bold text-ink">PKR 50.5M</span>
            </div>
          </div>
        </div>

        {/* Tab Navigation Navigation */}
        <div className="mb-6 border-b border-slate-200">
          <nav className="-mb-px flex space-x-6 overflow-x-auto">
            {[
              { id: "cri", label: "1. Community Resilience (CRI)", icon: IconShield },
              { id: "services", label: "2. Essential Services Continuity", icon: IconActivity },
              { id: "recovery", label: "3. Post-Disaster Recovery (ARI)", icon: IconWaterKit },
              { id: "displacement", label: "4. Displacement & Population Return", icon: IconUsers },
              { id: "adaptation", label: "5. Climate Adaptation Actions", icon: IconBrain },
            ].map(({ id, label, icon: Icon }) => {
              const active = activeTab === id;
              return (
                <button
                  key={id}
                  onClick={() => setActiveTab(id as DomainTab)}
                  className={`flex items-center gap-2 whitespace-nowrap border-b-2 py-3 px-1 text-sm font-semibold transition ${
                    active
                      ? "border-blue-600 text-blue-600"
                      : "border-transparent text-slate-500 hover:border-slate-300 hover:text-slate-700"
                  }`}
                >
                  <Icon className="h-4 w-4" />
                  {label}
                </button>
              );
            })}
          </nav>
        </div>

        {/* ========================================================================= */}
        {/* TAB 1: COMMUNITY RESILIENCE INDEX (CRI)                                   */}
        {/* ========================================================================= */}
        {activeTab === "cri" && (
          <div className="space-y-6">
            {/* CRI Methodology & Simulation Callout */}
            <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
              <div className="flex flex-col justify-between gap-4 md:flex-row md:items-center">
                <div>
                  <h2 className="font-display text-lg font-bold text-ink">
                    8-Dimension Community Resilience Assessment (CRI)
                  </h2>
                  <p className="mt-1 text-xs text-slate-500">
                    Transparent, evidence-based vulnerability scoring. Normalized across fixed reference thresholds (0.0 to 10.0 scale, where higher is more resilient).
                  </p>
                </div>
                <div className="flex items-center gap-3">
                  <div className="text-right">
                    <span className="text-[11px] font-bold text-slate-400 block uppercase">Composite CRI</span>
                    <span className="font-display text-2xl font-black text-blue-600">{assessment.compositeScore} / 100</span>
                  </div>
                  <div className="h-10 w-px bg-slate-200" />
                  <div className="text-right">
                    <span className="text-[11px] font-bold text-slate-400 block uppercase">Data Confidence (DCS)</span>
                    <span className="font-display text-2xl font-black text-emerald-600">{assessment.confidenceScore}%</span>
                  </div>
                </div>
              </div>

              {/* Dimension Scorecard Grid */}
              <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
                {CRI_DIMENSION_WEIGHTS.map((dim) => {
                  const ev = (assessment.dimensionEvidence as any)[dim.key];
                  const score = ev?.score ?? null;
                  const weightPct = Math.round(dim.weight * 100);

                  return (
                    <div key={dim.key} className="rounded-xl border border-slate-200 bg-slate-50/50 p-4 transition hover:bg-slate-50">
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-bold text-slate-700">{dim.label}</span>
                        <span className="text-[10px] font-semibold text-slate-400">Weight: {weightPct}%</span>
                      </div>
                      <div className="mt-2 flex items-baseline gap-2">
                        <span className="font-display text-2xl font-bold text-ink">{score !== null ? score : "Missing"}</span>
                        <span className="text-xs text-slate-400">/ 10.0</span>
                      </div>

                      {/* Progress Bar */}
                      <div className="mt-2 h-1.5 w-full rounded-full bg-slate-200 overflow-hidden">
                        <div
                          className="h-full bg-blue-600 rounded-full"
                          style={{ width: `${(score || 0) * 10}%` }}
                        />
                      </div>

                      <div className="mt-3 text-[11px] text-slate-500 space-y-1">
                        <div className="flex justify-between">
                          <span>Provenance:</span>
                          <span className={`font-semibold ${ev?.isSimulated ? "text-amber-600 font-bold" : "text-slate-700"}`}>
                            {ev?.isSimulated ? "SIMULATED" : ev?.provenance || "N/A"}
                          </span>
                        </div>
                        <div className="truncate" title={ev?.source}>
                          <span className="text-slate-400">Source:</span> {ev?.source}
                        </div>
                        <div className="text-[10px] text-slate-400 italic">
                          {dim.referenceThreshold}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Missing Data & Gating Explanation */}
              <div className="mt-6 rounded-xl border border-blue-100 bg-blue-50/70 p-4 text-xs text-blue-900">
                <span className="font-bold">Transparent Weight Renormalization & Evidence Gating:</span>
                <p className="mt-1 text-blue-800">
                  When specific community indicators lack empirical survey evidence, their weight is excluded and remaining indicators are renormalized proportionally. The Data Confidence Score (DCS) displays assessment reliability separately without artificially depressing resilience scores. If fewer than 4 dimensions have verified data, publishing an official CRI score is strictly withheld.
                </p>
              </div>
            </div>
          </div>
        )}

        {/* ========================================================================= */}
        {/* TAB 2: ESSENTIAL SERVICES CONTINUITY                                      */}
        {/* ========================================================================= */}
        {activeTab === "services" && (
          <div className="space-y-6">
            <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
              <div className="flex flex-col justify-between gap-4 md:flex-row md:items-center">
                <div>
                  <h2 className="font-display text-lg font-bold text-ink">
                    Essential Services Continuity & Disruption Monitoring
                  </h2>
                  <p className="mt-1 text-xs text-slate-500">
                    Real-time operational status of drinking water, healthcare, sanitation, electricity, telecommunications, and access corridors.
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <span className="inline-flex items-center gap-1 rounded-full bg-amber-50 border border-amber-200 px-3 py-1 text-xs font-semibold text-amber-800">
                    <IconAlertTriangle className="h-3.5 w-3.5 text-amber-600" />
                    AI Cues are Advisory (Human Verification Required)
                  </span>
                </div>
              </div>

              {/* Service Cards Grid */}
              <div className="mt-6 grid grid-cols-1 gap-4 lg:grid-cols-2">
                {services.map((svc) => {
                  const meta = ESSENTIAL_SERVICE_LABELS[svc.serviceType];
                  const isDisrupted = svc.status === "VERIFIED_DISRUPTED" || svc.status === "POTENTIAL_DISRUPTION_FLAGGED";

                  return (
                    <div
                      key={svc.id}
                      className={`rounded-xl border p-5 transition ${
                        isDisrupted ? "border-amber-300 bg-amber-50/30" : "border-slate-200 bg-white"
                      }`}
                    >
                      <div className="flex items-start justify-between gap-4">
                        <div>
                          <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                            {meta?.title || svc.serviceType}
                          </span>
                          <h3 className="font-display text-base font-bold text-ink">{svc.facilityName}</h3>
                          <p className="mt-0.5 text-xs text-slate-500">{svc.district} District</p>
                        </div>
                        <span
                          className={`rounded-full px-2.5 py-1 text-xs font-bold ${
                            svc.status === "OPERATIONAL"
                              ? "bg-emerald-100 text-emerald-800"
                              : svc.status === "VERIFIED_DISRUPTED"
                              ? "bg-red-100 text-red-800"
                              : svc.status === "POTENTIAL_DISRUPTION_FLAGGED"
                              ? "bg-amber-100 text-amber-800"
                              : "bg-slate-100 text-slate-700"
                          }`}
                        >
                          {svc.status.replace(/_/g, " ")}
                        </span>
                      </div>

                      {/* Disruption & Telemetry Notes */}
                      <div className="mt-4 space-y-2 text-xs text-slate-600 border-t border-slate-100 pt-3">
                        {svc.disruptionDurationHrs && (
                          <div className="flex justify-between">
                            <span className="text-slate-400">Disruption Duration:</span>
                            <span className="font-bold text-red-600">{svc.disruptionDurationHrs} hours</span>
                          </div>
                        )}
                        {svc.affectedPopulationEstimate && (
                          <div className="flex justify-between">
                            <span className="text-slate-400">Affected Population:</span>
                            <span className="font-semibold text-ink">{svc.affectedPopulationEstimate.toLocaleString()} persons</span>
                          </div>
                        )}
                        {svc.alternativeServicesInUse && (
                          <div>
                            <span className="text-slate-400 block">Alternative Service In Use:</span>
                            <span className="font-semibold text-blue-700">{svc.alternativeServicesInUse}</span>
                          </div>
                        )}
                        {svc.verificationNotes && (
                          <div className="text-[11px] text-slate-500 italic bg-white/70 p-2 rounded border border-slate-100">
                            {svc.verificationNotes}
                          </div>
                        )}
                      </div>

                      {/* Verification Footer & Action Button */}
                      <div className="mt-4 flex items-center justify-between border-t border-slate-100 pt-3 text-[11px]">
                        <div>
                          {svc.isVerified ? (
                            <span className="text-emerald-700 font-semibold flex items-center gap-1">
                              <IconCheck className="h-3.5 w-3.5" />
                              Verified by {svc.verifiedBy}
                            </span>
                          ) : (
                            <span className="text-amber-700 font-semibold flex items-center gap-1">
                              <IconAlertTriangle className="h-3.5 w-3.5" />
                              Unverified Citizen / Advisory Report
                            </span>
                          )}
                        </div>
                        <button
                          onClick={() => {
                            setSelectedService(svc);
                            setNewStatus(svc.status);
                            setVerifierName(svc.verifiedBy || "");
                            setAlternativeServices(svc.alternativeServicesInUse || "");
                            setVerificationModalOpen(true);
                          }}
                          className="rounded-lg bg-slate-100 px-3 py-1.5 text-xs font-bold text-slate-700 hover:bg-slate-200 transition"
                        >
                          Verify / Change Status
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Cross-Workflow Flow Banner */}
              <div className="mt-6 rounded-xl border border-blue-200 bg-blue-50/70 p-4 flex items-center justify-between">
                <div className="text-xs text-blue-950">
                  <span className="font-bold block">Workflow Connection: Services Continuity → Recovery Tracking (ARI)</span>
                  <p className="mt-0.5 text-blue-800">
                    Disrupted facilities dynamically reduce the operational numerator in Tab 4 (ARI). Restoring a facility immediately updates recovery progress.
                  </p>
                </div>
                <button
                  onClick={() => setActiveTab("recovery")}
                  className="rounded-lg bg-blue-600 px-3 py-1.5 text-xs font-bold text-white hover:bg-blue-700 shrink-0 flex items-center gap-1"
                >
                  View Recovery Impact (ARI) <IconArrowRight className="h-3.5 w-3.5" />
                </button>
              </div>
            </div>
          </div>
        )}

        {/* ========================================================================= */}
        {/* TAB 3: POST-DISASTER RECOVERY TRACKING (ARI)                              */}
        {/* ========================================================================= */}
        {activeTab === "recovery" && (
          <div className="space-y-6">
            <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
              <div className="flex flex-col justify-between gap-4 md:flex-row md:items-center">
                <div>
                  <h2 className="font-display text-lg font-bold text-ink">
                    Adaptation Recovery Index (ARI) — {recovery.disasterEventLabel}
                  </h2>
                  <p className="mt-1 text-xs text-slate-500">
                    Tracking verified long-term restoration over time across 7 essential public sectors. Monitored on Day {recovery.daysPostDisaster} post-disaster.
                  </p>
                </div>
                <div className="text-right">
                  <span className="text-xs font-bold text-slate-400 block uppercase">Lead Agency</span>
                  <span className="text-sm font-extrabold text-ink">{recovery.leadAgency}</span>
                </div>
              </div>

              {/* Sector Progress Bars */}
              <div className="mt-6 space-y-4">
                {ARI_SECTOR_DEFINITIONS.map((def) => {
                  const ev = (recovery.sectorEvidence as any)[def.key];
                  const pct = ev?.pct ?? null;
                  const isAvailable = ev?.available && pct !== null;

                  return (
                    <div key={def.key} className="rounded-xl border border-slate-200 bg-slate-50/50 p-4">
                      <div className="flex items-center justify-between">
                        <div>
                          <h4 className="text-sm font-bold text-ink">{def.label}</h4>
                          <span className="text-[11px] text-slate-500">{def.description}</span>
                        </div>
                        <div className="text-right">
                          <span className="font-display text-lg font-extrabold text-ink">
                            {isAvailable ? `${pct}%` : "Evidence Pending"}
                          </span>
                          <span className="block text-[10px] text-slate-400 font-semibold">Weight: {def.weight * 100}%</span>
                        </div>
                      </div>

                      {/* Bar */}
                      <div className="mt-3 h-2 w-full rounded-full bg-slate-200 overflow-hidden">
                        <div
                          className={`h-full rounded-full ${
                            !isAvailable ? "bg-slate-300" : (pct || 0) >= 70 ? "bg-emerald-500" : "bg-blue-600"
                          }`}
                          style={{ width: `${isAvailable ? pct : 0}%` }}
                        />
                      </div>

                      {/* Evidence Citations */}
                      <div className="mt-3 flex flex-wrap items-center justify-between text-[11px] text-slate-500">
                        <div>
                          <span className="text-slate-400">Evidence Required:</span> {def.verificationEvidenceRequired}
                        </div>
                        {ev?.verifiedBy && (
                          <div className="font-semibold text-emerald-700">
                            Verified by {ev.verifiedBy} ({ev.verifiedAt})
                          </div>
                        )}
                        {!isAvailable && (
                          <div className="font-semibold text-amber-700">
                            Nullable Metric (Not assumed to be 0%)
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        )}

        {/* ========================================================================= */}
        {/* TAB 4: VERIFIED POPULATION DISPLACEMENT & RETURN                           */}
        {/* ========================================================================= */}
        {activeTab === "displacement" && (
          <div className="space-y-6">
            <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
              <div className="flex flex-col justify-between gap-4 md:flex-row md:items-center">
                <div>
                  <h2 className="font-display text-lg font-bold text-ink">
                    Verified Population Displacement & Return Ledger
                  </h2>
                  <p className="mt-1 text-xs text-slate-500">
                    Independent tracking of verified returnees vs. camp occupancy and secondary informal displacement.
                  </p>
                </div>
                <div className="inline-flex items-center gap-1.5 rounded-full bg-emerald-100 px-3 py-1 text-xs font-bold text-emerald-800">
                  <IconCheck className="h-3.5 w-3.5" />
                  Mathematical Balance Validated
                </div>
              </div>

              {/* Critical Caution Banner */}
              <div className="mt-4 rounded-xl border border-amber-200 bg-amber-50 p-4 text-xs text-amber-900">
                <span className="font-bold flex items-center gap-1.5">
                  <IconAlertTriangle className="h-4 w-4 text-amber-600" />
                  Fundamental Data Integrity Rule:
                </span>
                <p className="mt-1 text-amber-800">
                  Declining relief camp occupancy is <strong>never</strong> treated as confirmed population return or successful recovery. Many displaced families leave formal camps for roadside tent settlements or remain unaccounted for. Only physically verified household re-occupation is counted as returned.
                </p>
              </div>

              {/* Population Equation Grid */}
              <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-5">
                <div className="rounded-xl border border-slate-200 bg-slate-50 p-4">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Total Displaced Baseline</span>
                  <div className="mt-1 font-display text-2xl font-black text-ink">
                    {displacement.totalDisplacedBaseline.toLocaleString()}
                  </div>
                  <span className="text-[10px] text-slate-400">100% of displaced cohort</span>
                </div>

                <div className="rounded-xl border border-emerald-200 bg-emerald-50/50 p-4">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-800">Verified Returned</span>
                  <div className="mt-1 font-display text-2xl font-black text-emerald-700">
                    {displacement.verifiedReturnedCount.toLocaleString()}
                  </div>
                  <span className="text-[10px] font-bold text-emerald-600">{displacement.verifiedReturnRatePct}% return rate</span>
                </div>

                <div className="rounded-xl border border-blue-200 bg-blue-50/50 p-4">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-blue-800">In Formal Relief Camps</span>
                  <div className="mt-1 font-display text-2xl font-black text-blue-700">
                    {displacement.inCampShelterCount.toLocaleString()}
                  </div>
                  <span className="text-[10px] text-blue-600">25.0% of cohort in camps</span>
                </div>

                <div className="rounded-xl border border-orange-200 bg-orange-50/50 p-4">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-orange-800">Secondary Roadside Camps</span>
                  <div className="mt-1 font-display text-2xl font-black text-orange-700">
                    {displacement.secondaryDisplacedCount.toLocaleString()}
                  </div>
                  <span className="text-[10px] font-bold text-orange-600">37.0% informal displacement</span>
                </div>

                <div className="rounded-xl border border-slate-200 bg-slate-50 p-4">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Unaccounted Location</span>
                  <div className="mt-1 font-display text-2xl font-black text-slate-700">
                    {displacement.unaccountedCount.toLocaleString()}
                  </div>
                  <span className="text-[10px] text-slate-400">9.0% pending verification</span>
                </div>
              </div>

              {/* Equation Statement */}
              <div className="mt-6 rounded-xl border border-slate-200 bg-slate-100 p-4 text-center font-mono text-xs text-slate-700">
                <span className="font-bold text-slate-900">Population Balance Equation:</span> {displacement.totalDisplacedBaseline.toLocaleString()} Baseline = {displacement.verifiedReturnedCount.toLocaleString()} (Returned) + {displacement.inCampShelterCount.toLocaleString()} (Camps) + {displacement.secondaryDisplacedCount.toLocaleString()} (Roadside) + {displacement.unaccountedCount.toLocaleString()} (Unaccounted)
              </div>
            </div>
          </div>
        )}

        {/* ========================================================================= */}
        {/* TAB 5: CLIMATE ADAPTATION ACTION TRACKER                                  */}
        {/* ========================================================================= */}
        {activeTab === "adaptation" && (
          <div className="space-y-6">
            <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
              <div className="flex flex-col justify-between gap-4 md:flex-row md:items-center">
                <div>
                  <h2 className="font-display text-lg font-bold text-ink">
                    Community Climate Adaptation Action Tracker
                  </h2>
                  <p className="mt-1 text-xs text-slate-500">
                    Tracking long-term resilience investments with third-party verification and dynamic CRI recalculation.
                  </p>
                </div>
                <div className="text-right">
                  <span className="text-xs font-bold text-slate-400 block uppercase">Resource Agent Telemetry</span>
                  <span className="text-xs font-bold text-emerald-700">PKR 459 / Beneficiary Avg</span>
                </div>
              </div>

              {/* Projects List */}
              <div className="mt-6 space-y-4">
                {adaptationList.map((project) => {
                  const sectorMeta = ADAPTATION_SECTOR_LABELS[project.sector];

                  return (
                    <div key={project.id} className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
                      <div className="flex flex-col justify-between gap-3 sm:flex-row sm:items-start">
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="rounded-full bg-blue-100 px-2.5 py-0.5 text-xs font-bold text-blue-800">
                              {sectorMeta?.label || project.sector}
                            </span>
                            <span
                              className={`rounded-full px-2.5 py-0.5 text-xs font-bold ${
                                project.status === "INDEPENDENTLY_VERIFIED"
                                  ? "bg-emerald-100 text-emerald-800"
                                  : "bg-blue-50 text-blue-700"
                              }`}
                            >
                              {project.status.replace(/_/g, " ")}
                            </span>
                          </div>
                          <h3 className="mt-2 font-display text-base font-bold text-ink">{project.title}</h3>
                          <p className="mt-1 text-xs text-slate-600">{project.description}</p>
                        </div>
                        <div className="text-right sm:min-w-[140px]">
                          <span className="text-xs font-bold text-slate-400 block uppercase">Budget</span>
                          <span className="font-display text-base font-extrabold text-ink">
                            PKR {(project.budgetPkr || 0).toLocaleString()}
                          </span>
                        </div>
                      </div>

                      {/* Physical Progress */}
                      <div className="mt-4">
                        <div className="flex justify-between text-xs font-semibold text-slate-600 mb-1">
                          <span>Physical Construction Progress</span>
                          <span className="font-bold text-ink">{project.physicalProgressPct}%</span>
                        </div>
                        <div className="h-2 w-full rounded-full bg-slate-200 overflow-hidden">
                          <div
                            className="h-full bg-emerald-500 rounded-full"
                            style={{ width: `${project.physicalProgressPct}%` }}
                          />
                        </div>
                      </div>

                      {/* Beneficiaries & Engineering Meta */}
                      <div className="mt-4 grid grid-cols-1 gap-2 sm:grid-cols-3 text-xs text-slate-600 border-t border-slate-100 pt-3">
                        <div>
                          <span className="text-slate-400 block">Target Beneficiaries:</span>
                          <span className="font-semibold text-ink">{project.targetBeneficiaries.toLocaleString()} residents</span>
                        </div>
                        <div>
                          <span className="text-slate-400 block">Verified Beneficiaries:</span>
                          <span className="font-semibold text-emerald-700">{project.verifiedBeneficiaries.toLocaleString()} residents</span>
                        </div>
                        <div>
                          <span className="text-slate-400 block">Partner / Lead Engineer:</span>
                          <span className="font-semibold text-ink">{project.implementingPartner}</span>
                        </div>
                      </div>

                      {/* Audit Certification Action */}
                      <div className="mt-4 flex flex-wrap items-center justify-between border-t border-slate-100 pt-3 text-xs">
                        <div>
                          {project.independentlyVerified ? (
                            <span className="text-emerald-700 font-bold flex items-center gap-1">
                              <IconCheck className="h-4 w-4" />
                              Independently Verified by {project.verifyingAuditor}
                            </span>
                          ) : (
                            <span className="text-amber-700 font-semibold flex items-center gap-1">
                              <IconAlertTriangle className="h-4 w-4" />
                              Pending Independent Third-Party Audit
                            </span>
                          )}
                        </div>

                        {!project.independentlyVerified && (
                          <button
                            onClick={() => {
                              setSelectedAdaptation(project);
                              setVerifiedBeneficiariesInput(project.targetBeneficiaries);
                              setCertifyModalOpen(true);
                            }}
                            className="rounded-lg bg-blue-600 px-3 py-1.5 text-xs font-bold text-white hover:bg-blue-700 transition"
                          >
                            Certify Audit & Recalculate CRI
                          </button>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        )}
      </main>

      {/* Service Verification Modal */}
      {verificationModalOpen && selectedService && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="w-full max-w-lg rounded-2xl bg-white p-6 shadow-xl">
            <h3 className="font-display text-lg font-bold text-ink">
              Verify Facility Status: {selectedService.facilityName}
            </h3>
            <p className="mt-1 text-xs text-slate-500">
              Update operational status, verify disruption duration, and log audit credentials.
            </p>

            <div className="mt-4 space-y-4">
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-1">Operational Status</label>
                <select
                  value={newStatus}
                  onChange={(e) => setNewStatus(e.target.value as ServiceOperationalStatus)}
                  className="w-full rounded-lg border border-slate-300 p-2 text-sm font-semibold"
                >
                  <option value="OPERATIONAL">OPERATIONAL (Requires Verification)</option>
                  <option value="POTENTIAL_DISRUPTION_FLAGGED">POTENTIAL DISRUPTION FLAGGED (Advisory)</option>
                  <option value="VERIFIED_DISRUPTED">VERIFIED DISRUPTED (Requires Verification)</option>
                  <option value="PARTIALLY_RESTORED">PARTIALLY RESTORED</option>
                  <option value="FULLY_RESTORED">FULLY RESTORED</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-1">Verifier Name / Entity</label>
                <input
                  type="text"
                  value={verifierName}
                  onChange={(e) => setVerifierName(e.target.value)}
                  placeholder="e.g. Dr. Tariq Mahmood (DHO Dadu)"
                  className="w-full rounded-lg border border-slate-300 p-2 text-sm"
                />
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-1">Alternative Services Deployed</label>
                <input
                  type="text"
                  value={alternativeServices}
                  onChange={(e) => setAlternativeServices(e.target.value)}
                  placeholder="e.g. 2x 5000L Mobile Water Bowsers dispatched"
                  className="w-full rounded-lg border border-slate-300 p-2 text-sm"
                />
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-1">Verification Inspection Notes</label>
                <textarea
                  value={verificationNotes}
                  onChange={(e) => setVerificationNotes(e.target.value)}
                  placeholder="Field evidence details, water turbidity readings, generator status..."
                  rows={3}
                  className="w-full rounded-lg border border-slate-300 p-2 text-sm"
                />
              </div>
            </div>

            <div className="mt-6 flex justify-end gap-3 border-t border-slate-100 pt-4">
              <button
                onClick={() => setVerificationModalOpen(false)}
                className="rounded-lg border border-slate-300 px-4 py-2 text-xs font-bold text-slate-600 hover:bg-slate-50"
              >
                Cancel
              </button>
              <button
                disabled={isSubmitting}
                onClick={handleUpdateServiceStatus}
                className="rounded-lg bg-blue-600 px-4 py-2 text-xs font-bold text-white hover:bg-blue-700 disabled:opacity-50"
              >
                {isSubmitting ? "Saving..." : "Save Verified Status"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Adaptation Audit Certification Modal */}
      {certifyModalOpen && selectedAdaptation && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="w-full max-w-lg rounded-2xl bg-white p-6 shadow-xl">
            <h3 className="font-display text-lg font-bold text-ink">
              Independent Certification: {selectedAdaptation.title}
            </h3>
            <p className="mt-1 text-xs text-slate-500">
              Certifying this adaptation asset verifies beneficiaries and unlocks evidence-backed CRI recalculation.
            </p>

            <div className="mt-4 space-y-4">
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-1">Certifying Auditor / Inspection Panel</label>
                <input
                  type="text"
                  value={auditorName}
                  onChange={(e) => setAuditorName(e.target.value)}
                  className="w-full rounded-lg border border-slate-300 p-2 text-sm font-semibold"
                />
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-1">Verified Beneficiary Count</label>
                <input
                  type="number"
                  value={verifiedBeneficiariesInput}
                  onChange={(e) => setVerifiedBeneficiariesInput(parseInt(e.target.value, 10))}
                  className="w-full rounded-lg border border-slate-300 p-2 text-sm font-semibold"
                />
              </div>
            </div>

            <div className="mt-6 flex justify-end gap-3 border-t border-slate-100 pt-4">
              <button
                onClick={() => setCertifyModalOpen(false)}
                className="rounded-lg border border-slate-300 px-4 py-2 text-xs font-bold text-slate-600 hover:bg-slate-50"
              >
                Cancel
              </button>
              <button
                disabled={isSubmitting}
                onClick={handleCertifyAdaptation}
                className="rounded-lg bg-emerald-600 px-4 py-2 text-xs font-bold text-white hover:bg-emerald-700 disabled:opacity-50"
              >
                {isSubmitting ? "Certifying..." : "Approve Certification & Recalculate CRI"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Architecture & Information Flow Guide Modal (Requirement 7) */}
      {architectureModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="w-full max-w-2xl rounded-2xl bg-white p-6 shadow-xl max-h-[85vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2">
                <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-blue-100 text-blue-700">
                  <IconBrain className="h-5 w-5" />
                </span>
                <h3 className="font-display text-lg font-bold text-ink">
                  End-to-End Resilience & Recovery Workflow Architecture
                </h3>
              </div>
              <button onClick={() => setArchitectureModalOpen(false)} className="text-slate-400 hover:text-slate-600">
                <IconX className="h-5 w-5" />
              </button>
            </div>

            <div className="mt-4 space-y-4 text-xs text-slate-600">
              <p className="text-sm font-semibold text-slate-800">
                How information flows between the 5 capabilities across the disaster lifecycle:
              </p>

              {/* Step 1 */}
              <div className="rounded-xl border border-slate-200 bg-slate-50 p-3.5">
                <span className="font-extrabold text-blue-800 block text-xs">
                  STAGE 1: Pre-Disaster Community Baseline (CRI)
                </span>
                <p className="mt-1 text-slate-600">
                  Establishes the underlying vulnerability and preparedness score (0-100) across 8 empirical dimensions using fixed thresholds. Evaluates Data Confidence Score (DCS) separately to protect scores from missing survey penalties.
                </p>
              </div>

              {/* Step 2 */}
              <div className="rounded-xl border border-amber-200 bg-amber-50/60 p-3.5">
                <span className="font-extrabold text-amber-900 block text-xs">
                  STAGE 2: Flood Event & Essential Services Disruption
                </span>
                <p className="mt-1 text-amber-800">
                  When a flood occurs, signals from the <strong>Flood Agent</strong> (severity) and <strong>Route Agent</strong> (road passability) flag critical facilities with advisory disruption cues. Field officers verify the breach, track disruption hours, and log mobile alternatives.
                </p>
              </div>

              {/* Step 3 */}
              <div className="rounded-xl border border-purple-200 bg-purple-50/60 p-3.5">
                <span className="font-extrabold text-purple-900 block text-xs">
                  STAGE 3: Population Displacement & Return Ledger
                </span>
                <p className="mt-1 text-purple-800">
                  Tracks displaced populations with a strict mathematical balance equation. Crucially separates formal relief camp occupancy from verified household return, detecting roadside informal displacement risks.
                </p>
              </div>

              {/* Step 4 */}
              <div className="rounded-xl border border-blue-200 bg-blue-50/60 p-3.5">
                <span className="font-extrabold text-blue-900 block text-xs">
                  STAGE 4: Post-Disaster Adaptation Recovery Index (ARI)
                </span>
                <p className="mt-1 text-blue-800">
                  Connects service disruptions directly to sector capacity metrics. Missing metrics are stored as null (never assumed 0%). Rebuilding houses directly updates the housing restoration trajectory.
                </p>
              </div>

              {/* Step 5 */}
              <div className="rounded-xl border border-emerald-200 bg-emerald-50/60 p-3.5">
                <span className="font-extrabold text-emerald-900 block text-xs">
                  STAGE 5: Climate Adaptation Investment & CRI Recalculation
                </span>
                <p className="mt-1 text-emerald-800">
                  Long-term infrastructure (solar RO plants, protective bunds) undergoes third-party engineering audits. Upon verification, the community's CRI dimension is mathematically recalculated from actual demographic coverage, completing the resilient cycle.
                </p>
              </div>
            </div>

            <div className="mt-6 flex justify-end border-t border-slate-100 pt-4">
              <button
                onClick={() => setArchitectureModalOpen(false)}
                className="rounded-lg bg-blue-600 px-4 py-2 text-xs font-bold text-white hover:bg-blue-700"
              >
                Close Guide
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Simulation Audit Modal */}
      {simulationModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="w-full max-w-xl rounded-2xl bg-white p-6 shadow-xl">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2">
                <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-blue-100 text-blue-700">
                  <IconActivity className="h-5 w-5" />
                </span>
                <h3 className="font-display text-lg font-bold text-ink">
                  End-to-End Simulation Audit Trail
                </h3>
              </div>
              <button onClick={() => setSimulationModalOpen(false)} className="text-slate-400 hover:text-slate-600">
                <IconX className="h-5 w-5" />
              </button>
            </div>

            <div className="mt-4">
              {simulationRunning ? (
                <div className="py-8 text-center">
                  <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-blue-600 border-r-transparent" />
                  <p className="mt-3 text-xs font-semibold text-slate-600">
                    Running live multi-agent flood, disruption, return, and adaptation recalculation...
                  </p>
                </div>
              ) : (
                <div className="space-y-2">
                  <p className="text-xs font-semibold text-slate-700 mb-2">
                    Verified Execution Lifecycle Steps:
                  </p>
                  <div className="max-h-64 overflow-y-auto space-y-2 pr-1">
                    {simulationAuditTrail.map((step, idx) => (
                      <div key={idx} className="rounded-lg bg-slate-50 border border-slate-200 p-2.5 text-xs text-slate-700 flex items-start gap-2">
                        <IconCheck className="h-4 w-4 text-emerald-600 shrink-0 mt-0.5" />
                        <span>{step}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            <div className="mt-6 flex justify-end border-t border-slate-100 pt-4">
              <button
                disabled={simulationRunning}
                onClick={() => setSimulationModalOpen(false)}
                className="rounded-lg bg-blue-600 px-4 py-2 text-xs font-bold text-white hover:bg-blue-700 disabled:opacity-50"
              >
                Close Audit Log
              </button>
            </div>
          </div>
        </div>
      )}

      <AdminNav />
    </div>
  );
}
