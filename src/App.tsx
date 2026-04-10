import { useState, useEffect } from "react";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const supabase = createClient(
  "https://bofhihxpqmqimkanwkyw.supabase.co",
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImJvZmhpaHhwcW1xaW1rYW53a3l3Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzUwODQ3OTMsImV4cCI6MjA5MDY2MDc5M30.fOOD-FweGID1x2mlJ3LWImtw7B6m6Pc-8auXLIuCqbw"
);

const uid = () => Math.random().toString(36).slice(2, 10);
const fmt = (n) => new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(n || 0);
const today = () => new Date().toISOString().slice(0, 10);
const fmtDate = (d) => d ? new Date(d + "T12:00:00").toLocaleDateString("pt-BR") : "—";

const STATUS_COLORS = { "Aguardando": "#f59e0b", "Em andamento": "#3b82f6", "Pronto": "#10b981", "Entregue": "#6b7280" };

// ── Gerador de PDF ──
function generatePDF(vehicles, services, dateFrom, dateTo) {
  const fS = services.filter(s => { const d = s.createdAt?.slice(0,10); return d && d >= dateFrom && d <= dateTo; });
  const tP = fS.reduce((s,sv) => s+(Number(sv.partsValue)||0), 0);
  const tL = fS.reduce((s,sv) => s+(Number(sv.laborValue)||0), 0);
  const html = `<!DOCTYPE html><html lang="pt-BR"><head><meta charset="UTF-8"/><title>Relatório</title><style>
  *{box-sizing:border-box;margin:0;padding:0;}body{font-family:Arial,sans-serif;font-size:12px;color:#1e293b;padding:30px;}
  .hdr{display:flex;justify-content:space-between;margin-bottom:20px;border-bottom:2px solid #f97316;padding-bottom:10px;}
  table{width:100%;border-collapse:collapse;margin-top:20px;}th{background:#f8fafc;padding:8px;text-align:left;border-bottom:2px solid #e2e8f0;}
  td{padding:8px;border-bottom:1px solid #f1f5f9;}</style></head><body>
  <div class="hdr"><strong>AutoGestão - Relatório Financeiro</strong><span>Período: ${fmtDate(dateFrom)} a ${fmtDate(dateTo)}</span></div>
  <p>Total Peças: ${fmt(tP)} | Total M.O: ${fmt(tL)} | <strong>Geral: ${fmt(tP+tL)}</strong></p>
  <script>window.onload=()=>window.print();</script></body></html>`;
  const blob = new Blob([html], { type: "text/html" });
  const url = URL.createObjectURL(blob);
  window.open(url, "_blank");
}

