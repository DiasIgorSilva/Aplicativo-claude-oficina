import { useState, useEffect, useCallback } from "react";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const supabase = createClient(
  "https://bofhihxpqmqimkanwkyw.supabase.co",
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImJvZmhpaHhwcW1xaW1rYW53a3l3Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzUwODQ3OTMsImV4cCI6MjA5MDY2MDc5M30.fOOD-FweGID1x2mlJ3LWImtw7B6m6Pc-8auXLIuCqbw"
);

const uid = () => Math.random().toString(36).slice(2, 10);
const fmt = (n) => new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(n || 0);
const today = () => new Date().toISOString().slice(0, 10);
const fmtDate = (d) => d ? new Date(d + "T12:00:00").toLocaleDateString("pt-BR") : "—";

const STATUS_COLORS = {
  "Aguardando": "#f59e0b",
  "Em andamento": "#3b82f6",
  "Pronto": "#10b981",
  "Entregue": "#6b7280",
};
const APPOINTMENT_STATUS = {
  "Agendado": "#6366f1",
  "Confirmado": "#10b981",
  "Cancelado": "#ef4444",
  "Concluído": "#6b7280"
};

export default function App() {
  const [tab, setTab] = useState("dashboard");
  const [vehicles, setVehicles] = useState([]);
  const [services, setServices] = useState([]);
  const [appointments, setAppointments] = useState([]);
  const [quotes, setQuotes] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchAll() {
      setLoading(true);
      const [v, s, a, q] = await Promise.all([
        supabase.from("vehicles").select("*").order("created_at", { ascending: false }),
        supabase.from("services").select("*").order("created_at", { ascending: false }),
        supabase.from("appointments").select("*").order("date", { ascending: true }),
        supabase.from("quotes").select("*").order("created_at", { ascending: false }),
      ]);
      if (v.data) setVehicles(v.data.map(mapV));
      if (s.data) setServices(s.data.map(mapS));
      if (a.data) setAppointments(a.data.map(mapA));
      if (q.data) setQuotes(q.data.map(mapQ));
      setLoading(false);
    }
    fetchAll();
  }, []);

  // mappers snake_case -> camelCase
  const mapV = (r) => ({ id: r.id, plate: r.plate, model: r.model, year: r.year, color: r.color, owner: r.owner, phone: r.phone, serviceType: r.service_type, status: r.status, entryDate: r.entry_date, exitDate: r.exit_date, notes: r.notes, createdAt: r.created_at });
  const mapS = (r) => ({ id: r.id, vehicleId: r.vehicle_id, vehiclePlate: r.vehicle_plate, vehicleModel: r.vehicle_model, description: r.description, partsValue: r.parts_value, laborValue: r.labor_value, partsList: r.parts_list, mechanic: r.mechanic, status: r.status, createdAt: r.created_at });
  const mapA = (r) => ({ id: r.id, clientName: r.client_name, clientPhone: r.client_phone, date: r.date, time: r.time, plate: r.plate, serviceType: r.service_type, mechanic: r.mechanic, status: r.status, notes: r.notes, createdAt: r.created_at });
  const mapQ = (r) => ({ id: r.id, clientName: r.client_name, clientPhone: r.client_phone, plate: r.plate, vehicleModel: r.vehicle_model, serviceType: r.service_type, date: r.date, validUntil: r.valid_until, status: r.status, items: r.items || [], total: r.total, notes: r.notes, createdAt: r.created_at });

  const tabs = [
    { id: "dashboard", label: "Dashboard", icon: "⬡" },
    { id: "vehicles", label: "Veículos", icon: "🚗" },
    { id: "services", label: "Serviços", icon: "🔧" },
    { id: "appointments", label: "Agendamentos", icon: "📅" },
    { id: "quotes", label: "Orçamentos", icon: "📋" },
  ];

  return (
    <div style={{ minHeight: "100vh", background: "#0d0f14", color: "#e2e8f0", fontFamily: "'DM Mono','Fira Mono',monospace", display: "flex", flexDirection: "column" }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=DM+Mono:wght@300;400;500&family=Syne:wght@700;800&display=swap');
        *{box-sizing:border-box;margin:0;padding:0;}
        ::-webkit-scrollbar{width:4px;}
        ::-webkit-scrollbar-track{background:#0d0f14;}
        ::-webkit-scrollbar-thumb{background:#2d3748;border-radius:2px;}
        input,select,textarea{outline:none;}
        button{cursor:pointer;}
        .card{background:#161b26;border:1px solid #1e2736;border-radius:12px;padding:20px;}
        .btn-primary{background:#f97316;color:#0d0f14;border:none;border-radius:8px;padding:9px 18px;font-family:inherit;font-weight:500;font-size:13px;transition:opacity .15s;}
        .btn-primary:hover{opacity:.85;}
        .btn-ghost{background:transparent;color:#94a3b8;border:1px solid #1e2736;border-radius:8px;padding:8px 16px;font-family:inherit;font-size:13px;transition:all .15s;}
        .btn-ghost:hover{border-color:#f97316;color:#f97316;}
        .btn-danger{background:transparent;color:#ef4444;border:1px solid #3f1212;border-radius:8px;padding:7px 14px;font-family:inherit;font-size:12px;}
        .btn-danger:hover{background:#3f1212;}
        .input{background:#0d0f14;border:1px solid #1e2736;border-radius:8px;padding:9px 13px;color:#e2e8f0;font-family:inherit;font-size:13px;width:100%;transition:border-color .15s;}
        .input:focus{border-color:#f97316;}
        .label{display:block;font-size:11px;color:#64748b;margin-bottom:5px;letter-spacing:.05em;text-transform:uppercase;}
        .badge{display:inline-block;border-radius:20px;padding:2px 10px;font-size:11px;font-weight:500;}
        .grid-2{display:grid;grid-template-columns:1fr 1fr;gap:14px;}
        .grid-3{display:grid;grid-template-columns:1fr 1fr 1fr;gap:14px;}
        .modal-bg{position:fixed;inset:0;background:rgba(0,0,0,.7);display:flex;align-items:center;justify-content:center;z-index:100;padding:20px;}
        .modal{background:#161b26;border:1px solid #1e2736;border-radius:16px;padding:28px;width:100%;max-width:520px;max-height:90vh;overflow-y:auto;}
        .modal h3{font-family:'Syne',sans-serif;font-size:18px;color:#f1f5f9;margin-bottom:20px;}
        .form-group{margin-bottom:14px;}
        .table-row{display:grid;align-items:center;padding:12px 16px;border-bottom:1px solid #1e2736;transition:background .1s;}
        .table-row:hover{background:#1a2030;}
        .table-header{display:grid;padding:10px 16px;font-size:11px;color:#475569;text-transform:uppercase;letter-spacing:.06em;border-bottom:1px solid #1e2736;}
        @media(max-width:640px){.grid-2,.grid-3{grid-template-columns:1fr;}}
      `}</style>

      <header style={{ padding: "16px 24px", borderBottom: "1px solid #1e2736", display: "flex", alignItems: "center", gap: 16, background: "#0d0f14" }}>
        <div style={{ width: 36, height: 36, background: "#f97316", borderRadius: 8, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 18 }}>🔩</div>
        <div>
          <div style={{ fontFamily: "'Syne',sans-serif", fontSize: 18, fontWeight: 800, color: "#f1f5f9", lineHeight: 1 }}>AutoGestão</div>
          <div style={{ fontSize: 11, color: "#475569", marginTop: 2 }}>Sistema de Gestão de Oficina</div>
        </div>
        {loading && <div style={{ marginLeft: "auto", fontSize: 11, color: "#f97316" }}>● sincronizando...</div>}
      </header>

      <nav style={{ display: "flex", gap: 4, padding: "12px 24px", borderBottom: "1px solid #1e2736", overflowX: "auto" }}>
        {tabs.map(t => (
          <button key={t.id} onClick={() => setTab(t.id)} style={{
            background: tab === t.id ? "#f97316" : "transparent",
            color: tab === t.id ? "#0d0f14" : "#64748b",
            border: "none", borderRadius: 8, padding: "8px 16px",
            fontFamily: "inherit", fontSize: 13, fontWeight: 500,
            whiteSpace: "nowrap", display: "flex", alignItems: "center", gap: 6, transition: "all .15s",
          }}>
            <span>{t.icon}</span> {t.label}
          </button>
        ))}
      </nav>

      <main style={{ flex: 1, padding: 24, maxWidth: 1100, width: "100%", margin: "0 auto" }}>
        {loading ? (
          <div style={{ textAlign: "center", padding: 80, color: "#475569" }}>
            <div style={{ fontSize: 32, marginBottom: 12 }}>🔩</div>
            <div>Carregando dados...</div>
          </div>
        ) : (
          <>
            {tab === "dashboard" && <Dashboard vehicles={vehicles} services={services} appointments={appointments} quotes={quotes} setTab={setTab} />}
            {tab === "vehicles" && <Vehicles vehicles={vehicles} setVehicles={setVehicles} services={services} mapV={mapV} />}
            {tab === "services" && <Services services={services} setServices={setServices} vehicles={vehicles} mapS={mapS} />}
            {tab === "appointments" && <Appointments appointments={appointments} setAppointments={setAppointments} mapA={mapA} />}
            {tab === "quotes" && <Quotes quotes={quotes} setQuotes={setQuotes} mapQ={mapQ} />}
          </>
        )}
      </main>
    </div>
  );
}

// ── Dashboard ─────────────────────────────────────────────────────────────────
function Dashboard({ vehicles, services, appointments, quotes, setTab }) {
  const activeVehicles = vehicles.filter(v => v.status !== "Entregue").length;
  const totalParts = services.reduce((s, sv) => s + (Number(sv.partsValue) || 0), 0);
  const totalLabor = services.reduce((s, sv) => s + (Number(sv.laborValue) || 0), 0);
  const todayApps = appointments.filter(a => a.date === today() && a.status !== "Cancelado").length;
  const pending = quotes.filter(q => q.status === "Pendente").length;

  const kpis = [
    { label: "Veículos na Oficina", value: activeVehicles, icon: "🚗", accent: "#f97316" },
    { label: "Receita em Peças", value: fmt(totalParts), icon: "⚙️", accent: "#3b82f6" },
    { label: "Receita em Mão de Obra", value: fmt(totalLabor), icon: "🔧", accent: "#10b981" },
    { label: "Agendamentos Hoje", value: todayApps, icon: "📅", accent: "#6366f1" },
    { label: "Orçamentos Pendentes", value: pending, icon: "📋", accent: "#f59e0b" },
    { label: "Receita Total", value: fmt(totalParts + totalLabor), icon: "💰", accent: "#10b981" },
  ];

  const recent = [...services].slice(0, 5);
  const inProgress = vehicles.filter(v => v.status === "Em andamento" || v.status === "Aguardando");

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 24 }}>
      <div>
        <h1 style={{ fontFamily: "'Syne',sans-serif", fontSize: 26, fontWeight: 800, color: "#f1f5f9" }}>Dashboard</h1>
        <p style={{ color: "#475569", fontSize: 13, marginTop: 4 }}>{new Date().toLocaleDateString("pt-BR", { weekday: "long", day: "numeric", month: "long", year: "numeric" })}</p>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: 14 }}>
        {kpis.map((k, i) => (
          <div key={i} className="card" style={{ borderLeft: `3px solid ${k.accent}` }}>
            <div style={{ fontSize: 22, marginBottom: 8 }}>{k.icon}</div>
            <div style={{ fontSize: 22, fontWeight: 700, color: "#f1f5f9", fontFamily: "'Syne',sans-serif" }}>{k.value}</div>
            <div style={{ fontSize: 11, color: "#475569", marginTop: 4, textTransform: "uppercase", letterSpacing: ".05em" }}>{k.label}</div>
          </div>
        ))}
      </div>

      <div className="grid-2">
        <div className="card">
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
            <h3 style={{ fontFamily: "'Syne',sans-serif", color: "#f1f5f9", fontSize: 15 }}>Últimos Serviços</h3>
            <button className="btn-ghost" style={{ fontSize: 11, padding: "5px 10px" }} onClick={() => setTab("services")}>Ver todos</button>
          </div>
          {recent.length === 0 ? <Empty text="Nenhum serviço registrado" /> : recent.map(sv => (
            <div key={sv.id} style={{ display: "flex", justifyContent: "space-between", padding: "10px 0", borderBottom: "1px solid #1e2736" }}>
              <div>
                <div style={{ fontSize: 13, color: "#e2e8f0" }}>{sv.description || "Serviço"}</div>
                <div style={{ fontSize: 11, color: "#475569" }}>{sv.vehiclePlate} · {fmtDate(sv.createdAt?.slice(0, 10))}</div>
              </div>
              <div style={{ textAlign: "right" }}>
                <div style={{ fontSize: 13, color: "#10b981" }}>{fmt((Number(sv.partsValue) || 0) + (Number(sv.laborValue) || 0))}</div>
                <StatusBadge status={sv.status} map={STATUS_COLORS} />
              </div>
            </div>
          ))}
        </div>

        <div className="card">
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
            <h3 style={{ fontFamily: "'Syne',sans-serif", color: "#f1f5f9", fontSize: 15 }}>Veículos em Serviço</h3>
            <button className="btn-ghost" style={{ fontSize: 11, padding: "5px 10px" }} onClick={() => setTab("vehicles")}>Ver todos</button>
          </div>
          {inProgress.length === 0 ? <Empty text="Nenhum veículo em serviço" /> : inProgress.map(v => (
            <div key={v.id} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "10px 0", borderBottom: "1px solid #1e2736" }}>
              <div>
                <div style={{ fontSize: 13, color: "#e2e8f0" }}>{v.plate} — {v.model}</div>
                <div style={{ fontSize: 11, color: "#475569" }}>{v.owner} · Entrada: {fmtDate(v.entryDate)}</div>
              </div>
              <StatusBadge status={v.status} map={STATUS_COLORS} />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

// ── Vehicles ──────────────────────────────────────────────────────────────────
function Vehicles({ vehicles, setVehicles, services, mapV }) {
  const [modal, setModal] = useState(false);
  const [editing, setEditing] = useState(null);
  const [search, setSearch] = useState("");
  const [form, setForm] = useState({});
  const [saving, setSaving] = useState(false);

  const open = (v = null) => { setEditing(v); setForm(v || { status: "Aguardando", entryDate: today() }); setModal(true); };
  const close = () => { setModal(false); setEditing(null); setForm({}); };

  const save = async () => {
    if (!form.plate || !form.model) return alert("Placa e modelo são obrigatórios.");
    setSaving(true);
    const row = { id: editing?.id || uid(), plate: form.plate, model: form.model, year: form.year, color: form.color, owner: form.owner, phone: form.phone, service_type: form.serviceType, status: form.status, entry_date: form.entryDate, exit_date: form.exitDate, notes: form.notes };
    const { data, error } = await supabase.from("vehicles").upsert(row).select();
    if (!error && data) {
      const mapped = mapV(data[0]);
      if (editing) setVehicles(vehicles.map(v => v.id === editing.id ? mapped : v));
      else setVehicles([mapped, ...vehicles]);
    }
    setSaving(false);
    close();
  };

  const remove = async (id) => {
    if (!confirm("Remover veículo?")) return;
    await supabase.from("vehicles").delete().eq("id", id);
    setVehicles(vehicles.filter(v => v.id !== id));
  };

  const filtered = vehicles.filter(v =>
    !search || v.plate?.toLowerCase().includes(search.toLowerCase()) ||
    v.model?.toLowerCase().includes(search.toLowerCase()) ||
    v.owner?.toLowerCase().includes(search.toLowerCase())
  );

  const cols = "2fr 1.5fr 1.5fr 1fr 80px 1fr";

  return (
    <Section title="Veículos" subtitle="Gerencie entrada e saída de veículos" action={<button className="btn-primary" onClick={() => open()}>+ Novo Veículo</button>}>
      <input className="input" style={{ maxWidth: 320, marginBottom: 16 }} placeholder="Buscar por placa, modelo ou cliente..." value={search} onChange={e => setSearch(e.target.value)} />
      <div className="card" style={{ padding: 0, overflow: "hidden" }}>
        <div className="table-header" style={{ gridTemplateColumns: cols }}>
          <span>Placa / Modelo</span><span>Cliente</span><span>Serviço</span><span>Entrada</span><span>Saída</span><span>Status / Ações</span>
        </div>
        {filtered.length === 0 ? <Empty text="Nenhum veículo encontrado" pad /> :
          filtered.map(v => {
            const vServices = services.filter(s => s.vehicleId === v.id);
            const total = vServices.reduce((s, sv) => s + (Number(sv.partsValue) || 0) + (Number(sv.laborValue) || 0), 0);
            return (
              <div key={v.id} className="table-row" style={{ gridTemplateColumns: cols }}>
                <div>
                  <div style={{ fontWeight: 500, color: "#f1f5f9", fontSize: 14 }}>{v.plate}</div>
                  <div style={{ fontSize: 11, color: "#64748b" }}>{v.model} {v.year ? `· ${v.year}` : ""}</div>
                </div>
                <div style={{ fontSize: 13 }}>{v.owner || "—"}<br /><span style={{ fontSize: 11, color: "#475569" }}>{v.phone || ""}</span></div>
                <div style={{ fontSize: 13 }}>{v.serviceType || "—"}<br /><span style={{ color: "#10b981", fontSize: 12 }}>{total > 0 ? fmt(total) : ""}</span></div>
                <div style={{ fontSize: 12, color: "#94a3b8" }}>{fmtDate(v.entryDate)}</div>
                <div style={{ fontSize: 12, color: "#94a3b8" }}>{fmtDate(v.exitDate)}</div>
                <div style={{ display: "flex", gap: 6, alignItems: "center" }}>
                  <StatusBadge status={v.status} map={STATUS_COLORS} />
                  <button className="btn-ghost" style={{ padding: "4px 10px", fontSize: 11 }} onClick={() => open(v)}>✏️</button>
                  <button className="btn-danger" style={{ padding: "4px 8px", fontSize: 11 }} onClick={() => remove(v.id)}>✕</button>
                </div>
              </div>
            );
          })}
      </div>

      {modal && (
        <div className="modal-bg" onClick={close}>
          <div className="modal" onClick={e => e.stopPropagation()}>
            <h3>{editing ? "Editar Veículo" : "Novo Veículo"}</h3>
            <div className="grid-2">
              <Field label="Placa *" value={form.plate || ""} onChange={v => setForm({ ...form, plate: v.toUpperCase() })} />
              <Field label="Modelo *" value={form.model || ""} onChange={v => setForm({ ...form, model: v })} />
              <Field label="Ano" value={form.year || ""} onChange={v => setForm({ ...form, year: v })} />
              <Field label="Cor" value={form.color || ""} onChange={v => setForm({ ...form, color: v })} />
              <Field label="Cliente" value={form.owner || ""} onChange={v => setForm({ ...form, owner: v })} />
              <Field label="Telefone" value={form.phone || ""} onChange={v => setForm({ ...form, phone: v })} />
              <Field label="Tipo de Serviço" value={form.serviceType || ""} onChange={v => setForm({ ...form, serviceType: v })} />
              <SelectField label="Status" value={form.status || "Aguardando"} onChange={v => setForm({ ...form, status: v })} options={Object.keys(STATUS_COLORS)} />
              <Field label="Data de Entrada" type="date" value={form.entryDate || ""} onChange={v => setForm({ ...form, entryDate: v })} />
              <Field label="Previsão de Saída" type="date" value={form.exitDate || ""} onChange={v => setForm({ ...form, exitDate: v })} />
            </div>
            <div className="form-group">
              <label className="label">Observações</label>
              <textarea className="input" rows={3} style={{ resize: "vertical" }} value={form.notes || ""} onChange={e => setForm({ ...form, notes: e.target.value })} />
            </div>
            <div style={{ display: "flex", gap: 10, justifyContent: "flex-end", marginTop: 8 }}>
              <button className="btn-ghost" onClick={close}>Cancelar</button>
              <button className="btn-primary" onClick={save} disabled={saving}>{saving ? "Salvando..." : "Salvar"}</button>
            </div>
          </div>
        </div>
      )}
    </Section>
  );
}

// ── Services ──────────────────────────────────────────────────────────────────
function Services({ services, setServices, vehicles, mapS }) {
  const [modal, setModal] = useState(false);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState({});
  const [saving, setSaving] = useState(false);

  const open = (s = null) => { setEditing(s); setForm(s || { status: "Aguardando" }); setModal(true); };
  const close = () => { setModal(false); setEditing(null); setForm({}); };

  const save = async () => {
    if (!form.vehicleId || !form.description) return alert("Veículo e descrição são obrigatórios.");
    setSaving(true);
    const vehicle = vehicles.find(v => v.id === form.vehicleId);
    const row = { id: editing?.id || uid(), vehicle_id: form.vehicleId, vehicle_plate: vehicle?.plate, vehicle_model: vehicle?.model, description: form.description, parts_value: Number(form.partsValue) || 0, labor_value: Number(form.laborValue) || 0, parts_list: form.partsList, mechanic: form.mechanic, status: form.status };
    const { data, error } = await supabase.from("services").upsert(row).select();
    if (!error && data) {
      const mapped = mapS(data[0]);
      if (editing) setServices(services.map(s => s.id === editing.id ? mapped : s));
      else setServices([mapped, ...services]);
    }
    setSaving(false);
    close();
  };

  const remove = async (id) => {
    if (!confirm("Remover serviço?")) return;
    await supabase.from("services").delete().eq("id", id);
    setServices(services.filter(s => s.id !== id));
  };

  const cols = "2fr 1.5fr 1fr 1fr 1fr 80px";

  return (
    <Section title="Serviços" subtitle="Registre serviços, peças e mão de obra" action={<button className="btn-primary" onClick={() => open()}>+ Novo Serviço</button>}>
      <div className="card" style={{ padding: 0, overflow: "hidden" }}>
        <div className="table-header" style={{ gridTemplateColumns: cols }}>
          <span>Descrição</span><span>Veículo</span><span>Peças (R$)</span><span>Mão de Obra (R$)</span><span>Status</span><span>Ações</span>
        </div>
        {services.length === 0 ? <Empty text="Nenhum serviço registrado" pad /> :
          services.map(s => (
            <div key={s.id} className="table-row" style={{ gridTemplateColumns: cols }}>
              <div>
                <div style={{ fontSize: 13, color: "#f1f5f9" }}>{s.description}</div>
                <div style={{ fontSize: 11, color: "#475569" }}>{fmtDate(s.createdAt?.slice(0, 10))}</div>
              </div>
              <div style={{ fontSize: 13 }}>{s.vehiclePlate}<br /><span style={{ fontSize: 11, color: "#64748b" }}>{s.vehicleModel}</span></div>
              <div style={{ fontSize: 13, color: "#3b82f6" }}>{fmt(Number(s.partsValue) || 0)}</div>
              <div style={{ fontSize: 13, color: "#10b981" }}>{fmt(Number(s.laborValue) || 0)}</div>
              <StatusBadge status={s.status} map={STATUS_COLORS} />
              <div style={{ display: "flex", gap: 6 }}>
                <button className="btn-ghost" style={{ padding: "4px 10px", fontSize: 11 }} onClick={() => open(s)}>✏️</button>
                <button className="btn-danger" style={{ padding: "4px 8px", fontSize: 11 }} onClick={() => remove(s.id)}>✕</button>
              </div>
            </div>
          ))}
      </div>

      {services.length > 0 && (
        <div className="card" style={{ display: "flex", gap: 32, justifyContent: "flex-end" }}>
          <Stat label="Total Peças" value={fmt(services.reduce((s, sv) => s + (Number(sv.partsValue) || 0), 0))} color="#3b82f6" />
          <Stat label="Total Mão de Obra" value={fmt(services.reduce((s, sv) => s + (Number(sv.laborValue) || 0), 0))} color="#10b981" />
          <Stat label="Total Geral" value={fmt(services.reduce((s, sv) => s + (Number(sv.partsValue) || 0) + (Number(sv.laborValue) || 0), 0))} color="#f97316" />
        </div>
      )}

      {modal && (
        <div className="modal-bg" onClick={close}>
          <div className="modal" onClick={e => e.stopPropagation()}>
            <h3>{editing ? "Editar Serviço" : "Novo Serviço"}</h3>
            <div className="form-group">
              <SelectField label="Veículo *" value={form.vehicleId || ""} onChange={v => setForm({ ...form, vehicleId: v })} options={vehicles.map(v => ({ value: v.id, label: `${v.plate} — ${v.model}` }))} placeholder="Selecione o veículo" />
            </div>
            <div className="form-group">
              <label className="label">Descrição do Serviço *</label>
              <textarea className="input" rows={2} value={form.description || ""} onChange={e => setForm({ ...form, description: e.target.value })} />
            </div>
            <div className="grid-2">
              <Field label="Valor em Peças (R$)" type="number" value={form.partsValue || ""} onChange={v => setForm({ ...form, partsValue: v })} />
              <Field label="Valor Mão de Obra (R$)" type="number" value={form.laborValue || ""} onChange={v => setForm({ ...form, laborValue: v })} />
              <SelectField label="Status" value={form.status || "Aguardando"} onChange={v => setForm({ ...form, status: v })} options={Object.keys(STATUS_COLORS)} />
              <Field label="Mecânico Responsável" value={form.mechanic || ""} onChange={v => setForm({ ...form, mechanic: v })} />
            </div>
            <div className="form-group">
              <label className="label">Peças utilizadas</label>
              <textarea className="input" rows={2} placeholder="Lista de peças..." value={form.partsList || ""} onChange={e => setForm({ ...form, partsList: e.target.value })} />
            </div>
            <div style={{ display: "flex", gap: 10, justifyContent: "flex-end", marginTop: 8 }}>
              <button className="btn-ghost" onClick={close}>Cancelar</button>
              <button className="btn-primary" onClick={save} disabled={saving}>{saving ? "Salvando..." : "Salvar"}</button>
            </div>
          </div>
        </div>
      )}
    </Section>
  );
}

// ── Appointments ──────────────────────────────────────────────────────────────
function Appointments({ appointments, setAppointments, mapA }) {
  const [modal, setModal] = useState(false);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState({});
  const [saving, setSaving] = useState(false);

  const open = (a = null) => { setEditing(a); setForm(a || { status: "Agendado", date: today() }); setModal(true); };
  const close = () => { setModal(false); setEditing(null); setForm({}); };

  const save = async () => {
    if (!form.date || !form.clientName) return alert("Data e cliente são obrigatórios.");
    setSaving(true);
    const row = { id: editing?.id || uid(), client_name: form.clientName, client_phone: form.clientPhone, date: form.date, time: form.time, plate: form.plate, service_type: form.serviceType, mechanic: form.mechanic, status: form.status, notes: form.notes };
    const { data, error } = await supabase.from("appointments").upsert(row).select();
    if (!error && data) {
      const mapped = mapA(data[0]);
      if (editing) setAppointments(appointments.map(a => a.id === editing.id ? mapped : a));
      else setAppointments([...appointments, mapped].sort((a, b) => (a.date + (a.time || "")).localeCompare(b.date + (b.time || ""))));
    }
    setSaving(false);
    close();
  };

  const remove = async (id) => {
    if (!confirm("Remover agendamento?")) return;
    await supabase.from("appointments").delete().eq("id", id);
    setAppointments(appointments.filter(a => a.id !== id));
  };

  const cols = "1fr 1fr 1.5fr 1fr 1fr 80px";

  return (
    <Section title="Agendamentos" subtitle="Gerencie a agenda da oficina" action={<button className="btn-primary" onClick={() => open()}>+ Novo Agendamento</button>}>
      <div className="card" style={{ padding: 0, overflow: "hidden" }}>
        <div className="table-header" style={{ gridTemplateColumns: cols }}>
          <span>Data</span><span>Hora</span><span>Cliente</span><span>Serviço</span><span>Status</span><span>Ações</span>
        </div>
        {appointments.length === 0 ? <Empty text="Nenhum agendamento" pad /> :
          appointments.map(a => (
            <div key={a.id} className="table-row" style={{ gridTemplateColumns: cols, background: a.date === today() ? "#1a2030" : undefined }}>
              <div style={{ fontSize: 13, color: "#f1f5f9", display: "flex", alignItems: "center", gap: 6 }}>
                {a.date === today() && <span style={{ width: 6, height: 6, borderRadius: "50%", background: "#f97316", display: "inline-block" }} />}
                {fmtDate(a.date)}
              </div>
              <div style={{ fontSize: 13 }}>{a.time || "—"}</div>
              <div>
                <div style={{ fontSize: 13, color: "#e2e8f0" }}>{a.clientName}</div>
                <div style={{ fontSize: 11, color: "#475569" }}>{a.clientPhone}</div>
              </div>
              <div style={{ fontSize: 13 }}>{a.serviceType || "—"}<br /><span style={{ fontSize: 11, color: "#64748b" }}>{a.plate}</span></div>
              <StatusBadge status={a.status} map={APPOINTMENT_STATUS} />
              <div style={{ display: "flex", gap: 6 }}>
                <button className="btn-ghost" style={{ padding: "4px 10px", fontSize: 11 }} onClick={() => open(a)}>✏️</button>
                <button className="btn-danger" style={{ padding: "4px 8px", fontSize: 11 }} onClick={() => remove(a.id)}>✕</button>
              </div>
            </div>
          ))}
      </div>

      {modal && (
        <div className="modal-bg" onClick={close}>
          <div className="modal" onClick={e => e.stopPropagation()}>
            <h3>{editing ? "Editar Agendamento" : "Novo Agendamento"}</h3>
            <div className="grid-2">
              <Field label="Cliente *" value={form.clientName || ""} onChange={v => setForm({ ...form, clientName: v })} />
              <Field label="Telefone" value={form.clientPhone || ""} onChange={v => setForm({ ...form, clientPhone: v })} />
              <Field label="Data *" type="date" value={form.date || ""} onChange={v => setForm({ ...form, date: v })} />
              <Field label="Hora" type="time" value={form.time || ""} onChange={v => setForm({ ...form, time: v })} />
              <Field label="Placa do Veículo" value={form.plate || ""} onChange={v => setForm({ ...form, plate: v.toUpperCase() })} />
              <Field label="Tipo de Serviço" value={form.serviceType || ""} onChange={v => setForm({ ...form, serviceType: v })} />
              <SelectField label="Status" value={form.status || "Agendado"} onChange={v => setForm({ ...form, status: v })} options={Object.keys(APPOINTMENT_STATUS)} />
              <Field label="Mecânico" value={form.mechanic || ""} onChange={v => setForm({ ...form, mechanic: v })} />
            </div>
            <div className="form-group">
              <label className="label">Observações</label>
              <textarea className="input" rows={2} value={form.notes || ""} onChange={e => setForm({ ...form, notes: e.target.value })} />
            </div>
            <div style={{ display: "flex", gap: 10, justifyContent: "flex-end", marginTop: 8 }}>
              <button className="btn-ghost" onClick={close}>Cancelar</button>
              <button className="btn-primary" onClick={save} disabled={saving}>{saving ? "Salvando..." : "Salvar"}</button>
            </div>
          </div>
        </div>
      )}
    </Section>
  );
}

// ── Quotes ────────────────────────────────────────────────────────────────────
function Quotes({ quotes, setQuotes, mapQ }) {
  const [modal, setModal] = useState(false);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState({ items: [] });
  const [saving, setSaving] = useState(false);

  const open = (q = null) => { setEditing(q); setForm(q ? { ...q, items: q.items || [] } : { status: "Pendente", date: today(), items: [] }); setModal(true); };
  const close = () => { setModal(false); setEditing(null); setForm({ items: [] }); };

  const addItem = () => setForm(f => ({ ...f, items: [...(f.items || []), { id: uid(), desc: "", qty: 1, unit: 0 }] }));
  const updateItem = (id, field, val) => setForm(f => ({ ...f, items: f.items.map(i => i.id === id ? { ...i, [field]: val } : i) }));
  const removeItem = (id) => setForm(f => ({ ...f, items: f.items.filter(i => i.id !== id) }));
  const total = (items) => (items || []).reduce((s, i) => s + (Number(i.qty) || 0) * (Number(i.unit) || 0), 0);

  const save = async () => {
    if (!form.clientName) return alert("Nome do cliente é obrigatório.");
    setSaving(true);
    const t = total(form.items);
    const row = { id: editing?.id || uid(), client_name: form.clientName, client_phone: form.clientPhone, plate: form.plate, vehicle_model: form.vehicleModel, service_type: form.serviceType, date: form.date, valid_until: form.validUntil, status: form.status, items: form.items, total: t, notes: form.notes };
    const { data, error } = await supabase.from("quotes").upsert(row).select();
    if (!error && data) {
      const mapped = mapQ(data[0]);
      if (editing) setQuotes(quotes.map(q => q.id === editing.id ? mapped : q));
      else setQuotes([mapped, ...quotes]);
    }
    setSaving(false);
    close();
  };

  const remove = async (id) => {
    if (!confirm("Remover orçamento?")) return;
    await supabase.from("quotes").delete().eq("id", id);
    setQuotes(quotes.filter(q => q.id !== id));
  };

  const QUOTE_STATUS = { "Pendente": "#f59e0b", "Aprovado": "#10b981", "Recusado": "#ef4444", "Expirado": "#6b7280" };
  const cols = "1fr 1.5fr 1.5fr 1fr 1fr 80px";

  return (
    <Section title="Orçamentos" subtitle="Crie e gerencie orçamentos para clientes" action={<button className="btn-primary" onClick={() => open()}>+ Novo Orçamento</button>}>
      <div className="card" style={{ padding: 0, overflow: "hidden" }}>
        <div className="table-header" style={{ gridTemplateColumns: cols }}>
          <span>Data</span><span>Cliente</span><span>Veículo / Serviço</span><span>Total</span><span>Status</span><span>Ações</span>
        </div>
        {quotes.length === 0 ? <Empty text="Nenhum orçamento criado" pad /> :
          quotes.map(q => (
            <div key={q.id} className="table-row" style={{ gridTemplateColumns: cols }}>
              <div style={{ fontSize: 12, color: "#94a3b8" }}>{fmtDate(q.date)}</div>
              <div>
                <div style={{ fontSize: 13, color: "#e2e8f0" }}>{q.clientName}</div>
                <div style={{ fontSize: 11, color: "#475569" }}>{q.clientPhone}</div>
              </div>
              <div>
                <div style={{ fontSize: 12 }}>{q.plate}</div>
                <div style={{ fontSize: 11, color: "#475569" }}>{q.serviceType}</div>
              </div>
              <div style={{ fontSize: 13, color: "#f97316", fontWeight: 600 }}>{fmt(q.total || 0)}</div>
              <StatusBadge status={q.status} map={QUOTE_STATUS} />
              <div style={{ display: "flex", gap: 6 }}>
                <button className="btn-ghost" style={{ padding: "4px 10px", fontSize: 11 }} onClick={() => open(q)}>✏️</button>
                <button className="btn-danger" style={{ padding: "4px 8px", fontSize: 11 }} onClick={() => remove(q.id)}>✕</button>
              </div>
            </div>
          ))}
      </div>

      {modal && (
        <div className="modal-bg" onClick={close}>
          <div className="modal" onClick={e => e.stopPropagation()}>
            <h3>{editing ? "Editar Orçamento" : "Novo Orçamento"}</h3>
            <div className="grid-2">
              <Field label="Cliente *" value={form.clientName || ""} onChange={v => setForm({ ...form, clientName: v })} />
              <Field label="Telefone" value={form.clientPhone || ""} onChange={v => setForm({ ...form, clientPhone: v })} />
              <Field label="Placa" value={form.plate || ""} onChange={v => setForm({ ...form, plate: v.toUpperCase() })} />
              <Field label="Modelo do Veículo" value={form.vehicleModel || ""} onChange={v => setForm({ ...form, vehicleModel: v })} />
              <Field label="Tipo de Serviço" value={form.serviceType || ""} onChange={v => setForm({ ...form, serviceType: v })} />
              <Field label="Data" type="date" value={form.date || ""} onChange={v => setForm({ ...form, date: v })} />
              <Field label="Validade" type="date" value={form.validUntil || ""} onChange={v => setForm({ ...form, validUntil: v })} />
              <SelectField label="Status" value={form.status || "Pendente"} onChange={v => setForm({ ...form, status: v })} options={["Pendente", "Aprovado", "Recusado", "Expirado"]} />
            </div>
            <div style={{ margin: "16px 0 8px" }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 10 }}>
                <label className="label" style={{ margin: 0 }}>Itens do Orçamento</label>
                <button className="btn-ghost" style={{ fontSize: 11, padding: "4px 10px" }} onClick={addItem}>+ Item</button>
              </div>
              {(form.items || []).map(item => (
                <div key={item.id} style={{ display: "grid", gridTemplateColumns: "3fr 1fr 1.5fr auto", gap: 8, marginBottom: 8, alignItems: "center" }}>
                  <input className="input" placeholder="Descrição" value={item.desc} onChange={e => updateItem(item.id, "desc", e.target.value)} />
                  <input className="input" type="number" placeholder="Qtd" value={item.qty} onChange={e => updateItem(item.id, "qty", e.target.value)} />
                  <input className="input" type="number" placeholder="Valor unit." value={item.unit} onChange={e => updateItem(item.id, "unit", e.target.value)} />
                  <button className="btn-danger" style={{ padding: "6px 10px" }} onClick={() => removeItem(item.id)}>✕</button>
                </div>
              ))}
              {(form.items || []).length > 0 && (
                <div style={{ textAlign: "right", padding: "8px 0", borderTop: "1px solid #1e2736", color: "#f97316", fontWeight: 600 }}>
                  Total: {fmt(total(form.items))}
                </div>
              )}
            </div>
            <div className="form-group">
              <label className="label">Observações</label>
              <textarea className="input" rows={2} value={form.notes || ""} onChange={e => setForm({ ...form, notes: e.target.value })} />
            </div>
            <div style={{ display: "flex", gap: 10, justifyContent: "flex-end", marginTop: 8 }}>
              <button className="btn-ghost" onClick={close}>Cancelar</button>
              <button className="btn-primary" onClick={save} disabled={saving}>{saving ? "Salvando..." : "Salvar"}</button>
            </div>
          </div>
        </div>
      )}
    </Section>
  );
}

// ── Shared ────────────────────────────────────────────────────────────────────
function Section({ title, subtitle, action, children }) {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
        <div>
          <h1 style={{ fontFamily: "'Syne',sans-serif", fontSize: 22, fontWeight: 800, color: "#f1f5f9" }}>{title}</h1>
          <p style={{ fontSize: 13, color: "#475569", marginTop: 2 }}>{subtitle}</p>
        </div>
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
    <div className="form-group">
      <label className="label">{label}</label>
      <input className="input" type={type} value={value} onChange={e => onChange(e.target.value)} />
    </div>
  );
}

function SelectField({ label, value, onChange, options, placeholder }) {
  return (
    <div className="form-group">
      <label className="label">{label}</label>
      <select className="input" value={value} onChange={e => onChange(e.target.value)} style={{ appearance: "none" }}>
        {placeholder && <option value="">{placeholder}</option>}
        {options.map(o => typeof o === "string"
          ? <option key={o} value={o}>{o}</option>
          : <option key={o.value} value={o.value}>{o.label}</option>
        )}
      </select>
    </div>
  );
}

function Stat({ label, value, color }) {
  return (
    <div>
      <div style={{ fontSize: 11, color: "#475569", textTransform: "uppercase", letterSpacing: ".05em" }}>{label}</div>
      <div style={{ fontSize: 18, fontWeight: 700, color, fontFamily: "'Syne',sans-serif" }}>{value}</div>
    </div>
  );
}

function Empty({ text, pad }) {
  return <div style={{ textAlign: "center", color: "#334155", fontSize: 13, padding: pad ? "40px 0" : "16px 0" }}>{text}</div>;
}
