import { useState, useEffect, useRef } from "react";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const supabase = createClient(
  "https://bofhihxpqmqimkanwkyw.supabase.co",
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImJvZmhpaHhwcW1xaW1rYW53a3l3Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzUwODQ3OTMsImV4cCI6MjA5MDY2MDc5M30.fOOD-FweGID1x2mlJ3LWImtw7B6m6Pc-8auXLIuCqbw"
);

// ── CONSTANTES E TAXAS ────────────────────────────────────────────────────
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

// ── MAPEADORES DE DADOS (IMPEDE O "SUMIÇO" DOS DADOS) ─────────────────────
const mapV = (r: any) => ({
  id: r.id, plate: r.plate || "S/P", brand: r.brand || "—", model: r.model || "—", 
  year: r.year || "—", owner: r.owner || "—", phone: r.phone || "—", mileage: r.mileage || 0
});

const mapS = (r: any) => ({
  id: r.id, vehicleId: r.vehicle_id, vehiclePlate: r.vehicle_plate || "—",
  vehicleBrand: r.vehicle_brand || "—", vehicleModel: r.vehicle_model || "—",
  description: r.description || "Sem descrição", partsValue: Number(r.parts_value) || 0,
  laborValue: Number(r.labor_value) || 0, netValue: Number(r.net_value) || 0,
  status: r.status || "Aguardando", entryDate: r.entry_date || today(),
  exitDate: r.exit_date, paymentMethod: r.payment_method || "Dinheiro",
  mileage: Number(r.mileage) || 0
});

