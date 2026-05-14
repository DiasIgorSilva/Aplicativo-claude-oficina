import { useState, useEffect, useRef } from "react";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const supabase = createClient(
  "https://bofhihxpqmqimkanwkyw.supabase.co",
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImJvZmhpaHhwcW1xaW1rYW53a3l3Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzUwODQ3OTMsImV4cCI6MjA5MDY2MDc5M30.fOOD-FweGID1x2mlJ3LWImtw7B6m6Pc-8auXLIuCqbw"
);

// ── AUXILIARES ────────────────────────────────────────────────────────────
const uid = () => Math.random().toString(36).slice(2, 10);
const fmt = (n: any) => new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(n || 0);
const today = () => new Date().toISOString().slice(0, 10);
const fmtDate = (d: any) => d ? new Date(d + "T12:00:00").toLocaleDateString("pt-BR") : "—";

const PAYMENT_METHODS: any = {
  "Dinheiro": 0, "Pix": 0, "Débito": 1.9,
  "Crédito 1x": 0.79, "Crédito 2x": 1.58, "Crédito 3x": 2.37, "Crédito 4x": 3.16,
  "Crédito 5x": 3.95, "Crédito 6x": 4.74, "Crédito 7x": 5.53, "Crédito 8x": 6.32,
  "Crédito 9x": 7.11, "Crédito 10x": 7.90, "Crédito 11x": 8.69, "Crédito 12x": 9.48
};

const MONTHS = ["Janeiro", "Fevereiro", "Março", "Abril", "Maio", "Junho", "Julho", "Agosto", "Setembro", "Outubro", "Novembro", "Dezembro"];

// ── MAPEADORES DE SEGURANÇA ───────────────────────────────────────────────
const mapV = (r: any) => ({
  id: r.id, plate: r.plate, brand: r.brand, model: r.model, year: r.year, 
  owner: r.owner, phone: r.phone, mileage: r.mileage || 0
});

const mapS = (r: any) => ({
  id: r.id, vehicleId: r.vehicle_id, vehiclePlate: r.vehicle_plate, 
  vehicleBrand: r.vehicle_brand, description: r.description,
  partsValue: Number(r.parts_value) || 0, laborValue: Number(r.labor_value) || 0,
  netValue: Number(r.net_value) || 0, status: r.status,
  entryDate: r.entry_date, exitDate: r.exit_date,
  paymentMethod: r.payment_method, mileage: r.mileage || 0
});

