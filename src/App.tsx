// AutoGestão v1.1.2 - Correção de Layout e Histórico de Veículos
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
const APPOINTMENT_STATUS = { "Agendado": "#6366f1", "Confirmado": "#10b981", "Cancelado": "#ef4444", "Concluído": "#6b7280" };

// --- PDF Generator ---
function generatePDF(vehicles, services, dateFrom, dateTo) {
  const fV = vehicles.filter(v => v.entryDate && v.entryDate >= dateFrom && v.entryDate <= dateTo);
  const fS = services.filter(s => { const d = s.createdAt?.slice(0,10); return d && d >= dateFrom && d <= dateTo; });
  const tP = fS.reduce((s,sv) => s+(Number(sv.partsValue)||0), 0);
  const tL = fS.reduce((s,sv) => s+(Number(sv.laborValue)||0), 0);
  const html = `<!DOCTYPE html><html lang="pt-BR"><head><meta charset="UTF-8"/><title>Relatório</title><style>
  *{box-sizing:border-box;margin:0;padding:0;}body{font-family:Arial,sans-serif;font-size:13px;color:#1e293b;padding:40px;}
  .hdr{display:flex;justify-content:space-between;margin-bottom:32px;padding-bottom:20px;border-bottom:3px solid #f97316;}
  .sec-title{font-size:14px;font-weight:700;padding:8px 12px;background:#f1f5f9;border-left:4px solid #f97316;margin:20px 0 12px;}
  .sum{display:grid;grid-template-columns:repeat(3,1fr);gap:16px;margin-bottom:24px;}
  .sum-card{border:1px solid #e2e8f0;border-radius:8px;padding:16px;}
  .sum-label{font-size:11px;color:#64748b;text-transform:uppercase;margin-bottom:6px;}
  .sum-val{font-size:20px;font-weight:700;}
  table{width:100%;border-collapse:collapse;}th{background:#f8fafc;padding:8px;text-align:left;font-size:11px;color:#475569;border-bottom:2px solid #e2e8f0;}
  td{padding:8px;border-bottom:1px solid #f1f5f9;font-size:12px;}
  .foot{margin-top:40px;padding-top:16px;border-top:1px solid #e2e8f0;text-align:center;font-size:11px;color:#94a3b8;}
  @media print{body{padding:20px;}}
  </style></head><body>
  <div class="hdr"><div><strong style="font-size:20px">🔩 AutoGestão</strong><br/><span style="color:#64748b;font-size:11px">Sistema de Gestão de Oficina</span></div>
  <div style="text-align:right"><strong>Relatório do Período</strong><br/><span style="color:#64748b;font-size:12px">${fmtDate(dateFrom)} até ${fmtDate(dateTo)}</span><br/><span style="color:#94a3b8;font-size:11px">Gerado em ${new Date().toLocaleDateString("pt-BR")}</span></div></div>
  <div class="sec-title">💰 Resumo Financeiro</div>
  <div class="sum">
    <div class="sum-card"><div class="sum-label">Receita em Peças</div><div class="sum-val" style="color:#3b82f6">${fmt(tP)}</div></div>
    <div class="sum-card"><div class="sum-label">Mão de Obra</div><div class="sum-val" style="color:#10b981">${fmt(tL)}</div></div>
    <div class="sum-card" style="border-color:#f97316"><div class="sum-label">Total Geral</div><div class="sum-val" style="color:#f97316">${fmt(tP+tL)}</div></div>
  </div>
  <div class="sec-title">🚗 Veículos (${fV.length})</div>
  <table><thead><tr><th>Placa</th><th>Modelo</th><th>Cliente</th><th>Status</th></tr></thead><tbody>
  ${fV.map(v=>`<tr><td><strong>${v.plate||"—"}</strong></td><td>${v.model}</td><td>${v.owner||"—"}</td><td>${v.status||"—"}</td></tr>`).join("")}
  </tbody></table>
  <div class="foot">AutoGestão · Relatório gerado automaticamente</div>
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
  const [quotes, setQuotes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showReport, setShowReport] = useState(false);

  useEffect(() => {
    async function fetchAll() {
      setLoading(true);
      const [v,s,a,q] = await Promise.all([
        supabase.from("vehicles").select("*").order("created_at",{ascending:false}),
        supabase.from("services").select("*").order("created_at",{ascending:false}),
        supabase.from("appointments").select("*").order("date",{ascending:true}),
        supabase.from("quotes").select("*").order("created_at",{ascending:false}),
      ]);
      if(v.data) setVehicles(v.data.map(mapV));
      if(s.data) setServices(s.data.map(mapS));
      if(a.data) setAppointments(a.data.map(mapA));
      if(q.data) setQuotes(q.data.map(mapQ));
      setLoading(false);
    }
    fetchAll();
  }, []);

  const mapV = r => ({id:r.id,plate:r.plate,model:r.model,year:r.year,color:r.color,owner:r.owner,phone:r.phone,serviceType:r.service_type,status:r.status,entryDate:r.entry_date,exitDate:r.exit_date,notes:r.notes,createdAt:r.created_at});
  const mapS = r => ({id:r.id,vehicleId:r.vehicle_id,vehiclePlate:r.vehicle_plate,vehicleModel:r.vehicle_model,description:r.description,partsValue:r.parts_value,laborValue:r.labor_value,partsList:r.parts_list,mechanic:r.mechanic,status:r.status,createdAt:r.created_at});
  const mapA = r => ({id:r.id,clientName:r.client_name,clientPhone:r.client_phone,date:r.date,time:r.time,plate:r.plate,serviceType:r.service_type,mechanic:r.mechanic,status:r.status,notes:r.notes,createdAt:r.created_at});
  const mapQ = r => ({id:r.id,clientName:r.client_name,clientPhone:r.client_phone,plate:r.plate,vehicleModel:r.vehicle_model,serviceType:r.service_type,date:r.date,validUntil:r.valid_until,status:r.status,items:r.items||[],total:r.total,notes:r.notes,createdAt:r.created_at});

  const tabs = [
    {id:"dashboard",label:"Dashboard",icon:"⬡"},
    {id:"vehicles",label:"Veículos",icon:"🚗"},
    {id:"services",label:"Serviços",icon:"🔧"},
    {id:"appointments",label:"Agenda",icon:"📅"},
    {id:"quotes",label:"Orçamentos",icon:"📋"},
  ];

  return (
    <div style={{minHeight:"100vh",background:"#0d0f14",color:"#e2e8f0",fontFamily:"'DM Mono',monospace",display:"flex",flexDirection:"column",paddingBottom:80, width:"100%", overflowX:"hidden"}}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=DM+Mono:wght@300;400;500&family=Syne:wght@700;800&display=swap');
        *{box-sizing:border-box;margin:0;padding:0;}
        body, html { width: 100%; overflow-x: hidden; }
        .card{background:#161b26;border:1px solid #1e2736;border-radius:12px;padding:16px; width: 100%;}
        .btn-primary{background:#f97316;color:#0d0f14;border:none;border-radius:8px;padding:9px 16px;font-family:inherit;font-weight:600;font-size:13px;}
        .btn-ghost{background:transparent;color:#94a3b8;border:1px solid #1e2736;border-radius:8px;padding:7px 14px;font-family:inherit;font-size:12px;}
        .btn-pdf{background:#7c3aed;color:#fff;border:none;border-radius:8px;padding:8px 14px;font-family:inherit;font-weight:500;font-size:12px;display:flex;align-items:center;gap:5px;}
        .input{background:#0d0f14;border:1px solid #1e2736;border-radius:8px;padding:9px 12px;color:#e2e8f0;font-family:inherit;font-size:13px;width:100%;}
        .label{display:block;font-size:11px;color:#64748b;margin-bottom:5px;text-transform:uppercase;}
        .badge{display:inline-block;border-radius:20px;padding:2px 8px;font-size:10px;font-weight:500;}
        
        /* Grid de KPIs - Corrigido para não vazar */
        .kpi-grid{display:grid;grid-template-columns: 1fr 1fr; gap:10px; width: 100%;}
        @media(min-width:768px){.kpi-grid{grid-template-columns:repeat(3,1fr); gap:16px;}}

        .dash-grid{display:grid;grid-template-columns:1fr;gap:16px;}
        @media(min-width:768px){.dash-grid{grid-template-columns:1fr 1fr;}}

        .table-wrap{overflow-x:auto; width: 100%; -webkit-overflow-scrolling:touch;}
        .table-row{display:grid;align-items:center;padding:12px;border-bottom:1px solid #1e2736;min-width:550px;}
        .table-header{display:grid;padding:10px 12px;font-size:10px;color:#475569;text-transform:uppercase;border-bottom:1px solid #1e2736;min-width:550px;}

        .modal-bg{position:fixed;inset:0;background:rgba(0,0,0,.8);display:flex;align-items:flex-end;justify-content:center;z-index:100;}
        .modal{background:#161b26;border-radius:16px 16px 0 0;padding:20px;width:100%;max-height:90vh;overflow-y:auto;}
        @media(min-width:640px){.modal-bg{align-items:center;padding:20px;}.modal{border-radius:16px;max-width:500px;}}

        .bottom-nav{position:fixed;bottom:0;left:0;right:0;background:#0d0f14;border-top:1px solid #1e2736;z-index:50;padding:8px 0 12px; width:100%;}
        .nav-item{display:flex;flex-direction:column;align-items:center;gap:2px;flex:1;background:transparent;border:none;color:#475569;font-size:10px;}
        .nav-item.active{color:#f97316;}
        .nav-item span{font-size:20px;}
      `}</style>

      <header style={{padding:"12px 16px",borderBottom:"1px solid #1e2736",display:"flex",alignItems:"center",justifyContent:"space-between",background:"#0d0f14"}}>
        <div style={{display:"flex",alignItems:"center",gap:10}}>
          <div style={{width:32,height:32,background:"#f97316",borderRadius:8,display:"flex",alignItems:"center",justifyContent:"center",fontSize:18}}>🔩</div>
          <div>
            <div style={{fontFamily:"'Syne',sans-serif",fontSize:16,fontWeight:800,color:"#f1f5f9"}}>AutoGestão</div>
            <div style={{fontSize:10,color:"#475569"}}>v1.1.2</div>
          </div>
        </div>
        <button className="btn-pdf" onClick={() => setShowReport(true)}>📄 PDF</button>
      </header>

      <main style={{flex:1,padding:"16px", width:"100%", maxWidth:"1100px", margin:"0 auto"}}>
        {loading ? (
          <div style={{textAlign:"center",padding:60}}>Carregando...</div>
        ) : (
          <>
            {tab==="dashboard" && <Dashboard vehicles={vehicles} services={services} appointments={appointments} quotes={quotes} setTab={setTab}/>}
            {tab==="vehicles" && <Vehicles vehicles={vehicles} setVehicles={setVehicles} services={services} mapV={mapV}/>}
            {tab==="services" && <Services services={services} setServices={setServices} vehicles={vehicles} mapS={mapS}/>}
            {tab==="appointments" && <Appointments appointments={appointments} setAppointments={setAppointments} mapA={mapA}/>}
            {tab==="quotes" && <Quotes quotes={quotes} setQuotes={setQuotes} mapQ={mapQ}/>}
          </>
        )}
      </main>

      <nav className="bottom-nav">
        <div style={{display:"flex", justifyContent:"space-around"}}>
          {tabs.map(t => (
            <button key={t.id} className={`nav-item ${tab===t.id?"active":""}`} onClick={() => setTab(t.id)}>
              <span>{t.icon}</span>{t.label}
            </button>
          ))}
        </div>
      </nav>

      {showReport && <ReportModal vehicles={vehicles} services={services} onClose={() => setShowReport(false)} onGenerate={(f,t) => {generatePDF(vehicles,services,f,t);setShowReport(false);}}/>}
    </div>
  );
}

