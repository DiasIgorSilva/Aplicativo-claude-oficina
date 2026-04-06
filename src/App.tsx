// AutoGestão v1.1.1 - Correção de responsividade mobile
// - Dashboard com 2 colunas no celular (era 3)
// - Navegação inferior no celular (mais fácil de usar)
// - Header compacto sem sobreposição
// - Modais deslizam de baixo no celular
// - Tabelas com scroll horizontal

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
  ${fV.length===0?'<p style="color:#94a3b8;font-style:italic;padding:16px">Nenhum veículo no período</p>':`
  <table><thead><tr><th>Placa</th><th>Modelo</th><th>Cliente</th><th>Serviço</th><th>Entrada</th><th>Status</th></tr></thead><tbody>
  ${fV.map(v=>`<tr><td><strong>${v.plate||"—"}</strong></td><td>${v.model||"—"}${v.year?` · ${v.year}`:""}</td><td>${v.owner||"—"}</td><td>${v.serviceType||"—"}</td><td>${fmtDate(v.entryDate)}</td><td>${v.status||"—"}</td></tr>`).join("")}
  </tbody></table>`}
  <div class="sec-title">🔧 Serviços (${fS.length})</div>
  ${fS.length===0?'<p style="color:#94a3b8;font-style:italic;padding:16px">Nenhum serviço no período</p>':`
  <table><thead><tr><th>Data</th><th>Veículo</th><th>Descrição</th><th>Mecânico</th><th>Peças</th><th>M.Obra</th><th>Total</th></tr></thead><tbody>
  ${fS.map(s=>`<tr><td>${fmtDate(s.createdAt?.slice(0,10))}</td><td>${s.vehiclePlate||"—"}</td><td>${s.description||"—"}</td><td>${s.mechanic||"—"}</td><td style="color:#3b82f6">${fmt(Number(s.partsValue)||0)}</td><td style="color:#10b981">${fmt(Number(s.laborValue)||0)}</td><td style="color:#f97316;font-weight:600">${fmt((Number(s.partsValue)||0)+(Number(s.laborValue)||0))}</td></tr>`).join("")}
  <tr style="font-weight:700;background:#f8fafc"><td colspan="4">TOTAL</td><td style="color:#3b82f6">${fmt(tP)}</td><td style="color:#10b981">${fmt(tL)}</td><td style="color:#f97316">${fmt(tP+tL)}</td></tr>
  </tbody></table>`}
  <div class="foot">AutoGestão · Relatório gerado automaticamente</div>
  <script>window.onload=()=>window.print();</script></body></html>`;
  const blob = new Blob([html], { type: "text/html" });
  const url = URL.createObjectURL(blob);
  window.open(url, "_blank");
  setTimeout(() => URL.revokeObjectURL(url), 10000);
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
    <div style={{minHeight:"100vh",background:"#0d0f14",color:"#e2e8f0",fontFamily:"'DM Mono','Fira Mono',monospace",display:"flex",flexDirection:"column",paddingBottom:72}}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=DM+Mono:wght@300;400;500&family=Syne:wght@700;800&display=swap');
        *{box-sizing:border-box;margin:0;padding:0;}
        ::-webkit-scrollbar{width:4px;}::-webkit-scrollbar-track{background:#0d0f14;}::-webkit-scrollbar-thumb{background:#2d3748;border-radius:2px;}
        input,select,textarea{outline:none;}button{cursor:pointer;}
        .card{background:#161b26;border:1px solid #1e2736;border-radius:12px;padding:16px;}
        .btn-primary{background:#f97316;color:#0d0f14;border:none;border-radius:8px;padding:9px 16px;font-family:inherit;font-weight:500;font-size:13px;}
        .btn-ghost{background:transparent;color:#94a3b8;border:1px solid #1e2736;border-radius:8px;padding:7px 14px;font-family:inherit;font-size:12px;transition:all .15s;}
        .btn-ghost:hover{border-color:#f97316;color:#f97316;}
        .btn-danger{background:transparent;color:#ef4444;border:1px solid #3f1212;border-radius:8px;padding:6px 10px;font-family:inherit;font-size:12px;}
        .btn-pdf{background:#7c3aed;color:#fff;border:none;border-radius:8px;padding:8px 14px;font-family:inherit;font-weight:500;font-size:12px;display:flex;align-items:center;gap:5px;white-space:nowrap;}
        .input{background:#0d0f14;border:1px solid #1e2736;border-radius:8px;padding:9px 12px;color:#e2e8f0;font-family:inherit;font-size:13px;width:100%;transition:border-color .15s;}
        .input:focus{border-color:#f97316;}
        .label{display:block;font-size:11px;color:#64748b;margin-bottom:5px;letter-spacing:.05em;text-transform:uppercase;}
        .badge{display:inline-block;border-radius:20px;padding:2px 8px;font-size:10px;font-weight:500;}
        .grid-2{display:grid;grid-template-columns:1fr 1fr;gap:12px;}
        .form-group{margin-bottom:13px;}

        /* KPI: 2 colunas mobile, 3 no desktop */
        .kpi-grid{display:grid;grid-template-columns:1fr 1fr;gap:12px;}
        @media(min-width:768px){.kpi-grid{grid-template-columns:repeat(3,1fr);}}

        /* Dashboard cards: 1 col mobile, 2 no desktop */
        .dash-grid{display:grid;grid-template-columns:1fr;gap:16px;}
        @media(min-width:768px){.dash-grid{grid-template-columns:1fr 1fr;}}

        /* Tabelas com scroll horizontal no mobile */
        .table-wrap{overflow-x:auto;-webkit-overflow-scrolling:touch;}
        .table-row{display:grid;align-items:center;padding:11px 14px;border-bottom:1px solid #1e2736;transition:background .1s;min-width:480px;}
        .table-row:hover{background:#1a2030;}
        .table-header{display:grid;padding:9px 14px;font-size:10px;color:#475569;text-transform:uppercase;letter-spacing:.06em;border-bottom:1px solid #1e2736;min-width:480px;}

        /* Modal: desliza de baixo no mobile, centralizado no desktop */
        .modal-bg{position:fixed;inset:0;background:rgba(0,0,0,.75);display:flex;align-items:flex-end;justify-content:center;z-index:100;}
        .modal{background:#161b26;border:1px solid #1e2736;border-radius:16px 16px 0 0;padding:24px;width:100%;max-width:540px;max-height:92vh;overflow-y:auto;}
        @media(min-width:640px){.modal-bg{align-items:center;padding:20px;}.modal{border-radius:16px;}}
        .modal h3{font-family:'Syne',sans-serif;font-size:17px;color:#f1f5f9;margin-bottom:18px;}

        /* Navegação: top no desktop, bottom no mobile */
        .top-nav{display:none;}
        .bottom-nav{display:block;position:fixed;bottom:0;left:0;right:0;background:#0d0f14;border-top:1px solid #1e2736;z-index:50;padding:6px 0 10px;}
        .bottom-nav-inner{display:flex;justify-content:space-around;}
        .nav-item{display:flex;flex-direction:column;align-items:center;gap:2px;padding:4px 8px;border:none;background:transparent;color:#475569;font-family:inherit;font-size:10px;cursor:pointer;border-radius:8px;}
        .nav-item.active{color:#f97316;}
        .nav-item .icon{font-size:20px;}
        @media(min-width:640px){
          .top-nav{display:flex;gap:4px;padding:10px 24px;border-bottom:1px solid #1e2736;overflow-x:auto;}
          .bottom-nav{display:none;}
          .top-nav-btn{background:transparent;color:#64748b;border:none;border-radius:8px;padding:8px 16px;font-family:inherit;font-size:13px;font-weight:500;white-space:nowrap;display:flex;align-items:center;gap:6px;cursor:pointer;}
          .top-nav-btn.active{background:#f97316;color:#0d0f14;}
        }
      `}</style>

      {/* Header */}
      <header style={{padding:"11px 16px",borderBottom:"1px solid #1e2736",display:"flex",alignItems:"center",justifyContent:"space-between",background:"#0d0f14",gap:10}}>
        <div style={{display:"flex",alignItems:"center",gap:10,minWidth:0}}>
          <div style={{width:32,height:32,flexShrink:0,background:"#f97316",borderRadius:8,display:"flex",alignItems:"center",justifyContent:"center",fontSize:16}}>🔩</div>
          <div>
            <div style={{fontFamily:"'Syne',sans-serif",fontSize:15,fontWeight:800,color:"#f1f5f9",lineHeight:1}}>AutoGestão</div>
            <div style={{fontSize:10,color:"#475569",marginTop:1}}>v1.1.1</div>
          </div>
        </div>
        <div style={{display:"flex",alignItems:"center",gap:8,flexShrink:0}}>
          {loading && <span style={{fontSize:10,color:"#f97316"}}>● sync</span>}
          <button className="btn-pdf" onClick={() => setShowReport(true)}>📄 PDF</button>
        </div>
      </header>

      {/* Top nav (desktop) */}
      <nav className="top-nav">
        {tabs.map(t => (
          <button key={t.id} className={`top-nav-btn ${tab===t.id?"active":""}`} onClick={() => setTab(t.id)}>
            {t.icon} {t.label}
          </button>
        ))}
      </nav>

      {/* Content */}
      <main style={{flex:1,padding:"18px 16px",maxWidth:1100,width:"100%",margin:"0 auto"}}>
        {loading ? (
          <div style={{textAlign:"center",padding:80,color:"#475569"}}>
            <div style={{fontSize:32,marginBottom:12}}>🔩</div>
            <div>Carregando dados...</div>
          </div>
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

      {/* Bottom nav (mobile) */}
      <nav className="bottom-nav">
        <div className="bottom-nav-inner">
          {tabs.map(t => (
            <button key={t.id} className={`nav-item ${tab===t.id?"active":""}`} onClick={() => setTab(t.id)}>
              <span className="icon">{t.icon}</span>{t.label}
            </button>
          ))}
        </div>
      </nav>

      {showReport && <ReportModal vehicles={vehicles} services={services} onClose={() => setShowReport(false)} onGenerate={(f,t) => {generatePDF(vehicles,services,f,t);setShowReport(false);}}/>}
    </div>
  );
}

