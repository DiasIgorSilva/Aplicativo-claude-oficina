import { useState, useEffect, useRef } from "react";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const supabase = createClient(
  "https://bofhihxpqmqimkanwkyw.supabase.co",
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImJvZmhpaHhwcW1xaW1rYW53a3l3Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzUwODQ3OTMsImV4cCI6MjA5MDY2MDc5M30.fOOD-FweGID1x2mlJ3LWImtw7B6m6Pc-8auXLIuCqbw"
);

// ── CONFIGURAÇÕES E TAXAS ────────────────────────────────────────────────
const PAYMENT_METHODS: any = {
  "Dinheiro": 0, "Pix": 0, "Débito": 1.9,
  "Crédito 1x": 0.79, "Crédito 2x": 1.58, "Crédito 3x": 2.37, "Crédito 4x": 3.16,
  "Crédito 5x": 3.95, "Crédito 6x": 4.74, "Crédito 7x": 5.53, "Crédito 8x": 6.32,
  "Crédito 9x": 7.11, "Crédito 10x": 7.90, "Crédito 11x": 8.69, "Crédito 12x": 9.48
};

const uid = () => Math.random().toString(36).slice(2, 10);
const fmt = (n: any) => new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(n || 0);
const fmtKm = (n: any) => n ? n.toLocaleString("pt-BR") + " km" : "—";
const today = () => new Date().toISOString().slice(0, 10);
const fmtDate = (d: any) => d ? new Date(d + "T12:00:00").toLocaleDateString("pt-BR") : "—";

// ── MAPEADORES (A "TRADUÇÃO" QUE SALVA OS DADOS) ─────────────────────────
const mapV = (r: any) => ({
  id: r.id, plate: r.plate, brand: r.brand, model: r.model, year: r.year, 
  owner: r.owner, phone: r.phone, mileage: r.mileage || 0
});

const mapS = (r: any) => ({
  id: r.id, vehicleId: r.vehicle_id, vehiclePlate: r.vehicle_plate,
  vehicleBrand: r.vehicle_brand, description: r.description,
  partsValue: r.parts_value || 0, laborValue: r.labor_value || 0,
  netValue: r.net_value || 0, status: r.status,
  entryDate: r.entry_date, exitDate: r.exit_date,
  paymentMethod: r.payment_method, mileage: r.mileage || 0
});

