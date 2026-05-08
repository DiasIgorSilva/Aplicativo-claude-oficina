import { useState, useEffect, useRef } from "react";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const supabase = createClient(
  "https://bofhihxpqmqimkanwkyw.supabase.co",
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImJvZmhpaHhwcW1xaW1rYW53a3l3Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzUwODQ3OTMsImV4cCI6MjA5MDY2MDc5M30.fOOD-FweGID1x2mlJ3LWImtw7B6m6Pc-8auXLIuCqbw"
);

const uid = () => Math.random().toString(36).slice(2, 10);
const fmt = (n: any) => new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(n || 0);
const fmtKm = (n: any) => n ? n.toLocaleString("pt-BR") + " km" : "—";
const today = () => new Date().toISOString().slice(0, 10);
const fmtDate = (d: any) => d ? new Date(d + "T12:00:00").toLocaleDateString("pt-BR") : "—";

const STATUS_COLORS: any = { "Aguardando": "#f59e0b", "Em andamento": "#3b82f6", "Pronto": "#10b981", "Entregue": "#6b7280" };

const CAR_BRANDS = [
  "Acura", "Agrale", "Alfa Romeo", "Asia", "Aston Martin", "Audi", "Bentley", "BMW", "BYD", 
  "Caoa Chery", "Chery", "Chevrolet", "Chrysler", "Citroën", "Daewoo", "Daihatsu", "Dodge", 
  "DS Automobiles", "Effa", "Ferrari", "Fiat", "Ford", "Geely", "GWM", "GWM Ora", "Hafei", 
  "Honda", "Hyundai", "Infiniti", "Iveco", "JAC", "Jaguar", "Jeep", "Jinbei", "Kia", 
  "Lamborghini", "Land Rover", "Lexus", "Lifan", "Mahindra", "Maserati", "Mazda", 
  "McLaren", "Mercedes-Benz", "Mini", "Mitsubishi", "Nissan", "Peugeot", "Porsche", 
  "RAM", "Renault", "Rolls-Royce", "Seat", "Shineray", "Smart", "SSangYong", "Subaru", 
  "Suzuki", "Toyota", "Troller", "Volkswagen", "Volvo", "ZX Auto",
].sort();

const MONTHS = ["Janeiro", "Fevereiro", "Março", "Abril", "Maio", "Junho", "Julho", "Agosto", "Setembro", "Outubro", "Novembro", "Dezembro"];

