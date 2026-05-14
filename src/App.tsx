import { useState, useEffect, useRef } from "react";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const supabase = createClient(
  "https://bofhihxpqmqimkanwkyw.supabase.co",
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImJvZmhpaHhwcW1xaW1rYW53a3l3Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzUwODQ3OTMsImV4cCI6MjA5MDY2MDc5M30.fOOD-FweGID1x2mlJ3LWImtw7B6m6Pc-8auXLIuCqbw"
);

// ── UTILITÁRIOS E CONSTANTES ──────────────────────────────────────────────
const PAYMENT_METHODS: any = {
  "Dinheiro": 0, "Pix": 0, "Débito": 1.9,
  "Crédito 1x": 0.79, "Crédito 2x": 1.58, "Crédito 3x": 2.37, "Crédito 4x": 3.16,
  "Crédito 5x": 3.95, "Crédito 6x": 4.74, "Crédito 7x": 5.53, "Crédito 8x": 6.32,
  "Crédito 9x": 7.11, "Crédito 10x": 7.90, "Crédito 11x": 8.69, "Crédito 12x": 9.48,
  "Múltiplo / Outro": 0
};

const uid = () => Math.random().toString(36).slice(2, 10);
const fmt = (n: any) => new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(n || 0);
const fmtKm = (n: any) => n ? n.toLocaleString("pt-BR") + " km" : "—";
const today = () => new Date().toISOString().slice(0, 10);
const fmtDate = (d: any) => d ? new Date(d + "T12:00:00").toLocaleDateString("pt-BR") : "—";

const STATUS_COLORS: any = { "Aguardando": "#f59e0b", "Em andamento": "#3b82f6", "Pronto": "#10b981", "Entregue": "#6b7280" };
const MONTHS = ["Janeiro", "Fevereiro", "Março", "Abril", "Maio", "Junho", "Julho", "Agosto", "Setembro", "Outubro", "Novembro", "Dezembro"];
const CAR_BRANDS = ["Audi", "BMW", "BYD", "Chevrolet", "Citroën", "Ferrari", "Fiat", "Ford", "GWM", "Honda", "Hyundai", "JAC", "Jaguar", "Jeep", "Kia", "Land Rover", "Mercedes-Benz", "Mitsubishi", "Nissan", "Peugeot", "Porsche", "RAM", "Renault", "Toyota", "Volkswagen", "Volvo"].sort();

// ── MAPEAMENTO DE DADOS (IMPEDE A PERDA DOS DADOS ANTIGOS) ───────────────
const mapV = (r: any) => ({
  id: r.id, plate: r.plate, brand: r.brand, model: r.model, year: r.year, 
  color: r.color, owner: r.owner, phone: r.phone, notes: r.notes, 
  mileage: r.mileage || 0, createdAt: r.created_at
});

const mapS = (r: any) => ({
  id: r.id, vehicleId: r.vehicle_id, vehiclePlate: r.vehicle_plate, 
  vehicleBrand: r.vehicle_brand, vehicleModel: r.vehicle_model, 
  description: r.description, partsValue: r.parts_value || 0, 
  laborValue: r.labor_value || 0, netValue: r.net_value || 0,
  status: r.status, entryDate: r.entry_date, exitDate: r.exit_date, 
  paymentMethod: r.payment_method, mileage: r.mileage || 0, createdAt: r.created_at
});