function ReportModal({vehicles, services, onClose, onGenerate}) {
  const firstDay = new Date(); firstDay.setDate(1);
  const [dateFrom, setDateFrom] = useState(firstDay.toISOString().slice(0,10));
  const [dateTo, setDateTo] = useState(today());
  const fV = vehicles.filter(v => v.entryDate>=dateFrom && v.entryDate<=dateTo);
  const fS = services.filter(s => { const d=s.createdAt?.slice(0,10); return d&&d>=dateFrom&&d<=dateTo; });
  const total = fS.reduce((s,sv) => s+(Number(sv.partsValue)||0)+(Number(sv.laborValue)||0), 0);
  const presets = [
    {label:"Este mês",from:new Date(new Date().getFullYear(),new Date().getMonth(),1).toISOString().slice(0,10),to:today()},
    {label:"Mês passado",from:new Date(new Date().getFullYear(),new Date().getMonth()-1,1).toISOString().slice(0,10),to:new Date(new Date().getFullYear(),new Date().getMonth(),0).toISOString().slice(0,10)},
    {label:"7 dias",from:new Date(Date.now()-7*86400000).toISOString().slice(0,10),to:today()},
    {label:"30 dias",from:new Date(Date.now()-30*86400000).toISOString().slice(0,10),to:today()},
  ];
  return (
    <div className="modal-bg" onClick={onClose}>
      <div className="modal" onClick={e=>e.stopPropagation()}>
        <h3>📄 Gerar Relatório PDF</h3>
        <div style={{marginBottom:14}}>
          <label className="label">Período rápido</label>
          <div style={{display:"flex",gap:8,flexWrap:"wrap"}}>
            {presets.map(p=><button key={p.label} className="btn-ghost" style={{fontSize:11,padding:"5px 10px"}} onClick={()=>{setDateFrom(p.from);setDateTo(p.to);}}>{p.label}</button>)}
          </div>
        </div>
        <div className="grid-2">
          <div className="form-group"><label className="label">Data inicial</label><input className="input" type="date" value={dateFrom} onChange={e=>setDateFrom(e.target.value)}/></div>
          <div className="form-group"><label className="label">Data final</label><input className="input" type="date" value={dateTo} onChange={e=>setDateTo(e.target.value)}/></div>
        </div>
        <div className="card" style={{marginBottom:16}}>
          <div style={{fontSize:11,color:"#475569",textTransform:"uppercase",marginBottom:10}}>Prévia</div>
          <div style={{display:"grid",gridTemplateColumns:"1fr 1fr 1fr",gap:10,textAlign:"center"}}>
            <div><div style={{fontSize:20,fontWeight:700,color:"#f97316",fontFamily:"'Syne',sans-serif"}}>{fV.length}</div><div style={{fontSize:11,color:"#475569"}}>Veículos</div></div>
            <div><div style={{fontSize:20,fontWeight:700,color:"#3b82f6",fontFamily:"'Syne',sans-serif"}}>{fS.length}</div><div style={{fontSize:11,color:"#475569"}}>Serviços</div></div>
            <div><div style={{fontSize:15,fontWeight:700,color:"#10b981",fontFamily:"'Syne',sans-serif"}}>{fmt(total)}</div><div style={{fontSize:11,color:"#475569"}}>Receita</div></div>
          </div>
        </div>
        <div style={{display:"flex",gap:10,justifyContent:"flex-end"}}>
          <button className="btn-ghost" onClick={onClose}>Cancelar</button>
          <button className="btn-pdf" onClick={()=>onGenerate(dateFrom,dateTo)}>📄 Gerar PDF</button>
        </div>
      </div>
    </div>
  );
}

