// @ts-nocheck
import { useState, useMemo } from "react";

// ─── PLATFORM BENCHMARKS (stay as rates) ─────────────────────
const PLATFORM_BM = {
  venezuela: { label: "Venezuela 🇻🇪", color: "#27AE60", cpm: 0.8,  ctr: 1.8 },
  latam:     { label: "LATAM 🌎",       color: "#2980B9", cpm: 2.5,  ctr: 1.5 },
  eeuu:      { label: "EE.UU. 🇺🇸",    color: "#E67E22", cpm: 12.0, ctr: 1.2 },
};

// ─── QUANTITY DEFAULTS per market (user-facing inputs) ────────
const QTY_DEFAULTS = {
  venezuela: { leads: 80, conversations: 30, profileVisits: 120, newFollowers: 40, qualified: 32, closed: 8,  directSales: 6  },
  latam:     { leads: 60, conversations: 22, profileVisits: 90,  newFollowers: 28, qualified: 21, closed: 6,  directSales: 5  },
  eeuu:      { leads: 25, conversations: 8,  profileVisits: 40,  newFollowers: 10, qualified: 11, closed: 4,  directSales: 3  },
};

const PIPELINE_RATES = {
  venezuela: { qualifiedToClose: 25, directConvRate: 20 },
  latam:     { qualifiedToClose: 20, directConvRate: 18 },
  eeuu:      { qualifiedToClose: 30, directConvRate: 22 },
};

const OBJECTIVES = {
  leads:  "Generación de Leads",
  ventas: "Venta Directa",
  marca:  "Reconocimiento de Marca",
  mixta:  "Estrategia Mixta",
};

const CUSTOM_METRIC_TYPES = [
  { key: "pct_of_clicks",      label: "% de clicks"      },
  { key: "pct_of_leads",       label: "% de leads"       },
  { key: "pct_of_impressions", label: "% de impresiones" },
  { key: "manual",             label: "Valor fijo manual" },
];

// ─── UTILS ────────────────────────────────────────────────────
function fmt(n, d = 0) {
  if (n == null || isNaN(n) || !isFinite(n)) return "—";
  return new Intl.NumberFormat("es-ES", { minimumFractionDigits: d, maximumFractionDigits: d }).format(n);
}
function fmtC(n) {
  if (n == null || isNaN(n) || !isFinite(n) || n <= 0) return n === 0 ? "$0" : "—";
  if (n >= 1000000) return "$" + fmt(n / 1000000, 2) + "M";
  if (n >= 1000)    return "$" + fmt(n / 1000, 1)    + "K";
  return "$" + fmt(n, 2);
}
function pct(part, total, d = 1) {
  if (!total || total === 0) return "—";
  const v = (part / total) * 100;
  return fmt(v, d) + "%";
}

function computeCustom(metric, calc) {
  const v = metric.inputValue;
  switch (metric.formulaType) {
    case "pct_of_clicks":      return calc.clicks      * (v / 100);
    case "pct_of_leads":       return (calc.leads || 0)* (v / 100);
    case "pct_of_impressions": return calc.impressions  * (v / 100);
    case "manual":             return v;
    default: return 0;
  }
}

// ─── REUSABLE UI ──────────────────────────────────────────────
const FONT = "'Poppins', sans-serif";
const FONT_MONO = "'Poppins', sans-serif";

function Slider({ label, value, onChange, min, max, step = 1, suffix = "", note, accent = "#E94560" }) {
  return (
    <div style={{ marginBottom: 14 }}>
      <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 4 }}>
        <span style={{ fontSize: 13, color: "#cbd5e1", fontFamily: FONT_MONO, textTransform: "uppercase", letterSpacing: 1 }}>{label}</span>
        <span style={{ fontSize: 16, color: "#ffffff", fontFamily: FONT_MONO, fontWeight: 700 }}>
          {suffix === "$" ? fmtC(value) : fmt(value, step < 1 ? 1 : 0) + suffix}
        </span>
      </div>
      <input type="range" min={min} max={max} step={step} value={value}
        onChange={e => onChange(parseFloat(e.target.value))}
        style={{ width: "100%", accentColor: accent, cursor: "pointer" }} />
      {note && <div style={{ fontSize: 12, color: "#94a3b8", marginTop: 2, fontFamily: FONT }}>{note}</div>}
    </div>
  );
}

function NInput({ label, value, onChange, prefix = "", suffix = "", accent, wide }) {
  return (
    <div style={{ flex: wide ? 2 : 1, minWidth: 70 }}>
      <div style={{ fontSize: 12, color: "#94a3b8", marginBottom: 3, fontFamily: FONT_MONO, textTransform: "uppercase", letterSpacing: 0.8 }}>{label}</div>
      <div style={{ display: "flex", alignItems: "center", background: "#020817", border: `1px solid ${accent ? accent + "44" : "#1e293b"}`, borderRadius: 6, overflow: "hidden" }}>
        {prefix && <span style={{ padding: "5px 6px", color: "#94a3b8", fontSize: 13, fontFamily: FONT }}>{prefix}</span>}
        <input type="number" value={value} onChange={e => onChange(parseFloat(e.target.value) || 0)}
          style={{ flex: 1, background: "transparent", border: "none", outline: "none", color: "#ffffff", fontSize: 15, padding: "5px 6px", fontFamily: FONT_MONO, minWidth: 0 }} />
        {suffix && <span style={{ padding: "5px 6px", color: "#94a3b8", fontSize: 13, fontFamily: FONT }}>{suffix}</span>}
      </div>
    </div>
  );
}

