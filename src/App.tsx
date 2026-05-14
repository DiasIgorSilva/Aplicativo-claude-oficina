import { useState, useEffect, useRef } from "react";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const supabase = createClient(
  "https://bofhihxpqmqimkanwkyw.supabase.co",
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImJvZmhpaHhwcW1xaW1rYW53a3l3Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzUwODQ3OTMsImV4cCI6MjA5MDY2MDc5M30.fOOD-FweGID1x2mlJ3LWImtw7B6m6Pc-8auXLIuCqbw"
);

// ── Tabelas de Taxas (0.79% por parcela) ──────────────────────────────────
const PAYMENT_METHODS: any = {
  "Dinheiro": 0,
  "Pix": 0,
  "Débito": 1.9, // Taxa padrão mercado
  "Crédito 1x": 0.79,
  "Crédito 2x": 1.58,
  "Crédito 3x": 2.37,
  "Crédito 4x": 3.16,
  "Crédito 5x": 3.95,
  "Crédito 6x": 4.74,
  "Crédito 7x": 5.53,
  "Crédito 8x": 6.32,
  "Crédito 9x": 7.11,
  "Crédito 10x": 7.90,
  "Crédito 11x": 8.69,
  "Crédito 12x": 9.48,
  "Múltiplo / Outro": 0
};

// ── Utilitários ───────────────────────────────────────────────────────────
const uid = () => Math.random().toString(36).slice(2, 10);
const fmt = (n: any) => new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(n || 0);
const today = () => new Date().toISOString().slice(0, 10);
const fmtDate = (d: any) => d ? new Date(d + "T12:00:00").toLocaleDateString("pt-BR") : "—";

const STATUS_COLORS: any = { "Aguardando": "#f59e0b", "Em andamento": "#3b82f6", "Pronto": "#10b981", "Entregue": "#6b7280" };
const MONTHS = ["Janeiro", "Fevereiro", "Março", "Abril", "Maio", "Junho", "Julho", "Agosto", "Setembro", "Outubro", "Novembro", "Dezembro"];

// ── Componentes de Seleção ────────────────────────────────────────────────
function BrandSelector({ value, onChange }: any) {
  const CAR_BRANDS = ["Fiat", "Volkswagen", "Chevrolet", "Ford", "Toyota", "Honda", "Hyundai", "Renault", "Jeep", "Nissan"].sort();
  return (
    <div style={{ marginBottom: 10 }}>
      <label className="label">Marca *</label>
      <select className="input" value={value} onChange={e => onChange(e.target.value)}>
        <option value="">Selecione...</option>
        {CAR_BRANDS.map(b => <option key={b} value={b}>{b}</option>)}
      </select>
    </div>
  );
}