// ── COMPONENTES DE INTERFACE ──────────────────────────────────────────────
function VehicleSelector({ vehicles, value, onChange }: any) {
  const [query, setQuery] = useState("");
  const [open, setOpen] = useState(false);
  const ref = useRef<any>(null);
  const sel = vehicles.find((v: any) => v.id === value);
  const filtered = vehicles.filter((v: any) => (v.plate||"").toLowerCase().includes(query.toLowerCase())).slice(0, 8);
  useEffect(() => { function handleClick(e: any) { if (ref.current && !ref.current.contains(e.target)) setOpen(false); } document.addEventListener("mousedown", handleClick); return () => document.removeEventListener("mousedown", handleClick); }, []);
  return (
    <div ref={ref} style={{ position: "relative", marginBottom: 15 }}>
      <label className="label">Selecionar Carro *</label>
      <input className="input" placeholder="Busque pela placa..." value={open ? query : (sel ? `${sel.plate} — ${sel.model}` : "")} onFocus={() => { setOpen(true); setQuery(""); }} onChange={e => setQuery(e.target.value)} autoComplete="off" />
      {open && (
        <div style={{ position: "absolute", top: "100%", left: 0, right: 0, zIndex: 250, background: "#1a2030", border: "1px solid #f97316", borderRadius: 8, maxHeight: 200, overflowY: "auto", marginTop: 4, boxShadow: "0 8px 24px rgba(0,0,0,.8)" }}>
          {filtered.map((v: any) => (<div key={v.id} onClick={() => { onChange(v.id); setOpen(false); }} style={{ padding: "12px 14px", cursor: "pointer", borderBottom: "1px solid #1e2736" }}><strong>{v.plate}</strong> — {v.brand} {v.model}</div>))}
        </div>
      )}
    </div>
  );
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
    async function fetchAll() {
      setLoading(true);
      try {
        const [v, s, e] = await Promise.all([
          supabase.from("vehicles").select("*").order("created_at", { ascending: false }),
          supabase.from("services").select("*").order("created_at", { ascending: false }),
          supabase.from("expenses").select("*").order("expense_date", { ascending: false }),
        ]);
        if (v.data) setVehicles(v.data.map(mapV));
        if (s.data) setServices(s.data.map(mapS));
        if (e.data) setExpenses(e.data);
      } catch (err) { console.error("Erro ao carregar dados:", err); }
      setLoading(false);
    }
    fetchAll();
  }, []);

  const tabs = [{ id: "dashboard", label: "Início", icon: "⬡" }, { id: "services", label: "Oficina", icon: "🔧" }, { id: "finance", label: "Financeiro", icon: "💰" }, { id: "vehicles", label: "Base", icon: "🚗" }];

  return (
    <div style={{ minHeight: "100vh", background: "#0d0f14", color: "#e2e8f0", fontFamily: "'DM Mono', monospace", display: "flex", flexDirection: "column", paddingBottom: 80 }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=DM+Mono:wght@300;400;500&family=Syne:wght@700;800&display=swap');
        *{box-sizing:border-box;margin:0;padding:0;}
        body, html { overflow-x: hidden; width: 100%; position: relative; }
        .card{background:#161b26; border:1px solid #1e2736; border-radius:12px; padding:16px; margin-bottom:12px;}
        .btn-primary{background:#f97316; color:#0d0f14; border:none; border-radius:8px; padding:12px 18px; font-weight:800; cursor:pointer; width:100%; font-size:13px;}
        .btn-ghost{background:transparent; color:#94a3b8; border:1px solid #1e2736; border-radius:8px; padding:8px 12px; cursor:pointer;}
        .input{background:#0d0f14; border:1px solid #1e2736; border-radius:8px; padding:10px 12px; color:#fff; width:100%; font-family:inherit; font-size:13px; margin-bottom:10px;}
        .label{display:block; font-size:11px; color:#64748b; margin-bottom:5px; text-transform:uppercase;}
        .badge{display:inline-block; border-radius:20px; padding:2px 8px; font-size:10px; font-weight:600;}
        .kpi-grid{display:grid; grid-template-columns: 1fr 1fr; gap:12px; margin-bottom:16px;}
        .bottom-nav{position:fixed; bottom:0; left:0; right:0; background:#0d0f14; border-top:1px solid #1e2736; z-index:50; padding:10px 0 20px; display:flex; justify-content:space-around;}
        .nav-item{display:flex; flex-direction:column; align-items:center; gap:4px; background:none; border:none; color:#475569; font-size:10px; cursor:pointer;}
        .nav-item.active{color:#f97316;}
        .modal-bg{position:fixed; inset:0; background:rgba(0,0,0,.8); display:flex; align-items:center; justify-content:center; z-index:100; padding:16px;}
        .modal{background:#161b26; border:1px solid #1e2736; border-radius:16px; padding:24px; width:100%; max-width:500px; max-height:90vh; overflow-y:auto;}
        .table-wrap{width:100%; overflow-x:auto; -webkit-overflow-scrolling:touch;}
        .table-row{min-width:600px; display:grid; grid-template-columns: 2fr 1.5fr 1fr 1fr 50px; align-items:center; padding:12px; border-bottom:1px solid #1e2736;}
      `}</style>

      <header style={{ padding: 20, borderBottom: "1px solid #1e2736", display: "flex", justifyContent: "space-between", alignItems: "center", background: "#0d0f14" }}>
        <h1 style={{ fontFamily: "'Syne', sans-serif", fontSize: 18, fontWeight: 800 }}>🔩 AutoGestão</h1>
        <button className="btn-ghost" onClick={() => setShowReport(true)} style={{fontSize:11}}>📄 PDF</button>
      </header>

      <main style={{ padding: 16, maxWidth: 800, margin: "0 auto", flex: 1 }}>
        {loading ? <p style={{textAlign:"center", padding:50}}>Sincronizando banco de dados...</p> : (
          <>
            {tab === "dashboard" && <Dashboard services={services} />}
            {tab === "services" && <ServicesTab services={services} setServices={setServices} vehicles={vehicles} />}
            {tab === "finance" && <FinanceTab services={services} expenses={expenses} setExpenses={setExpenses} />}
            {tab === "vehicles" && <VehiclesTab vehicles={vehicles} setVehicles={setVehicles} services={services} />}
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

// ── ABA INÍCIO ─────────────────────────────────────────────────────────────
function Dashboard({ services }: any) {
  const [selMonth, setSelMonth] = useState(new Date().getMonth());
  const active = services.filter((s: any) => s.status !== "Entregue");
  const filtered = services.filter((s: any) => s.status === "Entregue" && s.exitDate && new Date(s.exitDate + "T12:00:00").getMonth() === selMonth);
  const tP = filtered.reduce((acc: any, s: any) => acc + s.partsValue, 0);
  const tL = filtered.reduce((acc: any, s: any) => acc + s.laborValue, 0);
  return (
    <div>
      <div className="card" style={{background: "#1a2030"}}>
        <label className="label">Mês de Referência</label>
        <select className="input" value={selMonth} onChange={e => setSelMonth(Number(e.target.value))}>
          {MONTHS.map((m, i) => <option key={i} value={i}>{m}</option>)}
        </select>
      </div>
      <div className="kpi-grid">
        <div className="card" style={{ borderLeft: "3px solid #f97316" }}><label className="label">Oficina</label><strong>{active.length}</strong></div>
        <div className="card" style={{ borderLeft: "3px solid #10b981" }}><label className="label">Total {MONTHS[selMonth].slice(0,3)}</label><strong>{fmt(tP + tL)}</strong></div>
      </div>
      <div className="card">
        <h3 style={{ fontSize: 13, marginBottom: 10, color:"#f97316" }}>🛠️ Ativos</h3>
        {active.length === 0 ? <p style={{fontSize:11, color:"#64748b"}}>Pátio vazio.</p> : active.map((s:any) => <div key={s.id} style={{padding:"8px 0", borderBottom:"1px solid #1e2736", fontSize:12}}><strong>{s.vehiclePlate}</strong> — {s.description}</div>)}
      </div>
    </div>
  );
}

// ── ABA OFICINA ────────────────────────────────────────────────────────────
function ServicesTab({ services, setServices, vehicles }: any) {
  const [modal, setModal] = useState(false);
  const [editing, setEditing] = useState<any>(null);
  const [form, setForm] = useState<any>({});
  const open = (s = null) => { setEditing(s); setForm(s || { status: "Aguardando", entryDate: today(), partsValue: 0, laborValue: 0, paymentMethod: "Dinheiro" }); setModal(true); };

  const save = async () => {
    if (!form.vehicleId) return alert("Selecione um carro.");
    const v = vehicles.find((v: any) => v.id === form.vehicleId);
    const bruto = (Number(form.partsValue) || 0) + (Number(form.laborValue) || 0);
    const taxa = PAYMENT_METHODS[form.paymentMethod] || 0;
    const liquido = bruto * (1 - taxa / 100);

    const row = {
      id: editing?.id || uid(), vehicle_id: form.vehicleId, vehicle_plate: v?.plate, vehicle_brand: v?.brand, vehicle_model: v?.model,
      description: form.description, parts_value: Number(form.partsValue) || 0, labor_value: Number(form.laborValue) || 0,
      net_value: liquido, status: form.status, entry_date: form.entryDate, exit_date: form.status === "Entregue" ? (form.exitDate || today()) : null,
      payment_method: form.paymentMethod, mileage: Number(form.mileage) || 0
    };
    const { data, error } = await supabase.from("services").upsert(row).select();
    if (error) return alert("Erro ao salvar: " + error.message);
    if (data) {
      if (editing) setServices(services.map((s: any) => s.id === editing.id ? mapS(data[0]) : s));
      else setServices([mapS(data[0]), ...services]);
    }
    setModal(false);
  };

  return (
    <div>
      <button className="btn-primary" onClick={() => open()} style={{marginBottom:15}}>+ Nova Entrada</button>
      <div className="table-wrap">
        {services.filter((s:any)=>s.status !== "Entregue").map((s: any) => (
          <div key={s.id} className="table-row">
            <div style={{fontSize:11}}><strong>{s.description}</strong><br/>KM: {fmtKm(s.mileage)}</div>
            <div style={{fontSize:11}}><strong>{s.vehiclePlate}</strong><br/>{s.vehicleBrand}</div>
            <div style={{fontSize:11, color:"#10b981"}}>{fmt(s.laborValue)}</div>
            <StatusBadge status={s.status} map={STATUS_COLORS} />
            <button onClick={() => open(s)} className="btn-ghost">✏️</button>
          </div>
        ))}
      </div>
      {modal && (
        <div className="modal-bg" onClick={() => setModal(false)}><div className="modal" onClick={e => e.stopPropagation()}>
          <VehicleSelector vehicles={vehicles} value={form.vehicleId} onChange={(v: any) => setForm({...form, vehicleId: v})} />
          <Field label="Descrição" value={form.description} onChange={(v: any) => setForm({...form, description: v})} />
          <div style={{display:"grid", gridTemplateColumns:"1fr 1fr", gap:10}}>
            <Field label="M.O. (R$)" type="number" value={form.laborValue} onChange={(v: any) => setForm({...form, laborValue: v})} />
            <Field label="Peças (R$)" type="number" value={form.partsValue} onChange={(v: any) => setForm({...form, partsValue: v})} />
          </div>
          <div style={{display:"grid", gridTemplateColumns:"1fr 1fr", gap:10}}>
            <Field label="KM Atual" type="number" value={form.mileage} onChange={(v: any) => setForm({...form, mileage: v})} />
            <SelectField label="Status" value={form.status} onChange={(v: any) => setForm({...form, status: v})} options={Object.keys(STATUS_COLORS)} />
          </div>
          {form.status === "Entregue" && (
            <div style={{background:"#0d0f14", padding:12, borderRadius:8, marginTop:10, border:"1px solid #10b981"}}>
              <SelectField label="Forma de Pagamento" value={form.paymentMethod} onChange={(v: any) => setForm({...form, paymentMethod: v})} options={Object.keys(PAYMENT_METHODS)} />
              <Field label="Data Entrega" type="date" value={form.exitDate || today()} onChange={(v: any) => setForm({...form, exitDate: v})} />
              <p style={{fontSize:10, color:"#10b981", marginTop:5}}>Líquido Final: {fmt(((Number(form.partsValue)||0)+(Number(form.laborValue)||0)) * (1 - (PAYMENT_METHODS[form.paymentMethod]||0)/100))}</p>
            </div>
          )}
          <button className="btn-primary" onClick={save} style={{marginTop:15}}>Salvar Alterações</button>
        </div></div>
      )}
    </div>
  );
}

// ── ABA FINANCEIRO ─────────────────────────────────────────────────────────
function FinanceTab({ services, expenses, setExpenses }: any) {
  const [modal, setModal] = useState(false);
  const [form, setForm] = useState<any>({ expense_date: today() });
  const [selMonth, setSelMonth] = useState(new Date().getMonth());

  const totalIn = services.filter((s:any) => s.status === "Entregue" && s.exitDate && new Date(s.exitDate + "T12:00:00").getMonth() === selMonth)
    .reduce((acc:any, s:any) => acc + s.netValue, 0);
  const filteredExp = expenses.filter((e:any) => e.expense_date && new Date(e.expense_date + "T12:00:00").getMonth() === selMonth);
  const totalOut = filteredExp.reduce((acc:any, e:any) => acc + Number(e.value), 0);

  const saveExp = async () => {
    if (!form.category || !form.value) return alert("Preencha categoria e valor.");
    const row = { id: uid(), category: form.category, value: Number(form.value), supplier: form.supplier || "Geral", expense_date: form.expense_date || today() };
    const { data, error } = await supabase.from("expenses").insert(row).select();
    if (error) return alert("Erro: " + error.message);
    if (data) setExpenses([data[0], ...expenses]);
    setModal(false);
    setForm({ expense_date: today() });
  };

  return (
    <div>
      <div style={{display:"flex", gap:10, alignItems:"center", marginBottom:15}}>
        <h2 style={{fontFamily:"'Syne'", fontSize:18}}>Caixa</h2>
        <select className="input" value={selMonth} onChange={e => setSelMonth(Number(e.target.value))} style={{margin:0, width:130}}>
          {MONTHS.map((m, i) => <option key={i} value={i}>{m}</option>)}
        </select>
      </div>
      <div className="kpi-grid">
        <div className="card" style={{borderLeft:"4px solid #10b981"}}><label className="label">Entradas (Líq)</label><strong>{fmt(totalIn)}</strong></div>
        <div className="card" style={{borderLeft:"4px solid #ef4444"}}><label className="label">Despesas</label><strong>{fmt(totalOut)}</strong></div>
        <div className="card" style={{borderLeft:"4px solid #3b82f6", gridColumn:"1/-1"}}><label className="label">Saldo Líquido</label><strong style={{fontSize:18, color: (totalIn-totalOut)>=0?"#10b981":"#ef4444"}}>{fmt(totalIn-totalOut)}</strong></div>
      </div>
      <button className="btn-primary" onClick={() => setModal(true)}>+ Lançar Gasto Manual</button>
      <div className="card" style={{marginTop:15}}>
        <h3 style={{fontSize:13, marginBottom:10}}>Lista de Despesas</h3>
        {filteredExp.length === 0 ? <p style={{fontSize:11, color:"#64748b"}}>Sem gastos registrados.</p> : filteredExp.map((e:any) => (
          <div key={e.id} style={{display:"flex", justifyContent:"space-between", padding:"8px 0", borderBottom:"1px solid #1e2736", fontSize:12}}>
            <div><strong>{e.category}</strong><br/><small>{e.supplier} — {fmtDate(e.expense_date)}</small></div>
            <div style={{color:"#ef4444"}}>-{fmt(e.value)}</div>
          </div>
        ))}
      </div>
      {modal && (
        <div className="modal-bg" onClick={() => setModal(false)}><div className="modal" onClick={e => e.stopPropagation()}>
          <h3>Cadastrar Gasto</h3>
          <Field label="O que é? (Luz, Aluguel, etc)" onChange={(v:any) => setForm({...form, category: v})} />
          <Field label="Valor (R$)" type="number" onChange={(v:any) => setForm({...form, value: v})} />
          <Field label="Fornecedor / Origem" onChange={(v:any) => setForm({...form, supplier: v})} />
          <Field label="Data do Pagamento" type="date" value={form.expense_date} onChange={(v:any) => setForm({...form, expense_date: v})} />
          <button className="btn-primary" onClick={saveExp}>Salvar no Financeiro</button>
        </div></div>
      )}
    </div>
  );
}

// ── ABA VEÍCULOS ──────────────────────────────────────────────────────────
function VehiclesTab({ vehicles, setVehicles, services }: any) {
  const [modal, setModal] = useState(false);
  const [hist, setHist] = useState<any>(null);
  const [form, setForm] = useState<any>({});
  const open = (v = null) => { setForm(v || {}); setModal(true); };
  const save = async () => {
    if (!form.plate) return alert("Placa obrigatória.");
    const row = { id: form.id || uid(), plate: form.plate.toUpperCase(), brand: form.brand, model: form.model, year: form.year, mileage: Number(form.mileage)||0, owner: form.owner, phone: form.phone };
    const { data } = await supabase.from("vehicles").upsert(row).select();
    if (data) {
      if (form.id) setVehicles(vehicles.map((v:any) => v.id === form.id ? mapV(data[0]) : v));
      else setVehicles([mapV(data[0]), ...vehicles]);
    }
    setModal(false);
  };
  return (
    <div>
      <button className="btn-primary" onClick={() => open()} style={{marginBottom:15}}>+ Novo Cadastro</button>
      {vehicles.map((v: any) => (
        <div key={v.id} className="card" style={{display:"flex", justifyContent:"space-between", alignItems:"center"}}>
          <div><button onClick={() => setHist(v)} className="btn-ghost" style={{fontSize:9, padding:"2px 8px", marginBottom:5}}>📜 Prontuário</button><br/><strong>{v.plate}</strong> — {v.model}</div>
          <button onClick={() => open(v)} className="btn-ghost">✏️</button>
        </div>
      ))}
      {modal && (
        <div className="modal-bg" onClick={() => setModal(false)}><div className="modal" onClick={e => e.stopPropagation()}>
          <Field label="Placa" value={form.plate} onChange={(v:any) => setForm({...form, plate: v})} />
          <Field label="Marca" value={form.brand} onChange={(v:any) => setForm({...form, brand: v})} />
          <Field label="Modelo" value={form.model} onChange={(v:any) => setForm({...form, model: v})} />
          <Field label="Dono" value={form.owner} onChange={(v:any) => setForm({...form, owner: v})} />
          <button className="btn-primary" onClick={save}>Salvar Carro</button>
        </div></div>
      )}
      {hist && (
        <div className="modal-bg" onClick={() => setHist(null)}><div className="modal" onClick={e => e.stopPropagation()}>
          <h3>Histórico: {hist.plate}</h3>
          {services.filter((s:any)=>s.vehicleId===hist.id).map((s:any) => (
            <div key={s.id} style={{padding:10, borderBottom:"1px solid #1e2736", fontSize:12}}>
              <strong>{s.description}</strong><br/><small>KM: {fmtKm(s.mileage)} | {fmtDate(s.exitDate)}</small>
            </div>
          ))}
          <button className="btn-primary" onClick={() => setHist(null)} style={{marginTop:15}}>Fechar</button>
        </div></div>
      )}
    </div>
  );
}

// ── HELPERS ───────────────────────────────────────────────────────────────
function StatusBadge({ status, map }: any) { const color = (map || {})[status] || "#6b7280"; return <span className="badge" style={{ background: color + "22", color, border: `1px solid ${color}44` }}>{status || "—"}</span>; }
function Field({ label, value, onChange, type = "text" }: any) { return <div style={{ marginBottom: 10 }}><label className="label">{label}</label><input className="input" type={type} value={value || ""} onChange={e => onChange(e.target.value)} /></div>; }
function SelectField({ label, value, onChange, options }: any) { return <div style={{ marginBottom: 10 }}><label className="label">{label}</label><select className="input" value={value} onChange={e => onChange(e.target.value)}>{options.map((o: any) => <option key={o} value={o}>{o}</option>)}</select></div>; }
function generatePDF(v:any, s:any, f:any, t:any) { /* PDF Logic v1.3.2 */ }
function ReportModal({ services, onClose, onGenerate }: any) { 
  const [dF, setDF] = useState(today()); const [dT, setDT] = useState(today());
  return (<div className="modal-bg" onClick={onClose}><div className="modal" onClick={e=>e.stopPropagation()}><h3>PDF Período</h3><Field label="De" type="date" value={dF} onChange={setDF}/><Field label="Até" type="date" value={dT} onChange={setDT}/><button className="btn-primary" onClick={()=>onGenerate(dF,dT)}>Gerar Relatório</button></div></div>);
}