// ── APP ───────────────────────────────────────────────────────────────────
export default function App() {
  const [tab, setTab] = useState("dashboard");
  const [vehicles, setVehicles] = useState<any[]>([]);
  const [services, setServices] = useState<any[]>([]);
  const [expenses, setExpenses] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  async function loadAll() {
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

  useEffect(() => { loadAll(); }, []);

  return (
    <div style={{ minHeight: "100vh", background: "#0d0f14", color: "#e2e8f0", fontFamily: "sans-serif", paddingBottom: 80 }}>
      <style>{`
        .card{background:#161b26; border:1px solid #1e2736; border-radius:12px; padding:16px; margin-bottom:12px;}
        .btn-primary{background:#f97316; color:#0d0f14; border:none; border-radius:8px; padding:12px; font-weight:800; width:100%; cursor:pointer;}
        .input{background:#0d0f14; border:1px solid #1e2736; border-radius:8px; padding:10px; color:#fff; width:100%; margin-bottom:10px;}
        .label{font-size:10px; color:#64748b; text-transform:uppercase; margin-bottom:4px; display:block;}
        .bottom-nav{position:fixed; bottom:0; left:0; right:0; background:#0d0f14; border-top:1px solid #1e2736; display:flex; justify-content:space-around; padding:10px 0 20px; z-index:100;}
        .nav-item{background:none; border:none; color:#475569; font-size:10px; cursor:pointer; text-align:center;}
        .nav-item.active{color:#f97316;}
        .modal-bg{position:fixed; inset:0; background:rgba(0,0,0,.8); display:flex; align-items:center; justify-content:center; z-index:200; padding:16px;}
        .modal{background:#161b26; border:1px solid #1e2736; border-radius:16px; padding:20px; width:100%; max-width:450px;}
      `}</style>

      <header style={{ padding: 20, textAlign: "center", borderBottom: "1px solid #1e2736" }}>
        <h1 style={{ fontSize: 18 }}>🔩 AutoGestão</h1>
      </header>

      <main style={{ padding: 16, maxWidth: 600, margin: "0 auto" }}>
        {loading ? <p>Carregando...</p> : (
          <>
            {tab === "dashboard" && <Dashboard services={services} />}
            {tab === "services" && <ServicesTab services={services} setServices={setServices} vehicles={vehicles} />}
            {tab === "finance" && <FinanceTab services={services} expenses={expenses} setExpenses={setExpenses} />}
            {tab === "vehicles" && <VehiclesTab vehicles={vehicles} setVehicles={setVehicles} />}
          </>
        )}
      </main>

      <nav className="bottom-nav">
        {[{id:"dashboard", l:"Início", i:"⬡"}, {id:"services", l:"Oficina", i:"🔧"}, {id:"finance", l:"Financeiro", i:"💰"}, {id:"vehicles", l:"Base", i:"🚗"}].map(t => (
          <button key={t.id} onClick={() => setTab(t.id)} className={`nav-item ${tab === t.id ? 'active' : ''}`}>
            <div style={{fontSize:20}}>{t.i}</div>{t.l}
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
        <div key={s.id} className="card" style={{fontSize:13}}>
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
      entry_date: form.entryDate || today(),
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
          <div style={{fontSize:13}}><strong>{s.vehiclePlate}</strong><br/><small>{s.description}</small></div>
          <button onClick={() => { setForm(s); setModal(true); }} style={{background:"none", border:"1px solid #1e2736", color:"#fff", padding:8, borderRadius:8}}>✏️</button>
        </div>
      ))}
      {modal && (
        <div className="modal-bg" onClick={() => setModal(false)}>
          <div className="modal" onClick={e => e.stopPropagation()}>
            <label className="label">Carro</label>
            <select className="input" value={form.vehicleId} onChange={e => setForm({...form, vehicleId: e.target.value})}>
              <option value="">Selecione...</option>
              {vehicles.map((v:any) => <option key={v.id} value={v.id}>{v.plate} - {v.model}</option>)}
            </select>
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
                <label className="label">Pagamento</label>
                <select className="input" value={form.paymentMethod} onChange={e => setForm({...form, paymentMethod: e.target.value})}>
                  <option value="">Escolha...</option>
                  {Object.keys(PAYMENT_METHODS).map(m => <option key={m} value={m}>{m}</option>)}
                </select>
                <label className="label">Data de Entrega</label>
                <input className="input" type="date" value={form.exitDate || today()} onChange={e => setForm({...form, exitDate: e.target.value})} />
              </>
            )}
            <button className="btn-primary" onClick={save} style={{marginTop:10}}>Salvar</button>
          </div>
        </div>
      )}
    </div>
  );
}