export default function App() {
  const [tab, setTab] = useState("dashboard");
  const [vehicles, setVehicles] = useState([]);
  const [services, setServices] = useState([]);
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showReport, setShowReport] = useState(false);

  useEffect(() => {
    async function fetchAll() {
      setLoading(true);
      const [v, s, a] = await Promise.all([
        supabase.from("vehicles").select("*").order("created_at", { ascending: false }),
        supabase.from("services").select("*").order("created_at", { ascending: false }),
        supabase.from("appointments").select("*").order("date", { ascending: true }),
      ]);
      if (v.data) setVehicles(v.data.map(mapV));
      if (s.data) setServices(s.data.map(mapS));
      if (a.data) setAppointments(a.data.map(mapA));
      setLoading(false);
    }
    fetchAll();
  }, []);

  const mapV = r => ({ id: r.id, plate: r.plate, brand: r.brand, model: r.model, year: r.year, color: r.color, owner: r.owner, phone: r.phone, notes: r.notes, createdAt: r.created_at });
  const mapS = r => ({ id: r.id, vehicleId: r.vehicle_id, vehiclePlate: r.vehicle_plate, vehicleBrand: r.vehicle_brand, vehicleModel: r.vehicle_model, description: r.description, partsValue: r.parts_value, laborValue: r.labor_value, status: r.status, createdAt: r.created_at });
  const mapA = r => ({ id: r.id, clientName: r.client_name, date: r.date, status: r.status });

  const tabs = [
    { id: "dashboard", label: "Início", icon: "⬡" },
    { id: "services", label: "Oficina", icon: "🔧" },
    { id: "vehicles", label: "Base Carros", icon: "🚗" },
    { id: "appointments", label: "Agenda", icon: "📅" },
  ];

  return (
    <div style={{ minHeight: "100vh", background: "#0d0f14", color: "#e2e8f0", fontFamily: "'DM Mono', monospace", display: "flex", flexDirection: "column", paddingBottom: 80, width: "100%", overflowX: "hidden" }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=DM+Mono:wght@300;400;500&family=Syne:wght@700;800&display=swap');
        *{box-sizing:border-box;margin:0;padding:0;}
        body, html { width: 100%; overflow-x: hidden; }
        .card{background:#161b26;border:1px solid #1e2736;border-radius:12px;padding:16px; width: 100%;}
        .btn-primary{background:#f97316;color:#0d0f14;border:none;border-radius:8px;padding:10px 18px;font-weight:800;cursor:pointer;font-size:13px;}
        .btn-ghost{background:transparent;color:#94a3b8;border:1px solid #1e2736;border-radius:8px;padding:8px 12px;cursor:pointer;font-size:12px;}
        .btn-danger{background:transparent;color:#ef4444;border:1px solid #3f1212;border-radius:8px;padding:8px 12px;cursor:pointer;font-size:12px;}
        .input{background:#0d0f14;border:1px solid #1e2736;border-radius:8px;padding:10px 12px;color:#e2e8f0;width:100%;font-family:inherit;}
        .label{display:block;font-size:11px;color:#64748b;margin-bottom:5px;text-transform:uppercase;}
        .badge{display:inline-block;border-radius:20px;padding:2px 8px;font-size:10px;font-weight:600;}
        .kpi-grid{display:grid;grid-template-columns: 1fr 1fr; gap:10px; width: 100%;}
        @media(min-width:768px){.kpi-grid{grid-template-columns:repeat(5,1fr); gap:16px;}}
        .table-wrap{overflow-x:auto; width: 100%; -webkit-overflow-scrolling:touch;}
        .table-row{display:grid;align-items:center;padding:14px;border-bottom:1px solid #1e2736;min-width:650px;}
        .table-header{display:grid;padding:12px 14px;font-size:10px;color:#475569;text-transform:uppercase;border-bottom:1px solid #1e2736;min-width:650px;font-weight:700;}
        .modal-bg{position:fixed;inset:0;background:rgba(0,0,0,.85);display:flex;align-items:flex-end;justify-content:center;z-index:100;}
        .modal{background:#161b26;border-radius:16px 16px 0 0;padding:24px;width:100%;max-height:90vh;overflow-y:auto;}
        @media(min-width:640px){.modal-bg{align-items:center;padding:20px;}.modal{border-radius:16px;max-width:500px;}}
        .bottom-nav{position:fixed;bottom:0;left:0;right:0;background:#0d0f14;border-top:1px solid #1e2736;z-index:50;padding:10px 0 20px;}
        .nav-item{display:flex;flex-direction:column;align-items:center;gap:4px;flex:1;background:none;border:none;color:#475569;font-size:10px;cursor:pointer;font-family:inherit;}
        .nav-item.active{color:#f97316;}
      `}</style>

      <header style={{padding:"14px 20px",borderBottom:"1px solid #1e2736",display:"flex",alignItems:"center",justifyContent:"space-between",background:"#0d0f14"}}>
        <div style={{display:"flex",alignItems:"center",gap:10}}>
          <div style={{width:32,height:32,background:"#f97316",borderRadius:8,display:"flex",alignItems:"center",justifyContent:"center",fontSize:18}}>🔩</div>
          <div style={{fontFamily:"'Syne', sans-serif",fontSize:18,fontWeight:800}}>AutoGestão</div>
        </div>
        <button className="btn-primary" style={{background:"#7c3aed", color:"#fff", fontSize:11}} onClick={() => setShowReport(true)}>📄 PDF</button>
      </header>

      <main style={{flex:1,padding:"20px", width:"100%", maxWidth:1200, margin:"0 auto"}}>
        {loading ? <div style={{textAlign:"center",padding:100}}>Sincronizando...</div> : (
          <>
            {tab==="dashboard" && <Dashboard services={services} vehicles={vehicles} />}
            {tab==="services" && <Services services={services} setServices={setServices} vehicles={vehicles} mapS={mapS} />}
            {tab==="vehicles" && <Vehicles vehicles={vehicles} setVehicles={setVehicles} mapV={mapV} />}
            {tab==="appointments" && <div className="card" style={{textAlign:"center", color:"#475569"}}>Módulo de Agenda ativo.</div>}
          </>
        )}
      </main>

      <nav className="bottom-nav">
        <div style={{display:"flex", justifyContent:"space-around"}}>
          {tabs.map(t => (
            <button key={t.id} className={`nav-item ${tab===t.id?"active":""}`} onClick={() => setTab(t.id)}>
              <span style={{fontSize:22}}>{t.icon}</span>{t.label}
            </button>
          ))}
        </div>
      </nav>

      {showReport && <ReportModal onClose={() => setShowReport(false)} onGenerate={(f,t) => {generatePDF(vehicles,services,f,t);setShowReport(false);}}/>}
    </div>
  );
}

function Dashboard({services, vehicles}) {
  const activeServices = services.filter(s => s.status !== "Entregue");
  const tP = services.reduce((acc, s) => acc + (Number(s.partsValue) || 0), 0);
  const tL = services.reduce((acc, s) => acc + (Number(s.laborValue) || 0), 0);
  const kpis = [
    {label:"Na Oficina",value:activeServices.length,icon:"🔧",accent:"#f97316"},
    {label:"Base Carros",value:vehicles.length,icon:"🚗",accent:"#3b82f6"},
    {label:"Peças",value:fmt(tP),icon:"⚙️",accent:"#6366f1"},
    {label:"Mão de Obra",value:fmt(tL),icon:"🔧",accent:"#10b981"},
    {label:"Total",value:fmt(tP+tL),icon:"💰",accent:"#10b981"},
  ];
  return (
    <div style={{display:"flex",flexDirection:"column",gap:20}}>
      <div className="kpi-grid">
        {kpis.map((k,i)=>(
          <div key={i} className="card" style={{borderLeft:`3px solid ${k.accent}`, padding: "12px"}}>
            <div style={{fontSize:16}}>{k.icon}</div>
            <div style={{fontSize:15,fontWeight:800,marginTop:6, color:"#f1f5f9"}}>{k.value}</div>
            <div style={{fontSize:9,color:"#475569",textTransform:"uppercase", marginTop:2}}>{k.label}</div>
          </div>
        ))}
      </div>
      <div className="card">
        <h3 style={{fontSize:14,marginBottom:12,fontFamily:"'Syne',sans-serif"}}>Fluxo de Hoje</h3>
        {activeServices.slice(0,5).map(sv=>(
          <div key={sv.id} style={{display:"flex",justifyContent:"space-between",padding:"10px 0",borderBottom:"1px solid #1e2736", alignItems:"center"}}>
            <div style={{flex:1, paddingRight:10}}>
              <div style={{fontSize:12, color:"#e2e8f0", wordBreak:"break-word"}}>{sv.description}</div>
              <div style={{fontSize:10,color:"#475569"}}>{sv.vehiclePlate} • <StatusBadge status={sv.status} map={STATUS_COLORS}/></div>
            </div>
            <div style={{fontSize:12,color:"#f97316",fontWeight:700}}>{fmt((Number(sv.partsValue)||0)+(Number(sv.laborValue)||0))}</div>
          </div>
        ))}
      </div>
    </div>
  );
}

function Vehicles({vehicles,setVehicles,mapV}) {
  const [modal,setModal]=useState(false);
  const [editing,setEditing]=useState(null);
  const [search,setSearch]=useState("");
  const [form,setForm]=useState({});
  const [saving,setSaving]=useState(false);

  const open=(v=null)=>{setEditing(v);setForm(v||{});setModal(true);};
  const close=()=>{setModal(false);setEditing(null);setForm({});};

  const save=async()=>{
    if(!form.plate || !form.brand || !form.model) return alert("Placa, Marca e Modelo são obrigatórios.");
    setSaving(true);
    const row={id:editing?.id||uid(),plate:form.plate,brand:form.brand,model:form.model,year:form.year,color:form.color,owner:form.owner,phone:form.phone,notes:form.notes};
    const {data,error}=await supabase.from("vehicles").upsert(row).select();
    if(!error && data){const m=mapV(data[0]); if(editing)setVehicles(vehicles.map(v=>v.id===editing.id?m:v)); else setVehicles([m,...vehicles]);}
    setSaving(false);close();
  };

  const remove=async(id)=>{if(!confirm("Remover da base?"))return;await supabase.from("vehicles").delete().eq("id",id);setVehicles(vehicles.filter(v=>v.id!==id));};
  const filtered=vehicles.filter(v=>!search||v.plate?.toLowerCase().includes(search.toLowerCase())||v.owner?.toLowerCase().includes(search.toLowerCase()));
  const cols = "1.5fr 1.5fr 1fr 100px";

  return (
    <Section title="Base de Veículos" action={<button className="btn-primary" onClick={()=>open()}>+ Novo Cadastro</button>}>
      <input className="input" placeholder="Buscar placa ou cliente..." value={search} onChange={e=>setSearch(e.target.value)} style={{marginBottom:12}}/>
      <div className="card" style={{padding:0, overflow:"hidden"}}>
        <div className="table-wrap">
          <div className="table-header" style={{gridTemplateColumns:cols}}><span>Veículo / Placa</span><span>Cliente</span><span>Telefone</span><span>Ações</span></div>
          {filtered.map(v=>(
            <div key={v.id} className="table-row" style={{gridTemplateColumns:cols}}>
              <div><div style={{fontSize:13,fontWeight:700, color:"#f1f5f9"}}>{v.brand} {v.model} {v.year?`(${v.year})`:""}</div><div style={{fontSize:10,color:"#f97316"}}>{v.plate}</div></div>
              <div style={{fontSize:12}}>{v.owner||"—"}</div>
              <div style={{fontSize:12}}>{v.phone||"—"}</div>
              <div style={{display:"flex",gap:8}}>
                <button onClick={()=>open(v)} className="btn-ghost" style={{padding:"6px"}}>✏️</button>
                <button onClick={()=>remove(v.id)} className="btn-danger" style={{padding:"6px"}}>✕</button>
              </div>
            </div>
          ))}
        </div>
      </div>
      {modal && <div className="modal-bg" onClick={close}><div className="modal" onClick={e=>e.stopPropagation()}>
        <h3 style={{marginBottom:20}}>Cadastro Master</h3>
        <div style={{display:"grid", gridTemplateColumns:"1fr 1fr", gap:12, marginBottom:10}}>
          <Field label="Placa" value={form.plate} onChange={v=>setForm({...form,plate:v.toUpperCase()})}/>
          <Field label="Marca" value={form.brand} onChange={v=>setForm({...form,brand:v})} placeholder="Ex: VW, Toyota..."/>
        </div>
        <div style={{display:"grid", gridTemplateColumns:"1fr 1fr", gap:12, marginBottom:10}}>
          <Field label="Modelo" value={form.model} onChange={v=>setForm({...form,model:v})}/>
          <Field label="Ano" value={form.year} onChange={v=>setForm({...form,year:v})}/>
        </div>
        <div style={{display:"grid", gridTemplateColumns:"1fr 1fr", gap:12, marginBottom:10}}>
          <Field label="Cliente" value={form.owner} onChange={v=>setForm({...form,owner:v})}/>
          <Field label="Telefone" value={form.phone} onChange={v=>setForm({...form,phone:v})}/>
        </div>
        <Field label="Cor" value={form.color} onChange={v=>setForm({...form,color:v})}/>
        <Field label="Observações do Carro" value={form.notes} onChange={v=>setForm({...form,notes:v})}/>
        <div style={{display:"flex",gap:10,marginTop:20}}><button className="btn-primary" style={{flex:1}} onClick={save} disabled={saving}>Salvar Cadastro</button><button className="btn-ghost" style={{flex:1}} onClick={close}>Cancelar</button></div>
      </div></div>}
    </Section>
  );
}

function Services({services,setServices,vehicles,mapS}) {
  const [modal,setModal]=useState(false);
  const [editing,setEditing]=useState(null);
  const [form,setForm]=useState({});
  const [saving,setSaving]=useState(false);

  const open=(s=null)=>{setEditing(s);setForm(s||{status:"Aguardando", partsValue:0, laborValue:0});setModal(true);};
  const close=()=>{setModal(false);setEditing(null);setForm({});};

  const save=async()=>{
    if(!form.vehicleId || !form.description) return alert("Selecione um carro e descreva o serviço.");
    setSaving(true);
    const v=vehicles.find(v=>v.id===form.vehicleId);
    const row={
      id:editing?.id || uid(),
      vehicle_id: form.vehicleId,
      vehicle_plate: v?.plate,
      vehicle_brand: v?.brand,
      vehicle_model: v?.model,
      description: form.description,
      parts_value: Number(form.partsValue)||0,
      labor_value: Number(form.laborValue)||0,
      status: form.status
    };
    const {data, error}=await supabase.from("services").upsert(row).select();
    if(!error && data) {
      const m=mapS(data[0]);
      if(editing) setServices(services.map(s=>s.id===editing.id?m:s));
      else setServices([m,...services]);
      close();
    }
    setSaving(false);
  };

  const remove=async(id)=>{if(!confirm("Excluir serviço?"))return;await supabase.from("services").delete().eq("id",id);setServices(services.filter(s=>s.id!==id));};
  const cols = "1.8fr 1.2fr 0.8fr 0.8fr 1fr 90px";

  return (
    <Section title="Fluxo Oficina" action={<button className="btn-primary" onClick={()=>open()}>+ Entrada de Carro</button>}>
      <div className="card" style={{padding:0, overflow:"hidden"}}>
        <div className="table-wrap">
          <div className="table-header" style={{gridTemplateColumns:cols}}><span>Serviço</span><span>Veículo</span><span>Peças</span><span>M.O.</span><span>Status</span><span>Ações</span></div>
          {services.map(s=>(
            <div key={s.id} className="table-row" style={{gridTemplateColumns:cols}}>
              <div style={{fontSize:12, wordBreak:"break-word", paddingRight:10}}>{s.description}</div>
              <div style={{fontSize:11}}><div style={{fontWeight:700, color:"#f1f5f9"}}>{s.vehiclePlate}</div><div style={{fontSize:9, color:"#64748b"}}>{s.vehicleBrand} {s.vehicleModel}</div></div>
              <div style={{fontSize:11, color:"#3b82f6"}}>{fmt(s.partsValue)}</div>
              <div style={{fontSize:11, color:"#10b981"}}>{fmt(s.laborValue)}</div>
              <StatusBadge status={s.status} map={STATUS_COLORS}/>
              <div style={{display:"flex",gap:6}}><button onClick={()=>open(s)} className="btn-ghost" style={{padding:"6px"}}>✏️</button><button onClick={()=>remove(s.id)} className="btn-danger" style={{padding:"6px"}}>✕</button></div>
            </div>
          ))}
        </div>
      </div>
      {modal && <div className="modal-bg" onClick={close}><div className="modal" onClick={e=>e.stopPropagation()}>
        <h3>Fluxo de Serviço</h3>
        <SelectField label="Carro da Base" value={form.vehicleId} onChange={v=>setForm({...form,vehicleId:v})} options={vehicles.map(v=>({value:v.id,label:`${v.plate} - ${v.brand} ${v.model}`}))} placeholder="Selecione o veículo cadastrado"/>
        <Field label="Descrição" value={form.description} onChange={v=>setForm({...form,description:v})}/>
        <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:10}}>
          <Field label="Peças" type="number" value={form.partsValue} onChange={v=>setForm({...form,partsValue:v})}/>
          <Field label="Mão de Obra" type="number" value={form.laborValue} onChange={v=>setForm({...form,laborValue:v})}/>
        </div>
        <SelectField label="Status" value={form.status} onChange={v=>setForm({...form,status:v})} options={Object.keys(STATUS_COLORS)}/>
        <div style={{display:"flex",gap:10,marginTop:20}}><button className="btn-primary" style={{flex:1}} onClick={save} disabled={saving}>Salvar</button><button className="btn-ghost" style={{flex:1}} onClick={close}>Cancelar</button></div>
      </div></div>}
    </Section>
  )
}

function Section({title,action,children}) {
  return (
    <div style={{display:"flex",flexDirection:"column",gap:12}}><div style={{display:"flex",justifyContent:"space-between",alignItems:"center"}}><h1 style={{fontFamily:"'Syne',sans-serif",fontSize:20,fontWeight:800}}>{title}</h1>{action}</div>{children}</div>
  );
}

function StatusBadge({status,map}) {
  const color=(map||{})[status]||"#6b7280";
  return <span className="badge" style={{background:color+"22",color,border:`1px solid ${color}44`}}>{status||"—"}</span>;
}

function Field({label,value,onChange,type="text", placeholder}) {
  return <div style={{marginBottom:10}}><label className="label">{label}</label><input className="input" type={type} value={value||""} onChange={e=>onChange(e.target.value)} placeholder={placeholder}/></div>;
}

function SelectField({label,value,onChange,options,placeholder}) {
  return <div style={{marginBottom:10}}><label className="label">{label}</label>
    <select className="input" value={value} onChange={e=>onChange(e.target.value)} style={{appearance:"none"}}>
      {placeholder && <option value="">{placeholder}</option>}
      {options.map(o=> typeof o === 'string' ? <option key={o} value={o}>{o}</option> : <option key={o.value} value={o.value}>{o.label}</option>)}
    </select>
  </div>;
}

function ReportModal({onClose,onGenerate}){
  return <div className="modal-bg" onClick={onClose}><div className="modal" onClick={e=>e.stopPropagation()}>
    <h3>Relatório</h3>
    <button className="btn-primary" style={{width:"100%", marginTop:15}} onClick={()=>onGenerate(today(),today())}>Gerar PDF de Hoje</button>
    <button className="btn-ghost" style={{width:"100%",marginTop:10}} onClick={onClose}>Fechar</button>
  </div></div>
}
