 (cd "$(git rev-parse --show-toplevel)" && git apply --3way <<'EOF' 
diff --git a/src/App.tsx b/src/App.tsx
index fc92d5aec7c8c26032fc6877553e599a6b94b3f4..9b654fc466a36f5419944c25e8f528f3ed8c153a 100644
--- a/src/App.tsx
+++ b/src/App.tsx
@@ -2,50 +2,75 @@ import { useState, useEffect, useCallback } from "react";
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
 
+const APP_VERSION = "v1.1.0";
+const RELEASE_NOTES = [
+  {
+    version: "v1.1.0",
+    title: "Relatório PDF",
+    date: "02/04/2026",
+    items: [
+      "Geração de relatório PDF por período selecionado",
+      "Atalhos rápidos de período (este mês, mês passado, últimos 7/30 dias)",
+      "Prévia do período antes de gerar",
+      "PDF com resumo financeiro, veículos e serviços"
+    ]
+  },
+  {
+    version: "v1.0.0",
+    title: "Lançamento inicial",
+    date: "01/04/2026",
+    items: [
+      "Dashboard operacional com indicadores principais",
+      "Cadastro de veículos, serviços, agendamentos e orçamentos",
+      "Integração com Supabase para persistência de dados"
+    ]
+  }
+];
+
 // ── PDF Generator ─────────────────────────────────────────────────────────────
 function generatePDF(vehicles, services, dateFrom, dateTo) {
   const filteredVehicles = vehicles.filter(v => {
     if (!v.entryDate) return false;
     return v.entryDate >= dateFrom && v.entryDate <= dateTo;
   });
 
   const filteredServices = services.filter(s => {
     if (!s.createdAt) return false;
     const d = s.createdAt.slice(0, 10);
     return d >= dateFrom && d <= dateTo;
   });
 
   const totalParts = filteredServices.reduce((s, sv) => s + (Number(sv.partsValue) || 0), 0);
   const totalLabor = filteredServices.reduce((s, sv) => s + (Number(sv.laborValue) || 0), 0);
   const totalGeral = totalParts + totalLabor;
 
   const html = `
 <!DOCTYPE html>
 <html lang="pt-BR">
 <head>
 <meta charset="UTF-8"/>
 <title>Relatório Oficina</title>
 <style>
   * { box-sizing: border-box; margin: 0; padding: 0; }
@@ -176,159 +201,201 @@ function generatePDF(vehicles, services, dateFrom, dateTo) {
         <td style="color:#3b82f6">${fmt(totalParts)}</td>
         <td style="color:#10b981">${fmt(totalLabor)}</td>
         <td style="color:#f97316">${fmt(totalGeral)}</td>
         <td></td>
       </tr>
     </tbody>
   </table>`}
 </div>
 
 <div class="footer">
   AutoGestão — Sistema de Gestão de Oficina · Relatório gerado automaticamente
 </div>
 
 <script>window.onload = () => window.print();</script>
 </body>
 </html>`;
 
   const blob = new Blob([html], { type: "text/html" });
   const url = URL.createObjectURL(blob);
   const win = window.open(url, "_blank");
   setTimeout(() => URL.revokeObjectURL(url), 10000);
 }
 
 export default function App() {
   const [tab, setTab] = useState("dashboard");
+  const [vehicleToEditId, setVehicleToEditId] = useState(null);
   const [vehicles, setVehicles] = useState([]);
   const [services, setServices] = useState([]);
   const [appointments, setAppointments] = useState([]);
   const [quotes, setQuotes] = useState([]);
   const [loading, setLoading] = useState(true);
   const [showReport, setShowReport] = useState(false);
 
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
-    <div style={{ minHeight: "100vh", background: "#0d0f14", color: "#e2e8f0", fontFamily: "'DM Mono','Fira Mono',monospace", display: "flex", flexDirection: "column" }}>
+    <div className="app-shell" style={{ minHeight: "100vh", background: "#0d0f14", color: "#e2e8f0", fontFamily: "'DM Mono','Fira Mono',monospace", display: "flex", flexDirection: "column", width: "100%" }}>
       <style>{`
         @import url('https://fonts.googleapis.com/css2?family=DM+Mono:wght@300;400;500&family=Syne:wght@700;800&display=swap');
         *{box-sizing:border-box;margin:0;padding:0;}
+        html,body,#root{width:100%;max-width:100%;min-height:100%;overflow-x:hidden;background:#0d0f14;}
         ::-webkit-scrollbar{width:4px;}
         ::-webkit-scrollbar-track{background:#0d0f14;}
         ::-webkit-scrollbar-thumb{background:#2d3748;border-radius:2px;}
         input,select,textarea{outline:none;}
         button{cursor:pointer;}
-        .card{background:#161b26;border:1px solid #1e2736;border-radius:12px;padding:20px;}
+        .card{background:#161b26;border:1px solid #1e2736;border-radius:12px;padding:20px;min-width:0;}
         .btn-primary{background:#f97316;color:#0d0f14;border:none;border-radius:8px;padding:9px 18px;font-family:inherit;font-weight:500;font-size:13px;transition:opacity .15s;}
         .btn-primary:hover{opacity:.85;}
         .btn-ghost{background:transparent;color:#94a3b8;border:1px solid #1e2736;border-radius:8px;padding:8px 16px;font-family:inherit;font-size:13px;transition:all .15s;}
         .btn-ghost:hover{border-color:#f97316;color:#f97316;}
         .btn-danger{background:transparent;color:#ef4444;border:1px solid #3f1212;border-radius:8px;padding:7px 14px;font-family:inherit;font-size:12px;}
         .btn-danger:hover{background:#3f1212;}
         .btn-pdf{background:#7c3aed;color:#fff;border:none;border-radius:8px;padding:9px 18px;font-family:inherit;font-weight:500;font-size:13px;transition:opacity .15s;display:flex;align-items:center;gap:6px;}
         .btn-pdf:hover{opacity:.85;}
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
-        @media(max-width:640px){.grid-2,.grid-3{grid-template-columns:1fr;}}
+        .dashboard-kpi-grid{display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:14px;}
+        .top-nav-wrap{position:relative;z-index:20;}
+        .app-header{padding:16px 24px;border-bottom:1px solid #1e2736;display:flex;align-items:center;gap:16px;background:#0d0f14;width:100%;max-width:100vw;}
+        .app-main{flex:1;padding:24px;max-width:1100px;width:100%;margin:0 auto;min-width:0;}
+        .app-nav{display:flex;gap:4px;padding:12px 24px;border-bottom:1px solid #1e2736;overflow-x:auto;width:100%;max-width:100vw;background:#0d0f14;}
+        .app-pdf-btn{white-space:normal;text-align:center;}
+        @media(max-width:900px){.dashboard-kpi-grid{grid-template-columns:repeat(2,minmax(0,1fr));}}
+        @media(max-width:640px){
+          .grid-2,.grid-3{grid-template-columns:1fr;}
+          .dashboard-kpi-grid{grid-template-columns:1fr;}
+          .app-header{padding:14px 12px;gap:12px;align-items:flex-start;flex-wrap:wrap;}
+          .app-nav{padding:12px 12px;}
+          .app-main{padding:16px 12px;}
+          .app-pdf-btn{margin-left:0 !important;width:100%;}
+          .top-nav-wrap{position:sticky;top:0;z-index:70;}
+        }
       `}</style>
 
-      <header style={{ padding: "16px 24px", borderBottom: "1px solid #1e2736", display: "flex", alignItems: "center", gap: 16, background: "#0d0f14" }}>
-        <div style={{ width: 36, height: 36, background: "#f97316", borderRadius: 8, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 18 }}>🔩</div>
-        <div>
-          <div style={{ fontFamily: "'Syne',sans-serif", fontSize: 18, fontWeight: 800, color: "#f1f5f9", lineHeight: 1 }}>AutoGestão</div>
-          <div style={{ fontSize: 11, color: "#475569", marginTop: 2 }}>Sistema de Gestão de Oficina</div>
-        </div>
-        {loading && <div style={{ marginLeft: "auto", fontSize: 11, color: "#f97316" }}>● sincronizando...</div>}
-        <button className="btn-pdf" style={{ marginLeft: loading ? 8 : "auto" }} onClick={() => setShowReport(true)}>
-          📄 Gerar Relatório PDF
-        </button>
-      </header>
-
-      <nav style={{ display: "flex", gap: 4, padding: "12px 24px", borderBottom: "1px solid #1e2736", overflowX: "auto" }}>
-        {tabs.map(t => (
-          <button key={t.id} onClick={() => setTab(t.id)} style={{
-            background: tab === t.id ? "#f97316" : "transparent",
-            color: tab === t.id ? "#0d0f14" : "#64748b",
-            border: "none", borderRadius: 8, padding: "8px 16px",
-            fontFamily: "inherit", fontSize: 13, fontWeight: 500,
-            whiteSpace: "nowrap", display: "flex", alignItems: "center", gap: 6, transition: "all .15s",
-          }}>
-            <span>{t.icon}</span> {t.label}
+      <div className="top-nav-wrap">
+        <header className="app-header">
+          <div style={{ width: 36, height: 36, background: "#f97316", borderRadius: 8, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 18 }}>🔩</div>
+          <div>
+            <div style={{ fontFamily: "'Syne',sans-serif", fontSize: 18, fontWeight: 800, color: "#f1f5f9", lineHeight: 1 }}>AutoGestão</div>
+            <div style={{ fontSize: 11, color: "#475569", marginTop: 2 }}>Sistema de Gestão de Oficina</div>
+          </div>
+          {loading && <div style={{ marginLeft: "auto", fontSize: 11, color: "#f97316" }}>● sincronizando...</div>}
+          <button className="btn-pdf app-pdf-btn" style={{ marginLeft: loading ? 8 : "auto" }} onClick={() => setShowReport(true)}>
+            📄 Gerar Relatório PDF
           </button>
-        ))}
-      </nav>
+        </header>
+
+        <nav className="app-nav">
+          {tabs.map(t => (
+            <button key={t.id} onClick={() => setTab(t.id)} style={{
+              background: tab === t.id ? "#f97316" : "transparent",
+              color: tab === t.id ? "#0d0f14" : "#64748b",
+              border: "none", borderRadius: 8, padding: "8px 16px",
+              fontFamily: "inherit", fontSize: 13, fontWeight: 500,
+              whiteSpace: "nowrap", display: "flex", alignItems: "center", gap: 6, transition: "all .15s",
+            }}>
+              <span>{t.icon}</span> {t.label}
+            </button>
+          ))}
+        </nav>
+      </div>
 
-      <main style={{ flex: 1, padding: 24, maxWidth: 1100, width: "100%", margin: "0 auto" }}>
+      <main className="app-main" style={{ overflowX: "hidden", background: "#0d0f14" }}>
         {loading ? (
           <div style={{ textAlign: "center", padding: 80, color: "#475569" }}>
             <div style={{ fontSize: 32, marginBottom: 12 }}>🔩</div>
             <div>Carregando dados...</div>
           </div>
         ) : (
           <>
-            {tab === "dashboard" && <Dashboard vehicles={vehicles} services={services} appointments={appointments} quotes={quotes} setTab={setTab} />}
-            {tab === "vehicles" && <Vehicles vehicles={vehicles} setVehicles={setVehicles} services={services} mapV={mapV} />}
+            {tab === "dashboard" && (
+              <Dashboard
+                vehicles={vehicles}
+                services={services}
+                appointments={appointments}
+                quotes={quotes}
+                setTab={setTab}
+                appVersion={APP_VERSION}
+                releaseNotes={RELEASE_NOTES}
+                onEditVehicle={(vehicleId) => {
+                  setVehicleToEditId(vehicleId);
+                  setTab("vehicles");
+                }}
+              />
+            )}
+            {tab === "vehicles" && (
+              <Vehicles
+                vehicles={vehicles}
+                setVehicles={setVehicles}
+                services={services}
+                mapV={mapV}
+                initialEditId={vehicleToEditId}
+                onInitialEditConsumed={() => setVehicleToEditId(null)}
+              />
+            )}
             {tab === "services" && <Services services={services} setServices={setServices} vehicles={vehicles} mapS={mapS} />}
             {tab === "appointments" && <Appointments appointments={appointments} setAppointments={setAppointments} mapA={mapA} />}
             {tab === "quotes" && <Quotes quotes={quotes} setQuotes={setQuotes} mapQ={mapQ} />}
           </>
         )}
       </main>
 
       {showReport && (
         <ReportModal
           vehicles={vehicles}
           services={services}
           onClose={() => setShowReport(false)}
           onGenerate={(from, to) => { generatePDF(vehicles, services, from, to); setShowReport(false); }}
         />
       )}
     </div>
   );
 }
 
 // ── Report Modal ──────────────────────────────────────────────────────────────
 function ReportModal({ vehicles, services, onClose, onGenerate }) {
   const firstDay = new Date();
   firstDay.setDate(1);
   const [dateFrom, setDateFrom] = useState(firstDay.toISOString().slice(0, 10));
   const [dateTo, setDateTo] = useState(today());
@@ -382,134 +449,166 @@ function ReportModal({ vehicles, services, onClose, onGenerate }) {
               <div style={{ fontSize: 11, color: "#475569" }}>Veículos</div>
             </div>
             <div style={{ textAlign: "center" }}>
               <div style={{ fontSize: 22, fontWeight: 700, color: "#3b82f6", fontFamily: "'Syne',sans-serif" }}>{filteredS.length}</div>
               <div style={{ fontSize: 11, color: "#475569" }}>Serviços</div>
             </div>
             <div style={{ textAlign: "center" }}>
               <div style={{ fontSize: 18, fontWeight: 700, color: "#10b981", fontFamily: "'Syne',sans-serif" }}>{fmt(totalParts + totalLabor)}</div>
               <div style={{ fontSize: 11, color: "#475569" }}>Receita Total</div>
             </div>
           </div>
         </div>
 
         <div style={{ display: "flex", gap: 10, justifyContent: "flex-end" }}>
           <button className="btn-ghost" onClick={onClose}>Cancelar</button>
           <button className="btn-pdf" onClick={() => onGenerate(dateFrom, dateTo)}>
             📄 Gerar e Baixar PDF
           </button>
         </div>
       </div>
     </div>
   );
 }
 
 // ── Dashboard ─────────────────────────────────────────────────────────────────
-function Dashboard({ vehicles, services, appointments, quotes, setTab }) {
+function Dashboard({ vehicles, services, appointments, quotes, setTab, onEditVehicle, appVersion, releaseNotes }) {
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
+        <p style={{ color: "#94a3b8", fontSize: 12, marginTop: 8 }}>Versão atual: <strong style={{ color: "#f97316" }}>{appVersion}</strong></p>
       </div>
-      <div style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: 14 }}>
+      <div className="dashboard-kpi-grid">
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
-            <div key={v.id} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "10px 0", borderBottom: "1px solid #1e2736" }}>
+            <button
+              key={v.id}
+              type="button"
+              onClick={() => onEditVehicle(v.id)}
+              style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "10px 0", borderBottom: "1px solid #1e2736", width: "100%", textAlign: "left", background: "transparent", border: "none", color: "inherit" }}
+            >
               <div>
                 <div style={{ fontSize: 13, color: "#e2e8f0" }}>{v.plate} — {v.model}</div>
-                <div style={{ fontSize: 11, color: "#475569" }}>{v.owner} · Entrada: {fmtDate(v.entryDate)}</div>
+                <div style={{ fontSize: 11, color: "#475569" }}>{v.owner} · Entrada: {fmtDate(v.entryDate)} · Clique para editar</div>
               </div>
               <StatusBadge status={v.status} map={STATUS_COLORS} />
+            </button>
+          ))}
+        </div>
+      </div>
+      <div className="card">
+        <h3 style={{ fontFamily: "'Syne',sans-serif", color: "#f1f5f9", fontSize: 15, marginBottom: 14 }}>Histórico de Versões</h3>
+        <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
+          {releaseNotes.map(note => (
+            <div key={note.version} style={{ border: "1px solid #1e2736", borderRadius: 10, padding: "12px 14px", background: "#0d0f14" }}>
+              <div style={{ fontSize: 12, fontWeight: 600, color: "#f97316", marginBottom: 8 }}>
+                {note.version} — {note.title} {note.date}
+              </div>
+              <ul style={{ margin: 0, paddingLeft: 18, display: "grid", gap: 6 }}>
+                {note.items.map((item, idx) => (
+                  <li key={`${note.version}-${idx}`} style={{ fontSize: 12, color: "#94a3b8" }}>
+                    {item}
+                  </li>
+                ))}
+              </ul>
             </div>
           ))}
         </div>
       </div>
     </div>
   );
 }
 
 // ── Vehicles ──────────────────────────────────────────────────────────────────
-function Vehicles({ vehicles, setVehicles, services, mapV }) {
+function Vehicles({ vehicles, setVehicles, services, mapV, initialEditId, onInitialEditConsumed }) {
   const [modal, setModal] = useState(false);
   const [editing, setEditing] = useState(null);
   const [search, setSearch] = useState("");
   const [form, setForm] = useState({});
   const [saving, setSaving] = useState(false);
 
   const open = (v = null) => { setEditing(v); setForm(v || { status: "Aguardando", entryDate: today() }); setModal(true); };
   const close = () => { setModal(false); setEditing(null); setForm({}); };
 
+  useEffect(() => {
+    if (!initialEditId) return;
+    const vehicleToEdit = vehicles.find(v => v.id === initialEditId);
+    if (vehicleToEdit) open(vehicleToEdit);
+    onInitialEditConsumed();
+  }, [initialEditId, vehicles, onInitialEditConsumed]);
+
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
 
EOF
)