// --- Dashboard ---
function Dashboard({vehicles,services,appointments,quotes,setTab}) {
  const active = vehicles.filter(v=>v.status!=="Entregue").length;
  const tP = services.reduce((s,sv)=>s+(Number(sv.partsValue)||0),0);
  const tL = services.reduce((s,sv)=>s+(Number(sv.laborValue)||0),0);
  const todayA = appointments.filter(a=>a.date===today()&&a.status!=="Cancelado").length;
  
  const kpis = [
    {label:"Oficina",value:active,icon:"🚗",accent:"#f97316"},
    {label:"Peças",value:fmt(tP),icon:"⚙️",accent:"#3b82f6"},
    {label:"Mão de Obra",value:fmt(tL),icon:"🔧",accent:"#10b981"},
    {label:"Hoje",value:todayA,icon:"📅",accent:"#6366f1"},
    {label:"Receita Total",value:fmt(tP+tL),icon:"💰",accent:"#10b981"},
  ];

  return (
    <div style={{display:"flex",flexDirection:"column",gap:16}}>
      <h1 style={{fontFamily:"'Syne',sans-serif",fontSize:22,fontWeight:800}}>Dashboard</h1>
      <div className="kpi-grid">
        {kpis.map((k,i)=>(
          <div key={i} className="card" style={{borderLeft:`3px solid ${k.accent}`, padding: "12px"}}>
            <div style={{fontSize:16}}>{k.icon}</div>
            <div style={{fontSize:15,fontWeight:700,marginTop:4}}>{k.value}</div>
            <div style={{fontSize:9,color:"#475569",textTransform:"uppercase"}}>{k.label}</div>
          </div>
        ))}
      </div>
      <div className="dash-grid">
        <div className="card">
          <h3 style={{fontSize:14,marginBottom:12}}>Últimos Serviços</h3>
          {services.slice(0,4).map(sv=>(
            <div key={sv.id} style={{display:"flex",justifyContent:"space-between",padding:"8px 0",borderBottom:"1px solid #1e2736"}}>
              <div style={{minWidth:0}}><div style={{fontSize:12,whiteSpace:"nowrap",overflow:"hidden",textOverflow:"ellipsis"}}>{sv.description}</div><div style={{fontSize:10,color:"#475569"}}>{sv.vehiclePlate}</div></div>
              <div style={{fontSize:12,color:"#10b981",fontWeight:600}}>{fmt((Number(sv.partsValue)||0)+(Number(sv.laborValue)||0))}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

// --- Veículos com Lógica de Último Serviço ---
function Vehicles({vehicles,setVehicles,services,mapV}) {
  const [modal,setModal]=useState(false);
  const [editing,setEditing]=useState(null);
  const [search,setSearch]=useState("");
  const [form,setForm]=useState({});
  const [saving,setSaving]=useState(false);

  const open=(v=null)=>{setEditing(v);setForm(v||{status:"Aguardando",entryDate:today()});setModal(true);};
  const close=()=>{setModal(false);setEditing(null);setForm({});};

  const save=async()=>{
    if(!form.plate||!form.model)return alert("Placa e modelo são obrigatórios.");
    setSaving(true);
    const row={id:editing?.id||uid(),plate:form.plate,model:form.model,owner:form.owner,phone:form.phone,status:form.status,entry_date:form.entryDate};
    const {data,error}=await supabase.from("vehicles").upsert(row).select();
    if(!error && data){const m=mapV(data[0]); if(editing)setVehicles(vehicles.map(v=>v.id===editing.id?m:v)); else setVehicles([m,...vehicles]);}
    setSaving(false);close();
  };

  const filtered=vehicles.filter(v=>!search||v.plate?.toLowerCase().includes(search.toLowerCase())||v.owner?.toLowerCase().includes(search.toLowerCase()));

  return (
    <Section title="Veículos" subtitle="Gestão de pátio" action={<button className="btn-primary" onClick={()=>open()}>+ Novo</button>}>
      <input className="input" placeholder="Buscar placa ou cliente..." value={search} onChange={e=>setSearch(e.target.value)} style={{marginBottom:12}}/>
      <div className="card" style={{padding:0, overflow:"hidden"}}>
        <div className="table-wrap">
          <div className="table-header" style={{gridTemplateColumns:"1.2fr 1.5fr 1fr 1fr 80px"}}><span>Veículo</span><span>Cliente / Últ. Serviço</span><span>Entrada</span><span>Status</span><span>Ações</span></div>
          {filtered.map(v=>{
            // Lógica do Último Serviço
            const vServices = services.filter(s => s.vehicleId === v.id);
            const lastService = vServices.length > 0 ? [...vServices].sort((a,b)=>new Date(b.createdAt)-new Date(a.createdAt))[0] : null;

            return (
              <div key={v.id} className="table-row" style={{gridTemplateColumns:"1.2fr 1.5fr 1fr 1fr 80px"}}>
                <div><div style={{fontSize:13,fontWeight:600}}>{v.plate}</div><div style={{fontSize:10,color:"#64748b"}}>{v.model}</div></div>
                <div>
                  <div style={{fontSize:12}}>{v.owner||"—"}</div>
                  {lastService && <div style={{fontSize:9,color:"#f97316",marginTop:2}}>🕒 {lastService.description.substring(0,18)}...</div>}
                </div>
                <div style={{fontSize:11}}>{fmtDate(v.entryDate)}</div>
                <StatusBadge status={v.status} map={STATUS_COLORS}/>
                <div style={{display:"flex",gap:4}}><button onClick={()=>open(v)} className="btn-ghost" style={{padding:"4px"}}>✏️</button></div>
              </div>
            )
          })}
        </div>
      </div>
      {modal && <VehicleModal form={form} setForm={setForm} onSave={save} onClose={close} saving={saving}/>}
    </Section>
  );
}

// --- Outros Componentes Auxiliares (Simplicados para o exemplo) ---
function Services({services,setServices,vehicles,mapS}) {
  const [modal,setModal]=useState(false);
  const [form,setForm]=useState({status:"Aguardando"});
  const open=()=>setModal(true);
  const close=()=>setModal(false);
  const save=async()=>{
    const v=vehicles.find(v=>v.id===form.vehicleId);
    const row={id:uid(),vehicle_id:form.vehicleId,vehicle_plate:v?.plate,vehicle_model:v?.model,description:form.description,parts_value:form.partsValue,labor_value:form.laborValue,status:form.status};
    const {data}=await supabase.from("services").insert(row).select();
    if(data) setServices([mapS(data[0]),...services]);
    close();
  };
  return (
    <Section title="Serviços" subtitle="Histórico de manutenção" action={<button className="btn-primary" onClick={open}>+ Novo</button>}>
      <div className="card" style={{padding:0}}>
        <div className="table-wrap">
          <div className="table-header" style={{gridTemplateColumns:"2fr 1fr 1fr 1fr 60px"}}><span>Descrição</span><span>Veículo</span><span>Peças</span><span>M.O.</span><span>Ações</span></div>
          {services.map(s=>(
            <div key={s.id} className="table-row" style={{gridTemplateColumns:"2fr 1fr 1fr 1fr 60px"}}>
              <div style={{fontSize:12}}>{s.description}</div>
              <div style={{fontSize:11}}>{s.vehiclePlate}</div>
              <div style={{fontSize:11}}>{fmt(s.partsValue)}</div>
              <div style={{fontSize:11}}>{fmt(s.laborValue)}</div>
              <StatusBadge status={s.status} map={STATUS_COLORS}/>
            </div>
          ))}
        </div>
      </div>
      {modal && <div className="modal-bg"><div className="modal">
        <h3>Novo Serviço</h3>
        <SelectField label="Veículo" value={form.vehicleId} onChange={v=>setForm({...form,vehicleId:v})} options={vehicles.map(v=>({value:v.id,label:v.plate}))}/>
        <Field label="Descrição" value={form.description} onChange={v=>setForm({...form,description:v})}/>
        <div className="grid-2">
          <Field label="Peças" type="number" value={form.partsValue} onChange={v=>setForm({...form,partsValue:v})}/>
          <Field label="Mão de Obra" type="number" value={form.laborValue} onChange={v=>setForm({...form,laborValue:v})}/>
        </div>
        <div style={{display:"flex",gap:10,marginTop:10}}><button className="btn-primary" onClick={save}>Salvar</button><button onClick={close}>Sair</button></div>
      </div></div>}
    </Section>
  )
}

function Appointments({appointments,setAppointments,mapA}) {
  return <Section title="Agenda" subtitle="Próximos veículos" action={<button className="btn-primary">+ Novo</button>}>
    <div className="card"><Empty text="Agenda sincronizada"/></div>
  </Section>
}

function Quotes({quotes}) {
  return <Section title="Orçamentos" subtitle="Propostas pendentes" action={<button className="btn-primary">+ Novo</button>}>
    <div className="card"><Empty text="Nenhum orçamento"/></div>
  </Section>
}

// --- Componentes de Base ---
function VehicleModal({form,setForm,onSave,onClose,saving}){
  return (
    <div className="modal-bg" onClick={onClose}>
      <div className="modal" onClick={e=>e.stopPropagation()}>
        <h3>Veículo</h3>
        <div style={{display:"grid", gridTemplateColumns:"1fr 1fr", gap:10}}>
          <Field label="Placa" value={form.plate} onChange={v=>setForm({...form,plate:v.toUpperCase()})}/>
          <Field label="Modelo" value={form.model} onChange={v=>setForm({...form,model:v})}/>
          <Field label="Cliente" value={form.owner} onChange={v=>setForm({...form,owner:v})}/>
          <Field label="Telefone" value={form.phone} onChange={v=>setForm({...form,phone:v})}/>
        </div>
        <div style={{display:"flex",gap:10,marginTop:20}}>
          <button className="btn-primary" onClick={onSave}>{saving?"...":"Salvar"}</button>
          <button className="btn-ghost" onClick={onClose}>Voltar</button>
        </div>
      </div>
    </div>
  )
}

function ReportModal({onClose,onGenerate}){
  return <div className="modal-bg" onClick={onClose}><div className="modal" onClick={e=>e.stopPropagation()}>
    <h3>Relatório</h3>
    <button className="btn-primary" onClick={()=>onGenerate(today(),today())}>Gerar de Hoje</button>
    <button onClick={onClose} style={{marginTop:10}}>Fechar</button>
  </div></div>
}

function Section({title,subtitle,action,children}) {
  return (
    <div style={{display:"flex",flexDirection:"column",gap:12}}>
      <div style={{display:"flex",justifyContent:"space-between",alignItems:"center"}}>
        <div><h1 style={{fontFamily:"'Syne',sans-serif",fontSize:20,fontWeight:800}}>{title}</h1><p style={{fontSize:11,color:"#475569"}}>{subtitle}</p></div>
        {action}
      </div>
      {children}
    </div>
  );
}

function StatusBadge({status,map}) {
  const color=(map||{})[status]||"#6b7280";
  return <span className="badge" style={{background:color+"22",color,border:`1px solid ${color}44`}}>{status||"—"}</span>;
}

function Field({label,value,onChange,type="text"}) {
  return <div style={{marginBottom:10}}><label className="label">{label}</label><input className="input" type={type} value={value||""} onChange={e=>onChange(e.target.value)}/></div>;
}

function SelectField({label,value,onChange,options,placeholder}) {
  return <div style={{marginBottom:10}}><label className="label">{label}</label><select className="input" value={value} onChange={e=>onChange(e.target.value)}>{placeholder&&<option value="">{placeholder}</option>}{options.map(o=><option key={o.value} value={o.value}>{o.label}</option>)}</select></div>;
}

function Empty({text}) { return <div style={{textAlign:"center",padding:20,color:"#475569",fontSize:12}}>{text}</div>; }
