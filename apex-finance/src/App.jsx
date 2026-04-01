import { useState, useContext, createContext, useReducer, useEffect, useRef } from "react";
import { LineChart, Line, BarChart, Bar, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from "recharts";
 
// ─── THEME ───────────────────────────────────────────────────────────────────
const theme = {
  bg: "#080c14",
  bgCard: "#0d1526",
  bgCardHover: "#111d35",
  border: "#1a2744",
  borderLight: "#1e2f52",
  accent: "#3b82f6",
  accentPurple: "#8b5cf6",
  accentGlow: "#60a5fa",
  text: "#f0f6ff",
  textMuted: "#7a8fad",
  textDim: "#4a5d7a",
  green: "#22c55e",
  red: "#ef4444",
  yellow: "#f59e0b",
};
 
// ─── CONTEXT ─────────────────────────────────────────────────────────────────
const AppContext = createContext();
 
const initialState = {
  user: null,
  salary: 8000,
  transactions: [
    { id: 1, type: "income", category: "Salário", description: "Salário Mensal", amount: 8000, date: "2024-01-05" },
    { id: 2, type: "expense", category: "Contas Fixas", description: "Aluguel", amount: 2200, date: "2024-01-10" },
    { id: 3, type: "expense", category: "Alimentação", description: "Supermercado", amount: 650, date: "2024-01-12" },
    { id: 4, type: "expense", category: "Transporte", description: "Combustível", amount: 280, date: "2024-01-15" },
    { id: 5, type: "expense", category: "Lazer", description: "Cinema + Jantar", amount: 320, date: "2024-01-18" },
    { id: 6, type: "expense", category: "Saúde", description: "Plano de Saúde", amount: 450, date: "2024-01-20" },
    { id: 7, type: "income", category: "Freelance", description: "Projeto React", amount: 2500, date: "2024-01-22" },
    { id: 8, type: "expense", category: "Investimentos", description: "Tesouro Direto", amount: 1000, date: "2024-01-25" },
    { id: 9, type: "expense", category: "Outros", description: "Amazon", amount: 180, date: "2024-01-28" },
  ],
  categoryLimits: {
    Alimentação: 800, Transporte: 400, Lazer: 500,
    "Contas Fixas": 3000, Investimentos: 1500, Saúde: 600, Outros: 300,
  },
  savingGoal: 1500,
  notes: "",
};
 
function reducer(state, action) {
  switch (action.type) {
    case "LOGIN": return { ...state, user: action.payload };
    case "LOGOUT": return { ...state, user: null };
    case "ADD_TRANSACTION": return { ...state, transactions: [...state.transactions, { ...action.payload, id: Date.now() }] };
    case "DELETE_TRANSACTION": return { ...state, transactions: state.transactions.filter(t => t.id !== action.payload) };
    case "EDIT_TRANSACTION": return { ...state, transactions: state.transactions.map(t => t.id === action.payload.id ? action.payload : t) };
    case "SET_SALARY": return { ...state, salary: action.payload };
    case "SET_LIMIT": return { ...state, categoryLimits: { ...state.categoryLimits, [action.payload.cat]: action.payload.val } };
    case "SET_GOAL": return { ...state, savingGoal: action.payload };
    case "SET_NOTES": return { ...state, notes: action.payload };
    default: return state;
  }
}
 
function AppProvider({ children }) {
  const saved = localStorage.getItem("apexState");
  const [state, dispatch] = useReducer(reducer, saved ? { ...initialState, ...JSON.parse(saved) } : initialState);
  useEffect(() => { localStorage.setItem("apexState", JSON.stringify(state)); }, [state]);
  return <AppContext.Provider value={{ state, dispatch }}>{children}</AppContext.Provider>;
}
 
const useApp = () => useContext(AppContext);
 
// ─── HELPERS ─────────────────────────────────────────────────────────────────
const fmt = (n) => new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(n);
const categories = ["Alimentação", "Transporte", "Lazer", "Contas Fixas", "Investimentos", "Saúde", "Outros", "Salário", "Freelance", "Outros"];
const COLORS = ["#3b82f6","#8b5cf6","#22c55e","#f59e0b","#ef4444","#06b6d4","#ec4899","#a3e635"];
 
// ─── SHARED STYLES ────────────────────────────────────────────────────────────
const card = {
  background: theme.bgCard,
  border: `1px solid ${theme.border}`,
  borderRadius: 16,
  padding: "1.80rem 1.5rem",
};
 
// ─── GLOW STYLES ─────────────────────────────────────────────────────────────
const glowStyle = `
  .apex-glow { box-shadow: 0 0 40px rgba(59,130,246,0.12), 0 0 80px rgba(139,92,246,0.06); }
  .apex-glow-sm { box-shadow: 0 0 20px rgba(59,130,246,0.15); }
  .apex-btn { transition: all 0.2s; cursor: pointer; }
  .apex-btn:hover { opacity: 0.85; transform: translateY(-1px); }
  .apex-link { transition: color 0.2s; cursor: pointer; }
  .apex-link:hover { color: #60a5fa !important; }
  .apex-input { transition: border-color 0.2s; }
  .apex-input:focus { outline: none; border-color: #3b82f6 !important; box-shadow: 0 0 0 3px rgba(59,130,246,0.15); }
  .apex-row:hover { background: #111d35 !important; }
  .apex-nav:hover { background: rgba(59,130,246,0.1) !important; color: #93c5fd !important; }
  .apex-nav.active { background: rgba(59,130,246,0.15) !important; color: #60a5fa !important; border-left: 10px solid #3b82f6; }
  ::-webkit-scrollbar { width: 4px; } ::-webkit-scrollbar-track { background: transparent; } ::-webkit-scrollbar-thumb { background: #1e2f52; border-radius: 100px; }
`;
 
// ─── ICONS (inline SVG) ───────────────────────────────────────────────────────
const Icon = ({ name, size = 18, color = "currentColor" }) => {
  const paths = {
    dashboard: "M3 9l9-7 9 7v11a2 2 0 01-2 2H5a2 2 0 01-2-2z M9 22V12h6v10",
    transactions: "M8 6h13M8 12h13M8 18h13M3 6h.01M3 12h.01M3 18h.01",
    chart: "M18 20V10M12 20V4M6 20v-6",
    target: "M12 22c5.52 0 10-4.48 10-10S17.52 2 12 2 2 6.48 2 12s4.48 10 10 10z M12 18c3.31 0 6-2.69 6-6s-2.69-6-6-6-6 2.69-6 6 2.69 6 6 6z M12 14c1.1 0 2-.9 2-2s-.9-2-2-2-2 .9-2 2 .9 2 2 2z",
    calculator: "M5 3h14a2 2 0 012 2v14a2 2 0 01-2 2H5a2 2 0 01-2-2V5a2 2 0 012-2z M8 7h2M14 7h2M8 11h2M14 11h2M8 15h2M14 15h2",
    note: "M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z M14 2v6h6 M16 13H8M16 17H8M10 9H8",
    settings: "M12 15a3 3 0 100-6 3 3 0 000 6z M19.4 15a1.65 1.65 0 00.33 1.82l.06.06a2 2 0 010 2.83 2 2 0 01-2.83 0l-.06-.06a1.65 1.65 0 00-1.82-.33 1.65 1.65 0 00-1 1.51V21a2 2 0 01-4 0v-.09A1.65 1.65 0 009 19.4a1.65 1.65 0 00-1.82.33l-.06.06a2 2 0 01-2.83 0 2 2 0 010-2.83l.06-.06A1.65 1.65 0 004.68 15a1.65 1.65 0 00-1.51-1H3a2 2 0 010-4h.09A1.65 1.65 0 004.6 9a1.65 1.65 0 00-.33-1.82l-.06-.06a2 2 0 010-2.83 2 2 0 012.83 0l.06.06A1.65 1.65 0 009 4.68a1.65 1.65 0 001-1.51V3a2 2 0 014 0v.09a1.65 1.65 0 001 1.51 1.65 1.65 0 001.82-.33l.06-.06a2 2 0 012.83 0 2 2 0 010 2.83l-.06.06A1.65 1.65 0 0019.4 9a1.65 1.65 0 001.51 1H21a2 2 0 010 4h-.09a1.65 1.65 0 00-1.51 1z",
    logout: "M9 21H5a2 2 0 01-2-2V5a2 2 0 012-2h4 M16 17l5-5-5-5 M21 12H9",
    plus: "M12 5v14M5 12h14",
    bell: "M18 8A6 6 0 006 8c0 7-3 9-3 9h18s-3-2-3-9 M13.73 21a2 2 0 01-3.46 0",
    search: "M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0",
    trend_up: "M23 6l-9.5 9.5-5-5L1 18 M17 6h6v6",
    trend_down: "M23 18l-9.5-9.5-5 5L1 6 M17 18h6v-6",
    trash: "M3 6h18 M19 6l-1 14a2 2 0 01-2 2H8a2 2 0 01-2-2L5 6 M10 11v6M14 11v6 M9 6V4h6v2",
    edit: "M11 4H4a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2v-7 M18.5 2.5a2.121 2.121 0 013 3L12 15l-4 1 1-4 9.5-9.5z",
    menu: "M3 12h18M3 6h18M3 18h18",
    x: "M18 6L6 18M6 6l12 12",
    wallet: "M21 12V7H5a2 2 0 010-4h14v4 M3 5v14a2 2 0 002 2h16v-5 M18 12h.01",
    arrow_up: "M12 19V5M5 12l7-7 7 7",
    arrow_down: "M12 5v14M5 12l7 7 7-7",
    lightbulb: "M9 21h6M12 3a6 6 0 016 6c0 2.22-1.21 4.16-3 5.2V17H9v-2.8A6 6 0 016 9a6 6 0 016-6z",
    alert: "M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z M12 9v4M12 17h.01",
    eye: "M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z M12 9a3 3 0 100 6 3 3 0 000-6z",
    eye_off: "M17.94 17.94A10.07 10.07 0 0112 20c-7 0-11-8-11-8a18.45 18.45 0 015.06-5.94 M9.9 4.24A9.12 9.12 0 0112 4c7 0 11 8 11 8a18.5 18.5 0 01-2.16 3.19 M1 1l22 22",
    check: "M20 6L9 17l-5-5",
  };
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      {(paths[name] || "").split(" M").map((d, i) => (
        <path key={i} d={i === 0 ? d : "M" + d} />
      ))}
    </svg>
  );
};
 
