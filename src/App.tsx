import { useState, useEffect, useRef } from "react";
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

// ── Marcas que atuam/atuaram no Brasil desde 1990 ──────────────────────────
const CAR_BRANDS = [
  "Acura", "Agrale", "Alfa Romeo", "Aston Martin", "Audi",
  "Bentley", "BMW", "BYD", "Caoa Chery", "Chery",
  "Chevrolet", "Chrysler", "Citroën", "Dodge", "DS Automobiles",
  "Ferrari", "Fiat", "Ford", "GWM", "GWM Ora",
  "Honda", "Hyundai", "Infiniti", "JAC", "Jaguar",
  "Jeep", "Kia", "Lamborghini", "Land Rover", "Lexus",
  "Lifan", "Maserati", "McLaren", "Mercedes-Benz", "Mini",
  "Mitsubishi", "Nissan", "Peugeot", "Porsche", "RAM",
  "Renault", "Rolls-Royce", "Subaru", "Suzuki", "Toyota",
  "Troller", "Volkswagen", "Volvo", "ZX Auto",
];

// ── Componente de busca de marca ───────────────────────────────────────────
function BrandSelector({ value, onChange }) {
  const [query, setQuery] = useState(value || "");
  const [open, setOpen] = useState(false);
  const ref = useRef(null);

  const filtered = CAR_BRANDS.filter(b =>
    b.toLowerCase().includes(query.toLowerCase())
  );

  useEffect(() => {
    setQuery(value || "");
  }, [value]);

  useEffect(() => {
    function handleClick(e) {
      if (ref.current && !ref.current.contains(e.target)) setOpen(false);
    }
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, []);

  return (
    <div ref={ref} style={{ position: "relative", marginBottom: 10 }}>
      <label className="label">Marca *</label>
      <input
        className="input"
        placeholder="Digite ou selecione a marca..."
        value={query}
        onChange={e => { setQuery(e.target.value); onChange(e.target.value); setOpen(true); }}
        onFocus={() => setOpen(true)}
        autoComplete="off"
      />
      {open && filtered.length > 0 && (
        <div style={{
          position: "absolute", top: "100%", left: 0, right: 0, zIndex: 200,
          background: "#1a2030", border: "1px solid #2d3748", borderRadius: 8,
          maxHeight: 220, overflowY: "auto", marginTop: 4,
          boxShadow: "0 8px 24px rgba(0,0,0,.5)"
        }}>
          {filtered.map(b => (
            <div
              key={b}
              onClick={() => { onChange(b); setQuery(b); setOpen(false); }}
              style={{
                padding: "10px 14px", fontSize: 13, cursor: "pointer",
                color: value === b ? "#f97316" : "#e2e8f0",
                background: value === b ? "rgba(249,115,22,.1)" : "transparent",
                borderBottom: "1px solid #1e2736",
                transition: "background .1s",
              }}
              onMouseEnter={e => e.currentTarget.style.background = "rgba(249,115,22,.08)"}
              onMouseLeave={e => e.currentTarget.style.background = value === b ? "rgba(249,115,22,.1)" : "transparent"}
            >
              {b}
            </div>
          ))}
        </div>
      )}
      {open && filtered.length === 0 && query.length > 0 && (
        <div style={{
          position: "absolute", top: "100%", left: 0, right: 0, zIndex: 200,
          background: "#1a2030", border: "1px solid #2d3748", borderRadius: 8,
          padding: "12px 14px", marginTop: 4, fontSize: 12, color: "#64748b"
        }}>
          Marca não encontrada — você pode digitar mesmo assim
        </div>
      )}
    </div>
  );
}

// ── Gerador de PDF ─────────────────────────────────────────────────────────
function generatePDF(vehicles, services, dateFrom, dateTo) {
  const fS = services.filter(s => {
    const d = s.exitDate;
    return s.status === "Entregue" && d && d >= dateFrom && d <= dateTo;
  });
  const tP = fS.reduce((s, sv) => s + (Number(sv.partsValue) || 0), 0);
  const tL = fS.reduce((s, sv) => s + (Number(sv.laborValue) || 0), 0);

  const html = `<!DOCTYPE html><html lang="pt-BR"><head><meta charset="UTF-8"/>
<title>Relatório Financeiro</title>
<style>*{box-sizing:border-box;margin:0;padding:0;}body{font-family:Arial,sans-serif;font-size:12px;color:#1e293b;padding:40px;}.hdr{display:flex;justify-content:space-between;margin-bottom:30px;border-bottom:3px solid #f97316;padding-bottom:15px;}.resumo{display:grid;grid-template-columns:repeat(3,1fr);gap:15px;margin-bottom:30px;}.card-res{border:1px solid #e2e8f0;padding:15px;border-radius:8px;}table{width:100%;border-collapse:collapse;}th{background:#f8fafc;padding:10px;text-align:left;border-bottom:2px solid #e2e8f0;font-size:10px;text-transform:uppercase;}td{padding:10px;border-bottom:1px solid #f1f5f9;}</style>
</head><body>
<div class="hdr"><div><strong style="font-size:22px;color:#0f172a;">AutoGestão</strong><br/>Relatório de Serviços Entregues</div><div style="text-align:right"><strong>Período:</strong> ${fmtDate(dateFrom)} até ${fmtDate(dateTo)}</div></div>
<div class="resumo"><div class="card-res">Peças:<br/><strong>${fmt(tP)}</strong></div><div class="card-res">Mão de Obra:<br/><strong>${fmt(tL)}</strong></div><div class="card-res" style="border-color:#f97316">Total Geral:<br/><strong>${fmt(tP + tL)}</strong></div></div>
<table><thead><tr><th>Entrega</th><th>Veículo</th><th>Descrição</th><th>M.O.</th><th>Peças</th><th>Total</th></tr></thead><tbody>
${fS.map(s => `<tr><td>${fmtDate(s.exitDate)}</td><td><strong>${s.vehiclePlate}</strong><br/>${s.vehicleBrand} ${s.vehicleModel}</td><td>${s.description}</td><td>${fmt(s.laborValue)}</td><td>${fmt(s.partsValue)}</td><td><strong>${fmt((Number(s.laborValue) || 0) + (Number(s.partsValue) || 0))}</strong></td></tr>`).join("")}
</tbody></table>
<script>window.onload=()=>window.print();</script>
</body></html>`;

  const blob = new Blob([html], { type: "text/html" });
  window.open(URL.createObjectURL(blob), "_blank");
}

// ── App principal ──────────────────────────────────────────────────────────
export default function App() {
  const [tab, setTab] = useState("dashboard");
  const [vehicles, setVehicles] = useState([]);
  const [services, setServices] = useState([]);
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

  const mapV = r => ({ id: r.id, plate: r.plate, brand: r.brand, model: r.model, year: r.year, color: r.color, owner: r.owner, phone: r.phone, notes: r.notes, createdAt: r.created_at });
  const mapS = r => ({ id: r.id, vehicleId: r.vehicle_id, vehiclePlate: r.vehicle_plate, vehicleBrand: r.vehicle_brand, vehicleModel: r.vehicle_model, description: r.description, partsValue: r.parts_value, laborValue: r.labor_value, status: r.status, entryDate: r.entry_date, exitDate: r.exit_date, createdAt: r.created_at });

  const tabs = [
    { id: "dashboard", label: "Início", icon: "⬡" },
    { id: "services", label: "Oficina", icon: "🔧" },
    { id: "vehicles", label: "Base Carros", icon: "🚗" },
  ];

  return (
    <div style={{ minHeight: "100vh", background: "#0d0f14", color: "#e2e8f0", fontFamily: "'DM Mono', monospace", display: "flex", flexDirection: "column", paddingBottom: 80, width: "100vw", maxWidth: "100%", overflowX: "hidden" }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=DM+Mono:wght@300;400;500&family=Syne:wght@700;800&display=swap');
        *{box-sizing:border-box;margin:0;padding:0;}
        .card{background:#161b26;border:1px solid #1e2736;border-radius:12px;padding:16px;width:100%;}
        .btn-primary{background:#f97316;color:#0d0f14;border:none;border-radius:8px;padding:10px 18px;font-weight:800;cursor:pointer;font-size:13px;}
        .btn-ghost{background:transparent;color:#94a3b8;border:1px solid #1e2736;border-radius:8px;padding:8px 12px;cursor:pointer;}
        .btn-history{background:rgba(59,130,246,0.1);color:#3b82f6;border:1px solid #3b82f6;border-radius:6px;padding:4px 8px;font-size:10px;font-weight:700;cursor:pointer;margin-bottom:6px;display:inline-block;}
        .input{background:#0d0f14;border:1px solid #1e2736;border-radius:8px;padding:10px 12px;color:#e2e8f0;width:100%;font-family:inherit;font-size:13px;}
        .input:focus{border-color:#f97316;outline:none;}
        .label{display:block;font-size:11px;color:#64748b;margin-bottom:5px;text-transform:uppercase;letter-spacing:.05em;}
        .badge{display:inline-block;border-radius:20px;padding:2px 8px;font-size:10px;font-weight:600;}
        .kpi-grid{display:grid;grid-template-columns:1fr 1fr;gap:12px;width:100%;}
        @media(min-width:768px){.kpi-grid{grid-template-columns:repeat(4,1fr);}}
        .bottom-nav{position:fixed;bottom:0;left:0;right:0;background:#0d0f14;border-top:1px solid #1e2736;z-index:50;padding:10px 0 20px;}
        .nav-item{display:flex;flex-direction:column;align-items:center;gap:4px;flex:1;background:none;border:none;color:#475569;font-size:10px;cursor:pointer;font-family:inherit;}
        .nav-item.active{color:#f97316;}
        .modal-bg{position:fixed;inset:0;background:rgba(0,0,0,.75);display:flex;align-items:center;justify-content:center;z-index:100;padding:16px;}
        .modal{background:#161b26;border:1px solid #1e2736;border-radius:16px;padding:24px;width:100%;max-width:500px;max-height:90vh;overflow-y:auto;}
        .modal h3{font-family:'Syne',sans-serif;font-size:18px;color:#f1f5f9;margin-bottom:18px;}
        .table-wrap{overflow-x:auto;-webkit-overflow-scrolling:touch;}
        .table-header{display:grid;padding:10px 14px;font-size:10px;color:#475569;text-transform:uppercase;letter-spacing:.06em;border-bottom:1px solid #1e2736;}
      `}</style>

      <header style={{ padding: "14px 20px", borderBottom: "1px solid #1e2736", display: "flex", alignItems: "center", justifyContent: "space-between", background: "#0d0f14" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <div style={{ width: 32, height: 32, background: "#f97316", borderRadius: 8, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 18 }}>🔩</div>
          <div style={{ fontFamily: "'Syne', sans-serif", fontSize: 18, fontWeight: 800 }}>AutoGestão</div>
        </div>
        <button className="btn-primary" style={{ background: "#7c3aed", color: "#fff", fontSize: 11 }} onClick={() => setShowReport(true)}>📄 PDF</button>
      </header>

      <main style={{ flex: 1, padding: "16px", width: "100%", maxWidth: 1200, margin: "0 auto" }}>
        {loading ? (
          <div style={{ textAlign: "center", padding: 100, color: "#475569" }}>
            <div style={{ fontSize: 32, marginBottom: 12 }}>🔩</div>
            Sincronizando...
          </div>
        ) : (
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

// ── Dashboard ──────────────────────────────────────────────────────────────
function Dashboard({ services, vehicles }) {
  const active = services.filter(s => s.status !== "Entregue");
  const delivered = services.filter(s => s.status === "Entregue");
  const tP = delivered.reduce((acc, s) => acc + (Number(s.partsValue) || 0), 0);
  const tL = delivered.reduce((acc, s) => acc + (Number(s.laborValue) || 0), 0);

  const kpis = [
    { label: "Na Oficina", value: active.length, icon: "🔧", accent: "#f97316" },
    { label: "Peças (Finalizado)", value: fmt(tP), icon: "⚙️", accent: "#6366f1" },
    { label: "M.O. (Finalizado)", value: fmt(tL), icon: "🔧", accent: "#10b981" },
    { label: "Total Real", value: fmt(tP + tL), icon: "💰", accent: "#10b981" },
  ];

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
      <div className="kpi-grid">
        {kpis.map((k, i) => (
          <div key={i} className="card" style={{ borderLeft: `3px solid ${k.accent}`, padding: 12 }}>
            <div style={{ fontSize: 16 }}>{k.icon}</div>
            <div style={{ fontSize: 15, fontWeight: 800, marginTop: 4, color: "#f1f5f9" }}>{k.value}</div>
            <div style={{ fontSize: 9, color: "#475569", textTransform: "uppercase", marginTop: 2 }}>{k.label}</div>
          </div>
        ))}
      </div>
      <div className="card">
        <h3 style={{ fontSize: 14, marginBottom: 12, fontFamily: "'Syne',sans-serif", color: "#f1f5f9" }}>Carros em Serviço</h3>
        {active.length === 0 ? <div style={{ fontSize: 12, color: "#475569", textAlign: "center", padding: 20 }}>Nenhum carro em serviço</div> :
          active.slice(0, 5).map(sv => (
            <div key={sv.id} style={{ display: "flex", justifyContent: "space-between", padding: "10px 0", borderBottom: "1px solid #1e2736" }}>
              <div style={{ flex: 1, paddingRight: 10 }}>
                <div style={{ fontSize: 12, color: "#e2e8f0" }}>{sv.description}</div>
                <div style={{ fontSize: 10, color: "#475569" }}>{sv.vehiclePlate} • {sv.vehicleBrand} {sv.vehicleModel} • Entrada: {fmtDate(sv.entryDate)}</div>
              </div>
              <StatusBadge status={sv.status} map={STATUS_COLORS} />
            </div>
          ))}
      </div>
    </div>
  );
}

// ── Vehicles ───────────────────────────────────────────────────────────────
function Vehicles({ vehicles, setVehicles, services, mapV }) {
  const [modal, setModal] = useState(false);
  const [historyModal, setHistoryModal] = useState(false);
  const [editing, setEditing] = useState(null);
  const [selectedV, setSelectedV] = useState(null);
  const [search, setSearch] = useState("");
  const [filterBrand, setFilterBrand] = useState("");
  const [form, setForm] = useState({});

  const open = (v = null) => { setEditing(v); setForm(v || {}); setModal(true); };
  const close = () => { setModal(false); setEditing(null); setForm({}); };

  const save = async () => {
    if (!form.plate || !form.brand || !form.model) return alert("Preencha placa, marca e modelo.");
    const row = { id: editing?.id || uid(), plate: form.plate, brand: form.brand, model: form.model, year: form.year, color: form.color, owner: form.owner, phone: form.phone, notes: form.notes };
    const { data } = await supabase.from("vehicles").upsert(row).select();
    if (data) {
      const m = mapV(data[0]);
      if (editing) setVehicles(vehicles.map(v => v.id === editing.id ? m : v));
      else setVehicles([m, ...vehicles]);
    }
    close();
  };

  const remove = async (id) => {
    if (!confirm("Remover veículo?")) return;
    await supabase.from("vehicles").delete().eq("id", id);
    setVehicles(vehicles.filter(v => v.id !== id));
  };

  // Marcas únicas dos veículos cadastrados para filtro rápido
  const brandsInUse = [...new Set(vehicles.map(v => v.brand).filter(Boolean))].sort();

  const filtered = vehicles.filter(v => {
    const matchSearch = !search ||
      v.plate?.toLowerCase().includes(search.toLowerCase()) ||
      v.owner?.toLowerCase().includes(search.toLowerCase()) ||
      v.model?.toLowerCase().includes(search.toLowerCase());
    const matchBrand = !filterBrand || v.brand === filterBrand;
    return matchSearch && matchBrand;
  });

  return (
    <Section title="Base Master" action={<button className="btn-primary" onClick={() => open()}>+ Novo</button>}>
      {/* Busca + filtro de marca */}
      <div style={{ display: "flex", gap: 8, marginBottom: 10, flexWrap: "wrap" }}>
        <input className="input" placeholder="Buscar placa, cliente ou modelo..." value={search} onChange={e => setSearch(e.target.value)} style={{ flex: 1, minWidth: 180 }} />
        {brandsInUse.length > 0 && (
          <select className="input" value={filterBrand} onChange={e => setFilterBrand(e.target.value)} style={{ flex: "0 0 auto", width: "auto", appearance: "none", paddingRight: 20 }}>
            <option value="">Todas as marcas</option>
            {brandsInUse.map(b => <option key={b} value={b}>{b}</option>)}
          </select>
        )}
      </div>

      <div className="card" style={{ padding: 0, overflow: "hidden" }}>
        <div className="table-wrap">
          <div className="table-header" style={{ gridTemplateColumns: "1.8fr 1.5fr 1fr 90px", display: "grid" }}>
            <span>Veículo</span><span>Cliente</span><span>Telefone</span><span></span>
          </div>
          {filtered.length === 0 ? (
            <div style={{ textAlign: "center", color: "#334155", padding: 40, fontSize: 13 }}>Nenhum veículo encontrado</div>
          ) : filtered.map(v => (
            <div key={v.id} style={{ display: "grid", gridTemplateColumns: "1.8fr 1.5fr 1fr 90px", alignItems: "center", padding: 14, borderBottom: "1px solid #1e2736", minWidth: 560 }}>
              <div>
                <button onClick={() => { setSelectedV(v); setHistoryModal(true); }} className="btn-history">📜 Histórico</button>
                <div style={{ fontSize: 13, fontWeight: 700, color: "#f1f5f9" }}>{v.brand} {v.model}</div>
                <div style={{ fontSize: 10, color: "#f97316" }}>{v.plate}{v.year ? ` · ${v.year}` : ""}{v.color ? ` · ${v.color}` : ""}</div>
              </div>
              <div style={{ fontSize: 12 }}>{v.owner || "—"}</div>
              <div style={{ fontSize: 12 }}>{v.phone || "—"}</div>
              <div style={{ display: "flex", gap: 6 }}>
                <button onClick={() => open(v)} className="btn-ghost" style={{ padding: 6, fontSize: 13 }}>✏️</button>
                <button onClick={() => remove(v.id)} className="btn-ghost" style={{ padding: 6, fontSize: 13, color: "#ef4444", borderColor: "#3f1212" }}>✕</button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Modal cadastro */}
      {modal && (
        <div className="modal-bg" onClick={close}>
          <div className="modal" onClick={e => e.stopPropagation()}>
            <h3>{editing ? "Editar Veículo" : "Cadastro de Veículo"}</h3>
            <Field label="Placa *" value={form.plate} onChange={v => setForm({ ...form, plate: v.toUpperCase() })} />
            <BrandSelector value={form.brand || ""} onChange={v => setForm({ ...form, brand: v })} />
            <Field label="Modelo *" value={form.model} onChange={v => setForm({ ...form, model: v })} />
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
              <Field label="Ano" value={form.year} onChange={v => setForm({ ...form, year: v })} />
              <Field label="Cor" value={form.color} onChange={v => setForm({ ...form, color: v })} />
            </div>
            <Field label="Cliente" value={form.owner} onChange={v => setForm({ ...form, owner: v })} />
            <Field label="Telefone" value={form.phone} onChange={v => setForm({ ...form, phone: v })} />
            <div style={{ marginBottom: 10 }}>
              <label className="label">Observações</label>
              <textarea className="input" rows={2} value={form.notes || ""} onChange={e => setForm({ ...form, notes: e.target.value })} style={{ resize: "vertical" }} />
            </div>
            <div style={{ display: "flex", gap: 10, justifyContent: "flex-end", marginTop: 8 }}>
              <button className="btn-ghost" onClick={close}>Cancelar</button>
              <button className="btn-primary" onClick={save}>Salvar</button>
            </div>
          </div>
        </div>
      )}

      {/* Modal histórico */}
      {historyModal && (
        <div className="modal-bg" onClick={() => setHistoryModal(false)}>
          <div className="modal" onClick={e => e.stopPropagation()}>
            <h3>📜 Prontuário: {selectedV?.plate}</h3>
            <div style={{ fontSize: 12, color: "#64748b", marginBottom: 16 }}>
              {selectedV?.brand} {selectedV?.model} · {selectedV?.owner}
            </div>
            <div style={{ maxHeight: 320, overflowY: "auto" }}>
              {services.filter(s => s.vehicleId === selectedV?.id).length === 0 ? (
                <p style={{ fontSize: 12, color: "#475569", textAlign: "center", padding: 20 }}>Sem histórico de serviços.</p>
              ) : services.filter(s => s.vehicleId === selectedV?.id).map(s => (
                <div key={s.id} style={{ padding: 12, background: "#0d0f14", borderRadius: 8, marginBottom: 10, borderLeft: "3px solid #10b981" }}>
                  <div style={{ fontSize: 12, fontWeight: 700, color: "#e2e8f0" }}>{s.description}</div>
                  <div style={{ fontSize: 10, color: "#64748b", marginTop: 4 }}>
                    Entrada: {fmtDate(s.entryDate)} · Entrega: {fmtDate(s.exitDate)}
                  </div>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginTop: 8 }}>
                    <StatusBadge status={s.status} map={STATUS_COLORS} />
                    <div style={{ fontSize: 13, fontWeight: 800, color: "#f97316" }}>
                      {fmt((Number(s.partsValue) || 0) + (Number(s.laborValue) || 0))}
                    </div>
                  </div>
                </div>
              ))}
            </div>
            <button className="btn-ghost" style={{ width: "100%", marginTop: 16 }} onClick={() => setHistoryModal(false)}>Fechar</button>
          </div>
        </div>
      )}
    </Section>
  );
}

// ── Services ───────────────────────────────────────────────────────────────
function Services({ services, setServices, vehicles, mapS }) {
  const [modal, setModal] = useState(false);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState({});
  const [filterStatus, setFilterStatus] = useState("");

  const open = (s = null) => { setEditing(s); setForm(s || { status: "Aguardando", partsValue: 0, laborValue: 0, entryDate: today() }); setModal(true); };
  const close = () => { setModal(false); setEditing(null); setForm({}); };

  const save = async () => {
    if (!form.vehicleId || !form.description) return alert("Selecione o carro e preencha a descrição.");
    const v = vehicles.find(v => v.id === form.vehicleId);
    const row = {
      id: editing?.id || uid(),
      vehicle_id: form.vehicleId,
      vehicle_plate: v?.plate,
      vehicle_brand: v?.brand,
      vehicle_model: v?.model,
      description: form.description,
      parts_value: Number(form.partsValue) || 0,
      labor_value: Number(form.laborValue) || 0,
      status: form.status,
      entry_date: form.entryDate,
      exit_date: form.status === "Entregue" ? (form.exitDate || today()) : null,
    };
    const { data } = await supabase.from("services").upsert(row).select();
    if (data) {
      const m = mapS(data[0]);
      if (editing) setServices(services.map(s => s.id === editing.id ? m : s));
      else setServices([m, ...services]);
    }
    close();
  };

  const remove = async (id) => {
    if (!confirm("Remover serviço?")) return;
    await supabase.from("services").delete().eq("id", id);
    setServices(services.filter(s => s.id !== id));
  };

  const filtered = filterStatus ? services.filter(s => s.status === filterStatus) : services;

  return (
    <Section title="Fluxo Oficina" action={<button className="btn-primary" onClick={() => open()}>+ Entrada</button>}>
      {/* Filtro por status */}
      <div style={{ display: "flex", gap: 6, marginBottom: 10, flexWrap: "wrap" }}>
        {["", ...Object.keys(STATUS_COLORS)].map(s => (
          <button key={s} onClick={() => setFilterStatus(s)} style={{
            background: filterStatus === s ? "#f97316" : "transparent",
            color: filterStatus === s ? "#0d0f14" : "#64748b",
            border: `1px solid ${filterStatus === s ? "#f97316" : "#1e2736"}`,
            borderRadius: 20, padding: "4px 12px", fontSize: 11, cursor: "pointer", fontFamily: "inherit",
          }}>
            {s || "Todos"}
          </button>
        ))}
      </div>

      <div className="card" style={{ padding: 0, overflow: "hidden" }}>
        <div className="table-wrap">
          <div className="table-header" style={{ gridTemplateColumns: "2fr 1.5fr 0.8fr 1fr 70px", display: "grid" }}>
            <span>Serviço</span><span>Veículo</span><span>M.O.</span><span>Status</span><span></span>
          </div>
          {filtered.length === 0 ? (
            <div style={{ textAlign: "center", color: "#334155", padding: 40, fontSize: 13 }}>Nenhum serviço encontrado</div>
          ) : filtered.map(s => (
            <div key={s.id} style={{ display: "grid", gridTemplateColumns: "2fr 1.5fr 0.8fr 1fr 70px", alignItems: "center", padding: 14, borderBottom: "1px solid #1e2736", minWidth: 580 }}>
              <div style={{ fontSize: 12, wordBreak: "break-word", paddingRight: 10 }}>
                <div style={{ color: "#e2e8f0" }}>{s.description}</div>
                <div style={{ fontSize: 10, color: "#475569", marginTop: 2 }}>Entrada: {fmtDate(s.entryDate)}</div>
              </div>
              <div style={{ fontSize: 11 }}>
                <div style={{ fontWeight: 700, color: "#f1f5f9" }}>{s.vehiclePlate}</div>
                <div style={{ fontSize: 9, color: "#64748b" }}>{s.vehicleBrand} {s.vehicleModel}</div>
              </div>
              <div style={{ fontSize: 11, color: "#10b981" }}>{fmt(s.laborValue)}</div>
              <StatusBadge status={s.status} map={STATUS_COLORS} />
              <div style={{ display: "flex", gap: 4 }}>
                <button onClick={() => open(s)} className="btn-ghost" style={{ padding: 6, fontSize: 13 }}>✏️</button>
                <button onClick={() => remove(s.id)} className="btn-ghost" style={{ padding: 6, fontSize: 13, color: "#ef4444", borderColor: "#3f1212" }}>✕</button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {modal && (
        <div className="modal-bg" onClick={close}>
          <div className="modal" onClick={e => e.stopPropagation()}>
            <h3>{editing ? "Editar Serviço" : "Nova Entrada"}</h3>
            <div style={{ marginBottom: 10 }}>
              <label className="label">Carro *</label>
              <select className="input" value={form.vehicleId || ""} onChange={e => setForm({ ...form, vehicleId: e.target.value })} style={{ appearance: "none" }}>
                <option value="">Selecione o carro...</option>
                {vehicles.map(v => <option key={v.id} value={v.id}>{v.plate} — {v.brand} {v.model}</option>)}
              </select>
            </div>
            <Field label="Descrição do Serviço *" value={form.description} onChange={v => setForm({ ...form, description: v })} />
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
              <Field label="Peças (R$)" type="number" value={form.partsValue} onChange={v => setForm({ ...form, partsValue: v })} />
              <Field label="Mão de Obra (R$)" type="number" value={form.laborValue} onChange={v => setForm({ ...form, laborValue: v })} />
            </div>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
              <Field label="Data de Entrada" type="date" value={form.entryDate} onChange={v => setForm({ ...form, entryDate: v })} />
              {form.status === "Entregue" && <Field label="Data de Entrega" type="date" value={form.exitDate || today()} onChange={v => setForm({ ...form, exitDate: v })} />}
            </div>
            <div style={{ marginBottom: 10 }}>
              <label className="label">Status</label>
              <select className="input" value={form.status || "Aguardando"} onChange={e => setForm({ ...form, status: e.target.value })} style={{ appearance: "none" }}>
                {Object.keys(STATUS_COLORS).map(s => <option key={s} value={s}>{s}</option>)}
              </select>
            </div>
            <div style={{ display: "flex", gap: 10, justifyContent: "flex-end", marginTop: 8 }}>
              <button className="btn-ghost" onClick={close}>Cancelar</button>
              <button className="btn-primary" onClick={save}>Salvar</button>
            </div>
          </div>
        </div>
      )}
    </Section>
  );
}

// ── Report Modal ───────────────────────────────────────────────────────────
function ReportModal({ services, onClose, onGenerate }) {
  const [dateFrom, setDateFrom] = useState(new Date(new Date().getFullYear(), new Date().getMonth(), 1).toISOString().slice(0, 10));
  const [dateTo, setDateTo] = useState(today());
  const fS = services.filter(s => s.status === "Entregue" && s.exitDate && s.exitDate >= dateFrom && s.exitDate <= dateTo);
  const total = fS.reduce((s, sv) => s + (Number(sv.partsValue) || 0) + (Number(sv.laborValue) || 0), 0);

  return (
    <div className="modal-bg" onClick={onClose}>
      <div className="modal" onClick={e => e.stopPropagation()}>
        <h3>📄 Relatório (Por Entrega)</h3>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10, marginBottom: 16 }}>
          <div><label className="label">Início</label><input className="input" type="date" value={dateFrom} onChange={e => setDateFrom(e.target.value)} /></div>
          <div><label className="label">Fim</label><input className="input" type="date" value={dateTo} onChange={e => setDateTo(e.target.value)} /></div>
        </div>
        <div className="card" style={{ background: "#0d0f14", marginBottom: 20 }}>
          <div style={{ display: "flex", justifyContent: "space-between" }}>
            <div><div style={{ fontSize: 22, fontWeight: 800, color: "#f97316" }}>{fS.length}</div><div style={{ fontSize: 9, color: "#475569" }}>Entregues</div></div>
            <div style={{ textAlign: "right" }}><div style={{ fontSize: 22, fontWeight: 800, color: "#10b981" }}>{fmt(total)}</div><div style={{ fontSize: 9, color: "#475569" }}>Faturamento Real</div></div>
          </div>
        </div>
        <button className="btn-primary" style={{ width: "100%" }} onClick={() => onGenerate(dateFrom, dateTo)}>Gerar PDF</button>
      </div>
    </div>
  );
}

// ── Shared ─────────────────────────────────────────────────────────────────
function Section({ title, action, children }) {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <h1 style={{ fontFamily: "'Syne',sans-serif", fontSize: 20, fontWeight: 800, color: "#f1f5f9" }}>{title}</h1>
        {action}
      </div>
      {children}
    </div>
  );
}

function StatusBadge({ status, map }) {
  const color = (map || {})[status] || "#6b7280";
  return <span className="badge" style={{ background: color + "22", color, border: `1px solid ${color}44` }}>{status || "—"}</span>;
}

function Field({ label, value, onChange, type = "text" }) {
  return (
    <div style={{ marginBottom: 10 }}>
      <label className="label">{label}</label>
      <input className="input" type={type} value={value || ""} onChange={e => onChange(e.target.value)} />
    </div>
  );
}