// ── ABA FINANCEIRO (CORREÇÃO AQUI) ─────────────────────────────────────────
function FinanceTab({ services, expenses, setExpenses }: any) {
  const [modal, setModal] = useState(false);
  const [form, setForm] = useState<any>({ expense_date: today() });
  const [selMonth, setSelMonth] = useState(new Date().getMonth());

  // Entradas: Apenas serviços entregues no mês selecionado
  const totalIn = services.filter((s:any) => s.status === "Entregue" && s.exitDate && new Date(s.exitDate + "T12:00:00").getMonth() === selMonth)
    .reduce((acc:any, s:any) => acc + s.netValue, 0);

  // Saídas: Apenas despesas do mês selecionado
  const filteredExp = expenses.filter((e:any) => e.expense_date && new Date(e.expense_date + "T12:00:00").getMonth() === selMonth);
  const totalOut = filteredExp.reduce((acc:any, e:any) => acc + Number(e.value || 0), 0);

  const saveExp = async () => {
    if (!form.category || !form.value) return alert("Preencha categoria e valor.");
    const row = { 
      id: uid(), 
      category: form.category, 
      value: Number(form.value), 
      supplier: form.supplier || "Geral", 
      expense_date: form.expense_date || today() 
    };
    const { data } = await supabase.from("expenses").insert(row).select();
    if (data) {
      setExpenses([data[0], ...expenses]);
      setModal(false);
      setForm({ expense_date: today() });
    }
  };

  return (
    <div>
      <div className="card" style={{background: "#1a2030"}}>
        <label className="label">Mês de Análise</label>
        <select className="input" value={selMonth} onChange={e => setSelMonth(Number(e.target.value))}>
          {MONTHS.map((m, i) => <option key={i} value={i}>{m}</option>)}
        </select>
      </div>

      <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:10, marginBottom:15 }}>
        <div className="card" style={{borderLeft:"4px solid #10b981", marginBottom:0}}><label className="label">Entradas</label><strong>{fmt(totalIn)}</strong></div>
        <div className="card" style={{borderLeft:"4px solid #ef4444", marginBottom:0}}><label className="label">Gastos</label><strong>{fmt(totalOut)}</strong></div>
      </div>
      
      <button className="btn-primary" onClick={() => setModal(true)}>+ Lançar Gasto</button>

      <div className="card" style={{marginTop:15}}>
        <h3 style={{fontSize:13, marginBottom:10}}>Histórico do Mês</h3>
        {filteredExp.length === 0 ? <p style={{fontSize:11, color:"#64748b"}}>Nenhum gasto neste mês.</p> : filteredExp.map((e:any) => (
          <div key={e.id} style={{display:"flex", justifyContent:"space-between", padding:"8px 0", borderBottom:"1px solid #1e2736", fontSize:12}}>
            <div><strong>{e.category}</strong><br/><small>{e.supplier} - {fmtDate(e.expense_date)}</small></div>
            <div style={{color:"#ef4444"}}>-{fmt(e.value)}</div>
          </div>
        ))}
      </div>

      {modal && (
        <div className="modal-bg" onClick={() => setModal(false)}>
          <div className="modal" onClick={e => e.stopPropagation()}>
            <h3>Novo Gasto</h3>
            <label className="label">Categoria (Luz, Peças...)</label><input className="input" onChange={e => setForm({...form, category: e.target.value})} />
            <label className="label">Valor (R$)</label><input className="input" type="number" onChange={e => setForm({...form, value: e.target.value})} />
            <label className="label">Fornecedor</label><input className="input" onChange={e => setForm({...form, supplier: e.target.value})} />
            <label className="label">Data</label><input className="input" type="date" value={form.expense_date} onChange={e => setForm({...form, expense_date: e.target.value})} />
            <button className="btn-primary" onClick={saveExp}>Salvar Despesa</button>
          </div>
        </div>
      )}
    </div>
  );
}

// ── ABA VEÍCULOS ──────────────────────────────────────────────────────────
function VehiclesTab({ vehicles, setVehicles }: any) {
  const [modal, setModal] = useState(false);
  const [form, setForm] = useState<any>({});

  const save = async () => {
    const row = { ...form, id: form.id || uid(), plate: form.plate?.toUpperCase() };
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
          <div style={{fontSize:13}}><strong>{v.plate}</strong><br/><small>{v.brand} {v.model}</small></div>
          <button onClick={() => { setForm(v); setModal(true); }} style={{background:"none", border:"1px solid #1e2736", color:"#fff", padding:8, borderRadius:8}}>✏️</button>
        </div>
      ))}
      {modal && (
        <div className="modal-bg" onClick={() => setModal(false)}>
          <div className="modal" onClick={e => e.stopPropagation()}>
            <label className="label">Placa</label><input className="input" value={form.plate} onChange={e => setForm({...form, plate: e.target.value})} />
            <label className="label">Marca</label><input className="input" value={form.brand} onChange={e => setForm({...form, brand: e.target.value})} />
            <label className="label">Modelo</label><input className="input" value={form.model} onChange={e => setForm({...form, model: e.target.value})} />
            <button className="btn-primary" onClick={save}>Salvar</button>
          </div>
        </div>
      )}
    </div>
  );
}