function KPI({ label, value, sub, accent, big, purple, warn }) {
  const c = warn ? "#ef4444" : purple ? "#8b5cf6" : accent;
  return (
    <div style={{ background: "#0a1628", border: `1px solid ${c}33`, borderRadius: 10, padding: big ? "16px 18px" : "12px 16px", borderLeft: `3px solid ${c}` }}>
      <div style={{ fontSize: 12, color: "#cbd5e1", textTransform: "uppercase", letterSpacing: 1, fontFamily: FONT_MONO, marginBottom: 3 }}>{label}</div>
      <div style={{ fontSize: big ? 24 : 19, color: c, fontWeight: 800, fontFamily: FONT_MONO }}>{value}</div>
      {sub && <div style={{ fontSize: 12, color: "#94a3b8", marginTop: 3, fontFamily: FONT }}>{sub}</div>}
    </div>
  );
}

// Funnel row: shows quantity + derived rate badge
function FunnelRow({ label, qty, rate, color, rateLabel, isBase }) {
  const barWidth = Math.min(Math.max(isBase ? 100 : (parseFloat(rate) || 0), 0), 100);
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 6 }}>
      <div style={{ width: 140, fontSize: 12, color: "#cbd5e1", textAlign: "right", fontFamily: FONT_MONO, flexShrink: 0, lineHeight: 1.3 }}>{label}</div>
      <div style={{ flex: 1, height: 28, background: "#020817", borderRadius: 4, overflow: "hidden", position: "relative" }}>
        <div style={{ height: "100%", width: `${barWidth}%`, background: `linear-gradient(90deg,${color}cc,${color}44)`, transition: "width 0.4s ease" }} />
        <div style={{ position: "absolute", inset: 0, display: "flex", alignItems: "center", paddingLeft: 10, gap: 8 }}>
          <span style={{ fontSize: 14, color: "#ffffff", fontFamily: FONT_MONO, fontWeight: 700 }}>{typeof qty === "number" ? fmt(Math.round(qty)) : qty}</span>
        </div>
      </div>
      {/* Rate badge - derived output */}
      <div style={{
        minWidth: 64, textAlign: "center", padding: "3px 7px", borderRadius: 5,
        background: isBase ? "transparent" : color + "18",
        border: isBase ? "none" : `1px solid ${color}33`,
        fontSize: 12, color: isBase ? "#334155" : color,
        fontFamily: FONT_MONO, flexShrink: 0
      }}>
        {isBase ? "" : (rateLabel || rate)}
      </div>
    </div>
  );
}

function Box({ children, style = {} }) {
  return <div style={{ background: "#0f172a", border: "1px solid #1e293b", borderRadius: 12, padding: 18, marginBottom: 14, ...style }}>{children}</div>;
}
function Label({ children }) {
  return <div style={{ fontSize: 12, color: "#94a3b8", letterSpacing: 2, textTransform: "uppercase", fontFamily: FONT_MONO, marginBottom: 12 }}>{children}</div>;
}

function SectionDivider({ title, icon }) {
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 10, margin: "28px 0 18px" }}>
      <div style={{ height: 1, flex: 1, background: "linear-gradient(90deg, #1e293b, transparent)" }} />
      <span style={{ fontSize: 13, color: "#cbd5e1", fontFamily: FONT, fontWeight: 600, textTransform: "uppercase", letterSpacing: 2, whiteSpace: "nowrap" }}>
        {icon} {title}
      </span>
      <div style={{ height: 1, flex: 1, background: "linear-gradient(270deg, #1e293b, transparent)" }} />
    </div>
  );
}