function Dashboard({vehicles,services,appointments,quotes,setTab}) {
  const active = vehicles.filter(v=>v.status!=="Entregue").length;
  const tP = services.reduce((s,sv)=>s+(Number(sv.partsValue)||0),0);
  const tL = services.reduce((s,sv)=>s+(Number(sv.laborValue)||0),0);
  const todayA = appointments.filter(a=>a.date===today()&&a.status!=="Cancelado").length;
  const pend = quotes.filter(q=>q.status==="Pendente").length;
  const kpis = [
    {label:"Veículos na Oficina",value:active,icon:"🚗",accent:"#f97316"},
    {label:"Receita em Peças",value:fmt(tP),icon:"⚙️",accent:"#3b82f6"},
    {label:"Mão de Obra",value:fmt(tL),icon:"🔧",accent:"#10b981"},
    {label:"Agendamentos Hoje",value:todayA,icon:"📅",accent:"#6366f1"},
    {label:"Orçamentos Pendentes",value:pend,icon:"📋",accent:"#f59e0b"},
    {label:"Receita Total",value:fmt(tP+tL),icon:"💰",accent:"#10b981"},
  ];
  const recent = services.slice(0,5);
  const inProg = vehicles.filter(v=>v.status==="Em andamento"||v.status==="Aguardando");
  return (
    <div style={{display:"flex",flexDirection:"column",gap:18}}>
      <div>
        <h1 style={{fontFamily:"'Syne',sans-serif",fontSize:22,fontWeight:800,color:"#f1f5f9"}}>Dashboard</h1>
        <p style={{color:"#475569",fontSize:12,marginTop:3}}>{new Date().toLocaleDateString("pt-BR",{weekday:"long",day:"numeric",month:"long",year:"numeric"})}</p>
      </div>
      <div className="kpi-grid">
        {kpis.map((k,i)=>(
          <div key={i} className="card" style={{borderLeft:`3px solid ${k.accent}`}}>
            <div style={{fontSize:18,marginBottom:5}}>{k.icon}</div>
            <div style={{fontSize:18,fontWeight:700,color:"#f1f5f9",fontFamily:"'Syne',sans-serif"}}>{k.value}</div>
            <div style={{fontSize:10,color:"#475569",marginTop:3,textTransform:"uppercase",letterSpacing:".04em"}}>{k.label}</div>
          </div>
        ))}
      </div>
      <div className="dash-grid">
        <div className="card">
          <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:12}}>
            <h3 style={{fontFamily:"'Syne',sans-serif",color:"#f1f5f9",fontSize:13}}>Últimos Serviços</h3>
            <button className="btn-ghost" style={{fontSize:11,padding:"4px 8px"}} onClick={()=>setTab("services")}>Ver todos</button>
          </div>
          {recent.length===0?<Empty text="Nenhum serviço"/>:recent.map(sv=>(
            <div key={sv.id} style={{display:"flex",justifyContent:"space-between",padding:"9px 0",borderBottom:"1px solid #1e2736"}}>
              <div style={{flex:1,minWidth:0,paddingRight:8}}>
                <div style={{fontSize:12,color:"#e2e8f0",overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap"}}>{sv.description||"Serviço"}</div>
                <div style={{fontSize:10,color:"#475569"}}>{sv.vehiclePlate} · {fmtDate(sv.createdAt?.slice(0,10))}</div>
              </div>
              <div style={{textAlign:"right",flexShrink:0}}>
                <div style={{fontSize:12,color:"#10b981"}}>{fmt((Number(sv.partsValue)||0)+(Number(sv.laborValue)||0))}</div>
                <StatusBadge status={sv.status} map={STATUS_COLORS}/>
              </div>
            </div>
          ))}
        </div>
        <div className="card">
          <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:12}}>
            <h3 style={{fontFamily:"'Syne',sans-serif",color:"#f1f5f9",fontSize:13}}>Veículos em Serviço</h3>
            <button className="btn-ghost" style={{fontSize:11,padding:"4px 8px"}} onClick={()=>setTab("vehicles")}>Ver todos</button>
          </div>
          {inProg.length===0?<Empty text="Nenhum veículo em serviço"/>:inProg.map(v=>(
            <div key={v.id} style={{display:"flex",justifyContent:"space-between",alignItems:"center",padding:"9px 0",borderBottom:"1px solid #1e2736"}}>
              <div style={{minWidth:0,flex:1}}>
                <div style={{fontSize:12,color:"#e2e8f0",overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap"}}>{v.plate} — {v.model}</div>
                <div style={{fontSize:10,color:"#475569"}}>{v.owner} · {fmtDate(v.entryDate)}</div>
              </div>
              <StatusBadge status={v.status} map={STATUS_COLORS}/>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

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
    const row={id:editing?.id||uid(),plate:form.plate,model:form.model,year:form.year,color:form.color,owner:form.owner,phone:form.phone,service_type:form.serviceType,status:form.status,entry_date:form.entryDate,exit_date:form.exitDate,notes:form.notes};
    const {data,error}=await supabase.from("vehicles").upsert(row).select();
    if(!error&&data){const m=mapV(data[0]);if(editing)setVehicles(vehicles.map(v=>v.id===editing.id?m:v));else setVehicles([m,...vehicles]);}
    setSaving(false);close();
  };
  const remove=async(id)=>{if(!confirm("Remover veículo?"))return;await supabase.from("vehicles").delete().eq("id",id);setVehicles(vehicles.filter(v=>v.id!==id));};
  const filtered=vehicles.filter(v=>!search||v.plate?.toLowerCase().includes(search.toLowerCase())||v.model?.toLowerCase().includes(search.toLowerCase())||v.owner?.toLowerCase().includes(search.toLowerCase()));
  const cols="1.5fr 1.2fr 1fr 80px 76px";
  return (
    <Section title="Veículos" subtitle="Entrada e saída de veículos" action={<button className="btn-primary" onClick={()=>open()}>+ Novo</button>}>
      <input className="input" style={{maxWidth:300,marginBottom:10}} placeholder="Buscar placa, modelo ou cliente..." value={search} onChange={e=>setSearch(e.target.value)}/>
      <div className="card" style={{padding:0,overflow:"hidden"}}>
        <div className="table-wrap">
          <div className="table-header" style={{gridTemplateColumns:cols}}><span>Veículo</span><span>Cliente</span><span>Entrada</span><span>Status</span><span>Ações</span></div>
          {filtered.length===0?<Empty text="Nenhum veículo" pad/>:filtered.map(v=>{
            const total=services.filter(s=>s.vehicleId===v.id).reduce((s,sv)=>s+(Number(sv.partsValue)||0)+(Number(sv.laborValue)||0),0);
            return(<div key={v.id} className="table-row" style={{gridTemplateColumns:cols}}>
              <div><div style={{fontWeight:500,color:"#f1f5f9",fontSize:13}}>{v.plate}</div><div style={{fontSize:10,color:"#64748b"}}>{v.model}{v.year?` · ${v.year}`:""}</div>{total>0&&<div style={{fontSize:10,color:"#10b981"}}>{fmt(total)}</div>}</div>
              <div style={{fontSize:12}}>{v.owner||"—"}<br/><span style={{fontSize:10,color:"#475569"}}>{v.phone||""}</span></div>
              <div style={{fontSize:11,color:"#94a3b8"}}>{fmtDate(v.entryDate)}</div>
              <StatusBadge status={v.status} map={STATUS_COLORS}/>
              <div style={{display:"flex",gap:3}}><button className="btn-ghost" style={{padding:"3px 7px",fontSize:11}} onClick={()=>open(v)}>✏️</button><button className="btn-danger" style={{padding:"3px 7px",fontSize:11}} onClick={()=>remove(v.id)}>✕</button></div>
            </div>);
          })}
        </div>
      </div>
      {modal&&<div className="modal-bg" onClick={close}><div className="modal" onClick={e=>e.stopPropagation()}>
        <h3>{editing?"Editar Veículo":"Novo Veículo"}</h3>
        <div className="grid-2">
          <Field label="Placa *" value={form.plate||""} onChange={v=>setForm({...form,plate:v.toUpperCase()})}/>
          <Field label="Modelo *" value={form.model||""} onChange={v=>setForm({...form,model:v})}/>
          <Field label="Ano" value={form.year||""} onChange={v=>setForm({...form,year:v})}/>
          <Field label="Cor" value={form.color||""} onChange={v=>setForm({...form,color:v})}/>
          <Field label="Cliente" value={form.owner||""} onChange={v=>setForm({...form,owner:v})}/>
          <Field label="Telefone" value={form.phone||""} onChange={v=>setForm({...form,phone:v})}/>
          <Field label="Tipo de Serviço" value={form.serviceType||""} onChange={v=>setForm({...form,serviceType:v})}/>
          <SelectField label="Status" value={form.status||"Aguardando"} onChange={v=>setForm({...form,status:v})} options={Object.keys(STATUS_COLORS)}/>
          <Field label="Data de Entrada" type="date" value={form.entryDate||""} onChange={v=>setForm({...form,entryDate:v})}/>
          <Field label="Previsão de Saída" type="date" value={form.exitDate||""} onChange={v=>setForm({...form,exitDate:v})}/>
        </div>
        <div className="form-group"><label className="label">Observações</label><textarea className="input" rows={2} value={form.notes||""} onChange={e=>setForm({...form,notes:e.target.value})}/></div>
        <div style={{display:"flex",gap:10,justifyContent:"flex-end",marginTop:8}}><button className="btn-ghost" onClick={close}>Cancelar</button><button className="btn-primary" onClick={save} disabled={saving}>{saving?"Salvando...":"Salvar"}</button></div>
      </div></div>}
    </Section>
  );
}

function Services({services,setServices,vehicles,mapS}) {
  const [modal,setModal]=useState(false);
  const [editing,setEditing]=useState(null);
  const [form,setForm]=useState({});
  const [saving,setSaving]=useState(false);
  const open=(s=null)=>{setEditing(s);setForm(s||{status:"Aguardando"});setModal(true);};
  const close=()=>{setModal(false);setEditing(null);setForm({});};
  const save=async()=>{
    if(!form.vehicleId||!form.description)return alert("Veículo e descrição são obrigatórios.");
    setSaving(true);
    const v=vehicles.find(v=>v.id===form.vehicleId);
    const row={id:editing?.id||uid(),vehicle_id:form.vehicleId,vehicle_plate:v?.plate,vehicle_model:v?.model,description:form.description,parts_value:Number(form.partsValue)||0,labor_value:Number(form.laborValue)||0,parts_list:form.partsList,mechanic:form.mechanic,status:form.status};
    const {data,error}=await supabase.from("services").upsert(row).select();
    if(!error&&data){const m=mapS(data[0]);if(editing)setServices(services.map(s=>s.id===editing.id?m:s));else setServices([m,...services]);}
    setSaving(false);close();
  };
  const remove=async(id)=>{if(!confirm("Remover serviço?"))return;await supabase.from("services").delete().eq("id",id);setServices(services.filter(s=>s.id!==id));};
  const cols="2fr 1fr 1fr 1fr 76px";
  return (
    <Section title="Serviços" subtitle="Peças e mão de obra" action={<button className="btn-primary" onClick={()=>open()}>+ Novo</button>}>
      <div className="card" style={{padding:0,overflow:"hidden"}}>
        <div className="table-wrap">
          <div className="table-header" style={{gridTemplateColumns:cols}}><span>Descrição</span><span>Veículo</span><span>Peças</span><span>M. Obra</span><span>Ações</span></div>
          {services.length===0?<Empty text="Nenhum serviço" pad/>:services.map(s=>(
            <div key={s.id} className="table-row" style={{gridTemplateColumns:cols}}>
              <div><div style={{fontSize:12,color:"#f1f5f9"}}>{s.description}</div><div style={{fontSize:10,color:"#475569"}}>{fmtDate(s.createdAt?.slice(0,10))} · <StatusBadge status={s.status} map={STATUS_COLORS}/></div></div>
              <div style={{fontSize:12}}>{s.vehiclePlate}<br/><span style={{fontSize:10,color:"#64748b"}}>{s.vehicleModel}</span></div>
              <div style={{fontSize:12,color:"#3b82f6"}}>{fmt(Number(s.partsValue)||0)}</div>
              <div style={{fontSize:12,color:"#10b981"}}>{fmt(Number(s.laborValue)||0)}</div>
              <div style={{display:"flex",gap:3}}><button className="btn-ghost" style={{padding:"3px 7px",fontSize:11}} onClick={()=>open(s)}>✏️</button><button className="btn-danger" style={{padding:"3px 7px",fontSize:11}} onClick={()=>remove(s.id)}>✕</button></div>
            </div>
          ))}
        </div>
      </div>
      {services.length>0&&<div className="card" style={{display:"flex",gap:20,justifyContent:"flex-end",flexWrap:"wrap"}}>
        <Stat label="Peças" value={fmt(services.reduce((s,sv)=>s+(Number(sv.partsValue)||0),0))} color="#3b82f6"/>
        <Stat label="Mão de Obra" value={fmt(services.reduce((s,sv)=>s+(Number(sv.laborValue)||0),0))} color="#10b981"/>
        <Stat label="Total Geral" value={fmt(services.reduce((s,sv)=>s+(Number(sv.partsValue)||0)+(Number(sv.laborValue)||0),0))} color="#f97316"/>
      </div>}
      {modal&&<div className="modal-bg" onClick={close}><div className="modal" onClick={e=>e.stopPropagation()}>
        <h3>{editing?"Editar Serviço":"Novo Serviço"}</h3>
        <div className="form-group"><SelectField label="Veículo *" value={form.vehicleId||""} onChange={v=>setForm({...form,vehicleId:v})} options={vehicles.map(v=>({value:v.id,label:`${v.plate} — ${v.model}`}))} placeholder="Selecione o veículo"/></div>
        <div className="form-group"><label className="label">Descrição *</label><textarea className="input" rows={2} value={form.description||""} onChange={e=>setForm({...form,description:e.target.value})}/></div>
        <div className="grid-2">
          <Field label="Peças (R$)" type="number" value={form.partsValue||""} onChange={v=>setForm({...form,partsValue:v})}/>
          <Field label="Mão de Obra (R$)" type="number" value={form.laborValue||""} onChange={v=>setForm({...form,laborValue:v})}/>
          <SelectField label="Status" value={form.status||"Aguardando"} onChange={v=>setForm({...form,status:v})} options={Object.keys(STATUS_COLORS)}/>
          <Field label="Mecânico" value={form.mechanic||""} onChange={v=>setForm({...form,mechanic:v})}/>
        </div>
        <div className="form-group"><label className="label">Peças utilizadas</label><textarea className="input" rows={2} value={form.partsList||""} onChange={e=>setForm({...form,partsList:e.target.value})}/></div>
        <div style={{display:"flex",gap:10,justifyContent:"flex-end",marginTop:8}}><button className="btn-ghost" onClick={close}>Cancelar</button><button className="btn-primary" onClick={save} disabled={saving}>{saving?"Salvando...":"Salvar"}</button></div>
      </div></div>}
    </Section>
  );
}

function Appointments({appointments,setAppointments,mapA}) {
  const [modal,setModal]=useState(false);
  const [editing,setEditing]=useState(null);
  const [form,setForm]=useState({});
  const [saving,setSaving]=useState(false);
  const open=(a=null)=>{setEditing(a);setForm(a||{status:"Agendado",date:today()});setModal(true);};
  const close=()=>{setModal(false);setEditing(null);setForm({});};
  const save=async()=>{
    if(!form.date||!form.clientName)return alert("Data e cliente são obrigatórios.");
    setSaving(true);
    const row={id:editing?.id||uid(),client_name:form.clientName,client_phone:form.clientPhone,date:form.date,time:form.time,plate:form.plate,service_type:form.serviceType,mechanic:form.mechanic,status:form.status,notes:form.notes};
    const {data,error}=await supabase.from("appointments").upsert(row).select();
    if(!error&&data){const m=mapA(data[0]);if(editing)setAppointments(appointments.map(a=>a.id===editing.id?m:a));else setAppointments([...appointments,m].sort((a,b)=>(a.date+(a.time||"")).localeCompare(b.date+(b.time||""))));}
    setSaving(false);close();
  };
  const remove=async(id)=>{if(!confirm("Remover agendamento?"))return;await supabase.from("appointments").delete().eq("id",id);setAppointments(appointments.filter(a=>a.id!==id));};
  const cols="1fr 1fr 1.5fr 1fr 76px";
  return (
    <Section title="Agendamentos" subtitle="Agenda da oficina" action={<button className="btn-primary" onClick={()=>open()}>+ Novo</button>}>
      <div className="card" style={{padding:0,overflow:"hidden"}}>
        <div className="table-wrap">
          <div className="table-header" style={{gridTemplateColumns:cols}}><span>Data</span><span>Hora</span><span>Cliente</span><span>Status</span><span>Ações</span></div>
          {appointments.length===0?<Empty text="Nenhum agendamento" pad/>:appointments.map(a=>(
            <div key={a.id} className="table-row" style={{gridTemplateColumns:cols,background:a.date===today()?"#1a2030":undefined}}>
              <div style={{fontSize:12,color:"#f1f5f9",display:"flex",alignItems:"center",gap:5}}>
                {a.date===today()&&<span style={{width:6,height:6,borderRadius:"50%",background:"#f97316",display:"inline-block",flexShrink:0}}/>}
                {fmtDate(a.date)}
              </div>
              <div style={{fontSize:12}}>{a.time||"—"}</div>
              <div><div style={{fontSize:12,color:"#e2e8f0"}}>{a.clientName}</div><div style={{fontSize:10,color:"#475569"}}>{a.serviceType||a.plate}</div></div>
              <StatusBadge status={a.status} map={APPOINTMENT_STATUS}/>
              <div style={{display:"flex",gap:3}}><button className="btn-ghost" style={{padding:"3px 7px",fontSize:11}} onClick={()=>open(a)}>✏️</button><button className="btn-danger" style={{padding:"3px 7px",fontSize:11}} onClick={()=>remove(a.id)}>✕</button></div>
            </div>
          ))}
        </div>
      </div>
      {modal&&<div className="modal-bg" onClick={close}><div className="modal" onClick={e=>e.stopPropagation()}>
        <h3>{editing?"Editar Agendamento":"Novo Agendamento"}</h3>
        <div className="grid-2">
          <Field label="Cliente *" value={form.clientName||""} onChange={v=>setForm({...form,clientName:v})}/>
          <Field label="Telefone" value={form.clientPhone||""} onChange={v=>setForm({...form,clientPhone:v})}/>
          <Field label="Data *" type="date" value={form.date||""} onChange={v=>setForm({...form,date:v})}/>
          <Field label="Hora" type="time" value={form.time||""} onChange={v=>setForm({...form,time:v})}/>
          <Field label="Placa" value={form.plate||""} onChange={v=>setForm({...form,plate:v.toUpperCase()})}/>
          <Field label="Tipo de Serviço" value={form.serviceType||""} onChange={v=>setForm({...form,serviceType:v})}/>
          <SelectField label="Status" value={form.status||"Agendado"} onChange={v=>setForm({...form,status:v})} options={Object.keys(APPOINTMENT_STATUS)}/>
          <Field label="Mecânico" value={form.mechanic||""} onChange={v=>setForm({...form,mechanic:v})}/>
        </div>
        <div className="form-group"><label className="label">Observações</label><textarea className="input" rows={2} value={form.notes||""} onChange={e=>setForm({...form,notes:e.target.value})}/></div>
        <div style={{display:"flex",gap:10,justifyContent:"flex-end",marginTop:8}}><button className="btn-ghost" onClick={close}>Cancelar</button><button className="btn-primary" onClick={save} disabled={saving}>{saving?"Salvando...":"Salvar"}</button></div>
      </div></div>}
    </Section>
  );
}

function Quotes({quotes,setQuotes,mapQ}) {
  const [modal,setModal]=useState(false);
  const [editing,setEditing]=useState(null);
  const [form,setForm]=useState({items:[]});
  const [saving,setSaving]=useState(false);
  const open=(q=null)=>{setEditing(q);setForm(q?{...q,items:q.items||[]}:{status:"Pendente",date:today(),items:[]});setModal(true);};
  const close=()=>{setModal(false);setEditing(null);setForm({items:[]});};
  const addItem=()=>setForm(f=>({...f,items:[...(f.items||[]),{id:uid(),desc:"",qty:1,unit:0}]}));
  const updItem=(id,field,val)=>setForm(f=>({...f,items:f.items.map(i=>i.id===id?{...i,[field]:val}:i)}));
  const delItem=(id)=>setForm(f=>({...f,items:f.items.filter(i=>i.id!==id)}));
  const total=(items)=>(items||[]).reduce((s,i)=>s+(Number(i.qty)||0)*(Number(i.unit)||0),0);
  const save=async()=>{
    if(!form.clientName)return alert("Nome do cliente é obrigatório.");
    setSaving(true);
    const t=total(form.items);
    const row={id:editing?.id||uid(),client_name:form.clientName,client_phone:form.clientPhone,plate:form.plate,vehicle_model:form.vehicleModel,service_type:form.serviceType,date:form.date,valid_until:form.validUntil,status:form.status,items:form.items,total:t,notes:form.notes};
    const {data,error}=await supabase.from("quotes").upsert(row).select();
    if(!error&&data){const m=mapQ(data[0]);if(editing)setQuotes(quotes.map(q=>q.id===editing.id?m:q));else setQuotes([m,...quotes]);}
    setSaving(false);close();
  };
  const remove=async(id)=>{if(!confirm("Remover orçamento?"))return;await supabase.from("quotes").delete().eq("id",id);setQuotes(quotes.filter(q=>q.id!==id));};
  const QS={"Pendente":"#f59e0b","Aprovado":"#10b981","Recusado":"#ef4444","Expirado":"#6b7280"};
  const cols="1fr 1.5fr 1fr 1fr 76px";
  return (
    <Section title="Orçamentos" subtitle="Orçamentos para clientes" action={<button className="btn-primary" onClick={()=>open()}>+ Novo</button>}>
      <div className="card" style={{padding:0,overflow:"hidden"}}>
        <div className="table-wrap">
          <div className="table-header" style={{gridTemplateColumns:cols}}><span>Data</span><span>Cliente</span><span>Total</span><span>Status</span><span>Ações</span></div>
          {quotes.length===0?<Empty text="Nenhum orçamento" pad/>:quotes.map(q=>(
            <div key={q.id} className="table-row" style={{gridTemplateColumns:cols}}>
              <div style={{fontSize:11,color:"#94a3b8"}}>{fmtDate(q.date)}</div>
              <div><div style={{fontSize:12,color:"#e2e8f0"}}>{q.clientName}</div><div style={{fontSize:10,color:"#475569"}}>{q.plate} · {q.serviceType}</div></div>
              <div style={{fontSize:13,color:"#f97316",fontWeight:600}}>{fmt(q.total||0)}</div>
              <StatusBadge status={q.status} map={QS}/>
              <div style={{display:"flex",gap:3}}><button className="btn-ghost" style={{padding:"3px 7px",fontSize:11}} onClick={()=>open(q)}>✏️</button><button className="btn-danger" style={{padding:"3px 7px",fontSize:11}} onClick={()=>remove(q.id)}>✕</button></div>
            </div>
          ))}
        </div>
      </div>
      {modal&&<div className="modal-bg" onClick={close}><div className="modal" onClick={e=>e.stopPropagation()}>
        <h3>{editing?"Editar Orçamento":"Novo Orçamento"}</h3>
        <div className="grid-2">
          <Field label="Cliente *" value={form.clientName||""} onChange={v=>setForm({...form,clientName:v})}/>
          <Field label="Telefone" value={form.clientPhone||""} onChange={v=>setForm({...form,clientPhone:v})}/>
          <Field label="Placa" value={form.plate||""} onChange={v=>setForm({...form,plate:v.toUpperCase()})}/>
          <Field label="Modelo" value={form.vehicleModel||""} onChange={v=>setForm({...form,vehicleModel:v})}/>
          <Field label="Tipo de Serviço" value={form.serviceType||""} onChange={v=>setForm({...form,serviceType:v})}/>
          <Field label="Data" type="date" value={form.date||""} onChange={v=>setForm({...form,date:v})}/>
          <Field label="Validade" type="date" value={form.validUntil||""} onChange={v=>setForm({...form,validUntil:v})}/>
          <SelectField label="Status" value={form.status||"Pendente"} onChange={v=>setForm({...form,status:v})} options={["Pendente","Aprovado","Recusado","Expirado"]}/>
        </div>
        <div style={{margin:"12px 0 8px"}}>
          <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:8}}>
            <label className="label" style={{margin:0}}>Itens</label>
            <button className="btn-ghost" style={{fontSize:11,padding:"3px 8px"}} onClick={addItem}>+ Item</button>
          </div>
          {(form.items||[]).map(item=>(
            <div key={item.id} style={{display:"grid",gridTemplateColumns:"3fr 1fr 1.5fr auto",gap:6,marginBottom:6,alignItems:"center"}}>
              <input className="input" placeholder="Descrição" value={item.desc} onChange={e=>updItem(item.id,"desc",e.target.value)}/>
              <input className="input" type="number" placeholder="Qtd" value={item.qty} onChange={e=>updItem(item.id,"qty",e.target.value)}/>
              <input className="input" type="number" placeholder="Valor" value={item.unit} onChange={e=>updItem(item.id,"unit",e.target.value)}/>
              <button className="btn-danger" style={{padding:"6px 8px"}} onClick={()=>delItem(item.id)}>✕</button>
            </div>
          ))}
          {(form.items||[]).length>0&&<div style={{textAlign:"right",padding:"6px 0",borderTop:"1px solid #1e2736",color:"#f97316",fontWeight:600}}>Total: {fmt(total(form.items))}</div>}
        </div>
        <div className="form-group"><label className="label">Observações</label><textarea className="input" rows={2} value={form.notes||""} onChange={e=>setForm({...form,notes:e.target.value})}/></div>
        <div style={{display:"flex",gap:10,justifyContent:"flex-end",marginTop:8}}><button className="btn-ghost" onClick={close}>Cancelar</button><button className="btn-primary" onClick={save} disabled={saving}>{saving?"Salvando...":"Salvar"}</button></div>
      </div></div>}
    </Section>
  );
}

function Section({title,subtitle,action,children}) {
  return (
    <div style={{display:"flex",flexDirection:"column",gap:13}}>
      <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start",gap:10}}>
        <div><h1 style={{fontFamily:"'Syne',sans-serif",fontSize:19,fontWeight:800,color:"#f1f5f9"}}>{title}</h1><p style={{fontSize:11,color:"#475569",marginTop:2}}>{subtitle}</p></div>
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
  return <div className="form-group"><label className="label">{label}</label><input className="input" type={type} value={value} onChange={e=>onChange(e.target.value)}/></div>;
}
function SelectField({label,value,onChange,options,placeholder}) {
  return <div className="form-group"><label className="label">{label}</label><select className="input" value={value} onChange={e=>onChange(e.target.value)} style={{appearance:"none"}}>{placeholder&&<option value="">{placeholder}</option>}{options.map(o=>typeof o==="string"?<option key={o} value={o}>{o}</option>:<option key={o.value} value={o.value}>{o.label}</option>)}</select></div>;
}
function Stat({label,value,color}) {
  return <div><div style={{fontSize:10,color:"#475569",textTransform:"uppercase",letterSpacing:".05em"}}>{label}</div><div style={{fontSize:15,fontWeight:700,color,fontFamily:"'Syne',sans-serif"}}>{value}</div></div>;
}
function Empty({text,pad}) {
  return <div style={{textAlign:"center",color:"#334155",fontSize:12,padding:pad?"36px 0":"14px 0"}}>{text}</div>;
}