// ── COMPONENTES DE BUSCA ──────────────────────────────────────────────────
function VehicleSelector({ vehicles, value, onChange }: any) {
  const [query, setQuery] = useState("");
  const [open, setOpen] = useState(false);
  const ref = useRef<any>(null);
  const sel = vehicles.find((v: any) => v.id === value);
  const filtered = vehicles.filter((v: any) => v.plate.toLowerCase().includes(query.toLowerCase())).slice(0, 8);
  
  return (
    <div ref={ref} style={{ position: "relative", marginBottom: 15 }}>
      <label className="label">Carro *</label>
      <input className="input" value={open ? query : (sel ? `${sel.plate} - ${sel.model}` : "")} 
        onFocus={() => {setOpen(true); setQuery("");}} onChange={e => setQuery(e.target.value)} placeholder="Busque pela placa..." />
      {open && (
        <div style={{ position: "absolute", top: "100%", left: 0, right: 0, zIndex: 100, background: "#1a2030", border: "1px solid #f97316", borderRadius: 8 }}>
          {filtered.map((v: any) => (
            <div key={v.id} onClick={() => { onChange(v.id); setOpen(false); }} style={{ padding: 12, borderBottom: "1px solid #1e2736", cursor: "pointer" }}>
              <strong>{v.plate}</strong> - {v.brand} {v.model}
            </div>
          ))}
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

  return (
    <div style={{ minHeight: "100vh", background: "#0d0f14", color: "#e2e8f0", fontFamily: "sans-serif", paddingBottom: 80 }}>
      <style>{`
        .card{background:#161b26; border:1px solid #1e2736; border-radius:12px; padding:16px; margin-bottom:10px;}
        .btn-primary{background:#f97316; color:#0d0f14; border:none; border-radius:8px; padding:10px 18px; font-weight:800; width:100%; cursor:pointer;}
        .input{background:#0d0f14; border:1px solid #1e2736; border-radius:8px; padding:10px; color:#fff; width:100%; margin-bottom:10px;}
        .label{font-size:11px; color:#64748b; text-transform:uppercase; display:block; margin-bottom:4px;}
        .bottom-nav{position:fixed; bottom:0; left:0; right:0; background:#0d0f14; border-top:1px solid #1e2736; display:flex; justify-content:space-around; padding:10px 0 20px;}
        .nav-item{background:none; border:none; color:#475569; font-size:10px; cursor:pointer;}
        .nav-item.active{color:#f97316;}
      `}</style>

      <header style={{ padding: 20, borderBottom: "1px solid #1e2736", textAlign: "center" }}>
        <h1 style={{ fontSize: 20, fontWeight: 800 }}>🔩 AutoGestão</h1>
      </header>

      <main style={{ padding: 16, maxWidth: 600, margin: "0 auto" }}>
        {loading ? <p>Sincronizando...</p> : (
          <>
            {tab === "dashboard" && <Dashboard services={services} />}
            {tab === "services" && <ServicesTab services={services} setServices={setServices} vehicles={vehicles} />}
            {tab === "finance" && <FinanceTab services={services} expenses={expenses} setExpenses={setExpenses} />}
            {tab === "vehicles" && <VehiclesTab vehicles={vehicles} setVehicles={setVehicles} services={services} />}
          </>
        )}
      </main>

      <nav className="bottom-nav">
        {[{id:"dashboard", label:"Início", icon:"⬡"}, {id:"services", label:"Oficina", icon:"🔧"}, {id:"finance", label:"Financeiro", icon:"💰"}, {id:"vehicles", label:"Base", icon:"🚗"}].map(t => (
          <button key={t.id} onClick={() => setTab(t.id)} className={`nav-item ${tab === t.id ? 'active' : ''}`}>
            <div style={{fontSize:20}}>{t.icon}</div>{t.label}
          </button>
        ))}
      </nav>
    </div>
  );
}

// ── ABA INÍCIO ─────────────────────────────────────────────────────────────
function Dashboard({ services }: any) {
  const active = services.filter((s: any) => s.status !== "Entregue");
  return (
    <div>
      <div className="card" style={{ borderLeft: "4px solid #f97316" }}>
        <label className="label">Carros em serviço</label>
        <div style={{ fontSize: 24, fontWeight: 800 }}>{active.length}</div>
      </div>
      {active.map((s: any) => (
        <div key={s.id} className="card">
          <strong>{s.vehiclePlate}</strong> - {s.description}
        </div>
      ))}
    </div>
  );
}

// ── ABA OFICINA ────────────────────────────────────────────────────────────
function ServicesTab({ services, setServices, vehicles }: any) {
  const [modal, setModal] = useState(false);
  const [form, setForm] = useState<any>({});

  const save = async () => {
    const v = vehicles.find((v: any) => v.id === form.vehicleId);
    const bruto = (Number(form.partsValue) || 0) + (Number(form.laborValue) || 0);
    const taxa = PAYMENT_METHODS[form.paymentMethod] || 0;
    const liquido = bruto * (1 - taxa / 100);

    const row = {
      id: form.id || uid(),
      vehicle_id: form.vehicleId,
      vehicle_plate: v?.plate,
      vehicle_brand: v?.brand,
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
      if (form.id) setServices(services.map((s: any) => s.id === form.id ? mapS(data[0]) : s));
      else setServices([mapS(data[0]), ...services]);
    }
    setModal(false);
  };

  return (
    <div>
      <button className="btn-primary" onClick={() => { setForm({status:"Aguardando", entryDate:today()}); setModal(true); }} style={{marginBottom:15}}>+ Nova Entrada</button>
      {services.filter((s:any)=>s.status !== "Entregue").map((s: any) => (
        <div key={s.id} className="card" style={{ display:"flex", justifyContent:"space-between", alignItems:"center" }}>
          <div><strong>{s.vehiclePlate}</strong><br/><small>{s.description}</small></div>
          <button onClick={() => { setForm(s); setModal(true); }} style={{background:"none", border:"1px solid #1e2736", color:"#fff", padding:5, borderRadius:5}}>✏️</button>
        </div>
      ))}
      {modal && (
        <div className="modal-bg" onClick={() => setModal(false)}>
          <div className="modal" onClick={e => e.stopPropagation()}>
            <VehicleSelector vehicles={vehicles} value={form.vehicleId} onChange={(v: any) => setForm({...form, vehicleId: v})} />
            <label className="label">Descrição</label>
            <input className="input" value={form.description} onChange={e => setForm({...form, description: e.target.value})} />
            <div style={{display:"grid", gridTemplateColumns:"1fr 1fr", gap:10}}>
              <div><label className="label">Mão de Obra</label><input className="input" type="number" value={form.laborValue} onChange={e => setForm({...form, laborValue: e.target.value})} /></div>
              <div><label className="label">Peças</label><input className="input" type="number" value={form.partsValue} onChange={e => setForm({...form, partsValue: e.target.value})} /></div>
            </div>
            <label className="label">Status</label>
            <select className="input" value={form.status} onChange={e => setForm({...form, status: e.target.value})}>
              <option value="Aguardando">Aguardando</option>
              <option value="Em andamento">Em andamento</option>
              <option value="Pronto">Pronto</option>
              <option value="Entregue">Entregue</option>
            </select>
            {form.status === "Entregue" && (
              <>
                <label className="label">Forma de Pagamento</label>
                <select className="input" value={form.paymentMethod} onChange={e => setForm({...form, paymentMethod: e.target.value})}>
                  <option value="">Selecione...</option>
                  {Object.keys(PAYMENT_METHODS).map(m => <option key={m} value={m}>{m}</option>)}
                </select>
              </>
            )}
            <button className="btn-primary" onClick={save}>Salvar</button>
          </div>
        </div>
      )}
    </div>
  );
}

// ── ABA FINANCEIRO ─────────────────────────────────────────────────────────
function FinanceTab({ services, expenses, setExpenses }: any) {
  const [modal, setModal] = useState(false);
  const [form, setForm] = useState<any>({});
  const month = new Date().getMonth();

  const totalIn = services.filter((s:any) => s.status === "Entregue" && new Date(s.exitDate + "T12:00:00").getMonth() === month)
    .reduce((acc:any, s:any) => acc + s.netValue, 0);
  const totalOut = expenses.filter((e:any) => new Date(e.expense_date + "T12:00:00").getMonth() === month)
    .reduce((acc:any, e:any) => acc + Number(e.value), 0);

  const saveExp = async () => {
    const row = { ...form, id: uid() };
    const { data } = await supabase.from("expenses").insert(row).select();
    if (data) setExpenses([data[0], ...expenses]);
    setModal(false);
  };

  return (
    <div>
      <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:10, marginBottom:15 }}>
        <div className="card" style={{borderLeft:"4px solid #10b981"}}><label className="label">Entradas</label><strong>{fmt(totalIn)}</strong></div>
        <div className="card" style={{borderLeft:"4px solid #ef4444"}}><label className="label">Gastos</label><strong>{fmt(totalOut)}</strong></div>
      </div>
      <button className="btn-primary" onClick={() => setModal(true)}>+ Lançar Gasto</button>
      {modal && (
        <div className="modal-bg" onClick={() => setModal(false)}>
          <div className="modal" onClick={e => e.stopPropagation()}>
            <label className="label">Categoria</label><input className="input" onChange={e => setForm({...form, category: e.target.value})} />
            <label className="label">Valor</label><input className="input" type="number" onChange={e => setForm({...form, value: e.target.value})} />
            <label className="label">Data</label><input className="input" type="date" onChange={e => setForm({...form, expense_date: e.target.value})} />
            <button className="btn-primary" onClick={saveExp}>Salvar</button>
          </div>
        </div>
      )}
    </div>
  );
}

// ── ABA VEÍCULOS ──────────────────────────────────────────────────────────
function VehiclesTab({ vehicles, setVehicles, services }: any) {
  const [modal, setModal] = useState(false);
  const [form, setForm] = useState<any>({});

  const save = async () => {
    const row = { ...form, id: form.id || uid() };
    const { data } = await supabase.from("vehicles").upsert(row).select();
    if (data) {
      if (form.id) setVehicles(vehicles.map((v:any) => v.id === form.id ? mapV(data[0]) : v));
      else setVehicles([mapV(data[0]), ...vehicles]);
    }
    setModal(false);
  };

  return (
    <div>
      <button className="btn-primary" onClick={() => { setForm({}); setModal(true); }} style={{marginBottom:15}}>+ Novo Carro</button>
      {vehicles.map((v: any) => (
        <div key={v.id} className="card" style={{display:"flex", justifyContent:"space-between", alignItems:"center"}}>
          <div><strong>{v.plate}</strong><br/><small>{v.brand} {v.model}</small></div>
          <button onClick={() => { setForm(v); setModal(true); }} style={{background:"none", border:"1px solid #1e2736", color:"#fff", padding:5, borderRadius:5}}>✏️</button>
        </div>
      ))}
      {modal && (
        <div className="modal-bg" onClick={() => setModal(false)}>
          <div className="modal" onClick={e => e.stopPropagation()}>
            <label className="label">Placa</label><input className="input" value={form.plate} onChange={e => setForm({...form, plate: e.target.value.toUpperCase()})} />
            <label className="label">Marca</label><input className="input" value={form.brand} onChange={e => setForm({...form, brand: e.target.value})} />
            <label className="label">Modelo</label><input className="input" value={form.model} onChange={e => setForm({...form, model: e.target.value})} />
            <button className="btn-primary" onClick={save}>Salvar</button>
          </div>
        </div>
      )}
    </div>
  );
}