// Qty input with label and hint showing derived %
function QtyRow({ label, hint, value, onChange, accent, derivedPct }) {
  return (
    <div style={{ marginBottom: 10 }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", marginBottom: 4 }}>
        <span style={{ fontSize: 13, color: "#cbd5e1", fontFamily: FONT_MONO, textTransform: "uppercase", letterSpacing: 0.8 }}>{label}</span>
        <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
          {derivedPct && (
            <span style={{ fontSize: 12, color: accent + "aa", fontFamily: FONT_MONO, background: accent + "14", padding: "1px 6px", borderRadius: 4 }}>
              {derivedPct}
            </span>
          )}
        </div>
      </div>
      <div style={{ display: "flex", alignItems: "center", background: "#020817", border: `1px solid ${accent}44`, borderRadius: 8, overflow: "hidden" }}>
        <input type="number" value={value} min={0} onChange={e => onChange(parseInt(e.target.value) || 0)}
          style={{ flex: 1, background: "transparent", border: "none", outline: "none", color: "#ffffff", fontSize: 18, padding: "7px 12px", fontFamily: FONT_MONO, fontWeight: 700 }} />
        <span style={{ padding: "7px 10px", color: "#94a3b8", fontSize: 13, fontFamily: FONT_MONO }}>{hint}</span>
      </div>
    </div>
  );
}

// ─── CUSTOM METRIC ROW ────────────────────────────────────────
function CustomMetricRow({ metric, onUpdate, onDelete, accent, calc }) {
  const result = useMemo(() => {
    const val = computeCustom(metric, calc);
    const cost = val > 0 ? calc.effectiveBudget / val : null;
    return { val: Math.round(val), cost };
  }, [metric, calc]);

  return (
    <div style={{ background: "#020817", border: `1px solid ${accent}22`, borderRadius: 8, padding: "10px 12px", marginBottom: 8 }}>
      <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 8 }}>
        <input value={metric.label} onChange={e => onUpdate({ ...metric, label: e.target.value })}
          placeholder="Nombre de la métrica..."
          style={{ flex: 1, background: "transparent", border: "none", outline: "none", color: "#ffffff", fontSize: 15, fontFamily: FONT_MONO, borderBottom: "1px solid #1e293b", paddingBottom: 2 }} />
        <button onClick={onDelete} style={{ background: "none", border: "none", color: "#94a3b8", cursor: "pointer", fontSize: 21, lineHeight: 1, padding: "0 4px" }}>×</button>
      </div>
      <div style={{ display: "flex", gap: 8, alignItems: "flex-end", flexWrap: "wrap" }}>
        <div style={{ minWidth: 130 }}>
          <div style={{ fontSize: 12, color: "#94a3b8", marginBottom: 3, fontFamily: FONT_MONO, textTransform: "uppercase" }}>Tipo</div>
          <select value={metric.formulaType} onChange={e => onUpdate({ ...metric, formulaType: e.target.value })}
            style={{ width: "100%", background: "#0f172a", border: `1px solid ${accent}33`, color: "#ffffff", fontSize: 14, padding: "5px 8px", borderRadius: 6, fontFamily: FONT_MONO }}>
            {CUSTOM_METRIC_TYPES.map(t => <option key={t.key} value={t.key}>{t.label}</option>)}
          </select>
        </div>
        <NInput label={metric.formulaType === "manual" ? "Valor" : "Porcentaje"} value={metric.inputValue}
          onChange={v => onUpdate({ ...metric, inputValue: v })}
          suffix={metric.formulaType === "manual" ? "" : "%"} accent={accent} />
        <div style={{ display: "flex", gap: 10 }}>
          <div>
            <div style={{ fontSize: 12, color: "#94a3b8", fontFamily: FONT_MONO, marginBottom: 3 }}>RESULTADO</div>
            <div style={{ fontSize: 21, color: accent, fontWeight: 800, fontFamily: FONT_MONO }}>{fmt(result.val)}</div>
          </div>
          {result.cost && (
            <div>
              <div style={{ fontSize: 12, color: "#94a3b8", fontFamily: FONT_MONO, marginBottom: 3 }}>COSTO/UNIDAD</div>
              <div style={{ fontSize: 21, color: accent, fontWeight: 800, fontFamily: FONT_MONO }}>{fmtC(result.cost)}</div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

// ─── MAIN APP ─────────────────────────────────────────────────
export default function App() {
  const [market, setMarket]       = useState("latam");
  const [objective, setObjective] = useState("leads");
  const [budget, setBudget]       = useState(1000);
  const [ticket, setTicket]       = useState(300);
  const [mixSplit, setMixSplit]   = useState(80);
  const [showPlatform, setShowPlatform] = useState(false);
  const [customMetrics, setCustomMetrics] = useState([]);

  // Platform benchmarks (rates) - editable but secondary
  const [platform, setPlatform] = useState({
    venezuela: { ...PLATFORM_BM.venezuela },
    latam:     { ...PLATFORM_BM.latam     },
    eeuu:      { ...PLATFORM_BM.eeuu      },
  });

  // Quantity inputs per market - PRIMARY inputs
  const [qty, setQty] = useState({
    venezuela: { ...QTY_DEFAULTS.venezuela },
    latam:     { ...QTY_DEFAULTS.latam     },
    eeuu:      { ...QTY_DEFAULTS.eeuu      },
  });

  // Pipeline close rates (still %)
  const [pipeRates, setPipeRates] = useState({
    venezuela: { ...PIPELINE_RATES.venezuela },
    latam:     { ...PIPELINE_RATES.latam     },
    eeuu:      { ...PIPELINE_RATES.eeuu      },
  });

  const bm     = platform[market];
  const q      = qty[market];
  const pr     = pipeRates[market];
  const accent = PLATFORM_BM[market].color;

  const upPlatform  = (mkt, k, v) => setPlatform(p => ({ ...p, [mkt]: { ...p[mkt], [k]: v } }));
  const upQty       = (mkt, k, v) => setQty(p => ({ ...p, [mkt]: { ...p[mkt], [k]: v } }));
  const upPipe      = (mkt, k, v) => setPipeRates(p => ({ ...p, [mkt]: { ...p[mkt], [k]: v } }));
  const resetAll    = (mkt) => {
    setPlatform(p => ({ ...p, [mkt]: { ...PLATFORM_BM[mkt] } }));
    setQty(p => ({ ...p, [mkt]: { ...QTY_DEFAULTS[mkt] } }));
    setPipeRates(p => ({ ...p, [mkt]: { ...PIPELINE_RATES[mkt] } }));
  };

  const addMetric   = () => setCustomMetrics(p => [...p, { id: Date.now(), label: "Nueva métrica", formulaType: "pct_of_clicks", inputValue: 5 }]);
  const upMetric    = (id, upd) => setCustomMetrics(p => p.map(m => m.id === id ? upd : m));
  const delMetric   = (id) => setCustomMetrics(p => p.filter(m => m.id !== id));

  const calc = useMemo(() => {
    const effBudget   = objective === "mixta" ? budget * (mixSplit / 100) : objective === "marca" ? 0 : budget;
    const brandBudget = objective === "mixta" ? budget * ((100 - mixSplit) / 100) : objective === "marca" ? budget : 0;
    const totalBudget = objective === "marca" ? budget : effBudget;

    // Platform derived
    const impressions = (totalBudget / bm.cpm) * 1000;
    const clicks      = impressions * (bm.ctr / 100);

    // Quantities — user-defined, used directly
    const leads         = q.leads;
    const conversations = q.conversations;
    const profileVisits = q.profileVisits;
    const newFollowers  = q.newFollowers;

    // Derived rates from quantities (these are the OUTPUTS shown in funnel)
    const leadsRate       = clicks > 0 ? (leads / clicks) * 100 : 0;
    const convRate        = clicks > 0 ? (conversations / clicks) * 100 : 0;
    const visitRate       = clicks > 0 ? (profileVisits / clicks) * 100 : 0;
    const followRate      = profileVisits > 0 ? (newFollowers / profileVisits) * 100 : 0;

    // Pipeline (still rate-based since these are sales process efficiencies)
    const qualified   = leads     * (q.qualified / leads || 0.4);
    const qualifiedN  = q.qualified;
    const closedN     = q.closed;

    const directSales = q.directSales;

    // Revenue
    const revenue = objective === "leads" || objective === "mixta"
      ? closedN * ticket
      : objective === "ventas"
        ? directSales * ticket
        : 0;

    // Costs
    const cpl           = leads         > 0 ? totalBudget / leads         : 0;
    const cpa           = closedN       > 0 ? totalBudget / closedN       : directSales > 0 ? totalBudget / directSales : 0;
    const costPerConv   = conversations > 0 ? totalBudget / conversations : 0;
    const costPerVisit  = profileVisits > 0 ? (objective === "marca" ? budget : brandBudget) / profileVisits : 0;
    const costPerFollow = newFollowers  > 0 ? (objective === "marca" ? budget : brandBudget) / newFollowers  : 0;
    const roas          = totalBudget   > 0 && revenue > 0 ? revenue / totalBudget : 0;

    // Brand impressions (for mixta)
    const brandImpressions = (brandBudget / bm.cpm) * 1000;

    return {
      impressions, clicks, leads, conversations, profileVisits, newFollowers,
      leadsRate, convRate, visitRate, followRate,
      qualifiedN, closedN, directSales, revenue,
      cpl, cpa, costPerConv, costPerVisit, costPerFollow, roas,
      effectiveBudget: totalBudget, brandBudget, brandImpressions,
    };
  }, [market, objective, budget, ticket, mixSplit, bm, q, pr]);

  const isLeads  = objective === "leads"  || objective === "mixta";
  const isVentas = objective === "ventas";
  const isMarca  = objective === "marca"  || objective === "mixta";

  return (
    <div style={{ minHeight: "100vh", background: "#020817", fontFamily: FONT, color: "#ffffff", paddingBottom: 60 }}>

      {/* HEADER */}
      <div style={{ borderBottom: "1px solid #1e293b", padding: "14px 28px", display: "flex", alignItems: "center", justifyContent: "space-between", position: "sticky", top: 0, background: "#020817", zIndex: 100 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
          <img src="/logo-imperians.png" alt="Imperians" style={{ height: 40, width: 40, borderRadius: 8, objectFit: "contain" }} />
          <div>
            <div style={{ fontSize: 12, color: "#94a3b8", letterSpacing: 3, textTransform: "uppercase", fontFamily: FONT }}>Meta Ads · Sistema de Decisión</div>
            <div style={{ fontSize: 20, fontWeight: 800, color: "#ffffff" }}>Calculadora de Proyecciones</div>
          </div>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
          <div style={{ fontSize: 12, color: "#94a3b8", fontFamily: FONT_MONO, textAlign: "right" }}>
            <div>CPM: ${bm.cpm} · CTR: {bm.ctr}%</div>
            <div style={{ color: "#64748b" }}>benchmarks plataforma</div>
          </div>
          <div style={{ padding: "5px 12px", borderRadius: 20, background: accent + "22", border: `1px solid ${accent}44`, fontSize: 13, color: accent, fontWeight: 700, fontFamily: FONT_MONO }}>
            {PLATFORM_BM[market].label} · {OBJECTIVES[objective]}
          </div>
        </div>
      </div>

      <div style={{ maxWidth: 1220, margin: "0 auto", padding: "22px 18px" }}>
        <div style={{ display: "grid", gridTemplateColumns: "350px 1fr", gap: 18 }}>

          {/* ── LEFT PANEL ── */}
          <div>
            {/* Market */}
            <Box>
              <Label>Mercado</Label>
              {Object.entries(PLATFORM_BM).map(([key, val]) => (
                <button key={key} onClick={() => setMarket(key)} style={{
                  width: "100%", marginBottom: 6, padding: "9px 14px", borderRadius: 8, cursor: "pointer",
                  border: `1.5px solid ${market === key ? val.color : "#1e293b"}`,
                  background: market === key ? val.color + "18" : "transparent",
                  color: market === key ? val.color : "#cbd5e1",
                  fontSize: 15, fontWeight: market === key ? 700 : 400, fontFamily: FONT,
                  textAlign: "left", display: "flex", justifyContent: "space-between", alignItems: "center"
                }}>
                  <span>{val.label}</span>
                  {market === key && <span style={{ fontSize: 12, fontFamily: FONT_MONO }}>CPM ${val.cpm}</span>}
                </button>
              ))}
            </Box>

            {/* Objective */}
            <Box>
              <Label>Objetivo</Label>
              {Object.entries(OBJECTIVES).map(([key, label]) => (
                <button key={key} onClick={() => setObjective(key)} style={{
                  width: "100%", marginBottom: 6, padding: "9px 14px", borderRadius: 8, cursor: "pointer",
                  border: `1.5px solid ${objective === key ? accent : "#1e293b"}`,
                  background: objective === key ? accent + "18" : "transparent",
                  color: objective === key ? accent : "#cbd5e1",
                  fontSize: 15, fontWeight: objective === key ? 700 : 400, textAlign: "left", fontFamily: FONT,
                }}>{label}</button>
              ))}
            </Box>

            {/* Budget & Ticket */}
            <Box>
              <Label>Inversión y Ticket</Label>
              <Slider label="Presupuesto mensual" value={budget} onChange={setBudget} min={100} max={20000} step={100} suffix="$" accent={accent} />
              {objective !== "marca" && (
                <Slider label="Valor prom. transacción" value={ticket} onChange={setTicket} min={10} max={10000} step={10} suffix="$" accent={accent} />
              )}
              {objective === "mixta" && (
                <Slider label="% para conversión" value={mixSplit} onChange={setMixSplit} min={50} max={90} step={5} suffix="%" accent={accent}
                  note={`${fmtC(budget * mixSplit / 100)} conversión · ${fmtC(budget * (100 - mixSplit) / 100)} marca`} />
              )}
            </Box>

            {/* ── QUANTITY INPUTS (primary) ── */}
            <Box style={{ border: `1px solid ${accent}33` }}>
              <Label>Cantidades por mes — {PLATFORM_BM[market].label}</Label>
              <div style={{ fontSize: 12, color: "#94a3b8", fontFamily: FONT, marginBottom: 12, lineHeight: 1.6 }}>
                Ingresa las cantidades reales o esperadas.<br />
                La calculadora derivará las tasas automáticamente.
              </div>

              {(isLeads) && <>
                <QtyRow label="Leads captados / mes" hint="leads" value={q.leads}
                  onChange={v => upQty(market, "leads", v)} accent={accent}
                  derivedPct={calc.clicks > 0 ? pct(q.leads, calc.clicks) + " de clicks" : null} />
                <QtyRow label="Conversaciones iniciadas" hint="conv." value={q.conversations}
                  onChange={v => upQty(market, "conversations", v)} accent={accent}
                  derivedPct={calc.leads > 0 ? pct(q.conversations, calc.leads) + " de leads" : null} />
                <QtyRow label="Leads calificados" hint="calific." value={q.qualified}
                  onChange={v => upQty(market, "qualified", v)} accent={accent}
                  derivedPct={calc.leads > 0 ? pct(q.qualified, calc.leads) + " de leads" : null} />
                <QtyRow label="Clientes cerrados" hint="ventas" value={q.closed}
                  onChange={v => upQty(market, "closed", v)} accent={accent}
                  derivedPct={q.qualified > 0 ? pct(q.closed, q.qualified) + " de calific." : null} />
              </>}

              {isVentas && <>
                <QtyRow label="Conversaciones iniciadas" hint="conv." value={q.conversations}
                  onChange={v => upQty(market, "conversations", v)} accent={accent}
                  derivedPct={calc.clicks > 0 ? pct(q.conversations, calc.clicks) + " de clicks" : null} />
                <QtyRow label="Ventas cerradas" hint="ventas" value={q.directSales}
                  onChange={v => upQty(market, "directSales", v)} accent={accent}
                  derivedPct={q.conversations > 0 ? pct(q.directSales, q.conversations) + " de conv." : null} />
              </>}

              {isMarca && <>
                <QtyRow label="Visitas al perfil" hint="visitas" value={q.profileVisits}
                  onChange={v => upQty(market, "profileVisits", v)} accent="#8b5cf6"
                  derivedPct={calc.clicks > 0 ? pct(q.profileVisits, calc.clicks) + " de clicks" : null} />
                <QtyRow label="Seguidores nuevos" hint="seguid." value={q.newFollowers}
                  onChange={v => upQty(market, "newFollowers", v)} accent="#8b5cf6"
                  derivedPct={q.profileVisits > 0 ? pct(q.newFollowers, q.profileVisits) + " de visitas" : null} />
              </>}
            </Box>

            {/* Platform benchmarks (secondary / collapsed) */}
            <Box style={{ padding: 0, overflow: "hidden" }}>
              <button onClick={() => setShowPlatform(!showPlatform)} style={{
                width: "100%", padding: "12px 18px", background: "transparent", border: "none", cursor: "pointer",
                color: "#cbd5e1", display: "flex", justifyContent: "space-between",
                fontSize: 12, fontFamily: FONT_MONO, textTransform: "uppercase", letterSpacing: 1.5
              }}>
                <span>Benchmarks de Plataforma (CPM · CTR)</span>
                <span style={{ color: "#64748b" }}>{showPlatform ? "▲" : "▼"}</span>
              </button>
              {showPlatform && (
                <div style={{ padding: "4px 18px 16px", borderTop: "1px solid #1e293b" }}>
                  {Object.entries(platform).map(([mkt, vals]) => (
                    <div key={mkt} style={{ marginTop: 12 }}>
                      <div style={{ fontSize: 13, color: PLATFORM_BM[mkt].color, fontFamily: FONT_MONO, marginBottom: 8 }}>{PLATFORM_BM[mkt].label}</div>
                      <div style={{ display: "flex", gap: 8 }}>
                        <NInput label="CPM $" value={vals.cpm} onChange={v => upPlatform(mkt, "cpm", v)} prefix="$" accent={PLATFORM_BM[mkt].color} />
                        <NInput label="CTR %" value={vals.ctr} onChange={v => upPlatform(mkt, "ctr", v)} suffix="%" accent={PLATFORM_BM[mkt].color} />
                      </div>
                      <button onClick={() => resetAll(mkt)} style={{ marginTop: 6, fontSize: 12, color: "#94a3b8", background: "none", border: "1px solid #1e293b", borderRadius: 4, padding: "2px 8px", cursor: "pointer", fontFamily: FONT }}>↺ reset todo</button>
                    </div>
                  ))}
                </div>
              )}
            </Box>
          </div>

          {/* ── RIGHT PANEL ── */}
          <div>
            <SectionDivider title="Resultados Clave" icon="📊" />
            {/* ROW 1 — primary KPIs */}
            <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 10, marginBottom: 12 }}>
              <KPI label="Inversión efectiva" value={fmtC(calc.effectiveBudget)}
                sub={objective === "mixta" ? `+ ${fmtC(calc.brandBudget)} marca` : "presupuesto mensual"}
                accent={accent} big />
              {isLeads && <>
                <KPI label="Costo por Lead (CPL)" value={fmtC(calc.cpl)} sub={`${fmt(calc.leads)} leads / mes`} accent={accent} big />
                <KPI label="Costo por Cliente (CPA)" value={fmtC(calc.cpa)} sub={`${fmt(q.closed)} clientes / mes`} accent={accent} big />
              </>}
              {isVentas && <>
                <KPI label="Costo por Conversación" value={fmtC(calc.costPerConv)} sub={`${fmt(q.conversations)} conv. / mes`} accent={accent} big />
                <KPI label="Costo por Venta" value={fmtC(calc.cpa)} sub={`${fmt(q.directSales)} ventas / mes`} accent={accent} big />
              </>}
              {objective === "marca" && <>
                <KPI label="Costo por Visita al Perfil" value={fmtC(calc.costPerVisit)} sub={`${fmt(q.profileVisits)} visitas / mes`} accent={accent} big />
                <KPI label="Costo por Seguidor" value={fmtC(calc.costPerFollow)} sub={`${fmt(q.newFollowers)} seguidores / mes`} accent={accent} big />
              </>}
            </div>

            {/* ROW 2 */}
            <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 10, marginBottom: 16 }}>
              <KPI label="Impresiones / mes" value={fmt(Math.round(calc.impressions))} sub={`CPM $${bm.cpm}`} accent={accent} />
              <KPI label="Clicks / mes" value={fmt(Math.round(calc.clicks))} sub={`CTR ${bm.ctr}%`} accent={accent} />
              {(isLeads || isVentas) && <>
                <KPI label="ROAS" value={calc.roas > 0 ? calc.roas.toFixed(2) + "x" : "—"} sub="retorno sobre inversión" accent={accent} warn={calc.roas > 0 && calc.roas < 1} />
                <KPI label="Ingresos / mes" value={fmtC(calc.revenue)} sub="escenario proyectado" accent={accent} />
              </>}
              {isMarca && <>
                <KPI label="Visitas al perfil" value={fmt(q.profileVisits)} sub={pct(q.profileVisits, calc.clicks) + " de clicks"} accent={accent} purple={objective === "mixta"} />
                <KPI label="Seguidores nuevos" value={fmt(q.newFollowers)} sub={pct(q.newFollowers, q.profileVisits) + " de visitas"} accent={accent} purple={objective === "mixta"} />
              </>}
            </div>

            {/* FUNNEL */}
            <SectionDivider title="Pipeline de Conversión" icon="🔄" />
            <Box>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 12 }}>
                <Label>Detalle del Funnel</Label>
                <div style={{ fontSize: 12, color: "#94a3b8", fontFamily: FONT_MONO }}>cantidad · tasa derivada →</div>
              </div>

              <FunnelRow label="Impresiones" qty={Math.round(calc.impressions)} rate={100} color={accent} isBase />
              <FunnelRow label="Clicks" qty={Math.round(calc.clicks)} rate={bm.ctr} color={accent} rateLabel={`CTR ${bm.ctr}%`} />

              {isLeads && <>
                <FunnelRow label="Leads captados" qty={q.leads} rate={Math.min(calc.leadsRate, 100)} color={accent} rateLabel={pct(q.leads, calc.clicks) + " de clicks"} />
                <FunnelRow label="Conversaciones" qty={q.conversations} rate={Math.min((q.conversations / q.leads) * 100, 100)} color={accent} rateLabel={pct(q.conversations, q.leads) + " de leads"} />
                <FunnelRow label="Calificados" qty={q.qualified} rate={Math.min((q.qualified / q.leads) * 100, 100)} color={accent} rateLabel={pct(q.qualified, q.leads) + " de leads"} />
                <FunnelRow label="Clientes cerrados" qty={q.closed} rate={Math.min((q.closed / q.qualified) * 100, 100)} color={accent} rateLabel={pct(q.closed, q.qualified) + " de calific."} />
              </>}

              {isVentas && <>
                <FunnelRow label="Conversaciones" qty={q.conversations} rate={Math.min(calc.convRate, 100)} color={accent} rateLabel={pct(q.conversations, calc.clicks) + " de clicks"} />
                <FunnelRow label="Ventas cerradas" qty={q.directSales} rate={Math.min((q.directSales / q.conversations) * 100, 100)} color={accent} rateLabel={pct(q.directSales, q.conversations) + " de conv."} />
              </>}

              {isMarca && (
                <div style={{ marginTop: 14, paddingTop: 14, borderTop: "1px solid #1e293b" }}>
                  <div style={{ fontSize: 12, color: "#8b5cf6", fontFamily: FONT_MONO, marginBottom: 8 }}>
                    CAMPAÑA DE MARCA — {fmtC(objective === "marca" ? budget : calc.brandBudget)}
                  </div>
                  <FunnelRow label="Impresiones marca" qty={Math.round(objective === "marca" ? calc.impressions : calc.brandImpressions)} rate={100} color="#8b5cf6" isBase />
                  <FunnelRow label="Visitas al perfil" qty={q.profileVisits} rate={Math.min(calc.visitRate, 100)} color="#8b5cf6" rateLabel={pct(q.profileVisits, calc.clicks) + " de clicks"} />
                  <FunnelRow label="Seguidores nuevos" qty={q.newFollowers} rate={Math.min(calc.followRate, 100)} color="#8b5cf6" rateLabel={pct(q.newFollowers, q.profileVisits) + " de visitas"} />
                </div>
              )}
            </Box>

            {/* CUSTOM METRICS */}
            <SectionDivider title="Métricas Personalizadas" icon="⚙️" />
            <Box>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 14 }}>
                <Label>Métricas Personalizadas</Label>
                <button onClick={addMetric} style={{
                  padding: "5px 12px", borderRadius: 6, cursor: "pointer",
                  background: accent + "22", border: `1px solid ${accent}55`,
                  color: accent, fontSize: 13, fontFamily: FONT_MONO, fontWeight: 700, marginTop: -10
                }}>+ Agregar métrica</button>
              </div>
              {customMetrics.length === 0 ? (
                <div style={{ textAlign: "center", padding: "14px 0", color: "#94a3b8", fontSize: 14, fontStyle: "italic", fontFamily: FONT }}>
                  Agrega métricas propias: mensajes respondidos, llamadas agendadas, no-shows, upsells…
                </div>
              ) : customMetrics.map(m => (
                <CustomMetricRow key={m.id} metric={m} onUpdate={upd => upMetric(m.id, upd)} onDelete={() => delMetric(m.id)} accent={accent} calc={{ ...calc, leads: q.leads }} />
              ))}
            </Box>

            {/* SCENARIOS */}
            <SectionDivider title="Escenarios de Proyección" icon="📈" />
            <Box>
              <Label>Escenarios de Proyección</Label>
              <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 10 }}>
                {[
                  { label: "▼ Pesimista (−40%)", color: "#ef4444", factor: 0.6  },
                  { label: "● Base",             color: accent,    factor: 1.0  },
                  { label: "▲ Optimista (+50%)", color: "#22c55e", factor: 1.5  },
                ].map(({ label, color, factor }) => {
                  const scLeads   = Math.round(q.leads        * factor);
                  const scClosed  = Math.round((isVentas ? q.directSales : q.closed) * factor);
                  const scRevenue = scClosed * ticket;
                  const scVisits  = Math.round(q.profileVisits * factor);
                  const scFollow  = Math.round(q.newFollowers  * factor);
                  const scCpl     = scLeads  > 0 ? calc.effectiveBudget / scLeads  : 0;
                  const scCpa     = scClosed > 0 ? calc.effectiveBudget / scClosed : 0;
                  return (
                    <div key={label} style={{ background: "#020817", border: `1px solid ${color}22`, borderRadius: 10, padding: 14 }}>
                      <div style={{ fontSize: 12, color, fontFamily: FONT_MONO, marginBottom: 10, textTransform: "uppercase", letterSpacing: 1 }}>{label}</div>
                      {isLeads && <>
                        <div style={{ marginBottom: 6 }}>
                          <div style={{ fontSize: 12, color: "#94a3b8", fontFamily: FONT }}>Leads / mes</div>
                          <div style={{ fontSize: 20, color, fontWeight: 700, fontFamily: FONT_MONO }}>{fmt(scLeads)}</div>
                        </div>
                        <div style={{ marginBottom: 6 }}>
                          <div style={{ fontSize: 12, color: "#94a3b8", fontFamily: FONT }}>CPL</div>
                          <div style={{ fontSize: 16, color, fontWeight: 700, fontFamily: FONT_MONO }}>{fmtC(scCpl)}</div>
                        </div>
                      </>}
                      {isMarca && <>
                        <div style={{ marginBottom: 6 }}>
                          <div style={{ fontSize: 12, color: "#94a3b8", fontFamily: FONT }}>Visitas al perfil</div>
                          <div style={{ fontSize: 20, color, fontWeight: 700, fontFamily: FONT_MONO }}>{fmt(scVisits)}</div>
                        </div>
                        <div style={{ marginBottom: 6 }}>
                          <div style={{ fontSize: 12, color: "#94a3b8", fontFamily: FONT }}>Seguidores nuevos</div>
                          <div style={{ fontSize: 20, color, fontWeight: 700, fontFamily: FONT_MONO }}>{fmt(scFollow)}</div>
                        </div>
                      </>}
                      {(isLeads || isVentas) && <>
                        <div style={{ marginBottom: 6 }}>
                          <div style={{ fontSize: 12, color: "#94a3b8", fontFamily: FONT }}>Clientes / mes</div>
                          <div style={{ fontSize: 20, color, fontWeight: 700, fontFamily: FONT_MONO }}>{fmt(scClosed)}</div>
                        </div>
                        <div style={{ marginBottom: 6 }}>
                          <div style={{ fontSize: 12, color: "#94a3b8", fontFamily: FONT }}>CPA</div>
                          <div style={{ fontSize: 16, color, fontWeight: 700, fontFamily: FONT_MONO }}>{fmtC(scCpa)}</div>
                        </div>
                        <div>
                          <div style={{ fontSize: 12, color: "#94a3b8", fontFamily: FONT }}>Ingresos</div>
                          <div style={{ fontSize: 20, color, fontWeight: 700, fontFamily: FONT_MONO }}>{fmtC(scRevenue)}</div>
                        </div>
                      </>}
                    </div>
                  );
                })}
              </div>

              {calc.roas > 0 && calc.roas < 1 && (
                <div style={{ marginTop: 12, padding: "10px 14px", borderRadius: 8, background: "#ef444411", border: "1px solid #ef444433", fontSize: 14, color: "#ef4444", fontFamily: FONT }}>
                  ⚠️ ROAS proyectado menor a 1x. Revisar ticket, cantidades de cierre o presupuesto.
                </div>
              )}
              {calc.roas >= 1 && calc.roas < 2 && (
                <div style={{ marginTop: 12, padding: "10px 14px", borderRadius: 8, background: "#f59e0b11", border: "1px solid #f59e0b33", fontSize: 14, color: "#f59e0b", fontFamily: FONT }}>
                  ⚡ ROAS {calc.roas.toFixed(1)}x. Viable pero con margen ajustado.
                </div>
              )}
              {calc.roas >= 2 && (
                <div style={{ marginTop: 12, padding: "10px 14px", borderRadius: 8, background: "#22c55e11", border: "1px solid #22c55e33", fontSize: 14, color: "#22c55e", fontFamily: FONT }}>
                  ✓ Proyección saludable — ROAS {calc.roas.toFixed(1)}x · cada $1 genera ${calc.roas.toFixed(2)}.
                </div>
              )}
              {objective === "marca" && q.profileVisits > 0 && (
                <div style={{ marginTop: 12, padding: "10px 14px", borderRadius: 8, background: "#8b5cf611", border: "1px solid #8b5cf633", fontSize: 14, color: "#8b5cf6", fontFamily: FONT }}>
                  ✦ Costo por visita al perfil: {fmtC(calc.costPerVisit)} · Costo por seguidor nuevo: {fmtC(calc.costPerFollow)}
                </div>
              )}
            </Box>
          </div>
        </div>
      </div>
    </div>
  );
}