function VehicleSelector({ vehicles, value, onChange }: any) {
  const [query, setQuery] = useState("");
  const [open, setOpen] = useState(false);
  const ref = useRef<any>(null);
  const selectedVehicle = vehicles.find((v: any) => v.id === value);
  const displayValue = selectedVehicle ? `${selectedVehicle.plate} — ${selectedVehicle.brand} ${selectedVehicle.model}` : query;
  const filtered = vehicles.filter((v: any) => v.plate.toLowerCase().includes(query.toLowerCase()) || v.model.toLowerCase().includes(query.toLowerCase())).slice(0, 8);
  
  useEffect(() => {
    function handleClick(e: any) { if (ref.current && !ref.current.contains(e.target)) setOpen(false); }
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, []);

  return (
    <div ref={ref} style={{ position: "relative", marginBottom: 15 }}>
      <label className="label">Carro *</label>
      <input className="input" placeholder="Busque pela placa ou modelo..." value={open ? query : displayValue} onFocus={() => { setOpen(true); setQuery(""); }} onChange={e => setQuery(e.target.value)} autoComplete="off" />
      {open && (
        <div style={{ position: "absolute", top: "100%", left: 0, right: 0, zIndex: 250, background: "#1a2030", border: "1px solid #f97316", borderRadius: 8, maxHeight: 200, overflowY: "auto", marginTop: 4, boxShadow: "0 8px 24px rgba(0,0,0,.8)" }}>
          {filtered.map((v: any) => (
            <div key={v.id} onClick={() => { onChange(v.id); setOpen(false); }} style={{ padding: "12px 14px", cursor: "pointer", borderBottom: "1px solid #1e2736" }}>
              <div style={{ fontSize: 13, fontWeight: 700, color: "#f1f5f9" }}>{v.plate}</div>
              <div style={{ fontSize: 11, color: "#64748b" }}>{v.brand} {v.model}</div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

// ── App Principal ─────────────────────────────────────────────────────────
export default function App() {
  const [tab, setTab] = useState("dashboard");
  const [vehicles, setVehicles] = useState<any[]>([]);
  const [services, setServices] = useState<any[]>([]);
  const [expenses, setExpenses] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchAll() {
      setLoading(true);
      const [v, s, e] = await Promise.all([
        supabase.from("vehicles").select("*").order("created_at", { ascending: false }),
        supabase.from("services").select("*").order("created_at", { ascending: false }),
        supabase.from("expenses").select("*").order("expense_date", { ascending: false }),
      ]);
      if (v.data) setVehicles(v.data);
      if (s.data) setServices(s.data);
      if (e.data) setExpenses(e.data);
      setLoading(false);
    }
    fetchAll();
  }, []);

  const tabs = [
    { id: "dashboard", label: "Início", icon: "⬡" },
    { id: "services", label: "Oficina", icon: "🔧" },
    { id: "finance", label: "Financeiro", icon: "💰" },
    { id: "vehicles", label: "Base", icon: "🚗" }
  ];

  return (
    <div style={{ minHeight: "100vh", background: "#0d0f14", color: "#e2e8f0", fontFamily: "'DM Mono', monospace", display: "flex", flexDirection: "column", paddingBottom: 80, width: "100%" }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=DM+Mono:wght@300;400;500&family=Syne:wght@700;800&display=swap');
        *{box-sizing:border-box;margin:0;padding:0;}
        body, html { overflow-x: hidden; width: 100%; position: relative; }
        .card{background:#161b26;border:1px solid #1e2736;border-radius:12px;padding:16px;width:100%;}
        .btn-primary{background:#f97316;color:#0d0f14;border:none;border-radius:8px;padding:10px 18px;font-weight:800;cursor:pointer;font-size:13px;}
        .btn-ghost{background:transparent;color:#94a3b8;border:1px solid #1e2736;border-radius:8px;padding:8px 12px;cursor:pointer;}
        .input{background:#0d0f14;border:1px solid #1e2736;border-radius:8px;padding:10px 12px;color:#e2e8f0;width:100%;font-family:inherit;font-size:13px;}
        .label{display:block;font-size:11px;color:#64748b;margin-bottom:5px;text-transform:uppercase;}
        .badge{display:inline-block;border-radius:20px;padding:2px 8px;font-size:10px;font-weight:600;}
        .kpi-grid{display:grid;grid-template-columns: 1fr 1fr; gap:12px; width: 100%;}
        @media(min-width:768px){.kpi-grid{grid-template-columns:repeat(4,1fr);}}
        .bottom-nav{position:fixed;bottom:0;left:0;right:0;background:#0d0f14;border-top:1px solid #1e2736;z-index:50;padding:10px 0 20px;}
        .nav-item{display:flex;flex-direction:column;align-items:center;gap:4px;flex:1;background:none;border:none;color:#475569;font-size:10px;cursor:pointer;}
        .nav-item.active{color:#f97316;}
        .modal-bg{position:fixed;inset:0;background:rgba(0,0,0,.75);display:flex;align-items:center;justify-content:center;z-index:100;padding:16px;}
        .modal{background:#161b26;border:1px solid #1e2736;border-radius:16px;padding:24px;width:100%;max-width:500px;max-height:90vh;overflow-y:auto;}
        .table-wrap{width: 100%; overflow-x: auto; -webkit-overflow-scrolling: touch; margin-top: 10px;}
        .table-row{padding:14px; border-bottom:1px solid #1e2736; display: grid; align-items: center; min-width: 600px;}
      `}</style>

      <header style={{ padding: "14px 20px", borderBottom: "1px solid #1e2736", display: "flex", alignItems: "center", justifyContent: "space-between", background: "#0d0f14" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <div style={{ width: 32, height: 32, background: "#f97316", borderRadius: 8, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 18 }}>🔩</div>
          <div style={{ fontFamily: "'Syne', sans-serif", fontSize: 18, fontWeight: 800 }}>AutoGestão</div>
        </div>
      </header>

      <main style={{ flex: 1, padding: "16px", width: "100%", maxWidth: 1200, margin: "0 auto" }}>
        {loading ? <div style={{ textAlign: "center", padding: 100 }}>Carregando...</div> : (
          <>
            {tab === "dashboard" && <Dashboard services={services} />}
            {tab === "services" && <Services services={services} setServices={setServices} vehicles={vehicles} />}
            {tab === "finance" && <Finance services={services} expenses={expenses} setExpenses={setExpenses} />}
            {tab === "vehicles" && <Vehicles vehicles={vehicles} setVehicles={setVehicles} services={services} />}
          </>
        )}
      </main>

      <nav className="bottom-nav">
        <div style={{ display: "flex", justifyContent: "space-around" }}>
          {tabs.map(t => (
            <button key={t.id} className={`nav-item ${tab === t.id ? "active" : ""}`} onClick={() => setTab(t.id)}>
              <span style={{ fontSize: 22 }}>{t.icon}</span>{t.label}
            </button>
          ))}
        </div>
      </nav>
    </div>
  );
}

// ── Aba Dashboard ────────────────────────────────────────────────────────
function Dashboard({ services }: any) {
  const active = services.filter((s: any) => s.status !== "Entregue");
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
      <div className="card" style={{ borderLeft: "3px solid #f97316" }}>
        <label className="label">Carros na Oficina agora</label>
        <div style={{ fontSize: 24, fontWeight: 800 }}>{active.length}</div>
      </div>
      {active.map((s: any) => (
        <div key={s.id} className="card" style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <div><div style={{ fontSize: 13, fontWeight: 800 }}>{s.vehicle_plate}</div><div style={{ fontSize: 11, color: "#64748b" }}>{s.description}</div></div>
          <StatusBadge status={s.status} map={STATUS_COLORS} />
        </div>
      ))}
    </div>
  );
}

// ── Aba Oficina (Serviços + Cálculo de Taxa) ──────────────────────────────
function Services({ services, setServices, vehicles }: any) {
  const [modal, setModal] = useState(false);
  const [editing, setEditing] = useState<any>(null);
  const [form, setForm] = useState<any>({});

  const open = (s = null) => { setEditing(s); setForm(s || { status: "Aguardando", entry_date: today(), parts_value: 0, labor_value: 0 }); setModal(true); };
  
  const save = async () => {
    const v = vehicles.find((v: any) => v.id === form.vehicle_id);
    // Cálculo do Líquido
    const bruto = (Number(form.parts_value) || 0) + (Number(form.labor_value) || 0);
    const taxa = PAYMENT_METHODS[form.payment_method] || 0;
    const liquido = bruto - (bruto * (taxa / 100));

    const row = { 
      ...form, 
      id: editing?.id || uid(), 
      vehicle_plate: v?.plate, 
      vehicle_brand: v?.brand, 
      net_value: liquido,
      exit_date: form.status === "Entregue" ? (form.exit_date || today()) : null 
    };
    
    const { data } = await supabase.from("services").upsert(row).select();
    if (data) {
      if (editing) setServices(services.map((s: any) => s.id === editing.id ? data[0] : s));
      else setServices([data[0], ...services]);
    }
    setModal(false);
  };

  return (
    <Section title="Fluxo Oficina" action={<button className="btn-primary" onClick={() => open()}>+ Entrada</button>}>
      {services.filter((s:any)=>s.status !== "Entregue").map((s: any) => (
        <div key={s.id} className="card" style={{ marginBottom: 10, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <div><div style={{ fontSize: 12, fontWeight: 800 }}>{s.vehicle_plate}</div><div style={{ fontSize: 10 }}>{s.description}</div></div>
          <button onClick={() => open(s)} className="btn-ghost">✏️</button>
        </div>
      ))}
      {modal && <div className="modal-bg" onClick={() => setModal(false)}><div className="modal" onClick={e => e.stopPropagation()}>
        <h3>Serviço</h3>
        <VehicleSelector vehicles={vehicles} value={form.vehicle_id} onChange={(v: any) => setForm({ ...form, vehicle_id: v })} />
        <Field label="Descrição" value={form.description} onChange={(v: any) => setForm({ ...form, description: v })} />
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
          <Field label="Peças (R$)" type="number" value={form.parts_value} onChange={(v: any) => setForm({ ...form, parts_value: v })} />
          <Field label="Mão de Obra (R$)" type="number" value={form.labor_value} onChange={(v: any) => setForm({ ...form, labor_value: v })} />
        </div>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
          <SelectField label="Status" value={form.status} onChange={(v: any) => setForm({ ...form, status: v })} options={Object.keys(STATUS_COLORS)} />
          <Field label="KM Atual" type="number" value={form.mileage} onChange={(v: any) => setForm({ ...form, mileage: v })} />
        </div>
        {form.status === "Entregue" && (
          <div style={{ background: "#0d0f14", padding: 15, borderRadius: 10, border: "1px solid #1e2736", marginTop: 10 }}>
            <SelectField label="Pagamento" value={form.payment_method} onChange={(v: any) => setForm({ ...form, payment_method: v })} options={Object.keys(PAYMENT_METHODS)} />
            <Field label="Data Entrega" type="date" value={form.exit_date || today()} onChange={(v: any) => setForm({ ...form, exit_date: v })} />
            <div style={{ fontSize: 11, color: "#10b981", marginTop: 5 }}>
              Valor Cliente: {fmt((Number(form.parts_value)||0)+(Number(form.labor_value)||0))} <br/>
              Líquido Estimado: {fmt(((Number(form.parts_value)||0)+(Number(form.labor_value)||0)) * (1 - (PAYMENT_METHODS[form.payment_method]||0)/100))}
            </div>
          </div>
        )}
        <button className="btn-primary" style={{ width: "100%", marginTop: 15 }} onClick={save}>Salvar</button>
      </div></div>}
    </Section>
  );
}

// ── Aba Financeiro (Lucro e Despesas) ────────────────────────────────────
function Finance({ services, expenses, setExpenses }: any) {
  const [modal, setModal] = useState(false);
  const [form, setForm] = useState<any>({});
  const [selMonth, setSelMonth] = useState(new Date().getMonth());

  const filteredServices = services.filter((s: any) => s.status === "Entregue" && s.exit_date && new Date(s.exit_date + "T12:00:00").getMonth() === selMonth);
  const filteredExpenses = expenses.filter((e: any) => new Date(e.expense_date + "T12:00:00").getMonth() === selMonth);

  const totalEntrada = filteredServices.reduce((acc: any, s: any) => acc + (Number(s.net_value) || 0), 0);
  const totalSaida = filteredExpenses.reduce((acc: any, e: any) => acc + (Number(e.value) || 0), 0);

  const saveExpense = async () => {
    const row = { ...form, id: uid() };
    const { data } = await supabase.from("expenses").insert(row).select();
    if (data) setExpenses([data[0], ...expenses]);
    setModal(false);
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
      <Section title="Financeiro">
        <select className="input" value={selMonth} onChange={e => setSelMonth(Number(e.target.value))}>
          {MONTHS.map((m, i) => <option key={i} value={i}>{m}</option>)}
        </select>
      </Section>

      <div className="kpi-grid">
        <div className="card" style={{ borderLeft: "3px solid #10b981" }}><label className="label">Entradas (Líq)</label><div style={{ fontSize: 16, fontWeight: 800 }}>{fmt(totalEntrada)}</div></div>
        <div className="card" style={{ borderLeft: "3px solid #ef4444" }}><label className="label">Despesas</label><div style={{ fontSize: 16, fontWeight: 800 }}>{fmt(totalSaida)}</div></div>
        <div className="card" style={{ borderLeft: "3px solid #3b82f6", gridColumn: "span 2" }}><label className="label">Resultado / Margem</label><div style={{ fontSize: 18, fontWeight: 800, color: (totalEntrada - totalSaida) >= 0 ? "#10b981" : "#ef4444" }}>{fmt(totalEntrada - totalSaida)}</div></div>
      </div>

      <button className="btn-primary" onClick={() => setModal(true)}>+ Lançar Despesa</button>

      <div className="card">
        <h3 style={{ fontSize: 13, marginBottom: 12 }}>Relatório de Gastos</h3>
        {filteredExpenses.map((e: any) => (
          <div key={e.id} style={{ display: "flex", justifyContent: "space-between", padding: "8px 0", borderBottom: "1px solid #1e2736" }}>
            <div style={{ fontSize: 11 }}><strong>{e.category}</strong><br /><span style={{ color: "#64748b" }}>{e.supplier}</span></div>
            <div style={{ fontSize: 12, fontWeight: 800, color: "#ef4444" }}>-{fmt(e.value)}</div>
          </div>
        ))}
      </div>

      {modal && <div className="modal-bg" onClick={() => setModal(false)}><div className="modal" onClick={e => e.stopPropagation()}>
        <h3>Nova Despesa</h3>
        <Field label="Categoria (Ex: Luz, Aluguel, Peças)" value={form.category} onChange={(v: any) => setForm({ ...form, category: v })} />
        <Field label="Valor (R$)" type="number" value={form.value} onChange={(v: any) => setForm({ ...form, value: v })} />
        <Field label="Fornecedor" value={form.supplier} onChange={(v: any) => setForm({ ...form, supplier: v })} />
        <Field label="Data" type="date" value={form.expense_date || today()} onChange={(v: any) => setForm({ ...form, expense_date: v })} />
        <button className="btn-primary" style={{ width: "100%", marginTop: 15 }} onClick={saveExpense}>Salvar Despesa</button>
      </div></div>}
    </div>
  );
}

// ── Aba Veículos ──────────────────────────────────────────────────────────
function Vehicles({ vehicles, setVehicles, services }: any) {
  const [modal, setModal] = useState(false);
  const [form, setForm] = useState<any>({});
  const open = (v = null) => { setForm(v || {}); setModal(true); };
  const save = async () => {
    const row = { ...form, id: form.id || uid() };
    const { data } = await supabase.from("vehicles").upsert(row).select();
    if (data) {
      if (form.id) setVehicles(vehicles.map((v: any) => v.id === form.id ? data[0] : v));
      else setVehicles([data[0], ...vehicles]);
    }
    setModal(false);
  };
  return (
    <Section title="Base" action={<button className="btn-primary" onClick={() => open()}>+ Novo</button>}>
      {vehicles.map((v: any) => (
        <div key={v.id} className="card" style={{ marginBottom: 10, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <div><div style={{ fontSize: 13, fontWeight: 800 }}>{v.brand} {v.model}</div><div style={{ fontSize: 10, color: "#f97316" }}>{v.plate}</div></div>
          <button onClick={() => open(v)} className="btn-ghost">✏️</button>
        </div>
      ))}
      {modal && <div className="modal-bg" onClick={() => setModal(false)}><div className="modal" onClick={e => e.stopPropagation()}>
        <h3>Veículo</h3>
        <Field label="Placa" value={form.plate} onChange={(v: any) => setForm({ ...form, plate: v.toUpperCase() })} />
        <BrandSelector value={form.brand} onChange={(v: any) => setForm({ ...form, brand: v })} />
        <Field label="Modelo" value={form.model} onChange={(v: any) => setForm({ ...form, model: v })} />
        <button className="btn-primary" style={{ width: "100%", marginTop: 10 }} onClick={save}>Salvar</button>
      </div></div>}
    </Section>
  );
}

// ── Outros Helper Components ──────────────────────────────────────────────
function Section({ title, action, children }: any) { return (<div style={{ display: "flex", flexDirection: "column", gap: 12 }}><div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}><h1 style={{ fontFamily: "'Syne',sans-serif", fontSize: 18, fontWeight: 800 }}>{title}</h1>{action}</div>{children}</div>); }
function StatusBadge({ status, map }: any) { const color = (map || {})[status] || "#6b7280"; return <span className="badge" style={{ background: color + "22", color, border: `1px solid ${color}44` }}>{status || "—"}</span>; }
function Field({ label, value, onChange, type = "text" }: any) { return <div style={{ marginBottom: 10 }}><label className="label">{label}</label><input className="input" type={type} value={value || ""} onChange={e => onChange(e.target.value)} /></div>; }
function SelectField({ label, value, onChange, options }: any) { return <div style={{ marginBottom: 10 }}><label className="label">{label}</label><select className="input" value={value} onChange={e => onChange(e.target.value)}>{options.map((o: any) => <option key={o} value={o}>{o}</option>)}</select></div>; }
