'use client';
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
  "Crédito 9x": 7.11, "Crédito 10x": 7.90, "Crédito 11x": 8.69, "Crédito 12x": 9.48
};

const uid = () => Math.random().toString(36).slice(2, 10);
const fmt = (n: any) => new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(n || 0);
const fmtKm = (n: any) => n ? n.toLocaleString("pt-BR") + " km" : "—";
const today = () => new Date().toISOString().slice(0, 10);
const fmtDate = (d: any) => d ? new Date(d + "T12:00:00").toLocaleDateString("pt-BR") : "—";

const STATUS_COLORS: any = { "Aguardando": "#f59e0b", "Em andamento": "#3b82f6", "Pronto": "#10b981", "Entregue": "#6b7280" };
const MONTHS = ["Janeiro", "Fevereiro", "Março", "Abril", "Maio", "Junho", "Julho", "Agosto", "Setembro", "Outubro", "Novembro", "Dezembro"];
const CAR_BRANDS = ["Audi", "BMW", "BYD", "Chevrolet", "Citroën", "Ferrari", "Fiat", "Ford", "GWM", "Honda", "Hyundai", "JAC", "Jaguar", "Jeep", "Kia", "Land Rover", "Mercedes-Benz", "Mitsubishi", "Nissan", "Peugeot", "Porsche", "RAM", "Renault", "Toyota", "Volkswagen", "Volvo"].sort();

// ── MAPEADORES DE DADOS ──────────────────────────────────────────────────
const mapV = (r: any) => ({
  id: r.id, plate: r.plate, brand: r.brand, model: r.model, year: r.year, 
  color: r.color, owner: r.owner, phone: r.phone, notes: r.notes, 
  mileage: r.mileage || 0, createdAt: r.created_at
});

const mapS = (r: any) => {
  const parts = Number(r.parts_value) || 0;
  const labor = Number(r.labor_value) || 0;
  const net = r.net_value != null ? Number(r.net_value) : (parts + labor);
  let photosList = [];
  try {
    if (r.photos) {
      photosList = typeof r.photos === 'string' ? JSON.parse(r.photos) : r.photos;
    }
  } catch (e) { photosList = []; }

  return {
    id: r.id, vehicleId: r.vehicle_id, vehiclePlate: r.vehicle_plate, 
    vehicleBrand: r.vehicle_brand, vehicleModel: r.vehicle_model, 
    description: r.description, partsValue: parts, laborValue: labor, 
    netValue: net, status: r.status, entryDate: r.entry_date, 
    exitDate: r.exit_date, paymentMethod: r.payment_method || "Dinheiro", 
    mileage: r.mileage || 0, createdAt: r.created_at,
    mixedCash: Number(r.mixed_cash) || 0, mixedCard: Number(r.mixed_card) || 0,
    mixedCardMethod: r.mixed_card_method || "Débito",
    photos: Array.isArray(photosList) ? photosList : []
  };
};

