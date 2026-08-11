import { useState, useEffect, useRef } from "react";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

// Inicialização do cliente Supabase
      const supabase = createClient(
        "https://bofhihxpqmqimkanwkyw.supabase.co",
        "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImJvZmhpaHhwcW1xaW1rYW53a3l3Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzUwODQ3OTMsImV4cCI6MjA5MDY2MDc5M30.fOOD-FweGID1x2mlJ3LWImtw7B6m6Pc-8auXLIuCqbw"
      );

      // CONSTANTES
      const PAYMENT_METHODS = {
        "Dinheiro": 0, "Pix": 0, "Débito": 1.9,
        "Crédito 1x": 0.79, "Crédito 2x": 1.58, "Crédito 3x": 2.37, "Crédito 4x": 3.16,
        "Crédito 5x": 3.95, "Crédito 6x": 4.74, "Crédito 7x": 5.53, "Crédito 8x": 6.32,
        "Crédito 9x": 7.11, "Crédito 10x": 7.90, "Crédito 11x": 8.69, "Crédito 12x": 9.48
      };

      const STATUS_COLORS = { 
        "Aguardando": "#f59e0b", 
        "Em andamento": "#3b82f6", 
        "Pronto": "#10b981", 
        "Entregue": "#64748b" 
      };

      const MONTHS = ["Janeiro", "Fevereiro", "Março", "Abril", "Maio", "Junho", "Julho", "Agosto", "Setembro", "Outubro", "Novembro", "Dezembro"];
      const CAR_BRANDS = ["Audi", "BMW", "BYD", "Chevrolet", "Citroën", "Ferrari", "Fiat", "Ford", "GWM", "Honda", "Hyundai", "JAC", "Jaguar", "Jeep", "Kia", "Land Rover", "Mercedes-Benz", "Mitsubishi", "Nissan", "Peugeot", "Porsche", "RAM", "Renault", "Toyota", "Volkswagen", "Volvo"].sort();

      // Ícones
      function Icon({ name, size = 18, color = "currentColor", className = "" }: any) {
        const paths = {
          home: <path d="m3 9 9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/>,
          wrench: <path d="M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.8-3.8a6 6 0 0 1-7.9 7.9L6.7 20.3a2.1 2.1 0 0 1-3-3l6.9-6.9a6 6 0 0 1 7.9-7.9z"/>,
          finance: <g><rect width="20" height="12" x="2" y="6" rx="2"/><circle cx="12" cy="12" r="2"/></g>,
          car: <g><path d="M19 17h2c.6 0 1-.4 1-1v-3c0-.9-.7-1.7-1.5-1.9L18.4 6c-.3-.6-.9-1-1.6-1H7.2c-.7 0-1.3.4-1.6 1l-2.1 5.1C2.7 11.3 2 12.1 2 13v3c0 .6.4 1 1 1h2"/><circle cx="7" cy="17" r="2"/><circle cx="17" cy="17" r="2"/></g>,
          plus: <path d="M5 12h14M12 5v14"/>,
          edit: <path d="M12 20h9M16.5 3.5a2.12 2.12 0 0 1 3 3L7 19l-4 1 1-4Z"/>,
          history: <g><path d="M3 12a9 9 0 1 0 9-9 9.75 9.75 0 0 0-6.74 2.74L3 8"/><path d="M3 3v5h5M12 7v5l4 2"/></g>,
          file: <g><path d="M15 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7Z"/><path d="M14 2v4a2 2 0 0 0 2 2h4"/></g>,
          x: <path d="M18 6 6 18M6 6l12 12"/>,
          search: <g><circle cx="11" cy="11" r="8"/><path d="m21 21-4.3-4.3"/></g>,
          trash: <path d="M3 6h18M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2"/>,
          camera: <g><path d="M14.5 4h-5L7 7H4a2 2 0 0 0-2 2v9a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2V9a2 2 0 0-2-2h-3l-2.5-3z"/><circle cx="12" cy="13" r="3"/></g>,
          cloud: <path d="M17.5 19H9a7 7 0 1 1 6.71-9h1.79a4.5 4.5 0 1 1 0 9Z"/>,
          image: <g><rect width="18" height="18" x="3" y="3" rx="2" ry="2"/><circle cx="9" cy="9" r="2"/><path d="m21 15-3.086-3.086a2 2 0 0 0-2.828 0L6 21"/></g>
        };

        const pathElem = paths[name];
        if (!pathElem) return null;

        return (
          <svg 
            xmlns="http://www.w3.org/2000/svg" 
            width={size} 
            height={size} 
            viewBox="0 0 24 24" 
            fill="none" 
            stroke={color} 
            strokeWidth="2.2" 
            strokeLinecap="round" 
            strokeLinejoin="round"
            className={className}
          >
            {pathElem}
          </svg>
        );
      }

      // FORMATAÇÕES
      const uid = () => Math.random().toString(36).slice(2, 10);
      const fmt = (n: any) => new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(n || 0);
      const fmtKm = (n: any) => n ? Number(n).toLocaleString("pt-BR") + " km" : "—";
      const today = () => new Date().toISOString().slice(0, 10);
      const fmtDate = (d: any) => d ? new Date(d + "T12:00:00").toLocaleDateString("pt-BR") : "—";

      const mapV = (r: any) => ({
        id: r.id, plate: r.plate, brand: r.brand, model: r.model, year: r.year, 
        color: r.color, owner: r.owner, phone: r.phone, notes: r.notes, 
        mileage: r.mileage || 0, createdAt: r.created_at
      });

      
      function compressImage(file, maxWidth = 1600, quality = 0.8) {
        return new Promise((resolve, reject) => {
          const reader = new FileReader();
          reader.readAsDataURL(file);
          reader.onload = (e) => {
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
              ctx.drawImage(img, 0, 0, width, height);
              const dataUrl = canvas.toDataURL('image/jpeg', quality);
              const base64 = dataUrl.split(',')[1];
              resolve({ base64, mimeType: 'image/jpeg', dataUrl });
            };
            img.onerror = (err) => reject(err);
          };
          reader.onerror = (err) => reject(err);
        });
      }

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

      function BrandSelector({ value, onChange }: any) {
        const [query, setQuery] = useState(value || "");
        const [open, setOpen] = useState(false);
        const ref = useRef(null);
        const filtered = CAR_BRANDS.filter(b => b.toLowerCase().includes(query.toLowerCase()));
        
        useEffect(() => { setQuery(value || ""); }, [value]);
        useEffect(() => {
          function handleClick(e) { if (ref.current && !ref.current.contains(e.target)) setOpen(false); }
          document.addEventListener("mousedown", handleClick); 
          return () => document.removeEventListener("mousedown", handleClick);
        }, []);

        return (
          <div ref={ref} style={{ position: "relative" }} className="form-group">
            <label className="label">Marca *</label>
            <input 
              className="input" 
              placeholder="Digite ou escolha a marca..." 
              value={query} 
              onFocus={() => setOpen(true)} 
              onChange={e => { setQuery(e.target.value); onChange(e.target.value); setOpen(true); }} 
              autoComplete="off" 
            />
            {open && filtered.length > 0 && (
              <div className="dropdown-suggest">
                {filtered.map(b => (
                  <div 
                    key={b} 
                    onClick={() => { onChange(b); setQuery(b); setOpen(false); }} 
                    className="suggest-item"
                    style={{ color: value === b ? "var(--primary)" : "var(--text)" }}
                  >
                    {b}
                  </div>
                ))}
              </div>
            )}
          </div>
        );
      }

      function VehicleSelector({ vehicles, value, onChange }: any) {
        const [query, setQuery] = useState("");
        const [open, setOpen] = useState(false);
        const ref = useRef(null);
        const selected = vehicles.find(v => v.id === value);
        const displayValue = selected ? `${selected.plate} — ${selected.brand} ${selected.model}` : query;
        const filtered = vehicles.filter(v => 
          (v.plate || "").toLowerCase().includes(query.toLowerCase()) || 
          (v.model || "").toLowerCase().includes(query.toLowerCase())
        ).slice(0, 10);

        useEffect(() => {
          function handleClick(e) { if (ref.current && !ref.current.contains(e.target)) setOpen(false); }
          document.addEventListener("mousedown", handleClick); 
          return () => document.removeEventListener("mousedown", handleClick);
        }, []);

        return (
          <div ref={ref} style={{ position: "relative" }} className="form-group">
            <label className="label">Carro *</label>
            <input 
              className="input" 
              placeholder="Busque placa ou modelo..." 
              value={open ? query : displayValue} 
              onFocus={() => { setOpen(true); setQuery(""); }} 
              onChange={e => setQuery(e.target.value)} 
              autoComplete="off" 
            />
            {open && (
              <div className="dropdown-suggest">
                {filtered.map(v => (
                  <div 
                    key={v.id} 
                    onClick={() => { onChange(v.id); setOpen(false); }} 
                    className="suggest-item"
                  >
                    <div style={{ fontWeight: 700, fontSize: "13px" }}>{v.plate}</div>
                    <div className="suggest-item-sub">{v.brand} {v.model} {v.owner ? `· ${v.owner}` : ""}</div>
                  </div>
                ))}
              </div>
            )}
          </div>
        );
      }

      
      function DriveModal({ driveUrl, onSave, onClose }: any) {
        const [urlInput, setUrlInput] = useState(driveUrl || "");
        return (
          <div className="modal-overlay" onClick={onClose}>
            <div className="modal-content" onClick={e => e.stopPropagation()}>
              <div className="modal-header">
                <h3 className="modal-title">⚙️ Conectar Google Drive</h3>
                <button className="modal-close" onClick={onClose}><Icon name="x" size={18} /></button>
              </div>
              <p style={{ fontSize: "12px", color: "var(--text-muted)", marginBottom: "16px", lineHeight: "1.5" }}>
                Cole abaixo a URL do seu Web App criado no Google Apps Script. As fotos das vistorias e serviços serão salvas automaticamente na pasta <strong>ASDCAR_Fotos</strong> do seu Google Drive.
              </p>
              <div className="form-group">
                <label className="label">URL do Web App do Google Drive *</label>
                <input 
                  className="input" 
                  placeholder="https://script.google.com/macros/s/.../exec" 
                  value={urlInput} 
                  onChange={e => setUrlInput(e.target.value)} 
                />
              </div>
              <button className="btn btn-primary" style={{ width: "100%", marginTop: "16px", height: "44px" }} onClick={() => { onSave(urlInput.trim()); onClose(); }}>
                Salvar Conexão do Google Drive
              </button>
            </div>
          </div>
        );
      }

      function PhotoZoomModal({ photo, onClose }: any) {
        if (!photo) return null;
        return (
          <div className="modal-overlay" onClick={onClose}>
            <div className="modal-content" style={{ maxWidth: "650px", textAlign: "center" }} onClick={e => e.stopPropagation()}>
              <div className="modal-header">
                <h3 className="modal-title">{photo.type || "Foto da Vistoria"}</h3>
                <button className="modal-close" onClick={onClose}><Icon name="x" size={18} /></button>
              </div>
              <img src={photo.url} alt={photo.type} style={{ maxWidth: "100%", maxHeight: "450px", borderRadius: "12px", objectFit: "contain", border: "1px solid var(--border)", background: "#000" }} />
              <div style={{ marginTop: "16px", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <span style={{ fontSize: "11px", color: "var(--text-muted)" }}>Data: {new Date(photo.createdAt).toLocaleDateString("pt-BR")}</span>
                <a href={photo.driveLink} target="_blank" rel="noreferrer" className="btn btn-secondary" style={{ fontSize: "12px", gap: "6px" }}>
                  <Icon name="cloud" size={14} /> Abrir no Google Drive
                </a>
              </div>
            </div>
          </div>
        );
      }

      export default function App() {
        const [tab, setTab] = useState("dashboard");
        const [vehicles, setVehicles] = useState<any[]>([]);
        const [services, setServices] = useState<any[]>([]);
        const [expenses, setExpenses] = useState<any[]>([]);
        const [loading, setLoading] = useState(true);
        const [showReport, setShowReport] = useState(false);
        const [showOSModal, setShowOSModal] = useState<any>(null);
        const [globalViewMode, setGlobalViewMode] = useState("labor");
        const [driveUrl, setDriveUrl] = useState(() => localStorage.getItem("asdcar_drive_url") || "");
        const [showDriveModal, setShowDriveModal] = useState(false);
        const [zoomPhoto, setZoomPhoto] = useState<any>(null);

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
          { id: "dashboard", label: "Início", icon: "home" }, 
          { id: "services", label: "Oficina", icon: "wrench" }, 
          { id: "finance", label: "Financeiro", icon: "finance" }, 
          { id: "vehicles", label: "Carros", icon: "car" }
        ];

        return (
          <div>
            <style>{`
/* ── SISTEMA DE DESIGN GERAL ─────────────────────────────────────────── */
    :root {
      --bg: #090b11;
      --surface: #131722;
      --surface-card: #181d2a;
      --surface-overlay: #1d2436;
      --border: #22293b;
      --border-glow: rgba(249, 115, 22, 0.15);
      --primary: #f97316;
      --primary-hover: #ea580c;
      --primary-glow: rgba(249, 115, 22, 0.25);
      --accent: #8b5cf6;
      --accent-glow: rgba(139, 92, 246, 0.2);
      
      --success: #10b981;
      --success-bg: rgba(16, 185, 129, 0.1);
      --warning: #f59e0b;
      --warning-bg: rgba(245, 158, 11, 0.1);
      --info: #3b82f6;
      --info-bg: rgba(59, 130, 246, 0.1);
      --danger: #ef4444;
      --danger-bg: rgba(239, 68, 68, 0.1);
      
      --text: #f1f5f9;
      --text-muted: #64748b;
      --text-dim: #94a3b8;
      
      --font-title: 'Syne', sans-serif;
      --font-heading: 'Outfit', sans-serif;
      --font-body: 'Inter', sans-serif;
      --font-mono: 'DM Mono', monospace;
      
      --shadow: 0 10px 30px rgba(0, 0, 0, 0.6);
      --transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
    }

    * {
      box-sizing: border-box;
      margin: 0;
      padding: 0;
    }

    body {
      background-color: var(--bg);
      color: var(--text);
      font-family: var(--font-body);
      min-height: 100vh;
      overflow-x: hidden;
      -webkit-font-smoothing: antialiased;
    }

    /* Scrollbar */
    ::-webkit-scrollbar {
      width: 8px;
      height: 8px;
    }
    ::-webkit-scrollbar-track {
      background: var(--bg);
    }
    ::-webkit-scrollbar-thumb {
      background: var(--border);
      border-radius: 4px;
    }
    ::-webkit-scrollbar-thumb:hover {
      background: var(--text-muted);
    }

    .container {
      width: 100%;
      max-width: 1200px;
      margin: 0 auto;
      padding: 20px 16px 100px;
    }

    /* Header */
    header {
      background: rgba(19, 23, 34, 0.8);
      backdrop-filter: blur(12px);
      border-bottom: 1px solid var(--border);
      padding: 16px 24px;
      position: sticky;
      top: 0;
      z-index: 40;
      display: flex;
      align-items: center;
      justify-content: space-between;
      box-shadow: 0 4px 20px rgba(0,0,0,0.3);
    }

    .logo-area {
      display: flex;
      align-items: center;
      gap: 12px;
    }

    .logo-icon {
      width: 40px;
      height: 40px;
      background: linear-gradient(135deg, var(--primary), #ea580c);
      border-radius: 12px;
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 20px;
      box-shadow: 0 0 15px var(--primary-glow);
    }

    .logo-text {
      font-family: var(--font-title);
      font-size: 22px;
      font-weight: 800;
      letter-spacing: 0.5px;
      background: linear-gradient(to right, #fff, #94a3b8);
      -webkit-background-clip: text;
      -webkit-text-fill-color: transparent;
    }

    .status-badge {
      display: flex;
      align-items: center;
      gap: 8px;
      font-size: 11px;
      font-family: var(--font-heading);
      background: rgba(16, 185, 129, 0.08);
      border: 1px solid rgba(16, 185, 129, 0.2);
      color: var(--success);
      padding: 6px 12px;
      border-radius: 20px;
    }
    
    .status-dot {
      width: 6px;
      height: 6px;
      background-color: var(--success);
      border-radius: 50%;
      box-shadow: 0 0 8px var(--success);
      animation: pulse 2s infinite;
    }

    @keyframes pulse {
      0% { transform: scale(1); opacity: 1; }
      50% { transform: scale(1.4); opacity: 0.4; }
      100% { transform: scale(1); opacity: 1; }
    }

    .desktop-nav {
      display: none;
      gap: 8px;
    }

    .bottom-nav {
      position: fixed;
      bottom: 0;
      left: 0;
      right: 0;
      background: rgba(19, 23, 34, 0.9);
      backdrop-filter: blur(16px);
      border-top: 1px solid var(--border);
      padding: 10px 16px calc(10px + env(safe-area-inset-bottom));
      z-index: 40;
      box-shadow: 0 -5px 25px rgba(0,0,0,0.5);
    }

    .nav-inner {
      display: flex;
      justify-content: space-around;
      max-width: 600px;
      margin: 0 auto;
    }

    .nav-item {
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: 4px;
      background: none;
      border: none;
      color: var(--text-muted);
      font-size: 10px;
      font-weight: 600;
      font-family: var(--font-heading);
      cursor: pointer;
      flex: 1;
      transition: var(--transition);
      position: relative;
    }

    .nav-item svg {
      stroke: var(--text-muted);
      transition: var(--transition);
    }

    .nav-item.active {
      color: var(--primary);
    }

    .nav-item.active svg {
      stroke: var(--primary);
      transform: translateY(-2px);
      filter: drop-shadow(0 0 5px var(--primary-glow));
    }

    .nav-item.active::after {
      content: '';
      position: absolute;
      bottom: -6px;
      width: 16px;
      height: 3px;
      background: var(--primary);
      border-radius: 99px;
      box-shadow: 0 0 8px var(--primary);
    }

    @media(min-width: 768px) {
      .desktop-nav {
        display: flex;
      }
      .bottom-nav {
        display: none;
      }
      .container {
        padding-bottom: 40px;
      }
    }

    /* Cards */
    .card {
      background: var(--surface-card);
      border: 1px solid var(--border);
      border-radius: 16px;
      padding: 20px;
      box-shadow: var(--shadow);
      transition: var(--transition);
      position: relative;
      overflow: hidden;
    }

    .card:hover {
      border-color: rgba(249, 115, 22, 0.2);
      box-shadow: 0 15px 35px rgba(0,0,0,0.7);
    }

    .section-header {
      display: flex;
      align-items: center;
      justify-content: space-between;
      margin-bottom: 20px;
    }

    .section-title {
      font-family: var(--font-title);
      font-size: 22px;
      font-weight: 800;
      display: flex;
      align-items: center;
      gap: 10px;
      background: linear-gradient(135deg, #fff, #94a3b8);
      -webkit-background-clip: text;
      -webkit-text-fill-color: transparent;
    }

    /* Botões */
    .btn {
      display: inline-flex;
      align-items: center;
      justify-content: center;
      gap: 8px;
      padding: 10px 20px;
      border-radius: 10px;
      font-family: var(--font-heading);
      font-size: 13px;
      font-weight: 700;
      cursor: pointer;
      border: none;
      transition: var(--transition);
    }

    .btn:active {
      transform: scale(0.96);
    }

    .btn-primary {
      background: linear-gradient(135deg, var(--primary), #ea580c);
      color: #090b11;
      box-shadow: 0 4px 15px var(--primary-glow);
    }

    .btn-primary:hover {
      background: linear-gradient(135deg, #ea580c, #c2410c);
      box-shadow: 0 6px 20px rgba(249, 115, 22, 0.4);
    }

    .btn-accent {
      background: linear-gradient(135deg, var(--accent), #7c3aed);
      color: #fff;
      box-shadow: 0 4px 15px var(--accent-glow);
    }

    .btn-accent:hover {
      background: linear-gradient(135deg, #7c3aed, #6d28d9);
      box-shadow: 0 6px 20px rgba(139, 92, 246, 0.4);
    }

    .btn-secondary {
      background: var(--surface);
      border: 1px solid var(--border);
      color: var(--text-dim);
    }

    .btn-secondary:hover {
      background: var(--surface-overlay);
      color: #fff;
      border-color: var(--text-muted);
    }

    .btn-danger-ghost {
      background: rgba(239, 68, 68, 0.05);
      border: 1px solid rgba(239, 68, 68, 0.15);
      color: var(--danger);
    }

    .btn-danger-ghost:hover {
      background: rgba(239, 68, 68, 0.15);
      border-color: var(--danger);
    }

    .form-group {
      margin-bottom: 16px;
    }

    .label {
      display: block;
      font-size: 11px;
      font-weight: 700;
      color: var(--text-muted);
      margin-bottom: 6px;
      text-transform: uppercase;
      letter-spacing: 0.5px;
      font-family: var(--font-heading);
    }

    .input, .select, .textarea {
      width: 100%;
      background: var(--surface);
      border: 1px solid var(--border);
      color: var(--text);
      padding: 12px 14px;
      border-radius: 10px;
      font-family: var(--font-body);
      font-size: 13px;
      transition: var(--transition);
      outline: none;
    }

    .input:focus, .select:focus, .textarea:focus {
      border-color: var(--primary);
      box-shadow: 0 0 0 3px var(--primary-glow);
    }

    .textarea {
      resize: vertical;
      min-height: 90px;
      line-height: 1.5;
    }

    .form-grid-2 {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 12px;
    }

    /* Placa Mercosul */
    .plate-badge {
      display: inline-flex;
      flex-direction: column;
      border: 2px solid #1e40af;
      border-radius: 6px;
      overflow: hidden;
      width: 105px;
      height: 32px;
      background: #fff;
      box-shadow: 0 4px 10px rgba(0,0,0,0.15);
      font-family: var(--font-mono);
      flex-shrink: 0;
    }

    .plate-top {
      height: 8px;
      background: #1e40af;
      color: #fff;
      font-size: 5px;
      font-weight: 700;
      text-align: center;
      line-height: 8px;
      letter-spacing: 0.5px;
      text-transform: uppercase;
    }

    .plate-number {
      height: 20px;
      color: #111827;
      font-size: 14px;
      font-weight: 800;
      text-align: center;
      line-height: 20px;
      letter-spacing: 1px;
      text-transform: uppercase;
    }

    /* Badges */
    .badge {
      display: inline-flex;
      align-items: center;
      gap: 6px;
      padding: 6px 12px;
      border-radius: 20px;
      font-size: 11px;
      font-weight: 700;
      font-family: var(--font-heading);
      border: 1px solid transparent;
      width: fit-content;
    }

    .badge-aguardando {
      background: var(--warning-bg);
      color: var(--warning);
      border-color: rgba(245, 158, 11, 0.15);
    }
    .badge-andamento {
      background: var(--info-bg);
      color: var(--info);
      border-color: rgba(59, 130, 246, 0.15);
    }
    .badge-pronto {
      background: var(--success-bg);
      color: var(--success);
      border-color: rgba(16, 185, 129, 0.15);
    }
    .badge-entregue {
      background: rgba(100, 116, 139, 0.08);
      color: var(--text-dim);
      border-color: rgba(100, 116, 139, 0.15);
    }

    .list-container {
      display: flex;
      flex-direction: column;
      gap: 12px;
      margin-top: 12px;
    }

    .item-card {
      background: var(--surface-card);
      border: 1px solid var(--border);
      border-radius: 12px;
      padding: 16px;
      display: grid;
      grid-template-columns: 1fr;
      gap: 12px;
      align-items: center;
      transition: var(--transition);
    }

    .item-card:hover {
      border-color: var(--border-glow);
      transform: translateY(-2px);
    }

    @media (min-width: 768px) {
      .item-card {
        grid-template-columns: 1.5fr 1fr 1fr 1fr auto;
        gap: 16px;
      }
    }

    .item-details h4 {
      font-family: var(--font-heading);
      font-size: 15px;
      font-weight: 600;
      margin-bottom: 4px;
      color: var(--text);
    }

    .item-details p {
      font-size: 12px;
      color: var(--text-muted);
    }

    .value-highlight {
      font-family: var(--font-mono);
      font-size: 14px;
      font-weight: 700;
      color: var(--success);
    }

    .actions-cell {
      display: flex;
      gap: 6px;
      justify-content: flex-end;
    }

    .icon-btn {
      width: 34px;
      height: 34px;
      background: var(--surface);
      border: 1px solid var(--border);
      border-radius: 8px;
      color: var(--text-dim);
      display: flex;
      align-items: center;
      justify-content: center;
      cursor: pointer;
      transition: var(--transition);
    }

    .icon-btn:hover {
      color: var(--primary);
      border-color: var(--primary);
      background: var(--surface-overlay);
    }

    /* KPIs */
    .kpis-grid {
      display: grid;
      grid-template-columns: repeat(2, 1fr);
      gap: 12px;
      margin-bottom: 20px;
    }

    @media (max-width: 767px) {
      .kpis-grid > .kpi-card:last-child {
        grid-column: span 2;
      }
    }

    @media (min-width: 768px) {
      .kpis-grid {
        grid-template-columns: repeat(5, 1fr);
        gap: 16px;
      }
    }

    .kpi-card {
      background: var(--surface-card);
      border: 1px solid var(--border);
      border-radius: 16px;
      padding: 16px;
      display: flex;
      flex-direction: column;
      gap: 8px;
      position: relative;
      overflow: hidden;
      transition: var(--transition);
    }

    .kpi-card:hover {
      transform: translateY(-3px);
    }

    .kpi-icon-wrap {
      width: 36px;
      height: 36px;
      border-radius: 10px;
      display: flex;
      align-items: center;
      justify-content: center;
      color: #fff;
    }

    .kpi-value {
      font-family: var(--font-mono);
      font-size: 18px;
      font-weight: 700;
      color: var(--text);
    }

    .kpi-label {
      font-size: 10px;
      font-weight: 700;
      color: var(--text-muted);
      text-transform: uppercase;
      letter-spacing: 0.5px;
    }

    /* Modais */
    .modal-overlay {
      position: fixed;
      inset: 0;
      background: rgba(5, 7, 12, 0.85);
      backdrop-filter: blur(8px);
      z-index: 100;
      display: flex;
      align-items: center;
      justify-content: center;
      padding: 16px;
      animation: fadeIn 0.2s cubic-bezier(0.4, 0, 0.2, 1) both;
    }

    .modal-content {
      background: var(--surface-card);
      border: 1px solid var(--border);
      border-radius: 20px;
      width: 100%;
      max-width: 520px;
      max-height: 90vh;
      overflow-y: auto;
      padding: 24px;
      box-shadow: 0 25px 50px rgba(0, 0, 0, 0.8);
      position: relative;
      animation: slideUp 0.3s cubic-bezier(0.2, 0.8, 0.2, 1) both;
    }

    .modal-header {
      display: flex;
      align-items: center;
      justify-content: space-between;
      margin-bottom: 20px;
      border-bottom: 1px solid var(--border);
      padding-bottom: 12px;
    }

    .modal-title {
      font-family: var(--font-heading);
      font-size: 18px;
      font-weight: 700;
    }

    .modal-close {
      background: none;
      border: none;
      color: var(--text-muted);
      cursor: pointer;
      display: flex;
      align-items: center;
      justify-content: center;
      transition: var(--transition);
    }

    .modal-close:hover {
      color: #fff;
    }

    @keyframes fadeIn {
      from { opacity: 0; }
      to { opacity: 1; }
    }

    @keyframes slideUp {
      from { transform: translateY(20px); opacity: 0; }
      to { transform: translateY(0); opacity: 1; }
    }

    /* Autocomplete */
    .dropdown-suggest {
      position: absolute;
      top: 100%;
      left: 0;
      right: 0;
      background: var(--surface-overlay);
      border: 1px solid var(--primary);
      border-radius: 10px;
      max-height: 180px;
      overflow-y: auto;
      z-index: 200;
      margin-top: 4px;
      box-shadow: 0 10px 25px rgba(0,0,0,0.8);
    }

    .suggest-item {
      padding: 12px 16px;
      font-size: 13px;
      cursor: pointer;
      border-bottom: 1px solid var(--border);
      transition: var(--transition);
    }

    .suggest-item:hover {
      background: var(--surface);
      color: var(--primary);
    }

    .suggest-item-sub {
      font-size: 11px;
      color: var(--text-muted);
      margin-top: 2px;
    }

    .empty-state {
      text-align: center;
      padding: 40px 20px;
      color: var(--text-muted);
      font-size: 13px;
    }

    /* Filter Tabs */
    .filter-tabs {
      display: flex;
      flex-wrap: wrap;
      gap: 8px;
      margin-top: 4px;
    }

    .filter-tab {
      background: var(--surface-card);
      border: 1px solid var(--border);
      color: var(--text-dim);
      padding: 8px 16px;
      border-radius: 20px;
      font-size: 12px;
      font-weight: 600;
      font-family: var(--font-heading);
      cursor: pointer;
      transition: var(--transition);
      outline: none;
      -webkit-tap-highlight-color: transparent;
    }

    .filter-tab:hover {
      border-color: var(--primary);
      color: var(--text);
      background: var(--surface-overlay);
    }

    .filter-tab.active {
      background: var(--primary);
      color: #090b11;
      border-color: var(--primary);
      font-weight: 700;
      box-shadow: 0 0 12px var(--primary-glow);
    }

    @media (max-width: 767px) {
      .filter-tabs {
        display: flex;
        flex-wrap: wrap;
        gap: 6px;
        width: 100%;
      }
      .filter-tab {
        flex: 1 1 auto;
        padding: 8px 10px;
        font-size: 11px;
        text-align: center;
        white-space: nowrap;
      }
    }
            `}</style>
            <header>
              <div className="logo-area">
                <div className="logo-icon">🚗</div>
                <div className="logo-text">ASDCAR</div>
              </div>
              
              <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                <button 
                  className="btn btn-secondary" 
                  style={{ padding: "6px 12px", fontSize: "11px", gap: "4px" }}
                  onClick={() => setShowDriveModal(true)}
                  title="Configurar Google Drive"
                >
                  <Icon name="cloud" size={13} color={driveUrl ? "var(--success)" : "var(--text-dim)"} />
                  {driveUrl ? "Drive Ok" : "Conectar Drive"}
                </button>
                <div className="status-badge">
                  <div className="status-dot"></div>
                  Sistema Conectado
                </div>
                <button 
                  className="btn btn-accent" 
                  style={{ padding: "8px 14px", fontSize: "12px" }}
                  onClick={() => setShowReport(true)}
                >
                  <Icon name="file" size={14} color="#fff" /> Fechamento
                </button>
              </div>

              <div className="desktop-nav">
                {tabs.map(t => (
                  <button 
                    key={t.id} 
                    className={`btn ${tab === t.id ? "btn-primary" : "btn-secondary"}`} 
                    onClick={() => setTab(t.id)}
                    style={{ gap: "6px" }}
                  >
                    <Icon name={t.icon} size={15} color={tab === t.id ? "#090b11" : "var(--text-dim)"} />
                    {t.label}
                  </button>
                ))}
              </div>
            </header>

            <main className="container">
              {loading ? (
                <div style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", padding: "120px 20px", gap: "16px" }}>
                  <div className="status-dot" style={{ width: "24px", height: "24px", backgroundColor: "var(--primary)", boxShadow: "0 0 15px var(--primary)" }}></div>
                  <div style={{ color: "var(--text-dim)", fontWeight: 600, fontSize: "14px", letterSpacing: "0.5px" }}>Sincronizando Banco de Dados...</div>
                </div>
              ) : (
                <>
                  {tab === "dashboard" && <Dashboard services={services} viewMode={globalViewMode} setViewMode={setGlobalViewMode} />}
                  {tab === "services" && <ServicesTab services={services} vehicles={vehicles} loadAll={loadAll} onOpenOS={(s) => setShowOSModal(s)} driveUrl={driveUrl} onOpenDriveConfig={() => setShowDriveModal(true)} onZoomPhoto={(p) => setZoomPhoto(p)} />}
                  {tab === "finance" && <FinanceTab services={services} expenses={expenses} loadAll={loadAll} viewMode={globalViewMode} setViewMode={setGlobalViewMode} />}
                  {tab === "vehicles" && <VehiclesTab vehicles={vehicles} services={services} loadAll={loadAll} />}
                </>
              )}
            </main>

            <nav className="bottom-nav">
              <div className="nav-inner">
                {tabs.map(t => (
                  <button key={t.id} className={`nav-item ${tab === t.id ? "active" : ""}`} onClick={() => setTab(t.id)}>
                    <Icon name={t.icon} size={20} />
                    {t.label}
                  </button>
                ))}
              </div>
            </nav>

            {showReport && (
              <ReportModal 
                services={services} 
                viewMode={globalViewMode} 
                onClose={() => setShowReport(false)} 
                onGenerate={(f, t) => { generatePDF(vehicles, services, expenses, f, t, globalViewMode); setShowReport(false); }} 
              />
            )}
                        {showDriveModal && (
              <DriveModal 
                driveUrl={driveUrl} 
                onSave={(url) => { localStorage.setItem("asdcar_drive_url", url); setDriveUrl(url); }} 
                onClose={() => setShowDriveModal(false)} 
              />
            )}
            {zoomPhoto && <PhotoZoomModal photo={zoomPhoto} onClose={() => setZoomPhoto(null)} />}
            {showOSModal && <OSModal service={showOSModal} vehicles={vehicles} onClose={() => setShowOSModal(null)} />}
          </div>
        );
      }

      function Dashboard({ services, viewMode, setViewMode }: any) {
        const [selMonth, setSelMonth] = useState(new Date().getMonth());
        const [selYear, setSelYear] = useState(new Date().getFullYear());

        const activeServices = services.filter(s => s.status !== "Entregue");
        const filteredDelivered = services.filter(s => {
          if (s.status !== "Entregue" || !s.exitDate) return false;
          const d = new Date(s.exitDate + "T12:00:00");
          return d.getMonth() === selMonth && d.getFullYear() === selYear;
        });

        const tP = filteredDelivered.reduce((acc, s) => acc + (Number(s.partsValue) || 0), 0);
        const tL = filteredDelivered.reduce((acc, s) => acc + (Number(s.laborValue) || 0), 0);
        const ticketMedioVal = filteredDelivered.length > 0 ? (tL / filteredDelivered.length) : 0;

        const receitaCalculada = filteredDelivered.reduce((acc, s) => {
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
          <div style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
            <div className="card" style={{ display: "flex", flexWrap: "wrap", gap: "16px", background: "var(--surface)" }}>
              <div style={{ flex: "1 1 200px" }}>
                <label className="label">Mês de Referência</label>
                <select className="select" value={selMonth} onChange={(e) => setSelMonth(Number(e.target.value))}>
                  {MONTHS.map((m, i) => <option key={i} value={i}>{m}</option>)}
                </select>
              </div>
              <div style={{ flex: "1 1 100px" }}>
                <label className="label">Ano</label>
                <select className="select" value={selYear} onChange={(e) => setSelYear(Number(e.target.value))}>
                  {[2024, 2025, 2026, 2027].map(y => <option key={y} value={y}>{y}</option>)}
                </select>
              </div>
              <div style={{ flex: "2 1 300px" }}>
                <label className="label">Modelo de Filtro (Painel & PDF)</label>
                <select className="select" value={viewMode} onChange={(e) => setViewMode(e.target.value)}>
                  <option value="labor">Mão de Obra Líquida (Desconta taxas de cartão)</option>
                  <option value="total">Faturamento Bruto Líquido (Faturamento total com taxas descontadas)</option>
                </select>
              </div>
            </div>

            <div className="kpis-grid">
              {[
                { label: "Pátio Oficina", value: activeServices.length, icon: "wrench", bg: "var(--primary)", glow: "var(--primary-glow)" },
                { label: `Peças (${MONTHS[selMonth].slice(0,3)})`, value: fmt(tP), icon: "car", bg: "var(--accent)", glow: "var(--accent-glow)" },
                { label: `M.O. (${MONTHS[selMonth].slice(0,3)})`, value: fmt(tL), icon: "wrench", bg: "var(--success)", glow: "rgba(16,185,129,0.2)" },
                { label: `Ticket Médio M.O.`, value: fmt(ticketMedioVal), icon: "finance", bg: "var(--warning)", glow: "rgba(245, 158, 11, 0.2)" },
                { label: viewMode === "labor" ? "M.O. Líquida" : "Faturamento Líq.", value: fmt(receitaCalculada), icon: "finance", bg: "var(--info)", glow: "rgba(59,130,246,0.2)" },
              ].map((k, i) => (
                <div key={i} className="kpi-card">
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                    <div className="kpi-icon-wrap" style={{ backgroundColor: k.bg, boxShadow: `0 0 10px ${k.glow}` }}>
                      <Icon name={k.icon} size={16} color="#090b11" />
                    </div>
                    <div style={{ fontSize: "10px", color: "var(--success)", fontWeight: 700 }}>{i === 4 ? "LÍQUIDO" : ""}</div>
                  </div>
                  <div className="kpi-value" style={{ marginTop: "12px", color: i === 4 ? "var(--success)" : "var(--text)" }}>{k.value}</div>
                  <div className="kpi-label">{k.label}</div>
                </div>
              ))}
            </div>

            <div style={{ display: "grid", gridTemplateColumns: "1fr", gap: "20px" }} className="responsive-grid">
              <div className="card">
                <div className="section-header">
                  <h3 className="section-title">🛠️ Carros na Oficina ({activeServices.length})</h3>
                </div>
                {activeServices.length === 0 ? (
                  <div className="empty-state">Pátio livre de serviços pendentes.</div>
                ) : (
                  <div className="list-container">
                    {activeServices.map(sv => (
                      <div key={sv.id} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "12px 0", borderBottom: "1px solid var(--border)" }}>
                        <div>
                          <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                            <span className="plate-badge">
                              <span className="plate-top">BRASIL</span>
                              <span className="plate-number">{sv.vehiclePlate}</span>
                            </span>
                            <span style={{ fontSize: "13px", fontWeight: 700 }}>{sv.vehicleBrand} {sv.vehicleModel}</span>
                          </div>
                          <p style={{ fontSize: "11px", color: "var(--text-muted)", marginTop: "6px" }}>{sv.description.split("||")[0]}</p>
                        </div>
                        <span className={`badge badge-${statusClass(sv.status)}`}>{sv.status}</span>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              <div className="card">
                <div className="section-header">
                  <h3 className="section-title" style={{ color: "var(--success)" }}>✅ Finalizados & Entregues ({filteredDelivered.length})</h3>
                </div>
                {filteredDelivered.length === 0 ? (
                  <div className="empty-state">Nenhum serviço concluído no período.</div>
                ) : (
                  <div className="list-container">
                    {filteredDelivered.map(sv => (
                      <div key={sv.id} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "12px 0", borderBottom: "1px solid var(--border)" }}>
                        <div>
                          <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                            <span className="plate-badge">
                              <span className="plate-top">BRASIL</span>
                              <span className="plate-number">{sv.vehiclePlate}</span>
                            </span>
                            <span style={{ fontSize: "13px", fontWeight: 700 }}>{sv.vehicleBrand} {sv.vehicleModel}</span>
                          </div>
                          <p style={{ fontSize: "11px", color: "var(--text-muted)", marginTop: "6px" }}>Entregue em: {fmtDate(sv.exitDate)}</p>
                        </div>
                        <div style={{ textAlign: "right" }}>
                          <div className="value-highlight">{fmt(Number(sv.partsValue) + Number(sv.laborValue))}</div>
                          <span style={{ fontSize: "9px", color: "var(--text-muted)", textTransform: "uppercase" }}>{sv.paymentMethod}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        );
      }

      function statusClass(status: any) {
        if (status === "Aguardando") return "aguardando";
        if (status === "Em andamento") return "andamento";
        if (status === "Pronto") return "pronto";
        return "entregue";
      }

      function ServicesTab({ services, vehicles, loadAll, onOpenOS }) {
        const [modal, setModal] = useState(false);
        const [editing, setEditing] = useState<any>(null);
        const [form, setForm] = useState({});
        const [search, setSearch] = useState("");
        const [partsOwner, setPartsOwner] = useState("oficina"); 
        const [oficinaPartsText, setOficinaPartsText] = useState("");
        const [clientePartsText, setClientePartsText] = useState("");
        const [filterStatus, setFilterStatus] = useState("");
        const [photoType, setPhotoType] = useState("Vistoria / Avarias");
        const [uploading, setUploading] = useState(false);
        const [uploadStatus, setUploadStatus] = useState("");
        const fileInputRef = useRef(null);

        const handleUploadPhoto = async (file: any) => {
          if (!file) return;
          if (!driveUrl) {
            alert("Por favor, conecte seu Google Drive primeiro no botão do topo ('Conectar Drive')!");
            onOpenDriveConfig();
            return;
          }
          const v = vehicles.find(veh => veh.id === form.vehicleId);
          const plate = v?.plate || "GERAL";
          
          setUploading(true);
          setUploadStatus("⏳ Otimizando foto e enviando ao Google Drive...");
          
          try {
            const comp = await compressImage(file);
            const payload = {
              plate: plate,
              filename: `foto_${plate}_${Date.now()}.jpg`,
              mimeType: comp.mimeType,
              base64: comp.base64
            };

            const resp = await fetch(driveUrl, {
              method: "POST",
              headers: { "Content-Type": "text/plain;charset=utf-8" },
              body: JSON.stringify(payload)
            });
            const resData = await resp.json();
            
            if (resData.success) {
              const newPhoto = {
                id: resData.fileId,
                url: resData.url,
                driveLink: resData.driveLink,
                type: photoType,
                createdAt: new Date().toISOString()
              };
              const currentPhotos = form.photos || [];
              setForm({ ...form, photos: [...currentPhotos, newPhoto] });
              setUploadStatus("✅ Foto anexada com sucesso!");
              setTimeout(() => setUploadStatus(""), 3000);
            } else {
              throw new Error(resData.error || "Erro no upload");
            }
mport { useState, useEffect, useRef } from "react";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

// Inicialização do cliente Supabase
      const supabase = createClient(
        "https://bofhihxpqmqimkanwkyw.supabase.co",
        "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImJvZmhpaHhwcW1xaW1rYW53a3l3Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzUwODQ3OTMsImV4cCI6MjA5MDY2MDc5M30.fOOD-FweGID1x2mlJ3LWImtw7B6m6Pc-8auXLIuCqbw"
      );

      // CONSTANTES
      const PAYMENT_METHODS = {import { useState, useEffect, useRef } from "react";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

// Inicialização do cliente Supabase
      const supabase = createClient(
        "https://bofhihxpqmqimkanwkyw.supabase.co",
        "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImJvZmhpaHhwcW1xaW1rYW53a3l3Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzUwODQ3OTMsImV4cCI6MjA5MDY2MDc5M30.fOOD-FweGID1x2mlJ3LWImtw7B6m6Pc-8auXLIuCqbw"
      );

      // CONSTANTES
      const PAYMENT_METHODS = {
        "Dinheiro": 0, "Pix": 0, "Débito": 1.9,
        "Crédito 1x": 0.79, "Crédito 2x": 1.58, "Crédito 3x": 2.37, "Crédito 4x": 3.16,
        "Crédito 5x": 3.95, "Crédito 6x": 4.74, "Crédito 7x": 5.53, "Crédito 8x": 6.32,
        "Crédito 9x": 7.11, "Crédito 10x": 7.90, "Crédito 11x": 8.69, "Crédito 12x": 9.48
      };

      const STATUS_COLORS = { 
        "Aguardando": "#f59e0b", 
        "Em andamento": "#3b82f6", 
        "Pronto": "#10b981", 
        "Entregue": "#64748b" 
      };

      const MONTHS = ["Janeiro", "Fevereiro", "Março", "Abril", "Maio", "Junho", "Julho", "Agosto", "Setembro", "Outubro", "Novembro", "Dezembro"];
      const CAR_BRANDS = ["Audi", "BMW", "BYD", "Chevrolet", "Citroën", "Ferrari", "Fiat", "Ford", "GWM", "Honda", "Hyundai", "JAC", "Jaguar", "Jeep", "Kia", "Land Rover", "Mercedes-Benz", "Mitsubishi", "Nissan", "Peugeot", "Porsche", "RAM", "Renault", "Toyota", "Volkswagen", "Volvo"].sort();

      // Ícones
      function Icon({ name, size = 18, color = "currentColor", className = "" }: any) {
        const paths = {
          home: <path d="m3 9 9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/>,
          wrench: <path d="M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.8-3.8a6 6 0 0 1-7.9 7.9L6.7 20.3a2.1 2.1 0 0 1-3-3l6.9-6.9a6 6 0 0 1 7.9-7.9z"/>,
          finance: <g><rect width="20" height="12" x="2" y="6" rx="2"/><circle cx="12" cy="12" r="2"/></g>,
          car: <g><path d="M19 17h2c.6 0 1-.4 1-1v-3c0-.9-.7-1.7-1.5-1.9L18.4 6c-.3-.6-.9-1-1.6-1H7.2c-.7 0-1.3.4-1.6 1l-2.1 5.1C2.7 11.3 2 12.1 2 13v3c0 .6.4 1 1 1h2"/><circle cx="7" cy="17" r="2"/><circle cx="17" cy="17" r="2"/></g>,
          plus: <path d="M5 12h14M12 5v14"/>,
          edit: <path d="M12 20h9M16.5 3.5a2.12 2.12 0 0 1 3 3L7 19l-4 1 1-4Z"/>,
          history: <g><path d="M3 12a9 9 0 1 0 9-9 9.75 9.75 0 0 0-6.74 2.74L3 8"/><path d="M3 3v5h5M12 7v5l4 2"/></g>,
          file: <g><path d="M15 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7Z"/><path d="M14 2v4a2 2 0 0 0 2 2h4"/></g>,
          x: <path d="M18 6 6 18M6 6l12 12"/>,
          search: <g><circle cx="11" cy="11" r="8"/><path d="m21 21-4.3-4.3"/></g>,
          trash: <path d="M3 6h18M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2"/>,
          camera: <g><path d="M14.5 4h-5L7 7H4a2 2 0 0 0-2 2v9a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2V9a2 2 0 0-2-2h-3l-2.5-3z"/><circle cx="12" cy="13" r="3"/></g>,
          cloud: <path d="M17.5 19H9a7 7 0 1 1 6.71-9h1.79a4.5 4.5 0 1 1 0 9Z"/>,
          image: <g><rect width="18" height="18" x="3" y="3" rx="2" ry="2"/><circle cx="9" cy="9" r="2"/><path d="m21 15-3.086-3.086a2 2 0 0 0-2.828 0L6 21"/></g>
        };

        const pathElem = paths[name];
        if (!pathElem) return null;

        return (
          <svg 
            xmlns="http://www.w3.org/2000/svg" 
            width={size} 
            height={size} 
            viewBox="0 0 24 24" 
            fill="none" 
            stroke={color} 
            strokeWidth="2.2" 
            strokeLinecap="round" 
            strokeLinejoin="round"
            className={className}
          >
            {pathElem}
          </svg>
        );
      }

      // FORMATAÇÕES
      const uid = () => Math.random().toString(36).slice(2, 10);
      const fmt = (n: any) => new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(n || 0);
      const fmtKm = (n: any) => n ? Number(n).toLocaleString("pt-BR") + " km" : "—";
      const today = () => new Date().toISOString().slice(0, 10);
      const fmtDate = (d: any) => d ? new Date(d + "T12:00:00").toLocaleDateString("pt-BR") : "—";

      const mapV = (r: any) => ({
        id: r.id, plate: r.plate, brand: r.brand, model: r.model, year: r.year, 
        color: r.color, owner: r.owner, phone: r.phone, notes: r.notes, 
        mileage: r.mileage || 0, createdAt: r.created_at
      });

      
      function compressImage(file, maxWidth = 1600, quality = 0.8) {
        return new Promise((resolve, reject) => {
          const reader = new FileReader();
          reader.readAsDataURL(file);
          reader.onload = (e) => {
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
              ctx.drawImage(img, 0, 0, width, height);
              const dataUrl = canvas.toDataURL('image/jpeg', quality);
              const base64 = dataUrl.split(',')[1];
              resolve({ base64, mimeType: 'image/jpeg', dataUrl });
            };
            img.onerror = (err) => reject(err);
          };
          reader.onerror = (err) => reject(err);
        });
      }

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

      function BrandSelector({ value, onChange }: any) {
        const [query, setQuery] = useState(value || "");
        const [open, setOpen] = useState(false);
        const ref = useRef(null);
        const filtered = CAR_BRANDS.filter(b => b.toLowerCase().includes(query.toLowerCase()));
        
        useEffect(() => { setQuery(value || ""); }, [value]);
        useEffect(() => {
          function handleClick(e) { if (ref.current && !ref.current.contains(e.target)) setOpen(false); }
          document.addEventListener("mousedown", handleClick); 
          return () => document.removeEventListener("mousedown", handleClick);
        }, []);

        return (
          <div ref={ref} style={{ position: "relative" }} className="form-group">
            <label className="label">Marca *</label>
            <input 
              className="input" 
              placeholder="Digite ou escolha a marca..." 
              value={query} 
              onFocus={() => setOpen(true)} 
              onChange={e => { setQuery(e.target.value); onChange(e.target.value); setOpen(true); }} 
              autoComplete="off" 
            />
            {open && filtered.length > 0 && (
              <div className="dropdown-suggest">
                {filtered.map(b => (
                  <div 
                    key={b} 
                    onClick={() => { onChange(b); setQuery(b); setOpen(false); }} 
                    className="suggest-item"
                    style={{ color: value === b ? "var(--primary)" : "var(--text)" }}
                  >
                    {b}
                  </div>
                ))}
              </div>
            )}
          </div>
        );
      }

      function VehicleSelector({ vehicles, value, onChange }: any) {
        const [query, setQuery] = useState("");
        const [open, setOpen] = useState(false);
        const ref = useRef(null);
        const selected = vehicles.find(v => v.id === value);
        const displayValue = selected ? `${selected.plate} — ${selected.brand} ${selected.model}` : query;
        const filtered = vehicles.filter(v => 
          (v.plate || "").toLowerCase().includes(query.toLowerCase()) || 
          (v.model || "").toLowerCase().includes(query.toLowerCase())
        ).slice(0, 10);

        useEffect(() => {
          function handleClick(e) { if (ref.current && !ref.current.contains(e.target)) setOpen(false); }
          document.addEventListener("mousedown", handleClick); 
          return () => document.removeEventListener("mousedown", handleClick);
        }, []);

        return (
          <div ref={ref} style={{ position: "relative" }} className="form-group">
            <label className="label">Carro *</label>
            <input 
              className="input" 
              placeholder="Busque placa ou modelo..." 
              value={open ? query : displayValue} 
              onFocus={() => { setOpen(true); setQuery(""); }} 
              onChange={e => setQuery(e.target.value)} 
              autoComplete="off" 
            />
            {open && (
              <div className="dropdown-suggest">
                {filtered.map(v => (
                  <div 
                    key={v.id} 
                    onClick={() => { onChange(v.id); setOpen(false); }} 
                    className="suggest-item"
                  >
                    <div style={{ fontWeight: 700, fontSize: "13px" }}>{v.plate}</div>
                    <div className="suggest-item-sub">{v.brand} {v.model} {v.owner ? `· ${v.owner}` : ""}</div>
                  </div>
                ))}
              </div>
            )}
          </div>
        );
      }

      
      function DriveModal({ driveUrl, onSave, onClose }: any) {
        const [urlInput, setUrlInput] = useState(driveUrl || "");
        return (
          <div className="modal-overlay" onClick={onClose}>
            <div className="modal-content" onClick={e => e.stopPropagation()}>
              <div className="modal-header">
                <h3 className="modal-title">⚙️ Conectar Google Drive</h3>
                <button className="modal-close" onClick={onClose}><Icon name="x" size={18} /></button>
              </div>
              <p style={{ fontSize: "12px", color: "var(--text-muted)", marginBottom: "16px", lineHeight: "1.5" }}>
                Cole abaixo a URL do seu Web App criado no Google Apps Script. As fotos das vistorias e serviços serão salvas automaticamente na pasta <strong>ASDCAR_Fotos</strong> do seu Google Drive.
              </p>
              <div className="form-group">
                <label className="label">URL do Web App do Google Drive *</label>
                <input 
                  className="input" 
                  placeholder="https://script.google.com/macros/s/.../exec" 
                  value={urlInput} 
                  onChange={e => setUrlInput(e.target.value)} 
                />
              </div>
              <button className="btn btn-primary" style={{ width: "100%", marginTop: "16px", height: "44px" }} onClick={() => { onSave(urlInput.trim()); onClose(); }}>
                Salvar Conexão do Google Drive
              </button>
            </div>
          </div>
        );
      }

      function PhotoZoomModal({ photo, onClose }: any) {
        if (!photo) return null;
        return (
          <div className="modal-overlay" onClick={onClose}>
            <div className="modal-content" style={{ maxWidth: "650px", textAlign: "center" }} onClick={e => e.stopPropagation()}>
              <div className="modal-header">
                <h3 className="modal-title">{photo.type || "Foto da Vistoria"}</h3>
                <button className="modal-close" onClick={onClose}><Icon name="x" size={18} /></button>
              </div>
              <img src={photo.url} alt={photo.type} style={{ maxWidth: "100%", maxHeight: "450px", borderRadius: "12px", objectFit: "contain", border: "1px solid var(--border)", background: "#000" }} />
              <div style={{ marginTop: "16px", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <span style={{ fontSize: "11px", color: "var(--text-muted)" }}>Data: {new Date(photo.createdAt).toLocaleDateString("pt-BR")}</span>
                <a href={photo.driveLink} target="_blank" rel="noreferrer" className="btn btn-secondary" style={{ fontSize: "12px", gap: "6px" }}>
                  <Icon name="cloud" size={14} /> Abrir no Google Drive
                </a>
              </div>
            </div>
          </div>
        );
      }

      export default function App() {
        const [tab, setTab] = useState("dashboard");
        const [vehicles, setVehicles] = useState<any[]>([]);
        const [services, setServices] = useState<any[]>([]);
        const [expenses, setExpenses] = useState<any[]>([]);
        const [loading, setLoading] = useState(true);
        const [showReport, setShowReport] = useState(false);
        const [showOSModal, setShowOSModal] = useState<any>(null);
        const [globalViewMode, setGlobalViewMode] = useState("labor");
        const [driveUrl, setDriveUrl] = useState(() => localStorage.getItem("asdcar_drive_url") || "");
        const [showDriveModal, setShowDriveModal] = useState(false);
        const [zoomPhoto, setZoomPhoto] = useState<any>(null);

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
          { id: "dashboard", label: "Início", icon: "home" }, 
          { id: "services", label: "Oficina", icon: "wrench" }, 
          { id: "finance", label: "Financeiro", icon: "finance" }, 
          { id: "vehicles", label: "Carros", icon: "car" }
        ];

        return (
          <div>
            <style>{`
/* ── SISTEMA DE DESIGN GERAL ─────────────────────────────────────────── */
    :root {
      --bg: #090b11;
      --surface: #131722;
      --surface-card: #181d2a;
      --surface-overlay: #1d2436;
      --border: #22293b;
      --border-glow: rgba(249, 115, 22, 0.15);
      --primary: #f97316;
      --primary-hover: #ea580c;
      --primary-glow: rgba(249, 115, 22, 0.25);
      --accent: #8b5cf6;
      --accent-glow: rgba(139, 92, 246, 0.2);
      
      --success: #10b981;
      --success-bg: rgba(16, 185, 129, 0.1);
      --warning: #f59e0b;
      --warning-bg: rgba(245, 158, 11, 0.1);
      --info: #3b82f6;
      --info-bg: rgba(59, 130, 246, 0.1);
      --danger: #ef4444;
      --danger-bg: rgba(239, 68, 68, 0.1);
      
      --text: #f1f5f9;
      --text-muted: #64748b;
      --text-dim: #94a3b8;
      
      --font-title: 'Syne', sans-serif;
      --font-heading: 'Outfit', sans-serif;
      --font-body: 'Inter', sans-serif;
      --font-mono: 'DM Mono', monospace;
      
      --shadow: 0 10px 30px rgba(0, 0, 0, 0.6);
      --transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
    }

    * {
      box-sizing: border-box;
      margin: 0;
      padding: 0;
    }

    body {
      background-color: var(--bg);
      color: var(--text);
      font-family: var(--font-body);
      min-height: 100vh;
      overflow-x: hidden;
      -webkit-font-smoothing: antialiased;
    }

    /* Scrollbar */
    ::-webkit-scrollbar {
      width: 8px;
      height: 8px;
    }
    ::-webkit-scrollbar-track {
      background: var(--bg);
    }
    ::-webkit-scrollbar-thumb {
      background: var(--border);
      border-radius: 4px;
    }
    ::-webkit-scrollbar-thumb:hover {
      background: var(--text-muted);
    }

    .container {
      width: 100%;
      max-width: 1200px;
      margin: 0 auto;
      padding: 20px 16px 100px;
    }

    /* Header */
    header {
      background: rgba(19, 23, 34, 0.8);
      backdrop-filter: blur(12px);
      border-bottom: 1px solid var(--border);
      padding: 16px 24px;
      position: sticky;
      top: 0;
      z-index: 40;
      display: flex;
      align-items: center;
      justify-content: space-between;
      box-shadow: 0 4px 20px rgba(0,0,0,0.3);
    }

    .logo-area {
      display: flex;
      align-items: center;
      gap: 12px;
    }

    .logo-icon {
      width: 40px;
      height: 40px;
      background: linear-gradient(135deg, var(--primary), #ea580c);
      border-radius: 12px;
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 20px;
      box-shadow: 0 0 15px var(--primary-glow);
    }

    .logo-text {
      font-family: var(--font-title);
      font-size: 22px;
      font-weight: 800;
      letter-spacing: 0.5px;
      background: linear-gradient(to right, #fff, #94a3b8);
      -webkit-background-clip: text;
      -webkit-text-fill-color: transparent;
    }

    .status-badge {
      display: flex;
      align-items: center;
      gap: 8px;
      font-size: 11px;
      font-family: var(--font-heading);
      background: rgba(16, 185, 129, 0.08);
      border: 1px solid rgba(16, 185, 129, 0.2);
      color: var(--success);
      padding: 6px 12px;
      border-radius: 20px;
    }
    
    .status-dot {
      width: 6px;
      height: 6px;
      background-color: var(--success);
      border-radius: 50%;
      box-shadow: 0 0 8px var(--success);
      animation: pulse 2s infinite;
    }

    @keyframes pulse {
      0% { transform: scale(1); opacity: 1; }
      50% { transform: scale(1.4); opacity: 0.4; }
      100% { transform: scale(1); opacity: 1; }
    }

    .desktop-nav {
      display: none;
      gap: 8px;
    }

    .bottom-nav {
      position: fixed;
      bottom: 0;
      left: 0;
      right: 0;
      background: rgba(19, 23, 34, 0.9);
      backdrop-filter: blur(16px);
      border-top: 1px solid var(--border);
      padding: 10px 16px calc(10px + env(safe-area-inset-bottom));
      z-index: 40;
      box-shadow: 0 -5px 25px rgba(0,0,0,0.5);
    }

    .nav-inner {
      display: flex;
      justify-content: space-around;
      max-width: 600px;
      margin: 0 auto;
    }

    .nav-item {
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: 4px;
      background: none;
      border: none;
      color: var(--text-muted);
      font-size: 10px;
      font-weight: 600;
      font-family: var(--font-heading);
      cursor: pointer;
      flex: 1;
      transition: var(--transition);
      position: relative;
    }

    .nav-item svg {
      stroke: var(--text-muted);
      transition: var(--transition);
    }

    .nav-item.active {
      color: var(--primary);
    }

    .nav-item.active svg {
      stroke: var(--primary);
      transform: translateY(-2px);
      filter: drop-shadow(0 0 5px var(--primary-glow));
    }

    .nav-item.active::after {
      content: '';
      position: absolute;
      bottom: -6px;
      width: 16px;
      height: 3px;
      background: var(--primary);
      border-radius: 99px;
      box-shadow: 0 0 8px var(--primary);
    }

    @media(min-width: 768px) {
      .desktop-nav {
        display: flex;
      }
      .bottom-nav {
        display: none;
      }
      .container {
        padding-bottom: 40px;
      }
    }

    /* Cards */
    .card {
      background: var(--surface-card);
      border: 1px solid var(--border);
      border-radius: 16px;
      padding: 20px;
      box-shadow: var(--shadow);
      transition: var(--transition);
      position: relative;
      overflow: hidden;
    }

    .card:hover {
      border-color: rgba(249, 115, 22, 0.2);
      box-shadow: 0 15px 35px rgba(0,0,0,0.7);
    }

    .section-header {
      display: flex;
      align-items: center;
      justify-content: space-between;
      margin-bottom: 20px;
    }

    .section-title {
      font-family: var(--font-title);
      font-size: 22px;
      font-weight: 800;
      display: flex;
      align-items: center;
      gap: 10px;
      background: linear-gradient(135deg, #fff, #94a3b8);
      -webkit-background-clip: text;
      -webkit-text-fill-color: transparent;
    }

    /* Botões */
    .btn {
      display: inline-flex;
      align-items: center;
      justify-content: center;
      gap: 8px;
      padding: 10px 20px;
      border-radius: 10px;
      font-family: var(--font-heading);
      font-size: 13px;
      font-weight: 700;
      cursor: pointer;
      border: none;
      transition: var(--transition);
    }

    .btn:active {
      transform: scale(0.96);
    }

    .btn-primary {
      background: linear-gradient(135deg, var(--primary), #ea580c);
      color: #090b11;
      box-shadow: 0 4px 15px var(--primary-glow);
    }

    .btn-primary:hover {
      background: linear-gradient(135deg, #ea580c, #c2410c);
      box-shadow: 0 6px 20px rgba(249, 115, 22, 0.4);
    }

    .btn-accent {
      background: linear-gradient(135deg, var(--accent), #7c3aed);
      color: #fff;
      box-shadow: 0 4px 15px var(--accent-glow);
    }

    .btn-accent:hover {
      background: linear-gradient(135deg, #7c3aed, #6d28d9);
      box-shadow: 0 6px 20px rgba(139, 92, 246, 0.4);
    }

    .btn-secondary {
      background: var(--surface);
      border: 1px solid var(--border);
      color: var(--text-dim);
    }

    .btn-secondary:hover {
      background: var(--surface-overlay);
      color: #fff;
      border-color: var(--text-muted);
    }

    .btn-danger-ghost {
      background: rgba(239, 68, 68, 0.05);
      border: 1px solid rgba(239, 68, 68, 0.15);
      color: var(--danger);
    }

    .btn-danger-ghost:hover {
      background: rgba(239, 68, 68, 0.15);
      border-color: var(--danger);
    }

    .form-group {
      margin-bottom: 16px;
    }

    .label {
      display: block;
      font-size: 11px;
      font-weight: 700;
      color: var(--text-muted);
      margin-bottom: 6px;
      text-transform: uppercase;
      letter-spacing: 0.5px;
      font-family: var(--font-heading);
    }

    .input, .select, .textarea {
      width: 100%;
      background: var(--surface);
      border: 1px solid var(--border);
      color: var(--text);
      padding: 12px 14px;
      border-radius: 10px;
      font-family: var(--font-body);
      font-size: 13px;
      transition: var(--transition);
      outline: none;
    }

    .input:focus, .select:focus, .textarea:focus {
      border-color: var(--primary);
      box-shadow: 0 0 0 3px var(--primary-glow);
    }

    .textarea {
      resize: vertical;
      min-height: 90px;
      line-height: 1.5;
    }

    .form-grid-2 {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 12px;
    }

    /* Placa Mercosul */
    .plate-badge {
      display: inline-flex;
      flex-direction: column;
      border: 2px solid #1e40af;
      border-radius: 6px;
      overflow: hidden;
      width: 105px;
      height: 32px;
      background: #fff;
      box-shadow: 0 4px 10px rgba(0,0,0,0.15);
      font-family: var(--font-mono);
      flex-shrink: 0;
    }

    .plate-top {
      height: 8px;
      background: #1e40af;
      color: #fff;
      font-size: 5px;
      font-weight: 700;
      text-align: center;
      line-height: 8px;
      letter-spacing: 0.5px;
      text-transform: uppercase;
    }

    .plate-number {
      height: 20px;
      color: #111827;
      font-size: 14px;
      font-weight: 800;
      text-align: center;
      line-height: 20px;
      letter-spacing: 1px;
      text-transform: uppercase;
    }

    /* Badges */
    .badge {
      display: inline-flex;
      align-items: center;
      gap: 6px;
      padding: 6px 12px;
      border-radius: 20px;
      font-size: 11px;
      font-weight: 700;
      font-family: var(--font-heading);
      border: 1px solid transparent;
      width: fit-content;
    }

    .badge-aguardando {
      background: var(--warning-bg);
      color: var(--warning);
      border-color: rgba(245, 158, 11, 0.15);
    }
    .badge-andamento {
      background: var(--info-bg);
      color: var(--info);
      border-color: rgba(59, 130, 246, 0.15);
    }
    .badge-pronto {
      background: var(--success-bg);
      color: var(--success);
      border-color: rgba(16, 185, 129, 0.15);
    }
    .badge-entregue {
      background: rgba(100, 116, 139, 0.08);
      color: var(--text-dim);
      border-color: rgba(100, 116, 139, 0.15);
    }

    .list-container {
      display: flex;
      flex-direction: column;
      gap: 12px;
      margin-top: 12px;
    }

    .item-card {
      background: var(--surface-card);
      border: 1px solid var(--border);
      border-radius: 12px;
      padding: 16px;
      display: grid;
      grid-template-columns: 1fr;
      gap: 12px;
      align-items: center;
      transition: var(--transition);
    }

    .item-card:hover {
      border-color: var(--border-glow);
      transform: translateY(-2px);
    }

    @media (min-width: 768px) {
      .item-card {
        grid-template-columns: 1.5fr 1fr 1fr 1fr auto;
        gap: 16px;
      }
    }

    .item-details h4 {
      font-family: var(--font-heading);
      font-size: 15px;
      font-weight: 600;
      margin-bottom: 4px;
      color: var(--text);
    }

    .item-details p {
      font-size: 12px;
      color: var(--text-muted);
    }

    .value-highlight {
      font-family: var(--font-mono);
      font-size: 14px;
      font-weight: 700;
      color: var(--success);
    }

    .actions-cell {
      display: flex;
      gap: 6px;
      justify-content: flex-end;
    }

    .icon-btn {
      width: 34px;
      height: 34px;
      background: var(--surface);
      border: 1px solid var(--border);
      border-radius: 8px;
      color: var(--text-dim);
      display: flex;
      align-items: center;
      justify-content: center;
      cursor: pointer;
      transition: var(--transition);
    }

    .icon-btn:hover {
      color: var(--primary);
      border-color: var(--primary);
      background: var(--surface-overlay);
    }

    /* KPIs */
    .kpis-grid {
      display: grid;
      grid-template-columns: repeat(2, 1fr);
      gap: 12px;
      margin-bottom: 20px;
    }

    @media (max-width: 767px) {
      .kpis-grid > .kpi-card:last-child {
        grid-column: span 2;
      }
    }

    @media (min-width: 768px) {
      .kpis-grid {
        grid-template-columns: repeat(5, 1fr);
        gap: 16px;
      }
    }

    .kpi-card {
      background: var(--surface-card);
      border: 1px solid var(--border);
      border-radius: 16px;
      padding: 16px;
      display: flex;
      flex-direction: column;
      gap: 8px;
      position: relative;
      overflow: hidden;
      transition: var(--transition);
    }

    .kpi-card:hover {
      transform: translateY(-3px);
    }

    .kpi-icon-wrap {
      width: 36px;
      height: 36px;
      border-radius: 10px;
      display: flex;
      align-items: center;
      justify-content: center;
      color: #fff;
    }

    .kpi-value {
      font-family: var(--font-mono);
      font-size: 18px;
      font-weight: 700;
      color: var(--text);
    }

    .kpi-label {
      font-size: 10px;
      font-weight: 700;
      color: var(--text-muted);
      text-transform: uppercase;
      letter-spacing: 0.5px;
    }

    /* Modais */
    .modal-overlay {
      position: fixed;
      inset: 0;
      background: rgba(5, 7, 12, 0.85);
      backdrop-filter: blur(8px);
      z-index: 100;
      display: flex;
      align-items: center;
      justify-content: center;
      padding: 16px;
      animation: fadeIn 0.2s cubic-bezier(0.4, 0, 0.2, 1) both;
    }

    .modal-content {
      background: var(--surface-card);
      border: 1px solid var(--border);
      border-radius: 20px;
      width: 100%;
      max-width: 520px;
      max-height: 90vh;
      overflow-y: auto;
      padding: 24px;
      box-shadow: 0 25px 50px rgba(0, 0, 0, 0.8);
      position: relative;
      animation: slideUp 0.3s cubic-bezier(0.2, 0.8, 0.2, 1) both;
    }

    .modal-header {
      display: flex;
      align-items: center;
      justify-content: space-between;
      margin-bottom: 20px;
      border-bottom: 1px solid var(--border);
      padding-bottom: 12px;
    }

    .modal-title {
      font-family: var(--font-heading);
      font-size: 18px;
      font-weight: 700;
    }

    .modal-close {
      background: none;
      border: none;
      color: var(--text-muted);
      cursor: pointer;
      display: flex;
      align-items: center;
      justify-content: center;
      transition: var(--transition);
    }

    .modal-close:hover {
      color: #fff;
    }

    @keyframes fadeIn {
      from { opacity: 0; }
      to { opacity: 1; }
    }

    @keyframes slideUp {
      from { transform: translateY(20px); opacity: 0; }
      to { transform: translateY(0); opacity: 1; }
    }

    /* Autocomplete */
    .dropdown-suggest {
      position: absolute;
      top: 100%;
      left: 0;
      right: 0;
      background: var(--surface-overlay);
      border: 1px solid var(--primary);
      border-radius: 10px;
      max-height: 180px;
      overflow-y: auto;
      z-index: 200;
      margin-top: 4px;
      box-shadow: 0 10px 25px rgba(0,0,0,0.8);
    }

    .suggest-item {
      padding: 12px 16px;
      font-size: 13px;
      cursor: pointer;
      border-bottom: 1px solid var(--border);
      transition: var(--transition);
    }

    .suggest-item:hover {
      background: var(--surface);
      color: var(--primary);
    }

    .suggest-item-sub {
      font-size: 11px;
      color: var(--text-muted);
      margin-top: 2px;
    }

    .empty-state {
      text-align: center;
      padding: 40px 20px;
      color: var(--text-muted);
      font-size: 13px;
    }

    /* Filter Tabs */
    .filter-tabs {
      display: flex;
      flex-wrap: wrap;
      gap: 8px;
      margin-top: 4px;
    }

    .filter-tab {
      background: var(--surface-card);
      border: 1px solid var(--border);
      color: var(--text-dim);
      padding: 8px 16px;
      border-radius: 20px;
      font-size: 12px;
      font-weight: 600;
      font-family: var(--font-heading);
      cursor: pointer;
      transition: var(--transition);
      outline: none;
      -webkit-tap-highlight-color: transparent;
    }

    .filter-tab:hover {
      border-color: var(--primary);
      color: var(--text);
      background: var(--surface-overlay);
    }

    .filter-tab.active {
      background: var(--primary);
      color: #090b11;
      border-color: var(--primary);
      font-weight: 700;
      box-shadow: 0 0 12px var(--primary-glow);
    }

    @media (max-width: 767px) {
      .filter-tabs {
        display: flex;
        flex-wrap: wrap;
        gap: 6px;
        width: 100%;
      }
      .filter-tab {
        flex: 1 1 auto;
        padding: 8px 10px;
        font-size: 11px;
        text-align: center;
        white-space: nowrap;
      }
    }
            `}</style>
            <header>
              <div className="logo-area">
                <div className="logo-icon">🚗</div>
                <div className="logo-text">ASDCAR</div>
              </div>
              
              <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                <button 
                  className="btn btn-secondary" 
                  style={{ padding: "6px 12px", fontSize: "11px", gap: "4px" }}
                  onClick={() => setShowDriveModal(true)}
                  title="Configurar Google Drive"
                >
                  <Icon name="cloud" size={13} color={driveUrl ? "var(--success)" : "var(--text-dim)"} />
                  {driveUrl ? "Drive Ok" : "Conectar Drive"}
                </button>
                <div className="status-badge">
                  <div className="status-dot"></div>
                  Sistema Conectado
                </div>
                <button 
                  className="btn btn-accent" 
                  style={{ padding: "8px 14px", fontSize: "12px" }}
                  onClick={() => setShowReport(true)}
                >
                  <Icon name="file" size={14} color="#fff" /> Fechamento
                </button>
              </div>

              <div className="desktop-nav">
                {tabs.map(t => (
                  <button 
                    key={t.id} 
                    className={`btn ${tab === t.id ? "btn-primary" : "btn-secondary"}`} 
                    onClick={() => setTab(t.id)}
                    style={{ gap: "6px" }}
                  >
                    <Icon name={t.icon} size={15} color={tab === t.id ? "#090b11" : "var(--text-dim)"} />
                    {t.label}
                  </button>
                ))}
              </div>
            </header>

            <main className="container">
              {loading ? (
                <div style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", padding: "120px 20px", gap: "16px" }}>
                  <div className="status-dot" style={{ width: "24px", height: "24px", backgroundColor: "var(--primary)", boxShadow: "0 0 15px var(--primary)" }}></div>
                  <div style={{ color: "var(--text-dim)", fontWeight: 600, fontSize: "14px", letterSpacing: "0.5px" }}>Sincronizando Banco de Dados...</div>
                </div>
              ) : (
                <>
                  {tab === "dashboard" && <Dashboard services={services} viewMode={globalViewMode} setViewMode={setGlobalViewMode} />}
                  {tab === "services" && <ServicesTab services={services} vehicles={vehicles} loadAll={loadAll} onOpenOS={(s) => setShowOSModal(s)} driveUrl={driveUrl} onOpenDriveConfig={() => setShowDriveModal(true)} onZoomPhoto={(p) => setZoomPhoto(p)} />}
                  {tab === "finance" && <FinanceTab services={services} expenses={expenses} loadAll={loadAll} viewMode={globalViewMode} setViewMode={setGlobalViewMode} />}
                  {tab === "vehicles" && <VehiclesTab vehicles={vehicles} services={services} loadAll={loadAll} />}
                </>
              )}
            </main>

            <nav className="bottom-nav">
              <div className="nav-inner">
                {tabs.map(t => (
                  <button key={t.id} className={`nav-item ${tab === t.id ? "active" : ""}`} onClick={() => setTab(t.id)}>
                    <Icon name={t.icon} size={20} />
                    {t.label}
                  </button>
                ))}
              </div>
            </nav>

            {showReport && (
              <ReportModal 
                services={services} 
                viewMode={globalViewMode} 
                onClose={() => setShowReport(false)} 
                onGenerate={(f, t) => { generatePDF(vehicles, services, expenses, f, t, globalViewMode); setShowReport(false); }} 
              />
            )}
                        {showDriveModal && (
              <DriveModal 
                driveUrl={driveUrl} 
                onSave={(url) => { localStorage.setItem("asdcar_drive_url", url); setDriveUrl(url); }} 
                onClose={() => setShowDriveModal(false)} 
              />
            )}
            {zoomPhoto && <PhotoZoomModal photo={zoomPhoto} onClose={() => setZoomPhoto(null)} />}
            {showOSModal && <OSModal service={showOSModal} vehicles={vehicles} onClose={() => setShowOSModal(null)} />}
          </div>
        );
      }

      function Dashboard({ services, viewMode, setViewMode }: any) {
        const [selMonth, setSelMonth] = useState(new Date().getMonth());
        const [selYear, setSelYear] = useState(new Date().getFullYear());

        const activeServices = services.filter(s => s.status !== "Entregue");
        const filteredDelivered = services.filter(s => {
          if (s.status !== "Entregue" || !s.exitDate) return false;
          const d = new Date(s.exitDate + "T12:00:00");
          return d.getMonth() === selMonth && d.getFullYear() === selYear;
        });

        const tP = filteredDelivered.reduce((acc, s) => acc + (Number(s.partsValue) || 0), 0);
        const tL = filteredDelivered.reduce((acc, s) => acc + (Number(s.laborValue) || 0), 0);
        const ticketMedioVal = filteredDelivered.length > 0 ? (tL / filteredDelivered.length) : 0;

        const receitaCalculada = filteredDelivered.reduce((acc, s) => {
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
          <div style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
            <div className="card" style={{ display: "flex", flexWrap: "wrap", gap: "16px", background: "var(--surface)" }}>
              <div style={{ flex: "1 1 200px" }}>
                <label className="label">Mês de Referência</label>
                <select className="select" value={selMonth} onChange={(e) => setSelMonth(Number(e.target.value))}>
                  {MONTHS.map((m, i) => <option key={i} value={i}>{m}</option>)}
                </select>
              </div>
              <div style={{ flex: "1 1 100px" }}>
                <label className="label">Ano</label>
                <select className="select" value={selYear} onChange={(e) => setSelYear(Number(e.target.value))}>
                  {[2024, 2025, 2026, 2027].map(y => <option key={y} value={y}>{y}</option>)}
                </select>
              </div>
              <div style={{ flex: "2 1 300px" }}>
                <label className="label">Modelo de Filtro (Painel & PDF)</label>
                <select className="select" value={viewMode} onChange={(e) => setViewMode(e.target.value)}>
                  <option value="labor">Mão de Obra Líquida (Desconta taxas de cartão)</option>
                  <option value="total">Faturamento Bruto Líquido (Faturamento total com taxas descontadas)</option>
                </select>
              </div>
            </div>

            <div className="kpis-grid">
              {[
                { label: "Pátio Oficina", value: activeServices.length, icon: "wrench", bg: "var(--primary)", glow: "var(--primary-glow)" },
                { label: `Peças (${MONTHS[selMonth].slice(0,3)})`, value: fmt(tP), icon: "car", bg: "var(--accent)", glow: "var(--accent-glow)" },
                { label: `M.O. (${MONTHS[selMonth].slice(0,3)})`, value: fmt(tL), icon: "wrench", bg: "var(--success)", glow: "rgba(16,185,129,0.2)" },
                { label: `Ticket Médio M.O.`, value: fmt(ticketMedioVal), icon: "finance", bg: "var(--warning)", glow: "rgba(245, 158, 11, 0.2)" },
                { label: viewMode === "labor" ? "M.O. Líquida" : "Faturamento Líq.", value: fmt(receitaCalculada), icon: "finance", bg: "var(--info)", glow: "rgba(59,130,246,0.2)" },
              ].map((k, i) => (
                <div key={i} className="kpi-card">
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                    <div className="kpi-icon-wrap" style={{ backgroundColor: k.bg, boxShadow: `0 0 10px ${k.glow}` }}>
                      <Icon name={k.icon} size={16} color="#090b11" />
                    </div>
                    <div style={{ fontSize: "10px", color: "var(--success)", fontWeight: 700 }}>{i === 4 ? "LÍQUIDO" : ""}</div>
                  </div>
                  <div className="kpi-value" style={{ marginTop: "12px", color: i === 4 ? "var(--success)" : "var(--text)" }}>{k.value}</div>
                  <div className="kpi-label">{k.label}</div>
                </div>
              ))}
            </div>

            <div style={{ display: "grid", gridTemplateColumns: "1fr", gap: "20px" }} className="responsive-grid">
              <div className="card">
                <div className="section-header">
                  <h3 className="section-title">🛠️ Carros na Oficina ({activeServices.length})</h3>
                </div>
                {activeServices.length === 0 ? (
                  <div className="empty-state">Pátio livre de serviços pendentes.</div>
                ) : (
                  <div className="list-container">
                    {activeServices.map(sv => (
                      <div key={sv.id} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "12px 0", borderBottom: "1px solid var(--border)" }}>
                        <div>
                          <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                            <span className="plate-badge">
                              <span className="plate-top">BRASIL</span>
                              <span className="plate-number">{sv.vehiclePlate}</span>
                            </span>
                            <span style={{ fontSize: "13px", fontWeight: 700 }}>{sv.vehicleBrand} {sv.vehicleModel}</span>
                          </div>
                          <p style={{ fontSize: "11px", color: "var(--text-muted)", marginTop: "6px" }}>{sv.description.split("||")[0]}</p>
                        </div>
                        <span className={`badge badge-${statusClass(sv.status)}`}>{sv.status}</span>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              <div className="card">
                <div className="section-header">
                  <h3 className="section-title" style={{ color: "var(--success)" }}>✅ Finalizados & Entregues ({filteredDelivered.length})</h3>
                </div>
                {filteredDelivered.length === 0 ? (
                  <div className="empty-state">Nenhum serviço concluído no período.</div>
                ) : (
                  <div className="list-container">
                    {filteredDelivered.map(sv => (
                      <div key={sv.id} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "12px 0", borderBottom: "1px solid var(--border)" }}>
                        <div>
                          <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                            <span className="plate-badge">
                              <span className="plate-top">BRASIL</span>
                              <span className="plate-number">{sv.vehiclePlate}</span>
                            </span>
                            <span style={{ fontSize: "13px", fontWeight: 700 }}>{sv.vehicleBrand} {sv.vehicleModel}</span>
                          </div>
                          <p style={{ fontSize: "11px", color: "var(--text-muted)", marginTop: "6px" }}>Entregue em: {fmtDate(sv.exitDate)}</p>
                        </div>
                        <div style={{ textAlign: "right" }}>
                          <div className="value-highlight">{fmt(Number(sv.partsValue) + Number(sv.laborValue))}</div>
                          <span style={{ fontSize: "9px", color: "var(--text-muted)", textTransform: "uppercase" }}>{sv.paymentMethod}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        );
      }

      function statusClass(status: any) {
        if (status === "Aguardando") return "aguardando";
        if (status === "Em andamento") return "andamento";
        if (status === "Pronto") return "pronto";
        return "entregue";
      }

      function ServicesTab({ services, vehicles, loadAll, onOpenOS }) {
        const [modal, setModal] = useState(false);
        const [editing, setEditing] = useState<any>(null);
        const [form, setForm] = useState({});
        const [search, setSearch] = useState("");
        const [partsOwner, setPartsOwner] = useState("oficina"); 
        const [oficinaPartsText, setOficinaPartsText] = useState("");
        const [clientePartsText, setClientePartsText] = useState("");
        const [filterStatus, setFilterStatus] = useState("");
        const [photoType, setPhotoType] = useState("Vistoria / Avarias");
        const [uploading, setUploading] = useState(false);
        const [uploadStatus, setUploadStatus] = useState("");
        const fileInputRef = useRef(null);

        const handleUploadPhoto = async (file: any) => {
          if (!file) return;
          if (!driveUrl) {
            alert("Por favor, conecte seu Google Drive primeiro no botão do topo ('Conectar Drive')!");
            onOpenDriveConfig();
            return;
          }
          const v = vehicles.find(veh => veh.id === form.vehicleId);
          const plate = v?.plate || "GERAL";
          
          setUploading(true);
          setUploadStatus("⏳ Otimizando foto e enviando ao Google Drive...");
          
          try {
            const comp = await compressImage(file);
            const payload = {
              plate: plate,
              filename: `foto_${plate}_${Date.now()}.jpg`,
              mimeType: comp.mimeType,
              base64: comp.base64
            };

            const resp = await fetch(driveUrl, {
              method: "POST",
              headers: { "Content-Type": "text/plain;charset=utf-8" },
              body: JSON.stringify(payload)
            });
            const resData = await resp.json();
            
            if (resData.success) {
              const newPhoto = {
                id: resData.fileId,
                url: resData.url,
                driveLink: resData.driveLink,
                type: photoType,
                createdAt: new Date().toISOString()
              };
              const currentPhotos = form.photos || [];
              setForm({ ...form, photos: [...currentPhotos, newPhoto] });
              setUploadStatus("✅ Foto anexada com sucesso!");
              setTimeout(() => setUploadStatus(""), 3000);
            } else {
              throw new Error(resData.error || "Erro no upload");
            }

        "Dinheiro": 0, "Pix": 0, "Débito": 1.9,
        "Crédito 1x": 0.79, "Crédito 2x": 1.58, "Crédito 3x": 2.37, "Crédito 4x": 3.16,
        "Crédito 5x": 3.95, "Crédito 6x": 4.74, "Crédito 7x": 5.53, "Crédito 8x": 6.32,
        "Crédito 9x": 7.11, "Crédito 10x": 7.90, "Crédito 11x": 8.69, "Crédito 12x": 9.48
      };

      const STATUS_COLORS = { 
        "Aguardando": "#f59e0b", 
        "Em andamento": "#3b82f6", 
        "Pronto": "#10b981", 
        "Entregue": "#64748b" 
      };

      const MONTHS = ["Janeiro", "Fevereiro", "Março", "Abril", "Maio", "Junho", "Julho", "Agosto", "Setembro", "Outubro", "Novembro", "Dezembro"];
      const CAR_BRANDS = ["Audi", "BMW", "BYD", "Chevrolet", "Citroën", "Ferrari", "Fiat", "Ford", "GWM", "Honda", "Hyundai", "JAC", "Jaguar", "Jeep", "Kia", "Land Rover", "Mercedes-Benz", "Mitsubishi", "Nissan", "Peugeot", "Porsche", "RAM", "Renault", "Toyota", "Volkswagen", "Volvo"].sort();

      // Ícones
      function Icon({ name, size = 18, color = "currentColor", className = "" }: any) {
        const paths = {
          home: <path d="m3 9 9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/>,
          wrench: <path d="M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.8-3.8a6 6 0 0 1-7.9 7.9L6.7 20.3a2.1 2.1 0 0 1-3-3l6.9-6.9a6 6 0 0 1 7.9-7.9z"/>,
          finance: <g><rect width="20" height="12" x="2" y="6" rx="2"/><circle cx="12" cy="12" r="2"/></g>,
          car: <g><path d="M19 17h2c.6 0 1-.4 1-1v-3c0-.9-.7-1.7-1.5-1.9L18.4 6c-.3-.6-.9-1-1.6-1H7.2c-.7 0-1.3.4-1.6 1l-2.1 5.1C2.7 11.3 2 12.1 2 13v3c0 .6.4 1 1 1h2"/><circle cx="7" cy="17" r="2"/><circle cx="17" cy="17" r="2"/></g>,
          plus: <path d="M5 12h14M12 5v14"/>,
          edit: <path d="M12 20h9M16.5 3.5a2.12 2.12 0 0 1 3 3L7 19l-4 1 1-4Z"/>,
          history: <g><path d="M3 12a9 9 0 1 0 9-9 9.75 9.75 0 0 0-6.74 2.74L3 8"/><path d="M3 3v5h5M12 7v5l4 2"/></g>,
          file: <g><path d="M15 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7Z"/><path d="M14 2v4a2 2 0 0 0 2 2h4"/></g>,
          x: <path d="M18 6 6 18M6 6l12 12"/>,
          search: <g><circle cx="11" cy="11" r="8"/><path d="m21 21-4.3-4.3"/></g>,
          trash: <path d="M3 6h18M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2"/>,
          camera: <g><path d="M14.5 4h-5L7 7H4a2 2 0 0 0-2 2v9a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2V9a2 2 0 0-2-2h-3l-2.5-3z"/><circle cx="12" cy="13" r="3"/></g>,
          cloud: <path d="M17.5 19H9a7 7 0 1 1 6.71-9h1.79a4.5 4.5 0 1 1 0 9Z"/>,
          image: <g><rect width="18" height="18" x="3" y="3" rx="2" ry="2"/><circle cx="9" cy="9" r="2"/><path d="m21 15-3.086-3.086a2 2 0 0 0-2.828 0L6 21"/></g>
        };

        const pathElem = paths[name];
        if (!pathElem) return null;

        return (
          <svg 
            xmlns="http://www.w3.org/2000/svg" 
            width={size} 
            height={size} 
            viewBox="0 0 24 24" 
            fill="none" 
            stroke={color} 
            strokeWidth="2.2" 
            strokeLinecap="round" 
            strokeLinejoin="round"
            className={className}
          >
            {pathElem}
          </svg>
        );
      }

      // FORMATAÇÕES
      const uid = () => Math.random().toString(36).slice(2, 10);
      const fmt = (n: any) => new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(n || 0);
      const fmtKm = (n: any) => n ? Number(n).toLocaleString("pt-BR") + " km" : "—";
      const today = () => new Date().toISOString().slice(0, 10);
      const fmtDate = (d: any) => d ? new Date(d + "T12:00:00").toLocaleDateString("pt-BR") : "—";

      const mapV = (r: any) => ({
        id: r.id, plate: r.plate, brand: r.brand, model: r.model, year: r.year, 
        color: r.color, owner: r.owner, phone: r.phone, notes: r.notes, 
        mileage: r.mileage || 0, createdAt: r.created_at
      });

      
      function compressImage(file, maxWidth = 1600, quality = 0.8) {
        return new Promise((resolve, reject) => {
          const reader = new FileReader();
          reader.readAsDataURL(file);
          reader.onload = (e) => {
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
              ctx.drawImage(img, 0, 0, width, height);
              const dataUrl = canvas.toDataURL('image/jpeg', quality);
              const base64 = dataUrl.split(',')[1];
              resolve({ base64, mimeType: 'image/jpeg', dataUrl });
            };
            img.onerror = (err) => reject(err);
          };
          reader.onerror = (err) => reject(err);
        });
      }

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

      function BrandSelector({ value, onChange }: any) {
        const [query, setQuery] = useState(value || "");
        const [open, setOpen] = useState(false);
        const ref = useRef(null);
        const filtered = CAR_BRANDS.filter(b => b.toLowerCase().includes(query.toLowerCase()));
        
        useEffect(() => { setQuery(value || ""); }, [value]);
        useEffect(() => {
          function handleClick(e) { if (ref.current && !ref.current.contains(e.target)) setOpen(false); }
          document.addEventListener("mousedown", handleClick); 
          return () => document.removeEventListener("mousedown", handleClick);
        }, []);

        return (
          <div ref={ref} style={{ position: "relative" }} className="form-group">
            <label className="label">Marca *</label>
            <input 
              className="input" 
              placeholder="Digite ou escolha a marca..." 
              value={query} 
              onFocus={() => setOpen(true)} 
              onChange={e => { setQuery(e.target.value); onChange(e.target.value); setOpen(true); }} 
              autoComplete="off" 
            />
            {open && filtered.length > 0 && (
              <div className="dropdown-suggest">
                {filtered.map(b => (
                  <div 
                    key={b} 
                    onClick={() => { onChange(b); setQuery(b); setOpen(false); }} 
                    className="suggest-item"
                    style={{ color: value === b ? "var(--primary)" : "var(--text)" }}
                  >
                    {b}
                  </div>
                ))}
              </div>
            )}
          </div>
        );
      }

      function VehicleSelector({ vehicles, value, onChange }: any) {
        const [query, setQuery] = useState("");
        const [open, setOpen] = useState(false);
        const ref = useRef(null);
        const selected = vehicles.find(v => v.id === value);
        const displayValue = selected ? `${selected.plate} — ${selected.brand} ${selected.model}` : query;
        const filtered = vehicles.filter(v => 
          (v.plate || "").toLowerCase().includes(query.toLowerCase()) || 
          (v.model || "").toLowerCase().includes(query.toLowerCase())
        ).slice(0, 10);

        useEffect(() => {
          function handleClick(e) { if (ref.current && !ref.current.contains(e.target)) setOpen(false); }
          document.addEventListener("mousedown", handleClick); 
          return () => document.removeEventListener("mousedown", handleClick);
        }, []);

        return (
          <div ref={ref} style={{ position: "relative" }} className="form-group">
            <label className="label">Carro *</label>
            <input 
              className="input" 
              placeholder="Busque placa ou modelo..." 
              value={open ? query : displayValue} 
              onFocus={() => { setOpen(true); setQuery(""); }} 
              onChange={e => setQuery(e.target.value)} 
              autoComplete="off" 
            />
            {open && (
              <div className="dropdown-suggest">
                {filtered.map(v => (
                  <div 
                    key={v.id} 
                    onClick={() => { onChange(v.id); setOpen(false); }} 
                    className="suggest-item"
                  >
                    <div style={{ fontWeight: 700, fontSize: "13px" }}>{v.plate}</div>
                    <div className="suggest-item-sub">{v.brand} {v.model} {v.owner ? `· ${v.owner}` : ""}</div>
                  </div>
                ))}
              </div>
            )}
          </div>
        );
      }

      
      function DriveModal({ driveUrl, onSave, onClose }: any) {
        const [urlInput, setUrlInput] = useState(driveUrl || "");
        return (
          <div className="modal-overlay" onClick={onClose}>
            <div className="modal-content" onClick={e => e.stopPropagation()}>
              <div className="modal-header">
                <h3 className="modal-title">⚙️ Conectar Google Drive</h3>
                <button className="modal-close" onClick={onClose}><Icon name="x" size={18} /></button>
              </div>
              <p style={{ fontSize: "12px", color: "var(--text-muted)", marginBottom: "16px", lineHeight: "1.5" }}>
                Cole abaixo a URL do seu Web App criado no Google Apps Script. As fotos das vistorias e serviços serão salvas automaticamente na pasta <strong>ASDCAR_Fotos</strong> do seu Google Drive.
              </p>
              <div className="form-group">
                <label className="label">URL do Web App do Google Drive *</label>
                <input 
                  className="input" 
                  placeholder="https://script.google.com/macros/s/.../exec" 
                  value={urlInput} 
                  onChange={e => setUrlInput(e.target.value)} 
                />
              </div>
              <button className="btn btn-primary" style={{ width: "100%", marginTop: "16px", height: "44px" }} onClick={() => { onSave(urlInput.trim()); onClose(); }}>
                Salvar Conexão do Google Drive
              </button>
            </div>
          </div>
        );
      }

      function PhotoZoomModal({ photo, onClose }: any) {
        if (!photo) return null;
        return (
          <div className="modal-overlay" onClick={onClose}>
            <div className="modal-content" style={{ maxWidth: "650px", textAlign: "center" }} onClick={e => e.stopPropagation()}>
              <div className="modal-header">
                <h3 className="modal-title">{photo.type || "Foto da Vistoria"}</h3>
                <button className="modal-close" onClick={onClose}><Icon name="x" size={18} /></button>
              </div>
              <img src={photo.url} alt={photo.type} style={{ maxWidth: "100%", maxHeight: "450px", borderRadius: "12px", objectFit: "contain", border: "1px solid var(--border)", background: "#000" }} />
              <div style={{ marginTop: "16px", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <span style={{ fontSize: "11px", color: "var(--text-muted)" }}>Data: {new Date(photo.createdAt).toLocaleDateString("pt-BR")}</span>
                <a href={photo.driveLink} target="_blank" rel="noreferrer" className="btn btn-secondary" style={{ fontSize: "12px", gap: "6px" }}>
                  <Icon name="cloud" size={14} /> Abrir no Google Drive
                </a>
              </div>
            </div>
          </div>
        );
      }

      export default function App() {
        const [tab, setTab] = useState("dashboard");
        const [vehicles, setVehicles] = useState<any[]>([]);
        const [services, setServices] = useState<any[]>([]);
        const [expenses, setExpenses] = useState<any[]>([]);
        const [loading, setLoading] = useState(true);
        const [showReport, setShowReport] = useState(false);
        const [showOSModal, setShowOSModal] = useState<any>(null);
        const [globalViewMode, setGlobalViewMode] = useState("labor");
        const [driveUrl, setDriveUrl] = useState(() => localStorage.getItem("asdcar_drive_url") || "");
        const [showDriveModal, setShowDriveModal] = useState(false);
        const [zoomPhoto, setZoomPhoto] = useState<any>(null);

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
          { id: "dashboard", label: "Início", icon: "home" }, 
          { id: "services", label: "Oficina", icon: "wrench" }, 
          { id: "finance", label: "Financeiro", icon: "finance" }, 
          { id: "vehicles", label: "Carros", icon: "car" }
        ];

        return (
          <div>
            <style>{`
/* ── SISTEMA DE DESIGN GERAL ─────────────────────────────────────────── */
    :root {
      --bg: #090b11;
      --surface: #131722;
      --surface-card: #181d2a;
      --surface-overlay: #1d2436;
      --border: #22293b;
      --border-glow: rgba(249, 115, 22, 0.15);
      --primary: #f97316;
      --primary-hover: #ea580c;
      --primary-glow: rgba(249, 115, 22, 0.25);
      --accent: #8b5cf6;
      --accent-glow: rgba(139, 92, 246, 0.2);
      
      --success: #10b981;
      --success-bg: rgba(16, 185, 129, 0.1);
      --warning: #f59e0b;
      --warning-bg: rgba(245, 158, 11, 0.1);
      --info: #3b82f6;
      --info-bg: rgba(59, 130, 246, 0.1);
      --danger: #ef4444;
      --danger-bg: rgba(239, 68, 68, 0.1);
      
      --text: #f1f5f9;
      --text-muted: #64748b;
      --text-dim: #94a3b8;
      
      --font-title: 'Syne', sans-serif;
      --font-heading: 'Outfit', sans-serif;
      --font-body: 'Inter', sans-serif;
      --font-mono: 'DM Mono', monospace;
      
      --shadow: 0 10px 30px rgba(0, 0, 0, 0.6);
      --transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
    }

    * {
      box-sizing: border-box;
      margin: 0;
      padding: 0;
    }

    body {
      background-color: var(--bg);
      color: var(--text);
      font-family: var(--font-body);
      min-height: 100vh;
      overflow-x: hidden;
      -webkit-font-smoothing: antialiased;
    }

    /* Scrollbar */
    ::-webkit-scrollbar {
      width: 8px;
      height: 8px;
    }
    ::-webkit-scrollbar-track {
      background: var(--bg);
    }
    ::-webkit-scrollbar-thumb {
      background: var(--border);
      border-radius: 4px;
    }
    ::-webkit-scrollbar-thumb:hover {
      background: var(--text-muted);
    }

    .container {
      width: 100%;
      max-width: 1200px;
      margin: 0 auto;
      padding: 20px 16px 100px;
    }

    /* Header */
    header {
      background: rgba(19, 23, 34, 0.8);
      backdrop-filter: blur(12px);
      border-bottom: 1px solid var(--border);
      padding: 16px 24px;
      position: sticky;
      top: 0;
      z-index: 40;
      display: flex;
      align-items: center;
      justify-content: space-between;
      box-shadow: 0 4px 20px rgba(0,0,0,0.3);
    }

    .logo-area {
      display: flex;
      align-items: center;
      gap: 12px;
    }

    .logo-icon {
      width: 40px;
      height: 40px;
      background: linear-gradient(135deg, var(--primary), #ea580c);
      border-radius: 12px;
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 20px;
      box-shadow: 0 0 15px var(--primary-glow);
    }

    .logo-text {
      font-family: var(--font-title);
      font-size: 22px;
      font-weight: 800;
      letter-spacing: 0.5px;
      background: linear-gradient(to right, #fff, #94a3b8);
      -webkit-background-clip: text;
      -webkit-text-fill-color: transparent;
    }

    .status-badge {
      display: flex;
      align-items: center;
      gap: 8px;
      font-size: 11px;
      font-family: var(--font-heading);
      background: rgba(16, 185, 129, 0.08);
      border: 1px solid rgba(16, 185, 129, 0.2);
      color: var(--success);
      padding: 6px 12px;
      border-radius: 20px;
    }
    
    .status-dot {
      width: 6px;
      height: 6px;
      background-color: var(--success);
      border-radius: 50%;
      box-shadow: 0 0 8px var(--success);
      animation: pulse 2s infinite;
    }

    @keyframes pulse {
      0% { transform: scale(1); opacity: 1; }
      50% { transform: scale(1.4); opacity: 0.4; }
      100% { transform: scale(1); opacity: 1; }
    }

    .desktop-nav {
      display: none;
      gap: 8px;
    }

    .bottom-nav {
      position: fixed;
      bottom: 0;
      left: 0;
      right: 0;
      background: rgba(19, 23, 34, 0.9);
      backdrop-filter: blur(16px);
      border-top: 1px solid var(--border);
      padding: 10px 16px calc(10px + env(safe-area-inset-bottom));
      z-index: 40;
      box-shadow: 0 -5px 25px rgba(0,0,0,0.5);
    }

    .nav-inner {
      display: flex;
      justify-content: space-around;
      max-width: 600px;
      margin: 0 auto;
    }

    .nav-item {
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: 4px;
      background: none;
      border: none;
      color: var(--text-muted);
      font-size: 10px;
      font-weight: 600;
      font-family: var(--font-heading);
      cursor: pointer;
      flex: 1;
      transition: var(--transition);
      position: relative;
    }

    .nav-item svg {
      stroke: var(--text-muted);
      transition: var(--transition);
    }

    .nav-item.active {
      color: var(--primary);
    }

    .nav-item.active svg {
      stroke: var(--primary);
      transform: translateY(-2px);
      filter: drop-shadow(0 0 5px var(--primary-glow));
    }

    .nav-item.active::after {
      content: '';
      position: absolute;
      bottom: -6px;
      width: 16px;
      height: 3px;
      background: var(--primary);
      border-radius: 99px;
      box-shadow: 0 0 8px var(--primary);
    }

    @media(min-width: 768px) {
      .desktop-nav {
        display: flex;
      }
      .bottom-nav {
        display: none;
      }
      .container {
        padding-bottom: 40px;
      }
    }

    /* Cards */
    .card {
      background: var(--surface-card);
      border: 1px solid var(--border);
      border-radius: 16px;
      padding: 20px;
      box-shadow: var(--shadow);
      transition: var(--transition);
      position: relative;
      overflow: hidden;
    }

    .card:hover {
      border-color: rgba(249, 115, 22, 0.2);
      box-shadow: 0 15px 35px rgba(0,0,0,0.7);
    }

    .section-header {
      display: flex;
      align-items: center;
      justify-content: space-between;
      margin-bottom: 20px;
    }

    .section-title {
      font-family: var(--font-title);
      font-size: 22px;
      font-weight: 800;
      display: flex;
      align-items: center;
      gap: 10px;
      background: linear-gradient(135deg, #fff, #94a3b8);
      -webkit-background-clip: text;
      -webkit-text-fill-color: transparent;
    }

    /* Botões */
    .btn {
      display: inline-flex;
      align-items: center;
      justify-content: center;
      gap: 8px;
      padding: 10px 20px;
      border-radius: 10px;
      font-family: var(--font-heading);
      font-size: 13px;
      font-weight: 700;
      cursor: pointer;
      border: none;
      transition: var(--transition);
    }

    .btn:active {
      transform: scale(0.96);
    }

    .btn-primary {
      background: linear-gradient(135deg, var(--primary), #ea580c);
      color: #090b11;
      box-shadow: 0 4px 15px var(--primary-glow);
    }

    .btn-primary:hover {
      background: linear-gradient(135deg, #ea580c, #c2410c);
      box-shadow: 0 6px 20px rgba(249, 115, 22, 0.4);
    }

    .btn-accent {
      background: linear-gradient(135deg, var(--accent), #7c3aed);
      color: #fff;
      box-shadow: 0 4px 15px var(--accent-glow);
    }

    .btn-accent:hover {
      background: linear-gradient(135deg, #7c3aed, #6d28d9);
      box-shadow: 0 6px 20px rgba(139, 92, 246, 0.4);
    }

    .btn-secondary {
      background: var(--surface);
      border: 1px solid var(--border);
      color: var(--text-dim);
    }

    .btn-secondary:hover {
      background: var(--surface-overlay);
      color: #fff;
      border-color: var(--text-muted);
    }

    .btn-danger-ghost {
      background: rgba(239, 68, 68, 0.05);
      border: 1px solid rgba(239, 68, 68, 0.15);
      color: var(--danger);
    }

    .btn-danger-ghost:hover {
      background: rgba(239, 68, 68, 0.15);
      border-color: var(--danger);
    }

    .form-group {
      margin-bottom: 16px;
    }

    .label {
      display: block;
      font-size: 11px;
      font-weight: 700;
      color: var(--text-muted);
      margin-bottom: 6px;
      text-transform: uppercase;
      letter-spacing: 0.5px;
      font-family: var(--font-heading);
    }

    .input, .select, .textarea {
      width: 100%;
      background: var(--surface);
      border: 1px solid var(--border);
      color: var(--text);
      padding: 12px 14px;
      border-radius: 10px;
      font-family: var(--font-body);
      font-size: 13px;
      transition: var(--transition);
      outline: none;
    }

    .input:focus, .select:focus, .textarea:focus {
      border-color: var(--primary);
      box-shadow: 0 0 0 3px var(--primary-glow);
    }

    .textarea {
      resize: vertical;
      min-height: 90px;
      line-height: 1.5;
    }

    .form-grid-2 {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 12px;
    }

    /* Placa Mercosul */
    .plate-badge {
      display: inline-flex;
      flex-direction: column;
      border: 2px solid #1e40af;
      border-radius: 6px;
      overflow: hidden;
      width: 105px;
      height: 32px;
      background: #fff;
      box-shadow: 0 4px 10px rgba(0,0,0,0.15);
      font-family: var(--font-mono);
      flex-shrink: 0;
    }

    .plate-top {
      height: 8px;
      background: #1e40af;
      color: #fff;
      font-size: 5px;
      font-weight: 700;
      text-align: center;
      line-height: 8px;
      letter-spacing: 0.5px;
      text-transform: uppercase;
    }

    .plate-number {
      height: 20px;
      color: #111827;
      font-size: 14px;
      font-weight: 800;
      text-align: center;
      line-height: 20px;
      letter-spacing: 1px;
      text-transform: uppercase;
    }

    /* Badges */
    .badge {
      display: inline-flex;
      align-items: center;
      gap: 6px;
      padding: 6px 12px;
      border-radius: 20px;
      font-size: 11px;
      font-weight: 700;
      font-family: var(--font-heading);
      border: 1px solid transparent;
      width: fit-content;
    }

    .badge-aguardando {
      background: var(--warning-bg);
      color: var(--warning);
      border-color: rgba(245, 158, 11, 0.15);
    }
    .badge-andamento {
      background: var(--info-bg);
      color: var(--info);
      border-color: rgba(59, 130, 246, 0.15);
    }
    .badge-pronto {
      background: var(--success-bg);
      color: var(--success);
      border-color: rgba(16, 185, 129, 0.15);
    }
    .badge-entregue {
      background: rgba(100, 116, 139, 0.08);
      color: var(--text-dim);
      border-color: rgba(100, 116, 139, 0.15);
    }

    .list-container {
      display: flex;
      flex-direction: column;
      gap: 12px;
      margin-top: 12px;
    }

    .item-card {
      background: var(--surface-card);
      border: 1px solid var(--border);
      border-radius: 12px;
      padding: 16px;
      display: grid;
      grid-template-columns: 1fr;
      gap: 12px;
      align-items: center;
      transition: var(--transition);
    }

    .item-card:hover {
      border-color: var(--border-glow);
      transform: translateY(-2px);
    }

    @media (min-width: 768px) {
      .item-card {
        grid-template-columns: 1.5fr 1fr 1fr 1fr auto;
        gap: 16px;
      }
    }

    .item-details h4 {
      font-family: var(--font-heading);
      font-size: 15px;
      font-weight: 600;
      margin-bottom: 4px;
      color: var(--text);
    }

    .item-details p {
      font-size: 12px;
      color: var(--text-muted);
    }

    .value-highlight {
      font-family: var(--font-mono);
      font-size: 14px;
      font-weight: 700;
      color: var(--success);
    }

    .actions-cell {
      display: flex;
      gap: 6px;
      justify-content: flex-end;
    }

    .icon-btn {
      width: 34px;
      height: 34px;
      background: var(--surface);
      border: 1px solid var(--border);
      border-radius: 8px;
      color: var(--text-dim);
      display: flex;
      align-items: center;
      justify-content: center;
      cursor: pointer;
      transition: var(--transition);
    }

    .icon-btn:hover {
      color: var(--primary);
      border-color: var(--primary);
      background: var(--surface-overlay);
    }

    /* KPIs */
    .kpis-grid {
      display: grid;
      grid-template-columns: repeat(2, 1fr);
      gap: 12px;
      margin-bottom: 20px;
    }

    @media (max-width: 767px) {
      .kpis-grid > .kpi-card:last-child {
        grid-column: span 2;
      }
    }

    @media (min-width: 768px) {
      .kpis-grid {
        grid-template-columns: repeat(5, 1fr);
        gap: 16px;
      }
    }

    .kpi-card {
      background: var(--surface-card);
      border: 1px solid var(--border);
      border-radius: 16px;
      padding: 16px;
      display: flex;
      flex-direction: column;
      gap: 8px;
      position: relative;
      overflow: hidden;
      transition: var(--transition);
    }

    .kpi-card:hover {
      transform: translateY(-3px);
    }

    .kpi-icon-wrap {
      width: 36px;
      height: 36px;
      border-radius: 10px;
      display: flex;
      align-items: center;
      justify-content: center;
      color: #fff;
    }

    .kpi-value {
      font-family: var(--font-mono);
      font-size: 18px;
      font-weight: 700;
      color: var(--text);
    }

    .kpi-label {
      font-size: 10px;
      font-weight: 700;
      color: var(--text-muted);
      text-transform: uppercase;
      letter-spacing: 0.5px;
    }

    /* Modais */
    .modal-overlay {
      position: fixed;
      inset: 0;
      background: rgba(5, 7, 12, 0.85);
      backdrop-filter: blur(8px);
      z-index: 100;
      display: flex;
      align-items: center;
      justify-content: center;
      padding: 16px;
      animation: fadeIn 0.2s cubic-bezier(0.4, 0, 0.2, 1) both;
    }

    .modal-content {
      background: var(--surface-card);
      border: 1px solid var(--border);
      border-radius: 20px;
      width: 100%;
      max-width: 520px;
      max-height: 90vh;
      overflow-y: auto;
      padding: 24px;
      box-shadow: 0 25px 50px rgba(0, 0, 0, 0.8);
      position: relative;
      animation: slideUp 0.3s cubic-bezier(0.2, 0.8, 0.2, 1) both;
    }

    .modal-header {
      display: flex;
      align-items: center;
      justify-content: space-between;
      margin-bottom: 20px;
      border-bottom: 1px solid var(--border);
      padding-bottom: 12px;
    }

    .modal-title {
      font-family: var(--font-heading);
      font-size: 18px;
      font-weight: 700;
    }

    .modal-close {
      background: none;
      border: none;
      color: var(--text-muted);
      cursor: pointer;
      display: flex;
      align-items: center;
      justify-content: center;
      transition: var(--transition);
    }

    .modal-close:hover {
      color: #fff;
    }

    @keyframes fadeIn {
      from { opacity: 0; }
      to { opacity: 1; }
    }

    @keyframes slideUp {
      from { transform: translateY(20px); opacity: 0; }
      to { transform: translateY(0); opacity: 1; }
    }

    /* Autocomplete */
    .dropdown-suggest {
      position: absolute;
      top: 100%;
      left: 0;
      right: 0;
      background: var(--surface-overlay);
      border: 1px solid var(--primary);
      border-radius: 10px;
      max-height: 180px;
      overflow-y: auto;
      z-index: 200;
      margin-top: 4px;
      box-shadow: 0 10px 25px rgba(0,0,0,0.8);
    }

    .suggest-item {
      padding: 12px 16px;
      font-size: 13px;
      cursor: pointer;
      border-bottom: 1px solid var(--border);
      transition: var(--transition);
    }

    .suggest-item:hover {
      background: var(--surface);
      color: var(--primary);
    }

    .suggest-item-sub {
      font-size: 11px;
      color: var(--text-muted);
      margin-top: 2px;
    }

    .empty-state {
      text-align: center;
      padding: 40px 20px;
      color: var(--text-muted);
      font-size: 13px;
    }

    /* Filter Tabs */
    .filter-tabs {
      display: flex;
      flex-wrap: wrap;
      gap: 8px;
      margin-top: 4px;
    }

    .filter-tab {
      background: var(--surface-card);
      border: 1px solid var(--border);
      color: var(--text-dim);
      padding: 8px 16px;
      border-radius: 20px;
      font-size: 12px;
      font-weight: 600;
      font-family: var(--font-heading);
      cursor: pointer;
      transition: var(--transition);
      outline: none;
      -webkit-tap-highlight-color: transparent;
    }

    .filter-tab:hover {
      border-color: var(--primary);
      color: var(--text);
      background: var(--surface-overlay);
    }

    .filter-tab.active {
      background: var(--primary);
      color: #090b11;
      border-color: var(--primary);
      font-weight: 700;
      box-shadow: 0 0 12px var(--primary-glow);
    }

    @media (max-width: 767px) {
      .filter-tabs {
        display: flex;
        flex-wrap: wrap;
        gap: 6px;
        width: 100%;
      }
      .filter-tab {
        flex: 1 1 auto;
        padding: 8px 10px;
        font-size: 11px;
        text-align: center;
        white-space: nowrap;
      }
    }
            `}</style>
            <header>
              <div className="logo-area">
                <div className="logo-icon">🚗</div>
                <div className="logo-text">ASDCAR</div>
              </div>
              
              <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                <button 
                  className="btn btn-secondary" 
                  style={{ padding: "6px 12px", fontSize: "11px", gap: "4px" }}
                  onClick={() => setShowDriveModal(true)}
                  title="Configurar Google Drive"
                >
                  <Icon name="cloud" size={13} color={driveUrl ? "var(--success)" : "var(--text-dim)"} />
                  {driveUrl ? "Drive Ok" : "Conectar Drive"}
                </button>
                <div className="status-badge">
                  <div className="status-dot"></div>
                  Sistema Conectado
                </div>
                <button 
                  className="btn btn-accent" 
                  style={{ padding: "8px 14px", fontSize: "12px" }}
                  onClick={() => setShowReport(true)}
                >
                  <Icon name="file" size={14} color="#fff" /> Fechamento
                </button>
              </div>

              <div className="desktop-nav">
                {tabs.map(t => (
                  <button 
                    key={t.id} 
                    className={`btn ${tab === t.id ? "btn-primary" : "btn-secondary"}`} 
                    onClick={() => setTab(t.id)}
                    style={{ gap: "6px" }}
                  >
                    <Icon name={t.icon} size={15} color={tab === t.id ? "#090b11" : "var(--text-dim)"} />
                    {t.label}
                  </button>
                ))}
              </div>
            </header>

            <main className="container">
              {loading ? (
                <div style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", padding: "120px 20px", gap: "16px" }}>
                  <div className="status-dot" style={{ width: "24px", height: "24px", backgroundColor: "var(--primary)", boxShadow: "0 0 15px var(--primary)" }}></div>
                  <div style={{ color: "var(--text-dim)", fontWeight: 600, fontSize: "14px", letterSpacing: "0.5px" }}>Sincronizando Banco de Dados...</div>
                </div>
              ) : (
                <>
                  {tab === "dashboard" && <Dashboard services={services} viewMode={globalViewMode} setViewMode={setGlobalViewMode} />}
                  {tab === "services" && <ServicesTab services={services} vehicles={vehicles} loadAll={loadAll} onOpenOS={(s) => setShowOSModal(s)} driveUrl={driveUrl} onOpenDriveConfig={() => setShowDriveModal(true)} onZoomPhoto={(p) => setZoomPhoto(p)} />}
                  {tab === "finance" && <FinanceTab services={services} expenses={expenses} loadAll={loadAll} viewMode={globalViewMode} setViewMode={setGlobalViewMode} />}
                  {tab === "vehicles" && <VehiclesTab vehicles={vehicles} services={services} loadAll={loadAll} />}
                </>
              )}
            </main>

            <nav className="bottom-nav">
              <div className="nav-inner">
                {tabs.map(t => (
                  <button key={t.id} className={`nav-item ${tab === t.id ? "active" : ""}`} onClick={() => setTab(t.id)}>
                    <Icon name={t.icon} size={20} />
                    {t.label}
                  </button>
                ))}
              </div>
            </nav>

            {showReport && (
              <ReportModal 
                services={services} 
                viewMode={globalViewMode} 
                onClose={() => setShowReport(false)} 
                onGenerate={(f, t) => { generatePDF(vehicles, services, expenses, f, t, globalViewMode); setShowReport(false); }} 
              />
            )}
                        {showDriveModal && (
              <DriveModal 
                driveUrl={driveUrl} 
                onSave={(url) => { localStorage.setItem("asdcar_drive_url", url); setDriveUrl(url); }} 
                onClose={() => setShowDriveModal(false)} 
              />
            )}
            {zoomPhoto && <PhotoZoomModal photo={zoomPhoto} onClose={() => setZoomPhoto(null)} />}
            {showOSModal && <OSModal service={showOSModal} vehicles={vehicles} onClose={() => setShowOSModal(null)} />}
          </div>
        );
      }

      function Dashboard({ services, viewMode, setViewMode }: any) {
        const [selMonth, setSelMonth] = useState(new Date().getMonth());
        const [selYear, setSelYear] = useState(new Date().getFullYear());

        const activeServices = services.filter(s => s.status !== "Entregue");
        const filteredDelivered = services.filter(s => {
          if (s.status !== "Entregue" || !s.exitDate) return false;
          const d = new Date(s.exitDate + "T12:00:00");
          return d.getMonth() === selMonth && d.getFullYear() === selYear;
        });

        const tP = filteredDelivered.reduce((acc, s) => acc + (Number(s.partsValue) || 0), 0);
        const tL = filteredDelivered.reduce((acc, s) => acc + (Number(s.laborValue) || 0), 0);
        const ticketMedioVal = filteredDelivered.length > 0 ? (tL / filteredDelivered.length) : 0;

        const receitaCalculada = filteredDelivered.reduce((acc, s) => {
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
          <div style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
            <div className="card" style={{ display: "flex", flexWrap: "wrap", gap: "16px", background: "var(--surface)" }}>
              <div style={{ flex: "1 1 200px" }}>
                <label className="label">Mês de Referência</label>
                <select className="select" value={selMonth} onChange={(e) => setSelMonth(Number(e.target.value))}>
                  {MONTHS.map((m, i) => <option key={i} value={i}>{m}</option>)}
                </select>
              </div>
              <div style={{ flex: "1 1 100px" }}>
                <label className="label">Ano</label>
                <select className="select" value={selYear} onChange={(e) => setSelYear(Number(e.target.value))}>
                  {[2024, 2025, 2026, 2027].map(y => <option key={y} value={y}>{y}</option>)}
                </select>
              </div>
              <div style={{ flex: "2 1 300px" }}>
                <label className="label">Modelo de Filtro (Painel & PDF)</label>
                <select className="select" value={viewMode} onChange={(e) => setViewMode(e.target.value)}>
                  <option value="labor">Mão de Obra Líquida (Desconta taxas de cartão)</option>
                  <option value="total">Faturamento Bruto Líquido (Faturamento total com taxas descontadas)</option>
                </select>
              </div>
            </div>

            <div className="kpis-grid">
              {[
                { label: "Pátio Oficina", value: activeServices.length, icon: "wrench", bg: "var(--primary)", glow: "var(--primary-glow)" },
                { label: `Peças (${MONTHS[selMonth].slice(0,3)})`, value: fmt(tP), icon: "car", bg: "var(--accent)", glow: "var(--accent-glow)" },
                { label: `M.O. (${MONTHS[selMonth].slice(0,3)})`, value: fmt(tL), icon: "wrench", bg: "var(--success)", glow: "rgba(16,185,129,0.2)" },
                { label: `Ticket Médio M.O.`, value: fmt(ticketMedioVal), icon: "finance", bg: "var(--warning)", glow: "rgba(245, 158, 11, 0.2)" },
                { label: viewMode === "labor" ? "M.O. Líquida" : "Faturamento Líq.", value: fmt(receitaCalculada), icon: "finance", bg: "var(--info)", glow: "rgba(59,130,246,0.2)" },
              ].map((k, i) => (
                <div key={i} className="kpi-card">
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                    <div className="kpi-icon-wrap" style={{ backgroundColor: k.bg, boxShadow: `0 0 10px ${k.glow}` }}>
                      <Icon name={k.icon} size={16} color="#090b11" />
                    </div>
                    <div style={{ fontSize: "10px", color: "var(--success)", fontWeight: 700 }}>{i === 4 ? "LÍQUIDO" : ""}</div>
                  </div>
                  <div className="kpi-value" style={{ marginTop: "12px", color: i === 4 ? "var(--success)" : "var(--text)" }}>{k.value}</div>
                  <div className="kpi-label">{k.label}</div>
                </div>
              ))}
            </div>

            <div style={{ display: "grid", gridTemplateColumns: "1fr", gap: "20px" }} className="responsive-grid">
              <div className="card">
                <div className="section-header">
                  <h3 className="section-title">🛠️ Carros na Oficina ({activeServices.length})</h3>
                </div>
                {activeServices.length === 0 ? (
                  <div className="empty-state">Pátio livre de serviços pendentes.</div>
                ) : (
                  <div className="list-container">
                    {activeServices.map(sv => (
                      <div key={sv.id} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "12px 0", borderBottom: "1px solid var(--border)" }}>
                        <div>
                          <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                            <span className="plate-badge">
                              <span className="plate-top">BRASIL</span>
                              <span className="plate-number">{sv.vehiclePlate}</span>
                            </span>
                            <span style={{ fontSize: "13px", fontWeight: 700 }}>{sv.vehicleBrand} {sv.vehicleModel}</span>
                          </div>
                          <p style={{ fontSize: "11px", color: "var(--text-muted)", marginTop: "6px" }}>{sv.description.split("||")[0]}</p>
                        </div>
                        <span className={`badge badge-${statusClass(sv.status)}`}>{sv.status}</span>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              <div className="card">
                <div className="section-header">
                  <h3 className="section-title" style={{ color: "var(--success)" }}>✅ Finalizados & Entregues ({filteredDelivered.length})</h3>
                </div>
                {filteredDelivered.length === 0 ? (
                  <div className="empty-state">Nenhum serviço concluído no período.</div>
                ) : (
                  <div className="list-container">
                    {filteredDelivered.map(sv => (
                      <div key={sv.id} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "12px 0", borderBottom: "1px solid var(--border)" }}>
                        <div>
                          <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                            <span className="plate-badge">
                              <span className="plate-top">BRASIL</span>
                              <span className="plate-number">{sv.vehiclePlate}</span>
                            </span>
                            <span style={{ fontSize: "13px", fontWeight: 700 }}>{sv.vehicleBrand} {sv.vehicleModel}</span>
                          </div>
                          <p style={{ fontSize: "11px", color: "var(--text-muted)", marginTop: "6px" }}>Entregue em: {fmtDate(sv.exitDate)}</p>
                        </div>
                        <div style={{ textAlign: "right" }}>
                          <div className="value-highlight">{fmt(Number(sv.partsValue) + Number(sv.laborValue))}</div>
                          <span style={{ fontSize: "9px", color: "var(--text-muted)", textTransform: "uppercase" }}>{sv.paymentMethod}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        );
      }

      function statusClass(status: any) {
        if (status === "Aguardando") return "aguardando";
        if (status === "Em andamento") return "andamento";
        if (status === "Pronto") return "pronto";
        return "entregue";
      }

      function ServicesTab({ services, vehicles, loadAll, onOpenOS }) {
        const [modal, setModal] = useState(false);
        const [editing, setEditing] = useState<any>(null);
        const [form, setForm] = useState({});
        const [search, setSearch] = useState("");
        const [partsOwner, setPartsOwner] = useState("oficina"); 
        const [oficinaPartsText, setOficinaPartsText] = useState("");
        const [clientePartsText, setClientePartsText] = useState("");
        const [filterStatus, setFilterStatus] = useState("");
        const [photoType, setPhotoType] = useState("Vistoria / Avarias");
        const [uploading, setUploading] = useState(false);
        const [uploadStatus, setUploadStatus] = useState("");
        const fileInputRef = useRef(null);

        const handleUploadPhoto = async (file: any) => {
          if (!file) return;
          if (!driveUrl) {
            alert("Por favor, conecte seu Google Drive primeiro no botão do topo ('Conectar Drive')!");
            onOpenDriveConfig();
            return;
          }
          const v = vehicles.find(veh => veh.id === form.vehicleId);
          const plate = v?.plate || "GERAL";
          
          setUploading(true);
          setUploadStatus("⏳ Otimizando foto e enviando ao Google Drive...");
          
          try {
            const comp = await compressImage(file);
            const payload = {
              plate: plate,
              filename: `foto_${plate}_${Date.now()}.jpg`,
              mimeType: comp.mimeType,
              base64: comp.base64
            };

            const resp = await fetch(driveUrl, {
              method: "POST",
              headers: { "Content-Type": "text/plain;charset=utf-8" },
              body: JSON.stringify(payload)
            });
            const resData = await resp.json();
            
            if (resData.success) {
              const newPhoto = {
                id: resData.fileId,
                url: resData.url,
                driveLink: resData.driveLink,
                type: photoType,
                createdAt: new Date().toISOString()
              };
              const currentPhotos = form.photos || [];
              setForm({ ...form, photos: [...currentPhotos, newPhoto] });
              setUploadStatus("✅ Foto anexada com sucesso!");
              setTimeout(() => setUploadStatus(""), 3000);
            } else {
              throw new Error(resData.error || "Erro no upload");
            }