// ── Componentes de Seleção ────────────────────────────────────────────────
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
        <div style={{ position: "absolute", top: "100%", left: 0, right: 0, zIndex: 200, background: "#1a2030", border: "1px solid #2d3748", borderRadius: 8, maxHeight: 180, overflowY: "auto", marginTop: 4, boxShadow: "0 8px 24px rgba(0,0,0,.5)" }}>
          {filtered.map(b => (
            <div key={b} onClick={() => { onChange(b); setQuery(b); setOpen(false); }} style={{ padding: "10px 14px", fontSize: 13, cursor: "pointer", color: value === b ? "#f97316" : "#e2e8f0", borderBottom: "1px solid #1e2736" }}>{b}</div>
          ))}
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
  const filtered = vehicles.filter((v: any) => v.plate.toLowerCase().includes(query.toLowerCase()) || v.model.toLowerCase().includes(query.toLowerCase()) || v.brand.toLowerCase().includes(query.toLowerCase())).slice(0, 10);
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
          {filtered.length === 0 ? <div style={{ padding: "14px", fontSize: 12, color: "#64748b", textAlign: "center" }}>Não encontrado</div> :
            filtered.map((v: any) => (
              <div key={v.id} onClick={() => { onChange(v.id); setOpen(false); }} style={{ padding: "12px 14px", cursor: "pointer", borderBottom: "1px solid #1e2736" }}>
                <div style={{ fontSize: 13, fontWeight: 700, color: "#f1f5f9" }}>{v.plate}</div>
                <div style={{ fontSize: 11, color: "#64748b" }}>{v.brand} {v.model}</div>
              </div>
            ))
          }
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
  const [loading, setLoading] = useState(true);
  const [showReport, setShowReport] = useState(false);

  useEffect(() => {
    async function fetchAll() {
      setLoading(true);
      const [v, s] = await Promise.all([
        supabase.from("vehicles").select("*").order("created_at", { ascending: false }),
        supabase.from("services").select("*").order("created_at", { ascending: false }),
      ]);
      if (v.data) setVehicles(v.data.map(mapV));
      if (s.data) setServices(s.data.map(mapS));
      setLoading(false);
    }
    fetchAll();
  }, []);

  const mapV = (r: any) => ({ id: r.id, plate: r.plate, brand: r.brand, model: r.model, year: r.year, color: r.color, owner: r.owner, phone: r.phone, notes: r.notes, mileage: r.mileage, createdAt: r.created_at });
  const mapS = (r: any) => ({ id: r.id, vehicleId: r.vehicle_id, vehiclePlate: r.vehicle_plate, vehicleBrand: r.vehicle_brand, vehicleModel: r.vehicle_model, description: r.description, partsValue: r.parts_value, laborValue: r.labor_value, status: r.status, entryDate: r.entry_date, exitDate: r.exit_date, mileage: r.mileage, createdAt: r.created_at });

  const tabs = [{ id: "dashboard", label: "Início", icon: "⬡" }, { id: "services", label: "Oficina", icon: "🔧" }, { id: "vehicles", label: "Base Carros", icon: "🚗" }];

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
        .table-wrap{width: 100%; overflow-x: auto; -webkit-overflow-scrolling: touch; margin-top: 10px;}
        .table-header, .table-row { min-width: 650px; display: grid; align-items: center; }
        .table-header{padding:10px 14px;font-size:10px;color:#475569;text-transform:uppercase;border-bottom:1px solid #1e2736;}
        .table-row{padding:14px; border-bottom:1px solid #1e2736;}
      `}</style>

      <header style={{ padding: "14px 20px", borderBottom: "1px solid #1e2736", display: "flex", alignItems: "center", justifyContent: "space-between", background: "#0d0f14" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <div style={{ width: 32, height: 32, background: "#f97316", borderRadius: 8, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 18 }}>🔩</div>
          <div style={{ fontFamily: "'Syne', sans-serif", fontSize: 18, fontWeight: 800 }}>AutoGestão</div>
        </div>
        <button className="btn-primary" style={{ background: "#7c3aed", color: "#fff", fontSize: 11 }} onClick={() => setShowReport(true)}>📄 PDF</button>
      </header>

      <main style={{ flex: 1, padding: "16px", width: "100%", maxWidth: 1200, margin: "0 auto" }}>
        {loading ? <div style={{ textAlign: "center", padding: 100 }}>Sincronizando...</div> : (
          <>
            {tab === "dashboard" && <Dashboard services={services} vehicles={vehicles} />}
            {tab === "services" && <Services services={services} setServices={setServices} vehicles={vehicles} mapS={mapS} />}
            {tab === "vehicles" && <Vehicles vehicles={vehicles} setVehicles={setVehicles} services={services} mapV={mapV} />}
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

      {showReport && <ReportModal services={services} onClose={() => setShowReport(false)} onGenerate={(f, t) => { generatePDF(vehicles, services, f, t); setShowReport(false); }} />}
    </div>
  );
}

// ── Dashboard Corrigido ────────────────────────────────────────────────────
function Dashboard({ services, vehicles }: any) {
  const [selMonth, setSelMonth] = useState(new Date().getMonth());
  const [selYear, setSelYear] = useState(new Date().getFullYear());

  // Serviços que ainda estão na oficina (Diferentes de Entregue)
  const activeServices = services.filter((s: any) => s.status !== "Entregue");
  
  // Serviços entregues no período selecionado
  const filteredDelivered = services.filter((s: any) => {
    if (s.status !== "Entregue" || !s.exitDate) return false;
    const d = new Date(s.exitDate + "T12:00:00");
    return d.getMonth() === selMonth && d.getFullYear() === selYear;
  });

  const tP = filteredDelivered.reduce((acc: any, s: any) => acc + (Number(s.partsValue) || 0), 0);
  const tL = filteredDelivered.reduce((acc: any, s: any) => acc + (Number(s.laborValue) || 0), 0);

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
      
      {/* SELETOR DE PERÍODO */}
      <div className="card" style={{ display: "flex", gap: 10, alignItems: "center", background: "#1a2030" }}>
        <div style={{ flex: 1 }}>
          <label className="label">Mês de Referência</label>
          <select className="input" value={selMonth} onChange={(e) => setSelMonth(Number(e.target.value))}>
            {MONTHS.map((m, i) => <option key={i} value={i}>{m}</option>)}
          </select>
        </div>
        <div style={{ width: 100 }}>
          <label className="label">Ano</label>
          <select className="input" value={selYear} onChange={(e) => setSelYear(Number(e.target.value))}>
            {[2024, 2025, 2026, 2027].map(y => <option key={y} value={y}>{y}</option>)}
          </select>
        </div>
      </div>

      {/* KPIs DO MÊS SELECIONADO */}
      <div className="kpi-grid">
        {[
          { label: "Na Oficina", value: activeServices.length, icon: "🔧", accent: "#f97316" },
          { label: `Peças`, value: fmt(tP), icon: "⚙️", accent: "#6366f1" },
          { label: `Mão de Obra`, value: fmt(tL), icon: "🔧", accent: "#10b981" },
          { label: "Total Mês", value: fmt(tP + tL), icon: "💰", accent: "#10b981" },
        ].map((k, i) => (
          <div key={i} className="card" style={{ borderLeft: `3px solid ${k.accent}`, padding: 12 }}>
            <div style={{ fontSize: 16 }}>{k.icon}</div>
            <div style={{ fontSize: 15, fontWeight: 800, marginTop: 4, color: "#f1f5f9" }}>{k.value}</div>
            <div style={{ fontSize: 9, color: "#475569", textTransform: "uppercase", marginTop: 2 }}>{k.label}</div>
          </div>
        ))}
      </div>

      {/* LISTA 1: CARROS QUE ESTÃO NA OFICINA AGORA */}
      <div className="card">
        <h3 style={{ fontSize: 14, marginBottom: 12, color: "#f97316", fontFamily: "'Syne', sans-serif" }}>🛠️ Carros na Oficina (Ativos)</h3>
        {activeServices.length === 0 ? (
          <div style={{ fontSize: 12, color: "#475569", textAlign: "center", padding: 10 }}>Pátio vazio no momento.</div>
        ) : (
          activeServices.map((sv: any) => (
            <div key={sv.id} style={{ display: "flex", justifyContent: "space-between", padding: "10px 0", borderBottom: "1px solid #1e2736", alignItems: "center" }}>
              <div style={{ flex: 1, paddingRight: 10 }}>
                <div style={{ fontSize: 12, color: "#e2e8f0", fontWeight: 700 }}>{sv.vehiclePlate} — {sv.vehicleBrand}</div>
                <div style={{ fontSize: 10, color: "#64748b" }}>{sv.description}</div>
              </div>
              <StatusBadge status={sv.status} map={STATUS_COLORS} />
            </div>
          ))
        )}
      </div>

      {/* LISTA 2: SERVIÇOS FINALIZADOS NO MÊS SELECIONADO */}
      <div className="card">
        <h3 style={{ fontSize: 14, marginBottom: 12, color: "#10b981", fontFamily: "'Syne', sans-serif" }}>✅ Entregues em {MONTHS[selMonth]}</h3>
        {filteredDelivered.length === 0 ? (
          <div style={{ fontSize: 12, color: "#475569", textAlign: "center", padding: 10 }}>Nenhum serviço finalizado neste mês.</div>
        ) : (
          filteredDelivered.map((sv: any) => (
            <div key={sv.id} style={{ display: "flex", justifyContent: "space-between", padding: "10px 0", borderBottom: "1px solid #1e2736", alignItems: "center" }}>
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: 12, color: "#e2e8f0" }}>{sv.vehiclePlate} — {sv.vehicleBrand}</div>
                <div style={{ fontSize: 10, color: "#64748b" }}>Entregue em: {fmtDate(sv.exitDate)}</div>
              </div>
              <div style={{ fontSize: 12, fontWeight: 800, color: "#10b981" }}>{fmt((Number(sv.partsValue)||0) + (Number(sv.laborValue)||0))}</div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}

// ── Outros Componentes (Vehicles, Services, etc. permanecem iguais) ───────
// [Omiti o resto do código para brevidade, mas você deve manter as funções 
// Vehicles, Services e ReportModal do código anterior v1.2.1]