// ── COMPONENTES DE BUSCA INTELIGENTE ──────────────────────────────────────
function BrandSelector({ value, onChange }: any) {
  const [query, setQuery] = useState(value || "");
  const [open, setOpen] = useState(false);
  const ref = useRef<any>(null);
  const filtered = CAR_BRANDS.filter(b => b.toLowerCase().includes(query.toLowerCase()));
  useEffect(() => { setQuery(value || ""); }, [value]);
  useEffect(() => {
    function handleClick(e: any) { if (ref.current && !ref.current.contains(e.target)) setOpen(false); }
    document.addEventListener("mousedown", handleClick); return () => document.removeEventListener("mousedown", handleClick);
  }, []);
  return (
    <div ref={ref} style={{ position: "relative", marginBottom: 10 }}>
      <label className="label">Marca *</label>
      <input className="input" placeholder="Digite a marca..." value={query} onFocus={() => setOpen(true)} onChange={e => { setQuery(e.target.value); onChange(e.target.value); setOpen(true); }} autoComplete="off" />
      {open && filtered.length > 0 && (
        <div style={{ position: "absolute", top: "100%", left: 0, right: 0, zIndex: 200, background: "#1a2030", border: "1px solid #f97316", borderRadius: 8, maxHeight: 180, overflowY: "auto", marginTop: 4, boxShadow: "0 8px 24px rgba(0,0,0,.8)" }}>
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
  const selected = vehicles.find((v: any) => v.id === value);
  const displayValue = selected ? `${selected.plate} — ${selected.brand} ${selected.model}` : query;
  const filtered = vehicles.filter((v: any) => (v.plate||"").toLowerCase().includes(query.toLowerCase()) || (v.model||"").toLowerCase().includes(query.toLowerCase())).slice(0, 10);
  useEffect(() => {
    function handleClick(e: any) { if (ref.current && !ref.current.contains(e.target)) setOpen(false); }
    document.addEventListener("mousedown", handleClick); return () => document.removeEventListener("mousedown", handleClick);
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
              <div style={{ fontSize: 11, color: "#64748b" }}>{v.brand} {v.model} {v.owner ? `· ${v.owner}` : ""}</div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

function compressImage(file: any, maxWidth = 1600, quality = 0.8) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = (e: any) => {
      const img = new Image();
      img.src = e.target.result;
      img.onload = () => {
        let width = img.width;
        let height = img.height;
        if (width > maxWidth || height > maxWidth) {
          if (width > height) {
            height = Math.round((height * maxWidth) / width);
            width = maxWidth;
          } else {
            width = Math.round((width * maxWidth) / height);
            height = maxWidth;
          }
        }
        const canvas = document.createElement('canvas');
        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d');
        if (ctx) ctx.drawImage(img, 0, 0, width, height);
        const dataUrl = canvas.toDataURL('image/jpeg', quality);
        const base64 = dataUrl.split(',')[1];
        resolve({ base64, mimeType: 'image/jpeg', dataUrl });
      };
      img.onerror = (err: any) => reject(err);
    };
    reader.onerror = (err: any) => reject(err);
  });
}

function DriveModal({ driveUrl, onSave, onClose }: any) {
  const [urlInput, setUrlInput] = useState(driveUrl || "");
  return (
    <div className="modal-bg" onClick={onClose}>
      <div className="modal" onClick={e => e.stopPropagation()}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
          <h3 style={{ fontSize: 16, fontWeight: 700, color: "#f97316" }}>⚙️ Conectar Google Drive</h3>
          <button className="btn-ghost" onClick={onClose}>✕</button>
        </div>
        <p style={{ fontSize: 12, color: "#94a3b8", marginBottom: 16, lineHeight: 1.5 }}>
          Cole abaixo a URL do seu Web App criado no Google Apps Script. As fotos das vistorias serão salvas automaticamente na pasta <strong>ASDCAR_Fotos</strong> do seu Google Drive.
        </p>
        <div style={{ marginBottom: 16 }}>
          <label className="label">URL do Web App do Google Drive Script *</label>
          <input 
            className="input" 
            placeholder="https://script.google.com/macros/s/.../exec" 
            value={urlInput} 
            onChange={e => setUrlInput(e.target.value)} 
          />
        </div>
        <button className="btn-primary" style={{ width: "100%", height: 44 }} onClick={() => { onSave(urlInput.trim()); onClose(); }}>
          Salvar Conexão do Google Drive
        </button>
      </div>
    </div>
  );
}

function PhotoZoomModal({ photo, onClose }: any) {
  if (!photo) return null;
  return (
    <div className="modal-bg" onClick={onClose}>
      <div className="modal" style={{ maxWidth: 650, textAlign: "center" }} onClick={e => e.stopPropagation()}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
          <h3 style={{ fontSize: 15, fontWeight: 700, color: "#f97316" }}>{photo.type || "Foto da Vistoria"}</h3>
          <button className="btn-ghost" onClick={onClose}>✕</button>
        </div>
        <img src={photo.url} alt={photo.type} style={{ maxWidth: "100%", maxHeight: 450, borderRadius: 12, objectFit: "contain", border: "1px solid #1e2736", background: "#000" }} />
        <div style={{ marginTop: 16, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <span style={{ fontSize: 11, color: "#64748b" }}>Data: {new Date(photo.createdAt).toLocaleDateString("pt-BR")}</span>
          <a href={photo.driveLink} target="_blank" rel="noreferrer" className="btn-ghost" style={{ fontSize: 12, color: "#3b82f6", textDecoration: "none" }}>
            🔗 Abrir no Google Drive
          </a>
        </div>
      </div>
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
  const [showOSModal, setShowOSModal] = useState<any>(null);
  const [globalViewMode, setGlobalViewMode] = useState("labor");
  const [driveUrl, setDriveUrl] = useState("");
  const [showDriveModal, setShowDriveModal] = useState(false);
  const [zoomPhoto, setZoomPhoto] = useState<any>(null);

  useEffect(() => {
    if (typeof window !== "undefined" && window.localStorage) {
      setDriveUrl(localStorage.getItem("asdcar_drive_url") || "");
    }
  }, []);

  async function loadAll() {
    setLoading(true);
    const vRes = await supabase.from("vehicles").select("*").order("created_at", { ascending: false });
    if (vRes.data) setVehicles(vRes.data.map(mapV));

    const sRes = await supabase.from("services").select("*").order("created_at", { ascending: false });
    if (sRes.data) setServices(sRes.data.map(mapS));

    const eRes = await supabase.from("expenses").select("*").order("expense_date", { ascending: false });
    if (eRes.data) setExpenses(eRes.data);
    
    setLoading(false);
  }

  useEffect(() => { loadAll(); }, []);

  const tabs = [
    { id: "dashboard", label: "Início", icon: "⬡" }, 
    { id: "services", label: "Oficina", icon: "🔧" }, 
    { id: "finance", label: "Financeiro", icon: "💰" }, 
    { id: "vehicles", label: "Base Carros", icon: "🚗" }
  ];

  return (
    <div style={{ minHeight: "100vh", background: "#0d0f14", color: "#e2e8f0", fontFamily: "'DM Mono', monospace", display: "flex", flexDirection: "column", paddingBottom: 80, width: "100%" }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=DM+Mono:wght=300;400;500&family=Syne:wght=700;800&display=swap');
        *{box-sizing:border-box;margin:0;padding:0;}
        body, html { overflow-x: hidden; width: 100%; position: relative; }
        .card{background:#161b26;border:1px solid #1e2736;border-radius:12px;padding:16px;width:100%;}
        .btn-primary{background:#f97316;color:#0d0f14;border:none;border-radius:8px;padding:10px 18px;font-weight:800;cursor:pointer;font-size:13px;}
        .btn-ghost{background:transparent;color:#94a3b8;border:1px solid #1e2736;border-radius:8px;padding:8px 12px;cursor:pointer;}
        .btn-history{background:rgba(59,130,246,0.1);color:#3b82f6;border:1px solid #3b82f6;border-radius:6px;padding:4px 8px;font-size:10px;font-weight:700;cursor:pointer;margin-bottom:6px;display:inline-block;}
        .input, .textarea{background:#0d0f14;border:1px solid #1e2736;border-radius:8px;padding:10px 12px;color:#e2e8f0;width:100%;font-family:inherit;font-size:13px;letter-spacing:0.3px;line-height:1.4;}
        .textarea{resize:vertical;min-height:85px;white-space:pre-wrap;}
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
        .table-header, .table-row { min-width: 650px; display: grid; align-items: center; }
        .table-header{padding:10px 14px;font-size:10px;color:#475569;text-transform:uppercase;border-bottom:1px solid #1e2736;}
        .table-row{padding:14px; border-bottom:1px solid #1e2736;}
      `}</style>

      <header style={{ padding: "14px 20px", borderBottom: "1px solid #1e2736", display: "flex", alignItems: "center", justifyContent: "space-between", background: "#0d0f14" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <div style={{ width: 32, height: 32, background: "#f97316", borderRadius: 8, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 18 }}>🚘</div>
          <div style={{ fontFamily: "'Syne', sans-serif", fontSize: 18, fontWeight: 800 }}>ASDCAR</div>
        </div>
        <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
          <button className="btn-ghost" style={{ fontSize: 11, padding: "6px 10px" }} onClick={() => setShowDriveModal(true)}>
            ☁️ {driveUrl ? "Drive Ok" : "Conectar Drive"}
          </button>
          <button className="btn-primary" style={{ background: "#7c3aed", color: "#fff", fontSize: 11 }} onClick={() => setShowReport(true)}>📄 PDF</button>
        </div>
      </header>

      <main style={{ padding: 16, flex: 1, maxWidth: 1200, margin: "0 auto", width: "100%" }}>
        {loading ? (
          <div style={{ padding: 40, textAlign: "center", color: "#f97316" }}>Carregando dados da oficina...</div>
        ) : (
          <>
            {tab === "dashboard" && <Dashboard services={services} viewMode={globalViewMode} setViewMode={setGlobalViewMode} />}
            {tab === "services" && <ServicesTab services={services} vehicles={vehicles} loadAll={loadAll} onOpenOS={(s: any) => setShowOSModal(s)} driveUrl={driveUrl} onOpenDriveConfig={() => setShowDriveModal(true)} onZoomPhoto={(p: any) => setZoomPhoto(p)} />}
            {tab === "finance" && <FinanceTab expenses={expenses} services={services} loadAll={loadAll} viewMode={globalViewMode} />}
            {tab === "vehicles" && <VehiclesTab vehicles={vehicles} services={services} loadAll={loadAll} onZoomPhoto={(p: any) => setZoomPhoto(p)} />}
          </>
        )}
      </main>

      <nav className="bottom-nav">
        <div style={{ display: "flex", justifyContent: "space-around", maxWidth: 600, margin: "0 auto" }}>
          {tabs.map(t => (
            <button key={t.id} className={`nav-item ${tab === t.id ? "active" : ""}`} onClick={() => setTab(t.id)}>
              <span style={{ fontSize: 22 }}>{t.icon}</span>{t.label}
            </button>
          ))}
        </div>
      </nav>

      {showReport && <ReportModal services={services} viewMode={globalViewMode} onClose={() => setShowReport(false)} onGenerate={(f:any, t:any) => { generatePDF(vehicles, services, expenses, f, t, globalViewMode); setShowReport(false); }} />}
      {showDriveModal && (
        <DriveModal 
          driveUrl={driveUrl} 
          onSave={(url: any) => { if (typeof window !== "undefined") { localStorage.setItem("asdcar_drive_url", url); } setDriveUrl(url); }} 
          onClose={() => setShowDriveModal(false)} 
        />
      )}
      {zoomPhoto && <PhotoZoomModal photo={zoomPhoto} onClose={() => setZoomPhoto(null)} />}
      {showOSModal && <OSModal service={showOSModal} vehicles={vehicles} onClose={() => setShowOSModal(null)} />}
    </div>
  );
}

// ── ABA INÍCIO ─────────────────────────────────────────────────────────────
function Dashboard({ services, viewMode, setViewMode }: any) {
  const [selMonth, setSelMonth] = useState(new Date().getMonth());
  const [selYear, setSelYear] = useState(new Date().getFullYear());

  const activeServices = services.filter((s: any) => s.status !== "Entregue");
  const filteredDelivered = services.filter((s: any) => {
    if (s.status !== "Entregue" || !s.exitDate) return false;
    const d = new Date(s.exitDate + "T12:00:00");
    return d.getMonth() === selMonth && d.getFullYear() === selYear;
  });

  const tP = filteredDelivered.reduce((acc: any, s: any) => acc + (Number(s.partsValue) || 0), 0);
  const tL = filteredDelivered.reduce((acc: any, s: any) => acc + (Number(s.laborValue) || 0), 0);

  const receitaCalculada = filteredDelivered.reduce((acc: any, s: any) => {
    if (s.paymentMethod === "Múltiplo / Misto") {
      const taxaCard = PAYMENT_METHODS[s.mixedCardMethod] || 0;
      const dinheiroPixLivre = Number(s.mixedCash || 0);
      
      if (viewMode === "labor") {
        const totalBrutoServico = (Number(s.partsValue) || 0) + (Number(s.laborValue) || 0);
        if (totalBrutoServico <= 0) return acc;
        const percentualLabor = Number(s.laborValue) / totalBrutoServico;
        
        const cashProporcional = dinheiroPixLivre * percentualLabor;
        const cardProporcionalBruto = Number(s.mixedCard || 0) * percentualLabor;
        const cardProporcionalLiquido = cardProporcionalBruto * (1 - taxaCard / 100);
        
        return acc + cashProporcional + cardProporcionalLiquido;
      } else {
        const cardLiquido = Number(s.mixedCard || 0) * (1 - taxaCard / 100);
        return acc + dinheiroPixLivre + cardLiquido;
      }
    }

    const taxa = PAYMENT_METHODS[s.paymentMethod] || 0;
    if (viewMode === "labor") {
      return acc + (Number(s.laborValue || 0) * (1 - taxa / 100));
    } else {
      return acc + (s.netValue || 0);
    }
  }, 0);

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
      <div className="card" style={{ display: "flex", flexDirection: "column", gap: 10, background: "#1a2030" }}>
        <div style={{ display: "flex", gap: 10 }}>
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

        <div>
          <label className="label">Visualização do Painel</label>
          <div style={{ display: "flex", gap: 8 }}>
            <button 
              className="btn-ghost" 
              style={{ flex: 1, fontSize: 11, background: viewMode === "labor" ? "#f97316" : "transparent", color: viewMode === "labor" ? "#0d0f14" : "#94a3b8", border: viewMode === "labor" ? "none" : "1px solid #1e2736", fontWeight: viewMode === "labor" ? 800 : 400 }}
              onClick={() => setViewMode("labor")}
            >
              🛠️ Apenas Mão de Obra
            </button>
            <button 
              className="btn-ghost" 
              style={{ flex: 1, fontSize: 11, background: viewMode === "total" ? "#3b82f6" : "transparent", color: viewMode === "total" ? "#ffffff" : "#94a3b8", border: viewMode === "total" ? "none" : "1px solid #1e2736", fontWeight: viewMode === "total" ? 800 : 400 }}
              onClick={() => setViewMode("total")}
            >
              💵 Bruto Total (M.O. + Peças)
            </button>
          </div>
        </div>
      </div>

      <div className="kpi-grid" style={{ gridTemplateColumns: "repeat(auto-fit, minmax(130px, 1fr))" }}>
        <div className="card" style={{ borderLeft: "4px solid #f97316" }}>
          <span className="label">Pátio Oficina</span>
          <div style={{ fontSize: 22, fontWeight: 700, color: "#f97316", marginTop: 4 }}>{activeServices.length}</div>
          <span style={{ fontSize: 10, color: "#64748b" }}>Carros no pátio</span>
        </div>
        <div className="card" style={{ borderLeft: "4px solid #8b5cf6" }}>
          <span className="label">Peças ({MONTHS[selMonth].slice(0,3)})</span>
          <div style={{ fontSize: 18, fontWeight: 700, color: "#8b5cf6", marginTop: 4 }}>{fmt(tP)}</div>
          <span style={{ fontSize: 10, color: "#64748b" }}>Peças faturadas</span>
        </div>
        <div className="card" style={{ borderLeft: "4px solid #10b981" }}>
          <span className="label">M.O. ({MONTHS[selMonth].slice(0,3)})</span>
          <div style={{ fontSize: 18, fontWeight: 700, color: "#10b981", marginTop: 4 }}>{fmt(tL)}</div>
          <span style={{ fontSize: 10, color: "#64748b" }}>Mão de obra bruta</span>
        </div>
        <div className="card" style={{ borderLeft: "4px solid #f59e0b" }}>
          <span className="label">Ticket Médio M.O.</span>
          <div style={{ fontSize: 18, fontWeight: 700, color: "#f59e0b", marginTop: 4 }}>{fmt(filteredDelivered.length > 0 ? (tL / filteredDelivered.length) : 0)}</div>
          <span style={{ fontSize: 10, color: "#64748b" }}>Por carro entregue</span>
        </div>
        <div className="card" style={{ borderLeft: "4px solid #3b82f6" }}>
          <span className="label">{viewMode === "labor" ? "M.O. Líquida" : "Faturamento Líq."}</span>
          <div style={{ fontSize: 18, fontWeight: 700, color: "#3b82f6", marginTop: 4 }}>{fmt(receitaCalculada)}</div>
          <span style={{ fontSize: 10, color: "#10b981" }}>Líquido descontado taxas</span>
        </div>
      </div>

      <div className="card">
        <h3 style={{ fontSize: 14, fontWeight: 700, marginBottom: 12 }}>📋 Pátio em Atendimento ({activeServices.length})</h3>
        {activeServices.length === 0 ? <p style={{ fontSize: 12, color: "#64748b" }}>Nenhum veículo em atendimento no momento.</p> : (
          <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
            {activeServices.map((s: any) => (
              <div key={s.id} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "10px 12px", background: "#0d0f14", borderRadius: 8, borderLeft: `3px solid ${STATUS_COLORS[s.status] || "#6b7280"}` }}>
                <div>
                  <strong style={{ fontSize: 13, color: "#f97316" }}>{s.vehiclePlate}</strong> · <span style={{ fontSize: 12 }}>{s.vehicleBrand} {s.vehicleModel}</span>
                  <div style={{ fontSize: 11, color: "#64748b", marginTop: 2 }}>{s.description.split("||")[0]}</div>
                </div>
                <StatusBadge status={s.status} map={STATUS_COLORS} />
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

// ── ABA OFICINA ────────────────────────────────────────────────────────────
function ServicesTab({ services, vehicles, loadAll, onOpenOS, driveUrl, onOpenDriveConfig, onZoomPhoto }: any) {
  const [modal, setModal] = useState(false);
  const [editing, setEditing] = useState<any>(null);
  const [form, setForm] = useState<any>({});
  
  const [partsOwner, setPartsOwner] = useState("oficina"); 
  const [oficinaPartsText, setOficinaPartsText] = useState("");
  const [clientePartsText, setClientePartsText] = useState("");
  const [filterStatus, setFilterStatus] = useState("");

  const open = (s = null) => { 
    setEditing(s); 
    let initialOwner = "oficina";
    let ofiText = "";
    let cliText = "";
    if (s) {
      if (s.description?.includes("|| Peças Oficina:")) {
        initialOwner = "mista";
        const partes = s.description.split("||");
        ofiText = partes[1]?.replace("Peças Oficina:", "")?.trim() || "";
        cliText = partes[2]?.replace("Peças Cliente:", "")?.trim() || "";
      } else if (s.description?.includes("(Cliente forneceu as peças)")) {
        initialOwner = "cliente";
      }
    }
    setPartsOwner(initialOwner);
    setOficinaPartsText(ofiText);
    setClientePartsText(cliText);
    setForm(s || { status: "Aguardando", description: "", partsValue: 0, laborValue: 0, entryDate: today(), paymentMethod: "Dinheiro", mixedCash: 0, mixedCard: 0, mixedCardMethod: "Débito" }); 
    setModal(true); 
  };
  const close = () => { setModal(false); setEditing(null); setForm({}); };

  const save = async () => {
    if (!form.vehicleId || !form.description) return alert("Selecione o carro e descreva o serviço.");
    const v = vehicles.find((v: any) => v.id === form.vehicleId);
    let descLimpa = form.description.split("||")[0].replace(/\s*\(Cliente forneceu as peças\)/gi, "").trim();
    let finalPartsValue = Number(form.partsValue) || 0;

    if (partsOwner === "cliente") {
      descLimpa += " (Cliente forneceu as peças)";
      finalPartsValue = 0;
    } else if (partsOwner === "mista") {
      descLimpa += ` || Peças Oficina: ${oficinaPartsText || "Especificadas"} || Peças Cliente: ${clientePartsText || "Especificadas"}`;
    }

    let liquido = 0;
    const bruto = finalPartsValue + (Number(form.laborValue) || 0);
    const metodoCartaoMisto = form.mixed_card_method || form.mixedCardMethod || "Débito";

    if (form.paymentMethod === "Múltiplo / Misto") {
      const taxaCard = PAYMENT_METHODS[metodoCartaoMisto] || 0;
      const parteCash = Number(form.mixedCash) || 0;
      const parteCard = Number(form.mixedCard) || 0;
      liquido = parteCash + (parteCard * (1 - taxaCard / 100));
    } else {
      const taxa = PAYMENT_METHODS[form.paymentMethod] || 0;
      liquido = bruto - (bruto * (taxa / 100));
    }

    const row = { 
      id: editing?.id || uid(), 
      vehicle_id: form.vehicleId, 
      vehicle_plate: v?.plate, 
      vehicle_brand: v?.brand, 
      vehicle_model: v?.model, 
      description: descLimpa, 
      parts_value: finalPartsValue, 
      labor_value: Number(form.laborValue) || 0, 
      net_value: liquido, 
      status: form.status, 
      entry_date: form.entryDate, 
      exit_date: form.status === "Entregue" ? (form.exitDate || today()) : null, 
      payment_method: form.paymentMethod || "Dinheiro", 
      mileage: Number(form.mileage) || 0,
      mixed_cash: form.paymentMethod === "Múltiplo / Misto" ? Number(form.mixedCash) : 0,
      mixed_card: form.paymentMethod === "Múltiplo / Misto" ? Number(form.mixedCard) : 0,
      mixed_card_method: form.paymentMethod === "Múltiplo / Misto" ? metodoCartaoMisto : null
    };
    
    const { error } = await supabase.from("services").upsert(row);
    if (!error) { await loadAll(); close(); } else { alert("Erro ao salvar: " + error.message); }
  };

  const filtered = filterStatus ? services.filter((s: any) => s.status === filterStatus) : services;
  const cols = "1.8fr 1.3fr 0.8fr 1fr 110px";

  return (
    <Section title="Fluxo Oficina" action={<button className="btn-primary" onClick={() => open()}>+ Entrada</button>}>
      <div style={{ display: "flex", gap: 6, marginBottom: 10, flexWrap: "wrap" }}>
        {["", ...Object.keys(STATUS_COLORS)].map(s => (
          <button key={s} onClick={() => setFilterStatus(s)} style={{ background: filterStatus === s ? "#f97316" : "transparent", color: filterStatus === s ? "#0d0f14" : "#64748b", border: `1px solid ${filterStatus === s ? "#f97316" : "#1e2736"}`, borderRadius: 20, padding: "4px 12px", fontSize: 11, cursor: "pointer" }}>{s || "Todos"}</button>
        ))}
      </div>

      <div className="table-wrap"><div className="card" style={{ padding: 0 }}>
        <div className="table-header" style={{ gridTemplateColumns: cols }}>
          <div>Veículo / Descrição</div>
          <div>Forma de Pagamento</div>
          <div>Valores (P / M.O.)</div>
          <div>Status / Datas</div>
          <div style={{ textAlign: "right" }}>Ações</div>
        </div>

        {filtered.length === 0 ? <div style={{ padding: 20, textAlign: "center", color: "#64748b" }}>Nenhum serviço registrado.</div> : (
          filtered.map((s: any) => {
            const totalBruto = (Number(s.partsValue) || 0) + (Number(s.laborValue) || 0);
            return (
              <div key={s.id} className="table-row" style={{ gridTemplateColumns: cols }}>
                <div>
                  <button className="btn-history" onClick={() => {
                    const car = vehicles.find((v: any) => v.id === s.vehicleId);
                    if (car) alert(`Histórico do veículo ${car.plate}:\nProprietário: ${car.owner || '—'}\nMarca/Modelo: ${car.brand} ${car.model}`);
                  }}>
                    📋 {s.vehiclePlate}
                  </button>
                  <div style={{ fontSize: 13, fontWeight: 700 }}>{s.vehicleBrand} {s.vehicleModel}</div>
                  <div style={{ fontSize: 12, color: "#94a3b8", marginTop: 2 }}>{s.description.split("||")[0]}</div>
                </div>

                <div>
                  <div style={{ fontSize: 12, fontWeight: 600 }}>{s.paymentMethod}</div>
                  {s.paymentMethod === "Múltiplo / Misto" && (
                    <div style={{ fontSize: 10, color: "#f97316", marginTop: 2 }}>
                      Esp: {fmt(s.mixedCash)} · {s.mixedCardMethod}: {fmt(s.mixedCard)}
                    </div>
                  )}
                  {PAYMENT_METHODS[s.paymentMethod] > 0 && <div style={{ fontSize: 10, color: "#64748b" }}>Taxa: {PAYMENT_METHODS[s.paymentMethod]}%</div>}
                </div>

                <div>
                  <div style={{ fontSize: 11, color: "#8b5cf6" }}>P: {fmt(s.partsValue)}</div>
                  <div style={{ fontSize: 11, color: "#10b981" }}>M.O: {fmt(s.laborValue)}</div>
                  <div style={{ fontSize: 12, fontWeight: 700, color: "#f97316", marginTop: 2 }}>Bruto: {fmt(totalBruto)}</div>
                </div>

                <div>
                  <StatusBadge status={s.status} map={STATUS_COLORS} />
                  <div style={{ fontSize: 10, color: "#64748b", marginTop: 4 }}>Entrada: {fmtDate(s.entryDate)}</div>
                  {s.exitDate && <div style={{ fontSize: 10, color: "#10b981" }}>Saída: {fmtDate(s.exitDate)}</div>}
                </div>

                <div style={{ display: "flex", gap: 6, justifyContent: "flex-end" }}>
                  <button className="btn-ghost" style={{ fontSize: 11, padding: "4px 8px" }} onClick={() => onOpenOS(s)}>📄 OS</button>
                  <button className="btn-ghost" style={{ fontSize: 11, padding: "4px 8px" }} onClick={() => open(s)}>✏️</button>
                </div>
              </div>
            );
          })
        )}
      </div></div>

      {modal && (
        <div className="modal-bg" onClick={close}><div className="modal" onClick={e => e.stopPropagation()}>
          <h3>{editing ? "Editar Serviço" : "Novo Serviço"}</h3>
          
          <VehicleSelector vehicles={vehicles} value={form.vehicleId} onChange={(val: any) => setForm({ ...form, vehicleId: val })} />

          <div style={{ marginBottom: 15 }}>
            <label className="label">Origem das Peças *</label>
            <div style={{ display: "flex", gap: 8 }}>
              <button type="button" className="btn-ghost" style={{ flex: 1, fontSize: 11, background: partsOwner === "oficina" ? "#f97316" : "transparent", color: partsOwner === "oficina" ? "#0d0f14" : "#94a3b8" }} onClick={() => { setPartsOwner("oficina"); setForm({ ...form, partsValue: form.partsValue || 0 }); }}>Oficina Fornece</button>
              <button type="button" className="btn-ghost" style={{ flex: 1, fontSize: 11, background: partsOwner === "cliente" ? "#3b82f6" : "transparent", color: partsOwner === "cliente" ? "#ffffff" : "#94a3b8" }} onClick={() => { setPartsOwner("cliente"); setForm({ ...form, partsValue: 0 }); }}>Cliente Trouxe Tudo</button>
              <button type="button" className="btn-ghost" style={{ flex: 1, fontSize: 11, background: partsOwner === "mista" ? "#8b5cf6" : "transparent", color: partsOwner === "mista" ? "#ffffff" : "#94a3b8" }} onClick={() => setPartsOwner("mista")}>Peças Mistas</button>
            </div>
          </div>

          {partsOwner === "mista" && (
            <div style={{ background: "#0d0f14", padding: 12, borderRadius: 8, marginBottom: 15, border: "1px solid #8b5cf6" }}>
              <Field label="Peças Fornecidas pela Oficina" placeholder="Ex: Filtro de óleo, Óleo 5W30" value={oficinaPartsText} onChange={setOficinaPartsText} />
              <Field label="Peças Trazidas pelo Cliente" placeholder="Ex: Pastilhas de freio traseiras" value={clientePartsText} onChange={setClientePartsText} />
            </div>
          )}

          <div style={{ marginBottom: 15 }}>
            <label className="label">Descrição do Serviço *</label>
            <textarea className="textarea" placeholder="Descreva os serviços a serem realizados..." value={form.description ? form.description.split("||")[0].replace(/\s*\(Cliente forneceu as peças\)/gi, "") : ""} onChange={e => setForm({ ...form, description: e.target.value })} />
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
            {partsOwner !== "cliente" && <Field label="Valor das Peças (R$)" type="number" value={form.partsValue} onChange={(v: any) => setForm({ ...form, partsValue: v })} />}
            <Field label="Mão de Obra (R$)" type="number" value={form.laborValue} onChange={(v: any) => setForm({ ...form, laborValue: v })} />
          </div>

          <SelectField label="Status do Serviço" value={form.status || "Aguardando"} onChange={(v: any) => setForm({ ...form, status: v })} options={["Aguardando", "Em andamento", "Pronto", "Entregue"]} />
          <SelectField label="Forma de Pagamento" value={form.paymentMethod || "Dinheiro"} onChange={(v: any) => setForm({ ...form, paymentMethod: v })} options={Object.keys(PAYMENT_METHODS).concat(["Múltiplo / Misto"])} />

          {form.paymentMethod === "Múltiplo / Misto" && (
            <div style={{ background: "#0d0f14", padding: 12, borderRadius: 8, marginBottom: 15, border: "1px solid #f97316" }}>
              <Field label="Valor em Espécie / Pix (R$)" type="number" value={form.mixedCash} onChange={(v: any) => setForm({ ...form, mixedCash: v })} />
              <Field label="Valor no Cartão (R$)" type="number" value={form.mixedCard} onChange={(v: any) => setForm({ ...form, mixedCard: v })} />
              <SelectField label="Modalidade do Cartão Misto" value={form.mixedCardMethod || "Débito"} onChange={(v: any) => setForm({ ...form, mixedCardMethod: v })} options={Object.keys(PAYMENT_METHODS).filter(m => m !== "Dinheiro" && m !== "Pix")} />
            </div>
          )}

          <button className="btn-primary" style={{ width: "100%", marginTop: 15 }} onClick={save}>Salvar Registro</button>
        </div></div>
      )}
    </Section>
  );
}

// ── ABA FINANCEIRO ──────────────────────────────────────────────────────────
function FinanceTab({ expenses, services, loadAll, viewMode }: any) {
  const [modal, setModal] = useState(false);
  const [form, setForm] = useState<any>({});
  const [selMonth, setSelMonth] = useState(new Date().getMonth());
  const [selYear, setSelYear] = useState(new Date().getFullYear());

  const saveExpense = async () => {
    if (!form.description || !form.value) return alert("Informe a descrição e o valor da despesa.");
    const row = {
      id: form.id || uid(),
      description: form.description,
      value: Number(form.value) || 0,
      category: form.category || "Outros",
      expense_date: form.expense_date || today()
    };
    const { error } = await supabase.from("expenses").upsert(row);
    if (!error) { await loadAll(); setModal(false); setForm({}); } else { alert("Erro: " + error.message); }
  };

  const filteredDelivered = services.filter((s: any) => {
    if (s.status !== "Entregue" || !s.exitDate) return false;
    const d = new Date(s.exitDate + "T12:00:00");
    return d.getMonth() === selMonth && d.getFullYear() === selYear;
  });

  const faturamentoLiquido = filteredDelivered.reduce((acc: any, s: any) => {
    if (s.paymentMethod === "Múltiplo / Misto") {
      const taxaCard = PAYMENT_METHODS[s.mixedCardMethod] || 0;
      const dinheiroPixLivre = Number(s.mixedCash || 0);
      
      if (viewMode === "labor") {
        const totalBrutoServico = (Number(s.partsValue) || 0) + (Number(s.laborValue) || 0);
        if (totalBrutoServico <= 0) return acc;
        const percentualLabor = Number(s.laborValue) / totalBrutoServico;
        return acc + (dinheiroPixLivre * percentualLabor) + (Number(s.mixedCard || 0) * percentualLabor * (1 - taxaCard / 100));
      } else {
        return acc + dinheiroPixLivre + (Number(s.mixedCard || 0) * (1 - taxaCard / 100));
      }
    }

    const taxa = PAYMENT_METHODS[s.paymentMethod] || 0;
    if (viewMode === "labor") {
      return acc + (Number(s.laborValue || 0) * (1 - taxa / 100));
    } else {
      return acc + (s.netValue || 0);
    }
  }, 0);

  const monthExpenses = expenses.filter((e: any) => {
    if (!e.expense_date) return false;
    const d = new Date(e.expense_date + "T12:00:00");
    return d.getMonth() === selMonth && d.getFullYear() === selYear;
  });

  const totalDespesas = monthExpenses.reduce((acc: any, e: any) => acc + (Number(e.value) || 0), 0);
  const lucroLiquidoReal = faturamentoLiquido - totalDespesas;

  return (
    <Section title="Financeiro & Caixa" action={<button className="btn-primary" onClick={() => { setForm({ expense_date: today() }); setModal(true); }}>+ Lançar Despesa</button>}>
      <div className="card" style={{ display: "flex", gap: 10, background: "#1a2030" }}>
        <div style={{ flex: 1 }}>
          <label className="label">Mês</label>
          <select className="input" value={selMonth} onChange={e => setSelMonth(Number(e.target.value))}>
            {MONTHS.map((m, i) => <option key={i} value={i}>{m}</option>)}
          </select>
        </div>
        <div style={{ width: 100 }}>
          <label className="label">Ano</label>
          <select className="input" value={selYear} onChange={e => setSelYear(Number(e.target.value))}>
            {[2024, 2025, 2026, 2027].map(y => <option key={y} value={y}>{y}</option>)}
          </select>
        </div>
      </div>

      <div className="kpi-grid">
        <div className="card" style={{ borderLeft: "4px solid #10b981" }}>
          <span className="label">Entradas Líquidas</span>
          <div style={{ fontSize: 20, fontWeight: 700, color: "#10b981", marginTop: 4 }}>{fmt(faturamentoLiquido)}</div>
        </div>
        <div className="card" style={{ borderLeft: "4px solid #ef4444" }}>
          <span className="label">Despesas Totais</span>
          <div style={{ fontSize: 20, fontWeight: 700, color: "#ef4444", marginTop: 4 }}>{fmt(totalDespesas)}</div>
        </div>
        <div className="card" style={{ borderLeft: `4px solid ${lucroLiquidoReal >= 0 ? "#10b981" : "#ef4444"}` }}>
          <span className="label">Resultado Real do Mês</span>
          <div style={{ fontSize: 20, fontWeight: 700, color: lucroLiquidoReal >= 0 ? "#10b981" : "#ef4444", marginTop: 4 }}>{fmt(lucroLiquidoReal)}</div>
        </div>
      </div>

      <div className="card">
        <h3 style={{ fontSize: 14, fontWeight: 700, marginBottom: 12 }}>💸 Lançamentos de Despesas ({monthExpenses.length})</h3>
        {monthExpenses.length === 0 ? <p style={{ fontSize: 12, color: "#64748b" }}>Nenhuma despesa lançada neste mês.</p> : (
          <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
            {monthExpenses.map((e: any) => (
              <div key={e.id} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "10px 12px", background: "#0d0f14", borderRadius: 8 }}>
                <div>
                  <strong style={{ fontSize: 13 }}>{e.description}</strong>
                  <div style={{ fontSize: 11, color: "#64748b" }}>Cat: {e.category} · Data: {fmtDate(e.expense_date)}</div>
                </div>
                <div style={{ fontSize: 14, fontWeight: 700, color: "#ef4444" }}>-{fmt(e.value)}</div>
              </div>
            ))}
          </div>
        )}
      </div>

      {modal && (
        <div className="modal-bg" onClick={() => setModal(false)}><div className="modal" onClick={ev => ev.stopPropagation()}>
          <h3>Nova Despesa</h3>
          <Field label="Descrição" placeholder="Ex: Conta de luz, Compra de chaves" value={form.description} onChange={(v: any) => setForm({ ...form, description: v })} />
          <Field label="Valor (R$)" type="number" value={form.value} onChange={(v: any) => setForm({ ...form, value: v })} />
          <SelectField label="Categoria" value={form.category || "Outros"} onChange={(v: any) => setForm({ ...form, category: v })} options={["Peças", "Ferramentas", "Aluguel", "Energia / Água", "Salários", "Impostos", "Outros"]} />
          <Field label="Data da Despesa" type="date" value={form.expense_date} onChange={(v: any) => setForm({ ...form, expense_date: v })} />
          <button className="btn-primary" style={{ width: "100%", marginTop: 15 }} onClick={saveExpense}>Salvar Despesa</button>
        </div></div>
      )}
    </Section>
  );
}

// ── ABA BANCO DE VEÍCULOS ──────────────────────────────────────────────────
function VehiclesTab({ vehicles, services, loadAll, onZoomPhoto }: any) {
  const [modal, setModal] = useState(false);
  const [historyModal, setHistoryModal] = useState(false);
  const [selectedV, setSelectedV] = useState<any>(null);
  const [editing, setEditing] = useState<any>(null);
  const [search, setSearch] = useState("");
  const [form, setForm] = useState<any>({});

  const open = (v = null) => { setEditing(v); setForm(v || {}); setModal(true); };
  const close = () => { setModal(false); setEditing(null); setForm({}); };

  const save = async () => {
    if (!form.plate || !form.brand || !form.model) return alert("Preencha placa, marca e modelo.");
    const row = {
      id: editing?.id || uid(),
      plate: form.plate.toUpperCase().trim(),
      brand: form.brand,
      model: form.model,
      year: form.year,
      color: form.color,
      owner: form.owner,
      phone: form.phone,
      notes: form.notes,
      mileage: Number(form.mileage) || 0
    };
    const { error } = await supabase.from("vehicles").upsert(row);
    if (!error) { await loadAll(); close(); } else { alert("Erro ao salvar: " + error.message); }
  };

  const filtered = vehicles.filter((v: any) => 
    !search || 
    (v.plate || "").toLowerCase().includes(search.toLowerCase()) || 
    (v.owner || "").toLowerCase().includes(search.toLowerCase()) ||
    (v.model || "").toLowerCase().includes(search.toLowerCase())
  );

  return (
    <Section title="Cadastro de Veículos" action={<button className="btn-primary" onClick={() => open()}>+ Novo Veículo</button>}>
      <input className="input" placeholder="Buscar por placa, modelo ou dono..." value={search} onChange={e => setSearch(e.target.value)} style={{ marginBottom: 12 }} />

      <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
        {filtered.length === 0 ? <div style={{ padding: 20, textAlign: "center", color: "#64748b" }}>Nenhum veículo encontrado.</div> : (
          filtered.map((v: any) => {
            const count = services.filter((s: any) => s.vehicleId === v.id).length;
            return (
              <div key={v.id} className="card" style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <div>
                  <strong style={{ fontSize: 15, color: "#f97316" }}>{v.plate}</strong> · <span style={{ fontWeight: 700 }}>{v.brand} {v.model}</span>
                  <div style={{ fontSize: 11, color: "#94a3b8", marginTop: 2 }}>Dono: {v.owner || "—"} · Tel: {v.phone || "—"}</div>
                  <div style={{ fontSize: 10, color: "#64748b" }}>Ano: {v.year || "—"} · KM Inicial: {fmtKm(v.mileage)} · {count} Serviço(s)</div>
                </div>

                <div style={{ display: "flex", gap: 6 }}>
                  <button className="btn-ghost" style={{ fontSize: 11 }} onClick={() => { setSelectedV(v); setHistoryModal(true); }}>📋 Histórico</button>
                  <button className="btn-ghost" style={{ fontSize: 11 }} onClick={() => open(v)}>✏️</button>
                </div>
              </div>
            );
          })
        )}
      </div>

      {modal && (
        <div className="modal-bg" onClick={close}><div className="modal" onClick={e => e.stopPropagation()}>
          <h3>{editing ? "Editar Veículo" : "Novo Veículo"}</h3>
          <Field label="Placa *" placeholder="Ex: ABC1D23" value={form.plate} onChange={(v: any) => setForm({ ...form, plate: v.toUpperCase() })} />
          <BrandSelector value={form.brand} onChange={(v: any) => setForm({ ...form, brand: v })} />
          <Field label="Modelo *" placeholder="Ex: Corolla XEI" value={form.model} onChange={(v: any) => setForm({ ...form, model: v })} />
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
            <Field label="Ano" placeholder="Ex: 2018" value={form.year} onChange={(v: any) => setForm({ ...form, year: v })} />
            <Field label="KM Inicial" type="number" value={form.mileage} onChange={(v: any) => setForm({ ...form, mileage: v })} />
          </div>
          <Field label="Cliente / Proprietário" placeholder="Nome do proprietário" value={form.owner} onChange={(v: any) => setForm({ ...form, owner: v })} />
          <Field label="Telefone / WhatsApp" placeholder="Ex: (11) 99999-9999" value={form.phone} onChange={(v: any) => setForm({ ...form, phone: v })} />
          <button className="btn-primary" style={{ width: "100%", marginTop: 15 }} onClick={save}>Salvar Veículo</button>
        </div></div>
      )}

      {historyModal && (
        <div className="modal-bg" onClick={() => setHistoryModal(false)}><div className="modal" onClick={e => e.stopPropagation()}>
          <h3>Histórico: {selectedV?.plate}</h3>
          <div style={{ maxHeight: 320, overflowY: "auto", marginTop: 15 }}>
            {services.filter((s: any) => s.vehicleId === selectedV?.id).map((s: any) => (
              <div key={s.id} style={{ padding: 12, background: "#0d0f14", borderRadius: 8, marginBottom: 10, borderLeft: "3px solid #10b981" }}>
                <div style={{ fontSize: 12, fontWeight: 700 }}>{s.description.replace(/\|\|/g, " · ")}</div>
                <div style={{ fontSize: 10, color: "#64748b", marginTop: 4 }}>KM: {fmtKm(s.mileage)} | Finalizado: {fmtDate(s.exitDate)}</div>
                <div style={{ fontSize: 12, fontWeight: 800, color: "#f97316", marginTop: 5 }}>Total Bruto: {fmt((Number(s.partsValue) || 0) + (Number(s.laborValue) || 0))}</div>
              </div>
            ))}
          </div>
          <button className="btn-ghost" style={{ width: "100%", marginTop: 15 }} onClick={() => setHistoryModal(false)}>Fechar</button>
        </div></div>
      )}
    </Section>
  );
}

// ── MODAL GERADOR DE PDF ──────────────────────────────────────────────────
function ReportModal({ onClose, onGenerate }: any) {
  const [from, setFrom] = useState(today().slice(0, 8) + "01");
  const [to, setTo] = useState(today());
  return (
    <div className="modal-bg" onClick={onClose}><div className="modal" onClick={e => e.stopPropagation()}>
      <h3>Gerar Fechamento Comercial</h3>
      <Field label="Data Início" type="date" value={from} onChange={setFrom} />
      <Field label="Data Fim" type="date" value={to} onChange={setTo} />
      <button className="btn-primary" style={{width:"100%", marginTop:10}} onClick={() => onGenerate(from, to)}>Compilar Relatório Master</button>
    </div></div>
  );
}

// ── JANELA DA O.S ────────────────────────────────────────────────────────
function OSModal({ service, vehicles, onClose }: any) {
  const [email, setEmail] = useState("");
  const car = vehicles.find((v: any) => v.id === service.vehicleId) || {};
  return (
    <div className="modal-bg" onClick={onClose}><div className="modal" onClick={e => e.stopPropagation()}>
      <h3>Emitir O.S. — ASDCAR</h3>
      <div style={{marginBottom:10}}><label className="label">Cliente</label><input className="input" value={car.owner || "—"} disabled /></div>
      <Field label="E-mail do Cliente (Opcional)" value={email} onChange={setEmail} type="email" />
      <button className="btn-primary" style={{width:"100%", marginTop:10, background:"#7c3aed", color:"#fff"}} onClick={() => { generateOSFile(service, car, email); onClose(); }}>Gerar Via de Impressão</button>
    </div></div>
  );
}

function Section({ title, action, children }: any) { return (<div style={{ display: "flex", flexDirection: "column", gap: 12 }}><div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}><h1 style={{ fontFamily: "'Syne',sans-serif", fontSize: 20, fontWeight: 800 }}>{title}</h1>{action}</div>{children}</div>); }
function StatusBadge({ status, map }: any) { const color = (map || {})[status] || "#6b7280"; return <span className="badge" style={{ background: color + "22", color, border: `1px solid ${color}44` }}>{status || "—"}</span>; }
function Field({ label, value, onChange, type = "text", disabled = false, placeholder = "" }: any) { return <div style={{ marginBottom: 10 }}><label className="label">{label}</label><input className="input" placeholder={placeholder} type={type} value={value || ""} onChange={e => onChange(e.target.value)} disabled={disabled} /></div>; }
function SelectField({ label, value, onChange, options }: any) { return <div style={{ marginBottom: 10 }}><label className="label">{label}</label><select className="input" value={value} onChange={e => onChange(e.target.value)}>{options.map((o: any) => <option key={o} value={o}>{o}</option>)}</select></div>; }

// ── GERADORES DE DOCUMENTOS COMPLETOS ─────────────────────────────────────
function generateOSFile(s: any, car: any, email: string) {
  const tBruto = Number(s.partsValue || 0) + Number(s.laborValue || 0);
  let escopoPrincipal = s.description;
  let blocoPecasMistas = "";
  if (s.description?.includes("|| Peças Oficina:")) {
    const blocos = s.description.split("||");
    escopoPrincipal = blocos[0].trim();
    blocoPecasMistas = `<div style="margin-top:15px; padding:10px; background:#f8fafc; border-radius:4px; border:1px solid #e2e8f0;"><p style="margin-bottom:4px;">⚙️ <strong>Peças fornecidas pela ASDCAR:</strong> ${blocos[1]?.replace("Peças Oficina:", "")?.trim()}</p><p>👤 <strong>Peças trazidas pelo Cliente:</strong> ${blocos[2]?.replace("Peças Cliente:", "")?.trim()} <em>(Cliente forneceu)</em></p></div>`;
  } else if (s.description?.includes("(Cliente forneceu as peças)")) {
    escopoPrincipal = s.description.replace("(Cliente forneceu as peças)", "").trim();
    blocoPecasMistas = `<div style="margin-top:10px; color:#64748b; font-style:italic;">⚠️ Nota: Todas as peças para este serviço foram fornecidas pelo próprio cliente.</div>`;
  }
  const html = `<!DOCTYPE html><html lang="pt-BR"><head><meta charset="UTF-8"/><title>O.S. ${s.vehiclePlate}</title><style>*{box-sizing:border-box;margin:0;padding:0;}body{font-family:Arial,sans-serif;font-size:12px;color:#0f172a;padding:40px;}.os-border{border:2px dashed #000;padding:30px;}.hdr{display:flex;justify-content:space-between;align-items:center;border-bottom:2px solid #000;padding-bottom:15px;margin-bottom:20px;}.grid-ficha{display:grid;grid-template-columns:1fr 1fr;gap:20px;margin-bottom:25px;background:#f8fafc;padding:15px;border:1px solid #e2e8f0;}h2{font-size:13px;text-transform:uppercase;margin:20px 0 10px 0;border-left:4px solid #000;padding-left:8px;}.box-servico{border:1px solid #e2e8f0;padding:15px;min-height:80px;line-height:1.5;background:#fff;margin-bottom:20px;}.termos{font-size:10px;color:#475569;margin:30px 0;text-align:justify;}.assinaturas{display:grid;grid-template-columns:1fr 1fr;gap:40px;margin-top:50px;text-align:center;}.linha-sub{border-top:1px solid #000;padding-top:6px;font-size:11px;font-weight:bold;}.no-print{background:#7c3aed;color:white;padding:14px;text-align:center;font-weight:bold;cursor:pointer;margin-bottom:25px;border-radius:8px;border:none;width:100%;font-size:15px;}@media print{.no-print{display:none;}body{padding:0;}.os-border{border:none;}}</style></head><body><button class="no-print" onclick="window.print()">CLIQUE AQUI PARA IMPRIMIR VIA DO CLIENTE</button><div class="os-border"><div class="hdr"><div><strong style="font-size:24px;letter-spacing:1px;">ASDCAR</strong><br/><span style="color:#475569;">Centro Automotivo</span></div><div style="text-align:right;"><strong>ORDEM DE SERVIÇO</strong><br/>Data Entrada: ${fmtDate(s.entryDate)}<br/>Status: <strong>${s.status}</strong></div></div><h2>👤 Ficha do Cliente</h2><div class="grid-ficha"><div>Nome: <strong>${car.owner || '—'}</strong><br/>Telefone: <strong>${car.phone || '—'}</strong></div><div>E-mail: <strong>${email || 'Não informado'}</strong></div></div><h2>🚗 Identificação do Veículo</h2><div class="grid-ficha"><div>Placa: <strong style="text-transform:uppercase;">${s.vehiclePlate}</strong><br/>Modelo: <strong>${s.vehicleBrand || car.brand} ${s.vehicleModel || car.model}</strong></div><div>Ano: <strong>${car.year || '—'}</strong><br/>KM Entrada: <strong>${fmtKm(s.mileage)}</strong></div></div><h2>⚙️ Serviços Solicitados / Diagnóstico</h2><div class="box-servico"><strong>${escopoPrincipal}</strong>${blocoPecasMistas}</div><h2>💰 Valores e Condição de Pagamento</h2><div class="grid-ficha"><div>Valor Peças: <strong>${fmt(s.partsValue)}</strong><br/>Mão de Obra: <strong>${fmt(s.laborValue)}</strong><br/><span style="font-size:14px;color:#000;">Total da O.S.: <strong>${fmt(tBruto)}</strong></span></div><div>Forma de Pagamento: <strong>${s.paymentMethod}</strong>${s.paymentMethod === 'Múltiplo / Misto' ? `<br/>Espécie/Pix: ${fmt(s.mixedCash)}<br/>Cartão (${s.mixedCardMethod}): ${fmt(s.mixedCard)}` : ''}</div></div><div class="termos"><strong>TERMOS DE GARANTIA E CONDIÇÕES:</strong><br/>1. A garantia dos serviços executados é de 90 dias a contar da data de entrega do veículo, cobrindo exclusivamente defeitos de mão de obra.<br/>2. Peças fornecidas pelo cliente não possuem garantia pela oficina ASDCAR.<br/>3. Veículos não retirados em até 5 dias após a notificação de término estarão sujeitos a taxa de diária de permanência.</div><div class="assinaturas"><div><div class="linha-sub">ASDCAR Centro Automotivo</div></div><div><div class="linha-sub">Assinatura do Cliente / De acordo</div></div></div></div></body></html>`;
  const w = window.open("", "_blank");
  if (w) { w.document.write(html); w.document.close(); }
}

function generatePDF(vehicles: any[], services: any[], expenses: any[], fromStr: string, toStr: string, viewMode: string = "labor") {
  const from = new Date(fromStr + "T00:00:00");
  const to = new Date(toStr + "T23:59:59");
  const relServices = services.filter(s => { if (s.status !== "Entregue" || !s.exitDate) return false; const d = new Date(s.exitDate + "T12:00:00"); return d >= from && d <= to; });
  const relExpenses = expenses.filter(e => { if (!e.expense_date) return false; const d = new Date(e.expense_date + "T12:00:00"); return d >= from && d <= to; });

  const totalPecas = relServices.reduce((a, s) => a + (Number(s.partsValue) || 0), 0);
  const totalMO = relServices.reduce((a, s) => a + (Number(s.laborValue) || 0), 0);

  const faturamentoLiquido = relServices.reduce((acc, s) => {
    if (s.paymentMethod === "Múltiplo / Misto") {
      const taxaCard = PAYMENT_METHODS[s.mixedCardMethod] || 0;
      const dinheiroPixLivre = Number(s.mixedCash || 0);
      if (viewMode === "labor") {
        const totalBrutoServico = (Number(s.partsValue) || 0) + (Number(s.laborValue) || 0);
        if (totalBrutoServico <= 0) return acc;
        const percentualLabor = Number(s.laborValue) / totalBrutoServico;
        return acc + (dinheiroPixLivre * percentualLabor) + (Number(s.mixedCard || 0) * percentualLabor * (1 - taxaCard / 100));
      } else {
        return acc + dinheiroPixLivre + (Number(s.mixedCard || 0) * (1 - taxaCard / 100));
      }
    }
    const taxa = PAYMENT_METHODS[s.paymentMethod] || 0;
    if (viewMode === "labor") { return acc + (Number(s.laborValue || 0) * (1 - taxa / 100)); }
    else { return acc + (s.netValue || 0); }
  }, 0);

  const totalDespesas = relExpenses.reduce((a, e) => a + (Number(e.value) || 0), 0);
  const resultadoReal = faturamentoLiquido - totalDespesas;

  const html = `<!DOCTYPE html><html lang="pt-BR"><head><meta charset="UTF-8"/><title>Fechamento Comercial ASDCAR</title><style>*{box-sizing:border-box;margin:0;padding:0;}body{font-family:Arial,sans-serif;font-size:11px;color:#0f172a;padding:30px;}.hdr{display:flex;justify-content:space-between;align-items:center;border-bottom:2px solid #f97316;padding-bottom:12px;margin-bottom:20px;}.kpi-box{display:grid;grid-template-columns:repeat(4,1fr);gap:10px;margin-bottom:20px;}.kpi{background:#f8fafc;border:1px solid #e2e8f0;padding:10px;border-radius:6px;}.kpi-lbl{font-size:9px;color:#64748b;text-transform:uppercase;}.kpi-val{font-size:14px;font-weight:bold;margin-top:2px;}table{width:100%;border-collapse:collapse;margin-bottom:20px;}th,td{padding:8px;border:1px solid #e2e8f0;text-align:left;}th{background:#f1f5f9;font-size:9px;text-transform:uppercase;}.no-print{background:#f97316;color:white;padding:12px;text-align:center;font-weight:bold;cursor:pointer;margin-bottom:20px;border-radius:6px;border:none;width:100%;font-size:14px;}@media print{.no-print{display:none;}body{padding:0;}}</style></head><body><button class="no-print" onclick="window.print()">CLIQUE AQUI PARA IMPRIMIR OU SALVAR EM PDF</button><div class="hdr"><div><strong style="font-size:22px;color:#f97316;">ASDCAR</strong><br/><span>Fechamento Comercial</span></div><div style="text-align:right;">Período: <strong>${fmtDate(fromStr)} até ${fmtDate(toStr)}</strong></div></div><div class="kpi-box"><div class="kpi"><div class="kpi-lbl">Peças Totais</div><div class="kpi-val" style="color:#8b5cf6;">${fmt(totalPecas)}</div></div><div class="kpi"><div class="kpi-lbl">Mão de Obra</div><div class="kpi-val" style="color:#10b981;">${fmt(totalMO)}</div></div><div class="kpi"><div class="kpi-lbl">Entradas Líquidas</div><div class="kpi-val" style="color:#3b82f6;">${fmt(faturamentoLiquido)}</div></div><div class="kpi"><div class="kpi-lbl">Resultado Real</div><div class="kpi-val" style="color:${resultadoReal >= 0 ? '#10b981' : '#ef4444'};">${fmt(resultadoReal)}</div></div></div><h3>📋 Serviços Entregues (${relServices.length})</h3><table><thead><tr><th>Veículo</th><th>Descrição / Obs.</th><th>Forma Pagto</th><th>Peças</th><th>M.O.</th><th>Saída</th></tr></thead><tbody>${relServices.map(s => `<tr><td><strong>${s.vehiclePlate}</strong><br/>${s.vehicleBrand} ${s.vehicleModel}</td><td>${s.description.replace(/\|\|/g, '<br/>')}</td><td>${s.paymentMethod}</td><td>${fmt(s.partsValue)}</td><td>${fmt(s.laborValue)}</td><td>${fmtDate(s.exitDate)}</td></tr>`).join('')}</tbody></table><h3>💸 Despesas do Período (${relExpenses.length})</h3><table><thead><tr><th>Descrição</th><th>Categoria</th><th>Data</th><th>Valor</th></tr></thead><tbody>${relExpenses.map(e => `<tr><td>${e.description}</td><td>${e.category}</td><td>${fmtDate(e.expense_date)}</td><td style="color:#ef4444;font-weight:bold;">-${fmt(e.value)}</td></tr>`).join('')}</tbody></table></body></html>`;
  const w = window.open("", "_blank");
  if (w) { w.document.write(html); w.document.close(); }
}