// ─── LOGIN ────────────────────────────────────────────────────────────────────
function Login() {
  const { dispatch } = useApp();
  const [tab, setTab] = useState("login");
  const [form, setForm] = useState({ name: "", email: "", password: "" });
  const [showPw, setShowPw] = useState(false);
  const [error, setError] = useState("");
 
  const handle = () => {
    if (!form.email || !form.password) { setError("Preencha todos os campos."); return; }
    if (tab === "register" && !form.name) { setError("Informe seu nome."); return; }
    dispatch({ type: "LOGIN", payload: { name: form.name || form.email.split("@")[0], email: form.email } });
  };
 
  return (
    <div style={{ minHeight: "100vh", background: theme.bg, display: "flex", alignItems: "center", justifyContent: "center", fontFamily: "system-ui,sans-serif", padding: 16 }}>
      <style>{glowStyle}</style>
      <div style={{ position: "fixed", top: "20%", left: "50%", transform: "translateX(-50%)", width: 600, height: 300, background: "radial-gradient(ellipse at center, rgba(59,130,246,0.08) 0%, transparent 70%)", pointerEvents: "none" }} />
      <div className="apex-glow" style={{ ...card, width: "100%", maxWidth: 420, position: "relative" }}>
        <div style={{ textAlign: "center", marginBottom: 32 }}>
          <div style={{ display: "inline-flex", alignItems: "center", gap: 10, marginBottom: 8 }}>
            <div style={{ width: 36, height: 36, borderRadius: 10, background: "linear-gradient(135deg,#3b82f6,#8b5cf6)", display: "flex", alignItems: "center", justifyContent: "center" }}>
              <Icon name="wallet" size={18} color="#fff" />
            </div>
            <span style={{ fontSize: 22, fontWeight: 700, color: theme.text, letterSpacing: "-0.5px" }}>Finance</span>
          </div>
          <p style={{ color: theme.textMuted, fontSize: 14, margin: 0 }}>Controle financeiro premium</p>
        </div>
 
        <div style={{ display: "flex", background: "#060a12", borderRadius: 10, padding: 4, marginBottom: 24 }}>
          {["login","register"].map(t => (
            <button key={t} className="apex-btn" onClick={() => { setTab(t); setError(""); }}
              style={{ flex: 1, padding: "8px 0", borderRadius: 8, border: "none", cursor: "pointer", fontSize: 14, fontWeight: 500,
                background: tab === t ? "linear-gradient(135deg,#3b82f6,#8b5cf6)" : "transparent",
                color: tab === t ? "#fff" : theme.textMuted }}>
              {t === "login" ? "Entrar" : "Cadastrar"}
            </button>
          ))}
        </div>
 
        {tab === "register" && (
          <div style={{ marginBottom: 14 }}>
            <label style={{ color: theme.textMuted, fontSize: 13, display: "block", marginBottom: 6 }}>Nome</label>
            <input className="apex-input" value={form.name} onChange={e => setForm({ ...form, name: e.target.value })}
              placeholder="Seu nome completo"
              style={{ width: "100%", background: "#060a12", border: `1px solid ${theme.border}`, borderRadius: 10, padding: "11px 14px", color: theme.text, fontSize: 15, boxSizing: "border-box" }} />
          </div>
        )}
 
        <div style={{ marginBottom: 14 }}>
          <label style={{ color: theme.textMuted, fontSize: 13, display: "block", marginBottom: 6 }}>E-mail</label>
          <input className="apex-input" type="email" value={form.email} onChange={e => setForm({ ...form, email: e.target.value })}
            placeholder="seu@email.com"
            style={{ width: "100%", background: "#060a12", border: `1px solid ${theme.border}`, borderRadius: 10, padding: "11px 14px", color: theme.text, fontSize: 15, boxSizing: "border-box" }} />
        </div>
 
        <div style={{ marginBottom: 24, position: "relative" }}>
          <label style={{ color: theme.textMuted, fontSize: 13, display: "block", marginBottom: 6 }}>Senha</label>
          <input className="apex-input" type={showPw ? "text" : "password"} value={form.password} onChange={e => setForm({ ...form, password: e.target.value })}
            onKeyDown={e => e.key === "Enter" && handle()}
            placeholder="••••••••"
            style={{ width: "100%", background: "#060a12", border: `1px solid ${theme.border}`, borderRadius: 10, padding: "11px 40px 11px 14px", color: theme.text, fontSize: 15, boxSizing: "border-box" }} />
          <button onClick={() => setShowPw(!showPw)} style={{ position: "absolute", right: 12, bottom: 11, background: "none", border: "none", cursor: "pointer", color: theme.textMuted }}>
            <Icon name={showPw ? "eye_off" : "eye"} size={16} />
          </button>
        </div>
 
        {error && <p style={{ color: theme.red, fontSize: 13, marginBottom: 14, textAlign: "center" }}>{error}</p>}
 
        <button className="apex-btn" onClick={handle}
          style={{ width: "100%", padding: "13px 0", borderRadius: 12, border: "none", cursor: "pointer", fontSize: 15, fontWeight: 600, color: "#fff", background: "linear-gradient(135deg,#3b82f6,#8b5cf6)" }}>
          {tab === "login" ? "Entrar na plataforma" : "Criar conta"}
        </button>
 
        <p style={{ color: theme.textDim, fontSize: 12, textAlign: "center", marginTop: 16 }}>
          Demo: qualquer e-mail e senha funcionam
        </p>
      </div>
    </div>
  );
}
 