// ── COMPONENTES DE SELEÇÃO E BUSCA ────────────────────────────────────────
function BrandSelector({ value, onChange }: any) {
  const [query, setQuery] = useState(value || "");
  const [open, setOpen] = useState(false);
  const ref = useRef<any>(null);
  const filtered = CAR_BRANDS.filter(b => b.toLowerCase().includes(query.toLowerCase()));
  
  useEffect(() => { setQuery(value || ""); }, [value]);
  useEffect(() => {
    function handleClick(e: any) { if (ref.current && !ref.current.contains(e.target)) setOpen(false); }
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, []);

  return (
    <div ref={ref} style={{ position: "relative", marginBottom: 10 }}>
      <label className="label">Marca *</label>
      <input className="input" placeholder="Digite a marca..." value={query} onFocus={() => setOpen(true)} 
        onChange={e => { setQuery(e.target.value); onChange(e.target.value); setOpen(true); }} autoComplete="off" />
      {open && filtered.length > 0 && (
        <div style={{ position: "absolute", top: "100%", left: 0, right: 0, zIndex: 200, background: "#1a2030", border: "1px solid #2d3748", borderRadius: 8, maxHeight: 150, overflowY: "auto", marginTop: 4, boxShadow: "0 8px 24px rgba(0,0,0,.5)" }}>
          {filtered.map(b => <div key={b} onClick={() => { onChange(b); setQuery(b); setOpen(false); }} style={{ padding: "10px 14px", fontSize: 13, cursor: "pointer", color: value === b ? "#f97316" : "#e2e8f0", borderBottom: "1px solid #1e2736" }}>{b}</div>)}
        </div>
      )}
    </div>
  );
}

function VehicleSelector({ vehicles, value, onChange }: any) {
  const [query, setQuery] = useState("");
  const [open, setOpen] = useState(false);
  const ref = useRef<any>(null);
  const selectedVehicle = vehicles.find((v: any) => v.id === value);
  const displayValue = selectedVehicle ? `${selectedVehicle.plate} — ${selectedVehicle.brand} ${selectedVehicle.model}` : query;
  const filtered = vehicles.filter((v: any) => (v.plate||"").toLowerCase().includes(query.toLowerCase()) || (v.model||"").toLowerCase().includes(query.toLowerCase())).slice(0, 8);
  
  useEffect(() => {
    function handleClick(e: any) { if (ref.current && !ref.current.contains(e.target)) setOpen(false); }
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, []);

  return (
    <div ref={ref} style={{ position: "relative", marginBottom: 15 }}>
      <label className="label">Carro *</label>
      <input className="input" placeholder="Busque placa ou modelo..." value={open ? query : displayValue} onFocus={() => { setOpen(true); setQuery(""); }} onChange={e => setQuery(e.target.value)} autoComplete="off" />
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

// ── GERADOR DE PDF ────────────────────────────────────────────────────────
function generatePDF(vehicles: any, services: any, dateFrom: any, dateTo: any) {
  const fS = services.filter((s: any) => s.status === "Entregue" && s.exitDate && s.exitDate >= dateFrom && s.exitDate <= dateTo);
  const tP = fS.reduce((s: any, sv: any) => s + (Number(sv.partsValue) || 0), 0);
  const tL = fS.reduce((s: any, sv: any) => s + (Number(sv.laborValue) || 0), 0);
  
  const html = `<!DOCTYPE html><html lang="pt-BR"><head><meta charset="UTF-8"/><title>Relatório Oficina</title><style>
    *{box-sizing:border-box;margin:0;padding:0;}
    body{font-family:Arial,sans-serif;font-size:12px;color:#1e293b;padding:40px;background:#fff;}
    .hdr{display:flex;justify-content:space-between;margin-bottom:30px;border-bottom:3px solid #f97316;padding-bottom:15px;}
    .resumo{display:grid;grid-template-columns:repeat(3,1fr);gap:15px;margin-bottom:30px;}
    .card-res{border:1px solid #e2e8f0;padding:15px;border-radius:8px;}
    table{width:100%;border-collapse:collapse;}
    th{background:#f8fafc;padding:10px;text-align:left;border-bottom:2px solid #e2e8f0;font-size:10px;text-transform:uppercase;}
    td{padding:10px;border-bottom:1px solid #f1f5f9;}
    .no-print{background:#f97316;color:white;padding:15px;text-align:center;font-weight:bold;cursor:pointer;margin-bottom:20px;border-radius:8px;border:none;width:100%;font-size:16px;}
    @media print{.no-print{display:none;}body{padding:0;}}
  </style></head><body>
    <button class="no-print" onclick="window.print()">CLIQUE AQUI PARA SALVAR COMO PDF / IMPRIMIR</button>
    <div class="hdr"><div><strong style="font-size:22px;">AutoGestão</strong><br/>Relatório Financeiro</div><div style="text-align:right">Período: ${fmtDate(dateFrom)} a ${fmtDate(dateTo)}</div></div>
    <div class="resumo"><div class="card-res">Peças:<br/><strong>${fmt(tP)}</strong></div><div class="card-res">Mão de Obra:<br/><strong>${fmt(tL)}</strong></div><div class="card-res" style="border-color:#f97316">Total Real:<br/><strong>${fmt(tP+tL)}</strong></div></div>
    <table><thead><tr><th>Entrega</th><th>Veículo</th><th>KM</th><th>Descrição</th><th>Total</th></tr></thead><tbody>
    ${fS.map((s: any) => `<tr><td>${fmtDate(s.exitDate)}</td><td><strong>${s.vehiclePlate}</strong><br/>${s.vehicleBrand}</td><td>${fmtKm(s.mileage)}</td><td>${s.description}</td><td><strong>${fmt((Number(s.laborValue)||0)+(Number(s.partsValue)||0))}</strong></td></tr>`).join('')}
    </tbody></table>
    <script>window.onload=()=>setTimeout(()=>window.print(), 500);</script>
  </body></html>`;

  const blob = new Blob([html], { type: "text/html" });
  window.open(URL.createObjectURL(blob), "_blank");
}

// ── APP PRINCIPAL ─────────────────────────────────────────────────────────
export default function App() {
  const [tab, setTab] = useState("dashboard");
  const [vehicles, setVehicles] = useState<any[]>([]);
  const [services, setServices] = useState<any[]>([]);
  const [expenses, setExpenses] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showReport, setShowReport] = useState(false);

  useEffect(() => {
    async function load() {
      setLoading(true);
      const [v, s, e] = await Promise.all([
        supabase.from("vehicles").select("*").order("created_at", { ascending: false }),
        supabase.from("services").select("*").order("created_at", { ascending: false }),
        supabase.from("expenses").select("*").order("expense_date", { ascending: false })
      ]);
      if (v.data) setVehicles(v.data.map(mapV));
      if (s.data) setServices(s.data.map(mapS));
      if (e.data) setExpenses(e.data);
      setLoading(false);
    }
    load();
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
        .btn-history{background:rgba(59,130,246,0.1);color:#3b82f6;border:1px solid #3b82f6;border-radius:6px;padding:4px 8px;font-size:10px;font-weight:700;cursor:pointer;margin-bottom:6px;display:inline-block;}
        .input{background:#0d0f14;border:1px solid #1e2736;border-radius:8px;padding:10px 12px;color:#e2e8f0;width:100%;font-family:inherit;font-size:13px;}
        .label{display:block;font-size:11px;color:#64748b;margin-bottom:5px;text-transform:uppercase;}
        .badge{display:inline-block;border-radius:20px;padding:2px 8px;font-size:10px;font-weight:600;}
        .kpi-grid{display:grid;grid-template-columns: 1fr 1fr; gap:12px; width: 100%;}
        @media(min-width:768px){.kpi-grid{grid-template-columns:repeat(4,1fr);}}
        .bottom-nav{position:fixed;bottom:0;left:0;right:0;background:#0d0f14;border-top:1px solid #1e2736;z-index:50;padding:10px 0 20px; display:flex; justify-content:space-around;}
        .nav-item{display:flex;flex-direction:column;align-items:center;gap:4px;flex:1;background:none;border:none;color:#475569;font-size:10px;cursor:pointer;}
        .nav-item.active{color:#f97316;}
        .table-wrap{width: 100%; overflow-x: auto; -webkit-overflow-scrolling: touch; margin-top: 10px;}
        .table-header, .table-row { min-width: 650px; display: grid; align-items: center; }
        .table-header{padding:10px 14px;font-size:10px;color:#475569;text-transform:uppercase;border-bottom:1px solid #1e2736;}
        .table-row{padding:14px; border-bottom:1px solid #1e2736;}
        .modal-bg{position:fixed;inset:0;background:rgba(0,0,0,.75);display:flex;align-items:center;justify-content:center;z-index:100;padding:16px;}
        .modal{background:#161b26;border:1px solid #1e2736;border-radius:16px;padding:24px;width:100%;max-width:500px;max-height:90vh;overflow-y:auto;}
      `}</style>

      <header style={{ padding: "14px 20px", borderBottom: "1px solid #1e2736", display: "flex", alignItems: "center", justifyContent: "space-between", background: "#0d0f14" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <div style={{ width: 32, height: 32, background: "#f97316", borderRadius: 8, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 18 }}>🔩</div>
          <div style={{ fontFamily: "'Syne', sans-serif", fontSize: 18, fontWeight: 800 }}>AutoGestão</div>
        </div>
        <button className="btn-primary" onClick={() => setShowReport(true)} style={{ width: "auto" }}>📄 PDF</button>
      </header>

      <main style={{ flex: 1, padding: "16px", width: "100%", maxWidth: 1200, margin: "0 auto" }}>
        {loading ? <div style={{ textAlign: "center", padding: 100 }}>Sincronizando...</div> : (
          <>
            {tab === "dashboard" && <Dashboard services={services} />}
            {tab === "services" && <Services services={services} setServices={setServices} vehicles={vehicles} />}
            {tab === "finance" && <Finance services={services} expenses={expenses} setExpenses={setExpenses} />}
            {tab === "vehicles" && <Vehicles vehicles={vehicles} setVehicles={setVehicles} services={services} />}
          </>
        )}
      </main>

      <nav className="bottom-nav">
        {tabs.map(t => (
          <button key={t.id} className={`nav-item ${tab === t.id ? "active" : ""}`} onClick={() => setTab(t.id)}>
            <span style={{ fontSize: 22 }}>{t.icon}</span>{t.label}
          </button>
        ))}
      </nav>

      {showReport && <ReportModal services={services} onClose={() => setShowReport(false)} onGenerate={(f:any, t:any) => { generatePDF(vehicles, services, f, t); setShowReport(false); }} />}
    </div>
  );
}

// ── ABA INÍCIO (DASHBOARD COM MÊS) ────────────────────────────────────────
function Dashboard({ services }: any) {
  const [selMonth, setSelMonth] = useState(new Date().getMonth());
  const [selYear, setSelYear] = useState(new Date().getFullYear());

  const active = services.filter((s: any) => s.status !== "Entregue");
  const filtered = services.filter((s: any) => {
    if (s.status !== "Entregue" || !s.exitDate) return false;
    const d = new Date(s.exitDate + "T12:00:00");
    return d.getMonth() === selMonth && d.getFullYear() === selYear;
  });

  const tP = filtered.reduce((acc: any, s: any) => acc + (Number(s.partsValue) || 0), 0);
  const tL = filtered.reduce((acc: any, s: any) => acc + (Number(s.laborValue) || 0), 0);

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
      <div className="card" style={{ display: "flex", gap: 10, background: "#1a2030" }}>
        <div style={{ flex: 1 }}><label className="label">Mês</label>
          <select className="input" value={selMonth} onChange={e => setSelMonth(Number(e.target.value))}>
            {MONTHS.map((m, i) => <option key={i} value={i}>{m}</option>)}
          </select></div>
        <div style={{ width: 100 }}><label className="label">Ano</label>
          <select className="input" value={selYear} onChange={e => setSelYear(Number(e.target.value))}>
            {[2025, 2026, 2027].map(y => <option key={y} value={y}>{y}</option>)}
          </select></div>
      </div>
      <div className="kpi-grid">
        <div className="card" style={{ borderLeft: "3px solid #f97316" }}><div style={{ fontSize: 9, color: "#64748b" }}>OFICINA</div><div style={{ fontSize: 18, fontWeight: 800 }}>{active.length}</div></div>
        <div className="card" style={{ borderLeft: "3px solid #6366f1" }}><div style={{ fontSize: 9, color: "#64748b" }}>PEÇAS ({MONTHS[selMonth].slice(0,3)})</div><div style={{ fontSize: 15, fontWeight: 800 }}>{fmt(tP)}</div></div>
        <div className="card" style={{ borderLeft: "3px solid #10b981" }}><div style={{ fontSize: 9, color: "#64748b" }}>M.O. ({MONTHS[selMonth].slice(0,3)})</div><div style={{ fontSize: 15, fontWeight: 800 }}>{fmt(tL)}</div></div>
        <div className="card" style={{ borderLeft: "3px solid #10b981" }}><div style={{ fontSize: 9, color: "#64748b" }}>FATURAMENTO</div><div style={{ fontSize: 15, fontWeight: 800 }}>{fmt(tP + tL)}</div></div>
      </div>
      
      <div className="card">
        <h3 style={{ fontSize: 13, marginBottom: 12, color: "#f97316" }}>🛠️ Carros na Oficina (Ativos)</h3>
        {active.length === 0 ? <p style={{fontSize:11, color:"#64748b"}}>Nenhum carro na oficina.</p> : active.map((s: any) => (
          <div key={s.id} style={{ display: "flex", justifyContent: "space-between", padding: "8px 0", borderBottom: "1px solid #1e2736", alignItems:"center" }}>
            <div style={{ fontSize: 12 }}><strong>{s.vehiclePlate}</strong><br /><span style={{ color: "#64748b", fontSize: 10 }}>{s.description}</span></div>
            <StatusBadge status={s.status} map={STATUS_COLORS} />
          </div>
        ))}
      </div>
      
      <div className="card">
        <h3 style={{ fontSize: 13, marginBottom: 12, color: "#10b981" }}>✅ Entregues em {MONTHS[selMonth]}</h3>
        {filtered.length === 0 ? <p style={{fontSize:11, color:"#64748b"}}>Nenhuma entrega no mês.</p> : filtered.map((s: any) => (
          <div key={s.id} style={{ display: "flex", justifyContent: "space-between", padding: "8px 0", borderBottom: "1px solid #1e2736", alignItems:"center" }}>
            <div style={{ fontSize: 12 }}><strong>{s.vehiclePlate}</strong><br /><span style={{ color: "#64748b", fontSize: 10 }}>{fmtDate(s.exitDate)}</span></div>
            <div style={{ fontSize: 12, fontWeight: 800, color: "#10b981" }}>{fmt((Number(s.partsValue) || 0) + (Number(s.laborValue) || 0))}</div>
          </div>
        ))}
      </div>
    </div>
  );
}

// ── ABA OFICINA (SERVIÇOS) ────────────────────────────────────────────────
function Services({ services, setServices, vehicles }: any) {
  const [modal, setModal] = useState(false);
  const [editing, setEditing] = useState<any>(null);
  const [form, setForm] = useState<any>({});
  const [filter, setFilter] = useState("");

  const open = (s = null) => { setEditing(s); setForm(s || { status: "Aguardando", entryDate: today(), partsValue: 0, laborValue: 0 }); setModal(true); };
  
  const save = async () => {
    if (!form.vehicleId || !form.description) return alert("Selecione o carro e descreva o serviço.");
    const v = vehicles.find((v: any) => v.id === form.vehicleId);
    
    // Cálculo de Lucro Líquido baseado na taxa da máquina
    const bruto = (Number(form.partsValue) || 0) + (Number(form.laborValue) || 0);
    const taxa = PAYMENT_METHODS[form.paymentMethod] || 0;
    const liquido = bruto - (bruto * (taxa / 100));

    const row = { 
      id: editing?.id || uid(), 
      vehicle_id: form.vehicleId, 
      vehicle_plate: v?.plate, 
      vehicle_brand: v?.brand, 
      vehicle_model: v?.model, 
      description: form.description, 
      parts_value: Number(form.partsValue) || 0, 
      labor_value: Number(form.laborValue) || 0, 
      net_value: liquido,
      status: form.status, 
      entry_date: form.entryDate, 
      exit_date: form.status === "Entregue" ? (form.exitDate || today()) : null, 
      payment_method: form.paymentMethod,
      mileage: Number(form.mileage) || 0 
    };
    
    const { data } = await supabase.from("services").upsert(row).select();
    if (data) {
      if (editing) setServices(services.map((s: any) => s.id === editing.id ? mapS(data[0]) : s));
      else setServices([mapS(data[0]), ...services]);
    }
    setModal(false);
  };

  const filtered = filter ? services.filter((s: any) => s.status === filter) : services;
  const cols = "2fr 1.2fr 0.8fr 1fr 50px";

  return (
    <Section title="Fluxo Oficina" action={<button className="btn-primary" onClick={() => open()} style={{width:"auto"}}>+ Entrada</button>}>
      <div style={{ display: "flex", gap: 5, overflowX: "auto", paddingBottom: 5 }}>
        {["", "Aguardando", "Em andamento", "Pronto", "Entregue"].map(s => <button key={s} onClick={() => setFilter(s)} style={{ padding: "5px 12px", borderRadius: 20, fontSize: 10, background: filter === s ? "#f97316" : "#1a2030", color: filter === s ? "#0d0f14" : "#64748b", border: "none", cursor:"pointer" }}>{s || "Todos"}</button>)}
      </div>
      <div className="card" style={{ padding: 0 }}>
        <div className="table-wrap">
          <div className="table-header" style={{ gridTemplateColumns: cols }}><span>Serviço</span><span>Carro</span><span>M.O.</span><span>Status</span><span></span></div>
          {filtered.map((s: any) => (
            <div key={s.id} className="table-row" style={{ gridTemplateColumns: cols }}>
              <div style={{ fontSize: 11 }}>{s.description}<br /><span style={{ fontSize: 9, color: "#64748b" }}>KM: {fmtKm(s.mileage)}</span></div>
              <div style={{ fontSize: 11 }}><strong>{s.vehiclePlate}</strong><br />{s.vehicleBrand}</div>
              <div style={{ fontSize: 11, color: "#10b981" }}>{fmt(s.laborValue)}</div>
              <StatusBadge status={s.status} map={STATUS_COLORS} />
              <button onClick={() => open(s)} className="btn-ghost" style={{ padding: 5 }}>✏️</button>
            </div>
          ))}
        </div>
      </div>
      {modal && <div className="modal-bg" onClick={() => setModal(false)}><div className="modal" onClick={e => e.stopPropagation()}>
        <h3>Serviço</h3>
        <VehicleSelector vehicles={vehicles} value={form.vehicleId} onChange={(v: any) => setForm({ ...form, vehicleId: v })} />
        <Field label="Descrição *" value={form.description} onChange={(v: any) => setForm({ ...form, description: v })} />
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
          <Field label="KM Atual" type="number" value={form.mileage} onChange={(v: any) => setForm({ ...form, mileage: v })} />
          <Field label="Peças (R$)" type="number" value={form.partsValue} onChange={(v: any) => setForm({ ...form, partsValue: v })} />
        </div>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
          <Field label="Mão de Obra (R$)" type="number" value={form.laborValue} onChange={(v: any) => setForm({ ...form, laborValue: v })} />
          <SelectField label="Status" value={form.status} onChange={(v: any) => setForm({ ...form, status: v })} options={Object.keys(STATUS_COLORS)} />
        </div>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
          <Field label="Entrada" type="date" value={form.entryDate} onChange={(v: any) => setForm({ ...form, entryDate: v })} />
          {form.status === "Entregue" && <Field label="Entrega" type="date" value={form.exitDate || today()} onChange={(v: any) => setForm({ ...form, exitDate: v })} />}
        </div>
        {form.status === "Entregue" && (
          <div style={{ background: "#0d0f14", padding: 15, borderRadius: 10, border: "1px solid #1e2736", marginTop: 10 }}>
            <SelectField label="Pagamento" value={form.paymentMethod} onChange={(v: any) => setForm({ ...form, paymentMethod: v })} options={Object.keys(PAYMENT_METHODS)} />
            <div style={{ fontSize: 11, color: "#10b981", marginTop: 5 }}>
              Valor Cliente: {fmt((Number(form.partsValue)||0)+(Number(form.laborValue)||0))} <br/>
              Você Recebe Limpo: {fmt(((Number(form.partsValue)||0)+(Number(form.laborValue)||0)) * (1 - (PAYMENT_METHODS[form.paymentMethod]||0)/100))}
            </div>
          </div>
        )}
        <button className="btn-primary" style={{ width: "100%", marginTop: 15 }} onClick={save}>Salvar</button>
      </div></div>}
    </Section>
  );
}

// ── ABA FINANCEIRO (MARGEM E DESPESAS) ────────────────────────────────────
function Finance({ services, expenses, setExpenses }: any) {
  const [modal, setModal] = useState(false);
  const [form, setForm] = useState<any>({});
  const [selMonth, setSelMonth] = useState(new Date().getMonth());

  const filteredServices = services.filter((s: any) => s.status === "Entregue" && s.exitDate && new Date(s.exitDate + "T12:00:00").getMonth() === selMonth);
  const filteredExpenses = expenses.filter((e: any) => new Date(e.expense_date + "T12:00:00").getMonth() === selMonth);

  const totalEntrada = filteredServices.reduce((acc: any, s: any) => acc + (Number(s.netValue) || 0), 0);
  const totalSaida = filteredExpenses.reduce((acc: any, e: any) => acc + (Number(e.value) || 0), 0);

  const saveExpense = async () => {
    const row = { ...form, id: uid() };
    const { data } = await supabase.from("expenses").insert(row).select();
    if (data) setExpenses([data[0], ...expenses]);
    setModal(false);
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
      <div style={{display:"flex", gap:10, alignItems:"center"}}>
        <h1 style={{ fontFamily: "'Syne',sans-serif", fontSize: 20, fontWeight: 800 }}>Financeiro</h1>
        <select className="input" value={selMonth} onChange={e => setSelMonth(Number(e.target.value))} style={{margin:0, width:"150px"}}>
          {MONTHS.map((m, i) => <option key={i} value={i}>{m}</option>)}
        </select>
      </div>

      <div className="kpi-grid">
        <div className="card" style={{ borderLeft: "3px solid #10b981" }}><label className="label">Entradas (Líq)</label><div style={{ fontSize: 16, fontWeight: 800 }}>{fmt(totalEntrada)}</div></div>
        <div className="card" style={{ borderLeft: "3px solid #ef4444" }}><label className="label">Despesas</label><div style={{ fontSize: 16, fontWeight: 800 }}>{fmt(totalSaida)}</div></div>
        <div className="card" style={{ borderLeft: "3px solid #3b82f6", gridColumn: "1 / -1" }}><label className="label">Lucro do Mês</label><div style={{ fontSize: 20, fontWeight: 800, color: (totalEntrada - totalSaida) >= 0 ? "#10b981" : "#ef4444" }}>{fmt(totalEntrada - totalSaida)}</div></div>
      </div>

      <button className="btn-primary" onClick={() => setModal(true)}>+ Lançar Despesa</button>

      <div className="card">
        <h3 style={{ fontSize: 13, marginBottom: 12 }}>Relatório de Gastos</h3>
        {filteredExpenses.length === 0 ? <p style={{fontSize:11, color:"#64748b"}}>Nenhuma despesa lançada.</p> : filteredExpenses.map((e: any) => (
          <div key={e.id} style={{ display: "flex", justifyContent: "space-between", padding: "8px 0", borderBottom: "1px solid #1e2736" }}>
            <div style={{ fontSize: 11 }}><strong>{e.category}</strong><br /><span style={{ color: "#64748b" }}>{e.supplier} - {fmtDate(e.expense_date)}</span></div>
            <div style={{ fontSize: 12, fontWeight: 800, color: "#ef4444" }}>-{fmt(e.value)}</div>
          </div>
        ))}
      </div>

      {modal && <div className="modal-bg" onClick={() => setModal(false)}><div className="modal" onClick={e => e.stopPropagation()}>
        <h3>Nova Despesa</h3>
        <Field label="Categoria (Ex: Luz, Aluguel, Peças)" value={form.category} onChange={(v: any) => setForm({ ...form, category: v })} />
        <Field label="Valor (R$)" type="number" value={form.value} onChange={(v: any) => setForm({ ...form, value: v })} />
        <Field label="Fornecedor / Observação" value={form.supplier} onChange={(v: any) => setForm({ ...form, supplier: v })} />
        <Field label="Data de Pagamento" type="date" value={form.expense_date || today()} onChange={(v: any) => setForm({ ...form, expense_date: v })} />
        <button className="btn-primary" style={{ width: "100%", marginTop: 15 }} onClick={saveExpense}>Salvar Despesa</button>
      </div></div>}
    </div>
  );
}

// ── ABA BASE DE VEÍCULOS ──────────────────────────────────────────────────
function Vehicles({ vehicles, setVehicles, services }: any) {
  const [modal, setModal] = useState(false);
  const [hist, setHist] = useState<any>(null);
  const [form, setForm] = useState<any>({});
  const [search, setSearch] = useState("");

  const open = (v = null) => { setForm(v || {}); setModal(true); };
  const save = async () => {
    const row = { 
      id: form.id || uid(), plate: form.plate, brand: form.brand, model: form.model, 
      year: form.year, owner: form.owner, phone: form.phone, mileage: Number(form.mileage) || 0 
    };
    const { data } = await supabase.from("vehicles").upsert(row).select();
    if (data) {
      if (form.id) setVehicles(vehicles.map((v: any) => v.id === form.id ? mapV(data[0]) : v));
      else setVehicles([mapV(data[0]), ...vehicles]);
    }
    setModal(false);
  };

  const filtered = vehicles.filter((v: any) => !search || (v.plate||"").toLowerCase().includes(search.toLowerCase()) || (v.owner||"").toLowerCase().includes(search.toLowerCase()));

  return (
    <Section title="Base de Veículos" action={<button className="btn-primary" onClick={() => open()} style={{width:"auto"}}>+ Novo</button>}>
      <input className="input" placeholder="Buscar por placa ou cliente..." value={search} onChange={e => setSearch(e.target.value)} style={{ marginBottom: 10 }} />
      <div className="card" style={{ padding: 0 }}>
        <div className="table-wrap">
          <div className="table-header" style={{ gridTemplateColumns: "1.8fr 1.5fr 1fr 50px" }}><span>Veículo</span><span>Cliente</span><span>Telefone</span><span></span></div>
          {filtered.map((v: any) => (
            <div key={v.id} className="table-row" style={{ gridTemplateColumns: "1.8fr 1.5fr 1fr 50px" }}>
              <div><button onClick={() => setHist(v)} className="btn-history">📜 Histórico</button><br /><strong>{v.brand} {v.model}</strong><br /><span style={{ color: "#f97316", fontSize: 10 }}>{v.plate} · {v.year} · {fmtKm(v.mileage)}</span></div>
              <div style={{ fontSize: 11 }}>{v.owner}</div>
              <div style={{ fontSize: 11 }}>{v.phone}</div>
              <button onClick={() => open(v)} className="btn-ghost" style={{ padding: 5 }}>✏️</button>
            </div>
          ))}
        </div>
      </div>
      {modal && <div className="modal-bg" onClick={() => setModal(false)}><div className="modal" onClick={e => e.stopPropagation()}>
        <h3>Veículo</h3>
        <Field label="Placa" value={form.plate} onChange={(v: any) => setForm({ ...form, plate: v.toUpperCase() })} />
        <BrandSelector value={form.brand} onChange={(v: any) => setForm({ ...form, brand: v })} />
        <Field label="Modelo" value={form.model} onChange={(v: any) => setForm({ ...form, model: v })} />
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
          <Field label="Ano" value={form.year} onChange={(v: any) => setForm({ ...form, year: v })} />
          <Field label="KM Inicial" type="number" value={form.mileage} onChange={(v: any) => setForm({ ...form, mileage: v })} />
        </div>
        <Field label="Dono" value={form.owner} onChange={(v: any) => setForm({ ...form, owner: v })} />
        <Field label="Telefone" value={form.phone} onChange={(v: any) => setForm({ ...form, phone: v })} />
        <button className="btn-primary" style={{ width: "100%", marginTop: 10 }} onClick={save}>Salvar</button>
      </div></div>}
      {hist && <div className="modal-bg" onClick={() => setHist(null)}><div className="modal" onClick={e => e.stopPropagation()}>
        <h3>📜 Histórico: {hist.plate}</h3>
        <div style={{maxHeight: '320px', overflowY: 'auto'}}>
          {services.filter((s: any) => s.vehicleId === hist.id).map((s: any) => (
            <div key={s.id} style={{ padding: 12, background: "#0d0f14", borderRadius: 8, marginBottom: 10, borderLeft: "3px solid #10b981" }}>
              <div style={{ fontSize: 12, fontWeight: 700 }}>{s.description}</div>
              <div style={{ fontSize: 10, color: "#64748b" }}>KM: {fmtKm(s.mileage)} | Finalizado: {fmtDate(s.exitDate)}</div>
              <div style={{ fontSize: 11, fontWeight: 800, color: "#f97316", marginTop: 5 }}>Total: {fmt((Number(s.partsValue)||0)+(Number(s.laborValue)||0))}</div>
            </div>
          ))}
        </div>
        <button className="btn-ghost" style={{ width: "100%", marginTop: 15 }} onClick={() => setHist(null)}>Fechar</button>
      </div></div>}
    </Section>
  );
}

// ── HELPERS E EXTRAS ──────────────────────────────────────────────────────
function Section({ title, action, children }: any) { return (<div style={{ display: "flex", flexDirection: "column", gap: 12 }}><div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}><h1 style={{ fontFamily: "'Syne',sans-serif", fontSize: 20, fontWeight: 800 }}>{title}</h1>{action}</div>{children}</div>); }
function StatusBadge({ status, map }: any) { const color = (map || {})[status] || "#6b7280"; return <span className="badge" style={{ background: color + "22", color, border: `1px solid ${color}44` }}>{status || "—"}</span>; }
function Field({ label, value, onChange, type = "text" }: any) { return <div style={{ marginBottom: 10 }}><label className="label">{label}</label><input className="input" type={type} value={value || ""} onChange={e => onChange(e.target.value)} /></div>; }
function SelectField({ label, value, onChange, options }: any) { return <div style={{ marginBottom: 10 }}><label className="label">{label}</label><select className="input" value={value} onChange={e => onChange(e.target.value)}>{options.map((o: any) => <option key={o} value={o}>{o}</option>)}</select></div>; }

function ReportModal({ services, onClose, onGenerate }: any) {
  const [dateFrom, setDateFrom] = useState(new Date(new Date().getFullYear(), new Date().getMonth(), 1).toISOString().slice(0, 10));
  const [dateTo, setDateTo] = useState(today());
  return (
    <div className="modal-bg" onClick={onClose}><div className="modal" onClick={e => e.stopPropagation()}><h3>📄 Relatório de Caixa</h3>
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10, marginBottom: 15 }}>
        <div><label className="label">De</label><input className="input" type="date" value={dateFrom} onChange={e => setDateFrom(e.target.value)} /></div>
        <div><label className="label">Até</label><input className="input" type="date" value={dateTo} onChange={e => setDateTo(e.target.value)} /></div>
      </div>
      <button className="btn-primary" style={{ width: "100%" }} onClick={() => onGenerate(dateFrom, dateTo)}>Gerar PDF</button>
    </div></div>
  );
}