// ─── SIDEBAR ──────────────────────────────────────────────────────────────────
const navItems = [
  { id: "dashboard", icon: "dashboard", label: "Dashboard" },
  { id: "transactions", icon: "transactions", label: "Transações" },
  { id: "charts", icon: "chart", label: "Gráficos" },
  { id: "planning", icon: "target", label: "Planejamento" },
  { id: "simulator", icon: "calculator", label: "Simulador" },
  { id: "notes", icon: "note", label: "Anotações" },
];
 
function Sidebar({ page, setPage, collapsed, setCollapsed }) {
  const { state, dispatch } = useApp();
  return (
    <aside style={{ width: collapsed ? 68 : 220, background: theme.bgCard, borderRight: `1px solid ${theme.border}`, display: "flex", flexDirection: "column", transition: "width 0.25s", overflow: "hidden", flexShrink: 0 }}>
      <div style={{ padding: collapsed ? "20px 14px" : "20px 20px", display: "flex", alignItems: "center", gap: 10, borderBottom: `1px solid ${theme.border}`, marginBottom: 8 }}>
        <div style={{ width: 32, height: 32, borderRadius: 9, background: "linear-gradient(135deg,#3b82f6,#8b5cf6)", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
          <Icon name="wallet" size={16} color="#fff" />
        </div>
        {!collapsed && <span style={{ fontSize: 16, fontWeight: 700, color: theme.text, whiteSpace: "nowrap", letterSpacing: "-0.3px" }}>Apex Finance</span>}
      </div>
 
      <nav style={{ flex: 1, padding: "8px 10px" }}>
        {navItems.map(item => (
          <button key={item.id} className={`apex-nav ${page === item.id ? "active" : ""}`}
            onClick={() => setPage(item.id)}
            style={{ width: "100%", display: "flex", alignItems: "center", gap: 12, padding: "10px 12px", borderRadius: 10, border: "none", cursor: "pointer", background: "transparent", color: page === item.id ? theme.accentGlow : theme.textMuted, marginBottom: 2, textAlign: "left", whiteSpace: "nowrap", borderLeft: "2px solid transparent" }}>
            <span style={{ flexShrink: 0 }}><Icon name={item.icon} size={18} color="currentColor" /></span>
            {!collapsed && <span style={{ fontSize: 14, fontWeight: page === item.id ? 600 : 400 }}>{item.label}</span>}
          </button>
        ))}
      </nav>
 
      <div style={{ padding: "10px 10px 20px" }}>
        <button className="apex-nav" onClick={() => dispatch({ type: "LOGOUT" })}
          style={{ width: "100%", display: "flex", alignItems: "center", gap: 12, padding: "10px 12px", borderRadius: 10, border: "none", cursor: "pointer", background: "transparent", color: theme.textMuted, textAlign: "left", whiteSpace: "nowrap" }}>
          <Icon name="logout" size={18} color="currentColor" />
          {!collapsed && <span style={{ fontSize: 14 }}>Sair</span>}
        </button>
        <button className="apex-nav" onClick={() => setCollapsed(!collapsed)}
          style={{ width: "100%", display: "flex", alignItems: "center", justifyContent: collapsed ? "center" : "flex-end", padding: "8px 12px", borderRadius: 10, border: "none", cursor: "pointer", background: "transparent", color: theme.textDim, marginTop: 4 }}>
          <Icon name={collapsed ? "menu" : "x"} size={16} color="currentColor" />
        </button>
      </div>
    </aside>
  );
}
 
// ─── HEADER ───────────────────────────────────────────────────────────────────
function Header({ page, searchQ, setSearchQ }) {
  const { state } = useApp();
  const titles = { dashboard: "Dashboard", transactions: "Transações", charts: "Gráficos & Análises", planning: "Planejamento Financeiro", simulator: "Simulador de Investimentos", notes: "Anotações Financeiras" };
  const initials = (state.user?.name || "U").split(" ").map(w => w[0]).join("").slice(0, 2).toUpperCase();
  return (
    <header style={{ height: 64, borderBottom: `1px solid ${theme.border}`, display: "flex", alignItems: "center", padding: "0 24px", gap: 16, flexShrink: 0, background: theme.bg }}>
      <div style={{ flex: 1 }}>
        <h1 style={{ margin: 0, fontSize: 18, fontWeight: 700, color: theme.text }}>{titles[page]}</h1>
      </div>
      <div style={{ display: "flex", alignItems: "center", gap: 10, background: theme.bgCard, border: `1px solid ${theme.border}`, borderRadius: 10, padding: "8px 14px", width: 220 }}>
        <Icon name="search" size={15} color={theme.textDim} />
        <input value={searchQ} onChange={e => setSearchQ(e.target.value)} placeholder="Buscar..."
          style={{ background: "none", border: "none", outline: "none", color: theme.text, fontSize: 14, width: "100%" }} />
      </div>
      <div style={{ position: "relative", cursor: "pointer" }}>
        <Icon name="bell" size={20} color={theme.textMuted} />
        <span style={{ position: "absolute", top: -2, right: -2, width: 8, height: 8, borderRadius: "50%", background: theme.accentPurple }} />
      </div>
      <div style={{ width: 36, height: 36, borderRadius: "50%", background: "linear-gradient(135deg,#3b82f6,#8b5cf6)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 13, fontWeight: 700, color: "#fff", cursor: "pointer" }}>
        {initials}
      </div>
    </header>
  );
}
 
// ─── STAT CARD ────────────────────────────────────────────────────────────────
function StatCard({ label, value, change, icon, accent, sub }) {
  const positive = change >= 0;
  return (
    <div className="apex-glow-sm" style={{ ...card, transition: "all 0.2s", cursor: "default" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 14 }}>
        <div style={{ width: 40, height: 40, borderRadius: 11, background: `${accent}20`, display: "flex", alignItems: "center", justifyContent: "center" }}>
          <Icon name={icon} size={20} color={accent} />
        </div>
        {change !== undefined && (
          <div style={{ display: "flex", alignItems: "center", gap: 4, padding: "4px 9px", borderRadius: 20, background: positive ? "rgba(34,197,94,0.1)" : "rgba(239,68,68,0.1)", color: positive ? theme.green : theme.red, fontSize: 12, fontWeight: 600 }}>
            <Icon name={positive ? "trend_up" : "trend_down"} size={13} color="currentColor" />
            {Math.abs(change)}%
          </div>
        )}
      </div>
      <div style={{ fontSize: 22, fontWeight: 700, color: theme.text, marginBottom: 4 }}>{value}</div>
      <div style={{ fontSize: 13, color: theme.textMuted }}>{label}</div>
      {sub && <div style={{ fontSize: 12, color: theme.textDim, marginTop: 4 }}>{sub}</div>}
    </div>
  );
}
 
// ─── PROGRESS BAR ─────────────────────────────────────────────────────────────
function ProgressBar({ pct, color }) {
  return (
    <div style={{ height: 6, background: "#0d1a2e", borderRadius: 99, overflow: "hidden" }}>
      <div style={{ width: `${Math.min(pct, 100)}%`, height: "100%", background: color, borderRadius: 99, transition: "width 0.5s" }} />
    </div>
  );
}
 
// ─── DASHBOARD ────────────────────────────────────────────────────────────────
function Dashboard() {
  const { state } = useApp();
  const income = state.transactions.filter(t => t.type === "income").reduce((s, t) => s + t.amount, 0);
  const expenses = state.transactions.filter(t => t.type === "expense").reduce((s, t) => s + t.amount, 0);
  const balance = income - expenses;
  const available = income - expenses - state.savingGoal;
  const spentPct = Math.round((expenses / state.salary) * 100);
 
  const byCategory = {};
  state.transactions.filter(t => t.type === "expense").forEach(t => {
    byCategory[t.category] = (byCategory[t.category] || 0) + t.amount;
  });
 
  const insights = [];
  Object.entries(byCategory).forEach(([cat, amt]) => {
    const limit = state.categoryLimits[cat];
    if (limit && amt > limit) insights.push({ type: "alert", msg: `${cat}: ${Math.round(((amt - limit) / limit) * 100)}% acima do limite (${fmt(amt)} / ${fmt(limit)})` });
  });
  if (spentPct > 80) insights.push({ type: "warn", msg: `Você já gastou ${spentPct}% do seu salário este mês.` });
  if (balance > 0) insights.push({ type: "ok", msg: `Saldo positivo de ${fmt(balance)}. Ótimo controle!` });
 
  return (
    <div>
      {/* glow top */}
      <div style={{ position: "absolute", top: 0, left: "50%", transform: "translateX(-50%)", width: "80%", height: 2, background: "linear-gradient(90deg,transparent,#3b82f6,#8b5cf6,transparent)", borderRadius: 99 }} />
 
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(200px,1fr))", gap: 16, marginBottom: 24 }}>
        <StatCard label="Saldo Atual" value={fmt(balance)} change={10} icon="wallet" accent={theme.accent} />
        <StatCard label="Receitas do Mês" value={fmt(income)} change={12} icon="arrow_up" accent={theme.green} />
        <StatCard label="Despesas do Mês" value={fmt(expenses)} change={-5} icon="arrow_down" accent={theme.red} />
        <StatCard label="Disponível p/ Invest." value={fmt(Math.max(available, 0))} change={2} icon="trend_up" accent={theme.accentPurple} />
      </div>
 
      <div style={{ display: "grid", gridTemplateColumns: "2fr 1fr", gap: 16, marginBottom: 24 }}>
        {/* spending gauge */}
        <div style={card}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20 }}>
            <span style={{ color: theme.text, fontWeight: 600 }}>Uso do Orçamento Mensal</span>
            <span style={{ color: spentPct > 80 ? theme.red : theme.green, fontWeight: 700, fontSize: 20 }}>{spentPct}%</span>
          </div>
          <ProgressBar pct={spentPct} color={spentPct > 80 ? theme.red : spentPct > 60 ? theme.yellow : theme.green} />
          <div style={{ display: "flex", justifyContent: "space-between", marginTop: 10, fontSize: 12, color: theme.textDim }}>
            <span>R$ 0</span>
            <span>Salário: {fmt(state.salary)}</span>
          </div>
 
          <div style={{ marginTop: 24 }}>
            <div style={{ color: theme.textMuted, fontSize: 13, marginBottom: 12, fontWeight: 600 }}>Por Categoria</div>
            {Object.entries(byCategory).slice(0, 5).map(([cat, amt], i) => {
              const limit = state.categoryLimits[cat] || expenses;
              const p = Math.round((amt / limit) * 100);
              return (
                <div key={cat} style={{ marginBottom: 12 }}>
                  <div style={{ display: "flex", justifyContent: "space-between", fontSize: 13, marginBottom: 5 }}>
                    <span style={{ color: theme.textMuted }}>{cat}</span>
                    <span style={{ color: p > 100 ? theme.red : theme.text }}>{fmt(amt)}</span>
                  </div>
                  <ProgressBar pct={p} color={p > 100 ? theme.red : COLORS[i % COLORS.length]} />
                </div>
              );
            })}
          </div>
        </div>
 
        {/* insights */}
        <div style={card}>
          <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 16 }}>
            <Icon name="lightbulb" size={18} color={theme.yellow} />
            <span style={{ color: theme.text, fontWeight: 600 }}>Insights</span>
          </div>
          {insights.length === 0 && <p style={{ color: theme.textDim, fontSize: 13 }}>Sem alertas no momento.</p>}
          {insights.map((ins, i) => (
            <div key={i} style={{ display: "flex", gap: 10, marginBottom: 12, padding: "10px 12px", borderRadius: 10, background: ins.type === "alert" ? "rgba(239,68,68,0.08)" : ins.type === "warn" ? "rgba(245,158,11,0.08)" : "rgba(34,197,94,0.08)", border: `1px solid ${ins.type === "alert" ? "rgba(239,68,68,0.2)" : ins.type === "warn" ? "rgba(245,158,11,0.2)" : "rgba(34,197,94,0.2)"}` }}>
              <Icon name={ins.type === "ok" ? "check" : "alert"} size={15} color={ins.type === "alert" ? theme.red : ins.type === "warn" ? theme.yellow : theme.green} />
              <span style={{ fontSize: 12, color: theme.textMuted, lineHeight: 1.5 }}>{ins.msg}</span>
            </div>
          ))}
          <div style={{ marginTop: 16, padding: "12px", borderRadius: 10, background: "rgba(59,130,246,0.08)", border: "1px solid rgba(59,130,246,0.2)" }}>
            <div style={{ fontSize: 12, color: theme.textMuted, marginBottom: 4 }}>Meta de Economia</div>
            <div style={{ fontSize: 18, fontWeight: 700, color: theme.accent }}>{fmt(state.savingGoal)}/mês</div>
            <div style={{ fontSize: 11, color: theme.textDim, marginTop: 4 }}>
              {balance >= state.savingGoal ? "✓ Meta atingida" : `Faltam ${fmt(state.savingGoal - balance)}`}
            </div>
          </div>
        </div>
      </div>
 
      {/* recent transactions */}
      <div style={card}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
          <span style={{ color: theme.text, fontWeight: 600 }}>Transações Recentes</span>
          <span style={{ color: theme.accent, fontSize: 13, cursor: "pointer" }}>Ver todas →</span>
        </div>
        {state.transactions.slice(-5).reverse().map(t => (
          <div key={t.id} className="apex-row" style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "10px 12px", borderRadius: 10, transition: "background 0.15s" }}>
            <div style={{ display: "flex", gap: 12, alignItems: "center" }}>
              <div style={{ width: 36, height: 36, borderRadius: 10, background: t.type === "income" ? "rgba(34,197,94,0.12)" : "rgba(239,68,68,0.12)", display: "flex", alignItems: "center", justifyContent: "center" }}>
                <Icon name={t.type === "income" ? "arrow_up" : "arrow_down"} size={16} color={t.type === "income" ? theme.green : theme.red} />
              </div>
              <div>
                <div style={{ fontSize: 14, color: theme.text, fontWeight: 500 }}>{t.description}</div>
                <div style={{ fontSize: 12, color: theme.textDim }}>{t.category} · {t.date}</div>
              </div>
            </div>
            <span style={{ fontWeight: 700, color: t.type === "income" ? theme.green : theme.red }}>
              {t.type === "income" ? "+" : "-"}{fmt(t.amount)}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}
 
// ─── TRANSACTIONS ─────────────────────────────────────────────────────────────
function Transactions({ searchQ }) {
  const { state, dispatch } = useApp();
  const [filter, setFilter] = useState({ type: "all", cat: "all" });
  const [form, setForm] = useState({ type: "expense", category: "Alimentação", description: "", amount: "", date: new Date().toISOString().split("T")[0] });
  const [editing, setEditing] = useState(null);
 
  const filtered = state.transactions.filter(t => {
    if (filter.type !== "all" && t.type !== filter.type) return false;
    if (filter.cat !== "all" && t.category !== filter.cat) return false;
    if (searchQ && !t.description.toLowerCase().includes(searchQ.toLowerCase())) return false;
    return true;
  }).reverse();
 
  const save = () => {
    if (!form.description || !form.amount) return;
    if (editing) {
      dispatch({ type: "EDIT_TRANSACTION", payload: { ...editing, ...form, amount: parseFloat(form.amount) } });
      setEditing(null);
    } else {
      dispatch({ type: "ADD_TRANSACTION", payload: { ...form, amount: parseFloat(form.amount) } });
    }
    setForm({ type: "expense", category: "Alimentação", description: "", amount: "", date: new Date().toISOString().split("T")[0] });
  };
 
  const startEdit = (t) => { setEditing(t); setForm({ ...t, amount: String(t.amount) }); };
 
  const inputSt = { background: "#060a12", border: `1px solid ${theme.border}`, borderRadius: 10, padding: "10px 12px", color: theme.text, fontSize: 14, width: "100%", boxSizing: "border-box" };
 
  return (
    <div style={{ display: "grid", gridTemplateColumns: "340px 1fr", gap: 16 }}>
      {/* form */}
      <div style={card}>
        <h3 style={{ margin: "0 0 18px", color: theme.text, fontSize: 16, fontWeight: 600 }}>{editing ? "Editar Transação" : "Nova Transação"}</h3>
 
        <div style={{ display: "flex", background: "#060a12", borderRadius: 10, padding: 3, marginBottom: 14 }}>
          {["expense","income"].map(t => (
            <button key={t} onClick={() => setForm({ ...form, type: t })} className="apex-btn"
              style={{ flex: 1, padding: "8px 0", borderRadius: 8, border: "none", cursor: "pointer", fontSize: 13, fontWeight: 500,
                background: form.type === t ? (t === "income" ? "rgba(34,197,94,0.2)" : "rgba(239,68,68,0.2)") : "transparent",
                color: form.type === t ? (t === "income" ? theme.green : theme.red) : theme.textMuted }}>
              {t === "income" ? "Receita" : "Despesa"}
            </button>
          ))}
        </div>
 
        {[
          { label: "Descrição", key: "description", placeholder: "Ex: Supermercado" },
          { label: "Valor (R$)", key: "amount", placeholder: "0,00", type: "number" },
          { label: "Data", key: "date", type: "date" },
        ].map(f => (
          <div key={f.key} style={{ marginBottom: 12 }}>
            <label style={{ color: theme.textMuted, fontSize: 12, display: "block", marginBottom: 5 }}>{f.label}</label>
            <input className="apex-input" type={f.type || "text"} placeholder={f.placeholder} value={form[f.key]}
              onChange={e => setForm({ ...form, [f.key]: e.target.value })}
              style={inputSt} />
          </div>
        ))}
 
        <div style={{ marginBottom: 18 }}>
          <label style={{ color: theme.textMuted, fontSize: 12, display: "block", marginBottom: 5 }}>Categoria</label>
          <select className="apex-input" value={form.category} onChange={e => setForm({ ...form, category: e.target.value })}
            style={{ ...inputSt }}>
            {categories.map(c => <option key={c} value={c}>{c}</option>)}
          </select>
        </div>
 
        <button className="apex-btn" onClick={save}
          style={{ width: "100%", padding: "12px 0", borderRadius: 10, border: "none", cursor: "pointer", fontSize: 14, fontWeight: 600, color: "#fff", background: "linear-gradient(135deg,#3b82f6,#8b5cf6)" }}>
          {editing ? "Salvar Edição" : "+ Adicionar Transação"}
        </button>
        {editing && (
          <button className="apex-btn" onClick={() => { setEditing(null); setForm({ type: "expense", category: "Alimentação", description: "", amount: "", date: new Date().toISOString().split("T")[0] }); }}
            style={{ width: "100%", padding: "10px 0", borderRadius: 10, border: `1px solid ${theme.border}`, cursor: "pointer", fontSize: 14, color: theme.textMuted, background: "transparent", marginTop: 8 }}>
            Cancelar
          </button>
        )}
      </div>
 
      {/* list */}
      <div style={card}>
        <div style={{ display: "flex", gap: 10, marginBottom: 18, flexWrap: "wrap" }}>
          {["all","income","expense"].map(t => (
            <button key={t} onClick={() => setFilter({ ...filter, type: t })} className="apex-btn"
              style={{ padding: "6px 14px", borderRadius: 20, border: `1px solid ${filter.type === t ? theme.accent : theme.border}`, background: filter.type === t ? "rgba(59,130,246,0.12)" : "transparent", color: filter.type === t ? theme.accent : theme.textMuted, fontSize: 13, cursor: "pointer" }}>
              {t === "all" ? "Todas" : t === "income" ? "Receitas" : "Despesas"}
            </button>
          ))}
          <select value={filter.cat} onChange={e => setFilter({ ...filter, cat: e.target.value })}
            style={{ padding: "6px 10px", borderRadius: 20, border: `1px solid ${theme.border}`, background: theme.bgCard, color: theme.textMuted, fontSize: 13, cursor: "pointer" }}>
            <option value="all">Todas categorias</option>
            {categories.map(c => <option key={c} value={c}>{c}</option>)}
          </select>
        </div>
 
        {filtered.length === 0 && <p style={{ color: theme.textDim, textAlign: "center", padding: "32px 0" }}>Nenhuma transação encontrada.</p>}
        {filtered.map(t => (
          <div key={t.id} className="apex-row" style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "12px 10px", borderRadius: 10, borderBottom: `1px solid ${theme.border}`, transition: "background 0.15s" }}>
            <div style={{ display: "flex", gap: 12, alignItems: "center" }}>
              <div style={{ width: 38, height: 38, borderRadius: 10, background: t.type === "income" ? "rgba(34,197,94,0.12)" : "rgba(239,68,68,0.12)", display: "flex", alignItems: "center", justifyContent: "center" }}>
                <Icon name={t.type === "income" ? "arrow_up" : "arrow_down"} size={17} color={t.type === "income" ? theme.green : theme.red} />
              </div>
              <div>
                <div style={{ fontSize: 14, color: theme.text, fontWeight: 500 }}>{t.description}</div>
                <div style={{ fontSize: 12, color: theme.textDim }}>{t.category} · {t.date}</div>
              </div>
            </div>
            <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
              <span style={{ fontWeight: 700, fontSize: 15, color: t.type === "income" ? theme.green : theme.red }}>
                {t.type === "income" ? "+" : "-"}{fmt(t.amount)}
              </span>
              <div style={{ display: "flex", gap: 6 }}>
                <button onClick={() => startEdit(t)} style={{ background: "none", border: "none", cursor: "pointer", color: theme.textDim, padding: 4 }}><Icon name="edit" size={15} /></button>
                <button onClick={() => dispatch({ type: "DELETE_TRANSACTION", payload: t.id })} style={{ background: "none", border: "none", cursor: "pointer", color: theme.red, padding: 4, opacity: 0.7 }}><Icon name="trash" size={15} /></button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
 
// ─── CHARTS ───────────────────────────────────────────────────────────────────
const TooltipStyle = { background: theme.bgCard, border: `1px solid ${theme.border}`, borderRadius: 10, color: theme.text, fontSize: 13 };
 
function Charts() {
  const { state } = useApp();
 
  const byCategory = {};
  state.transactions.filter(t => t.type === "expense").forEach(t => {
    byCategory[t.category] = (byCategory[t.category] || 0) + t.amount;
  });
  const pieData = Object.entries(byCategory).map(([name, value]) => ({ name, value }));
 
  const monthlyData = [
    { name: "Out", receitas: 7500, despesas: 5200 },
    { name: "Nov", receitas: 8200, despesas: 6100 },
    { name: "Dez", receitas: 9500, despesas: 7800 },
    { name: "Jan", receitas: state.transactions.filter(t => t.type === "income").reduce((s, t) => s + t.amount, 0), despesas: state.transactions.filter(t => t.type === "expense").reduce((s, t) => s + t.amount, 0) },
  ];
 
  const lineData = monthlyData.map((d, i) => ({ ...d, saldo: d.receitas - d.despesas }));
 
  return (
    <div style={{ display: "grid", gap: 16 }}>
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
        <div style={card}>
          <h3 style={{ margin: "0 0 20px", color: theme.text, fontSize: 15, fontWeight: 600 }}>Gastos por Categoria</h3>
          <ResponsiveContainer width="100%" height={260}>
            <PieChart>
              <Pie data={pieData} cx="50%" cy="50%" innerRadius={60} outerRadius={100} dataKey="value" paddingAngle={3}>
                {pieData.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
              </Pie>
              <Tooltip contentStyle={TooltipStyle} formatter={v => fmt(v)} />
              <Legend iconSize={10} formatter={v => <span style={{ color: theme.textMuted, fontSize: 12 }}>{v}</span>} />
            </PieChart>
          </ResponsiveContainer>
        </div>
 
        <div style={card}>
          <h3 style={{ margin: "0 0 20px", color: theme.text, fontSize: 15, fontWeight: 600 }}>Evolução do Saldo</h3>
          <ResponsiveContainer width="100%" height={260}>
            <LineChart data={lineData}>
              <CartesianGrid strokeDasharray="3 3" stroke={theme.border} />
              <XAxis dataKey="name" tick={{ fill: theme.textDim, fontSize: 12 }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fill: theme.textDim, fontSize: 12 }} axisLine={false} tickLine={false} tickFormatter={v => `R$${(v/1000).toFixed(0)}k`} />
              <Tooltip contentStyle={TooltipStyle} formatter={v => fmt(v)} />
              <Line type="monotone" dataKey="saldo" stroke={theme.accent} strokeWidth={2.5} dot={{ fill: theme.accent, r: 4 }} />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>
 
      <div style={card}>
        <h3 style={{ margin: "0 0 20px", color: theme.text, fontSize: 15, fontWeight: 600 }}>Receitas vs Despesas (últimos 4 meses)</h3>
        <ResponsiveContainer width="100%" height={240}>
          <BarChart data={monthlyData} barGap={6}>
            <CartesianGrid strokeDasharray="3 3" stroke={theme.border} />
            <XAxis dataKey="name" tick={{ fill: theme.textDim, fontSize: 12 }} axisLine={false} tickLine={false} />
            <YAxis tick={{ fill: theme.textDim, fontSize: 12 }} axisLine={false} tickLine={false} tickFormatter={v => `R$${(v/1000).toFixed(0)}k`} />
            <Tooltip contentStyle={TooltipStyle} formatter={v => fmt(v)} />
            <Legend formatter={v => <span style={{ color: theme.textMuted, fontSize: 12 }}>{v === "receitas" ? "Receitas" : "Despesas"}</span>} />
            <Bar dataKey="receitas" fill={theme.green} radius={[6,6,0,0]} name="receitas" />
            <Bar dataKey="despesas" fill={theme.red} radius={[6,6,0,0]} name="despesas" />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
 
// ─── PLANNING ─────────────────────────────────────────────────────────────────
function Planning() {
  const { state, dispatch } = useApp();
  const [salary, setSalary] = useState(state.salary);
  const [goal, setGoal] = useState(state.savingGoal);
  const [limits, setLimits] = useState({ ...state.categoryLimits });
 
  const save = () => {
    dispatch({ type: "SET_SALARY", payload: parseFloat(salary) });
    dispatch({ type: "SET_GOAL", payload: parseFloat(goal) });
    Object.entries(limits).forEach(([cat, val]) => dispatch({ type: "SET_LIMIT", payload: { cat, val: parseFloat(val) } }));
  };
 
  const inputSt = { background: "#060a12", border: `1px solid ${theme.border}`, borderRadius: 10, padding: "10px 12px", color: theme.text, fontSize: 14, width: "100%", boxSizing: "border-box" };
 
  return (
    <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
      <div style={card}>
        <h3 style={{ margin: "0 0 20px", color: theme.text, fontSize: 16, fontWeight: 600 }}>Configuração Geral</h3>
        <div style={{ marginBottom: 14 }}>
          <label style={{ color: theme.textMuted, fontSize: 13, display: "block", marginBottom: 6 }}>Salário Mensal (R$)</label>
          <input className="apex-input" type="number" value={salary} onChange={e => setSalary(e.target.value)} style={inputSt} />
        </div>
        <div style={{ marginBottom: 24 }}>
          <label style={{ color: theme.textMuted, fontSize: 13, display: "block", marginBottom: 6 }}>Meta de Economia Mensal (R$)</label>
          <input className="apex-input" type="number" value={goal} onChange={e => setGoal(e.target.value)} style={inputSt} />
        </div>
 
        <h3 style={{ margin: "0 0 16px", color: theme.text, fontSize: 15, fontWeight: 600 }}>Limites por Categoria</h3>
        {Object.keys(limits).map(cat => (
          <div key={cat} style={{ marginBottom: 12 }}>
            <label style={{ color: theme.textMuted, fontSize: 12, display: "block", marginBottom: 5 }}>{cat} (R$)</label>
            <input className="apex-input" type="number" value={limits[cat]} onChange={e => setLimits({ ...limits, [cat]: e.target.value })} style={inputSt} />
          </div>
        ))}
 
        <button className="apex-btn" onClick={save}
          style={{ width: "100%", padding: "12px 0", borderRadius: 10, border: "none", cursor: "pointer", fontSize: 14, fontWeight: 600, color: "#fff", background: "linear-gradient(135deg,#3b82f6,#8b5cf6)", marginTop: 8 }}>
          Salvar Planejamento
        </button>
      </div>
 
      <div style={card}>
        <h3 style={{ margin: "0 0 20px", color: theme.text, fontSize: 16, fontWeight: 600 }}>Resumo do Planejamento</h3>
        <div style={{ display: "grid", gap: 12 }}>
          {[
            { label: "Salário", val: fmt(state.salary), color: theme.green },
            { label: "Meta de Economia", val: fmt(state.savingGoal), color: theme.accent },
            { label: "Orçamento p/ Gastos", val: fmt(state.salary - state.savingGoal), color: theme.yellow },
          ].map(item => (
            <div key={item.label} style={{ display: "flex", justifyContent: "space-between", padding: "12px 16px", borderRadius: 10, background: "#060a12", border: `1px solid ${theme.border}` }}>
              <span style={{ color: theme.textMuted, fontSize: 14 }}>{item.label}</span>
              <span style={{ color: item.color, fontWeight: 700, fontSize: 15 }}>{item.val}</span>
            </div>
          ))}
        </div>
 
        <div style={{ marginTop: 24 }}>
          <div style={{ color: theme.textMuted, fontSize: 13, marginBottom: 14, fontWeight: 600 }}>Limites vs Gastos Atuais</div>
          {Object.entries(state.categoryLimits).map(([cat, limit]) => {
            const spent = state.transactions.filter(t => t.type === "expense" && t.category === cat).reduce((s, t) => s + t.amount, 0);
            const pct = Math.round((spent / limit) * 100);
            return (
              <div key={cat} style={{ marginBottom: 14 }}>
                <div style={{ display: "flex", justifyContent: "space-between", fontSize: 12, marginBottom: 5 }}>
                  <span style={{ color: theme.textMuted }}>{cat}</span>
                  <span style={{ color: pct > 100 ? theme.red : theme.textDim }}>{fmt(spent)} / {fmt(limit)}</span>
                </div>
                <ProgressBar pct={pct} color={pct > 100 ? theme.red : pct > 80 ? theme.yellow : theme.green} />
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
 
// ─── SIMULATOR ────────────────────────────────────────────────────────────────
function Simulator() {
  const [vals, setVals] = useState({ initial: 10000, monthly: 500, rate: 1, months: 24 });
  const v = vals;
  const r = v.rate / 100;
  const future = v.initial * Math.pow(1 + r, v.months) + v.monthly * ((Math.pow(1 + r, v.months) - 1) / r);
  const invested = v.initial + v.monthly * v.months;
  const profit = future - invested;
 
  const chartData = Array.from({ length: v.months + 1 }, (_, i) => ({
    mes: i,
    valor: Math.round(v.initial * Math.pow(1 + r, i) + v.monthly * ((Math.pow(1 + r, i) - 1) / r)),
    investido: Math.round(v.initial + v.monthly * i),
  }));
 
  const field = (label, key, min, max, step, suffix = "") => (
    <div style={{ marginBottom: 18 }}>
      <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 8 }}>
        <label style={{ color: theme.textMuted, fontSize: 13 }}>{label}</label>
        <span style={{ color: theme.text, fontWeight: 600, fontSize: 14 }}>{key === "rate" ? `${v[key]}%` : key === "months" ? `${v[key]} meses` : fmt(v[key])}</span>
      </div>
      <input type="range" min={min} max={max} step={step} value={v[key]}
        onChange={e => setVals({ ...v, [key]: parseFloat(e.target.value) })}
        style={{ width: "100%", accentColor: theme.accent }} />
    </div>
  );
 
  return (
    <div style={{ display: "grid", gridTemplateColumns: "340px 1fr", gap: 16 }}>
      <div style={card}>
        <h3 style={{ margin: "0 0 24px", color: theme.text, fontSize: 16, fontWeight: 600 }}>Parâmetros</h3>
        {field("Valor Inicial", "initial", 0, 100000, 500)}
        {field("Aporte Mensal", "monthly", 0, 10000, 100)}
        {field("Taxa Mensal (%)", "rate", 0.1, 5, 0.1)}
        {field("Período (meses)", "months", 1, 120, 1)}
 
        <div style={{ marginTop: 24, padding: "16px", borderRadius: 12, background: "linear-gradient(135deg,rgba(59,130,246,0.1),rgba(139,92,246,0.1))", border: `1px solid ${theme.borderLight}` }}>
          <div style={{ fontSize: 13, color: theme.textMuted, marginBottom: 6 }}>Valor Final Estimado</div>
          <div style={{ fontSize: 28, fontWeight: 800, color: theme.accent, marginBottom: 4 }}>{fmt(future)}</div>
          <div style={{ fontSize: 13, color: theme.green }}>+{fmt(profit)} em juros ({Math.round((profit / invested) * 100)}%)</div>
        </div>
      </div>
 
      <div style={card}>
        <h3 style={{ margin: "0 0 8px", color: theme.text, fontSize: 15, fontWeight: 600 }}>Projeção de Crescimento</h3>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 10, marginBottom: 20 }}>
          {[
            { label: "Total Investido", val: fmt(invested), color: theme.accent },
            { label: "Rendimento", val: fmt(profit), color: theme.green },
            { label: "Valor Final", val: fmt(future), color: theme.accentPurple },
          ].map(item => (
            <div key={item.label} style={{ padding: "12px 14px", borderRadius: 10, background: "#060a12", border: `1px solid ${theme.border}`, textAlign: "center" }}>
              <div style={{ fontSize: 11, color: theme.textDim, marginBottom: 4 }}>{item.label}</div>
              <div style={{ fontSize: 15, fontWeight: 700, color: item.color }}>{item.val}</div>
            </div>
          ))}
        </div>
        <ResponsiveContainer width="100%" height={260}>
          <LineChart data={chartData.filter((_, i) => i % Math.max(1, Math.floor(v.months / 20)) === 0 || i === v.months)}>
            <CartesianGrid strokeDasharray="3 3" stroke={theme.border} />
            <XAxis dataKey="mes" tick={{ fill: theme.textDim, fontSize: 11 }} axisLine={false} tickLine={false} tickFormatter={v => `M${v}`} />
            <YAxis tick={{ fill: theme.textDim, fontSize: 11 }} axisLine={false} tickLine={false} tickFormatter={v => `R$${(v/1000).toFixed(0)}k`} />
            <Tooltip contentStyle={TooltipStyle} formatter={v => fmt(v)} labelFormatter={l => `Mês ${l}`} />
            <Legend formatter={v => <span style={{ color: theme.textMuted, fontSize: 12 }}>{v === "valor" ? "Valor Acumulado" : "Total Investido"}</span>} />
            <Line type="monotone" dataKey="valor" stroke={theme.accent} strokeWidth={2.5} dot={false} name="valor" />
            <Line type="monotone" dataKey="investido" stroke={theme.accentPurple} strokeWidth={2} strokeDasharray="5 5" dot={false} name="investido" />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
 
// ─── NOTES ────────────────────────────────────────────────────────────────────
function Notes() {
  const { state, dispatch } = useApp();
  const [text, setText] = useState(state.notes);
  return (
    <div style={{ maxWidth: 720 }}>
      <div style={card}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
          <h3 style={{ margin: 0, color: theme.text, fontSize: 16, fontWeight: 600 }}>Anotações Financeiras — {new Date().toLocaleDateString("pt-BR", { month: "long", year: "numeric" })}</h3>
          <button className="apex-btn" onClick={() => dispatch({ type: "SET_NOTES", payload: text })}
            style={{ padding: "8px 18px", borderRadius: 10, border: "none", cursor: "pointer", fontSize: 13, fontWeight: 600, color: "#fff", background: "linear-gradient(135deg,#3b82f6,#8b5cf6)" }}>
            Salvar
          </button>
        </div>
        <textarea value={text} onChange={e => setText(e.target.value)}
          placeholder="Escreva suas metas, reflexões e anotações financeiras do mês aqui..."
          style={{ width: "100%", minHeight: 320, background: "#060a12", border: `1px solid ${theme.border}`, borderRadius: 12, padding: "16px", color: theme.text, fontSize: 15, resize: "vertical", boxSizing: "border-box", lineHeight: 1.7, fontFamily: "inherit", outline: "none" }} />
        <p style={{ color: theme.textDim, fontSize: 12, margin: "10px 0 0" }}>
          {text.length} caracteres · Salvo automaticamente no navegador
        </p>
      </div>
    </div>
  );
}
 
// ─── MAIN APP ─────────────────────────────────────────────────────────────────
function AppShell() {
  const { state } = useApp();
  const [page, setPage] = useState("dashboard");
  const [collapsed, setCollapsed] = useState(false);
  const [searchQ, setSearchQ] = useState("");
 
  if (!state.user) return <Login />;
 
  const pages = { dashboard: Dashboard, transactions: Transactions, charts: Charts, planning: Planning, simulator: Simulator, notes: Notes };
  const Page = pages[page] || Dashboard;
 
  return (
    <div style={{ display: "flex", height: "100vh", background: theme.bg, fontFamily: "system-ui,-apple-system,sans-serif", color: theme.text, overflow: "hidden" }}>
      <style>{glowStyle}</style>
      <Sidebar page={page} setPage={setPage} collapsed={collapsed} setCollapsed={setCollapsed} />
      <div style={{ flex: 1, display: "flex", flexDirection: "column", overflow: "hidden" }}>
        <Header page={page} searchQ={searchQ} setSearchQ={setSearchQ} />
        <main style={{ flex: 1, overflow: "auto", padding: 24, position: "relative" }}>
          <Page searchQ={searchQ} />
        </main>
      </div>
    </div>
  );
}
 
export default function App() {
  return (
    <AppProvider>
      <AppShell />
    </AppProvider>
  );
}