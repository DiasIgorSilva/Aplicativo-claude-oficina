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

      
      function compressImage(file: any, maxWidth = 1600, quality = 0.8) {
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
          function handleClick(e: any) { if (ref.current && !ref.current.contains(e.target)) setOpen(false); }
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
          function handleClick(e: any) { if (ref.current && !ref.current.contains(e.target)) setOpen(false); }
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
        const [vehicles, setVehicles] = useState([]);
        const [services, setServices] = useState([]);
        const [expenses, setExpenses] = useState([]);
        const [loading, setLoading] = useState(true);
        const [showReport, setShowReport] = useState(false);
        const [showOSModal, setShowOSModal] = useState(null);
        const [globalViewMode, setGlobalViewMode] = useState("labor");
        const [driveUrl, setDriveUrl] = useState(() => localStorage.getItem("asdcar_drive_url") || "");
        const [showDriveModal, setShowDriveModal] = useState(false);
        const [zoomPhoto, setZoomPhoto] = useState(null);

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

      function ServicesTab({ services, vehicles, loadAll, onOpenOS }: any) {
        const [modal, setModal] = useState(false);
        const [editing, setEditing] = useState(null);
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
          } catch (err) {
            alert("Erro ao enviar foto para o Google Drive: " + err.message);
            setUploadStatus("");
          } finally {
            setUploading(false);
          }
        };

        const handleDeletePhoto = (index: any) => {
          if (!confirm("Deseja remover esta foto do registro? (O arquivo continuará no seu Google Drive)")) return;
          const currentPhotos = form.photos || [];
          const updated = currentPhotos.filter((_, idx) => idx !== index);
          setForm({ ...form, photos: updated });
        };

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
          const v = vehicles.find(v => v.id === form.vehicleId);
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
          const metodoCartaoMisto = form.mixedCardMethod || "Débito";

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
            mixed_card_method: form.paymentMethod === "Múltiplo / Misto" ? metodoCartaoMisto : null,
            photos: JSON.stringify(form.photos || [])
          };
          
          const { error } = await supabase.from("services").upsert(row);
          if (!error) { await loadAll(); close(); } else { alert("Erro ao salvar: " + error.message); }
        };

        const filtered = services.filter(s => {
          const matchesStatus = filterStatus ? s.status === filterStatus : true;
          const matchesSearch = !search || 
            (s.vehiclePlate || "").toLowerCase().includes(search.toLowerCase()) || 
            (s.vehicleBrand || "").toLowerCase().includes(search.toLowerCase()) || 
            (s.vehicleModel || "").toLowerCase().includes(search.toLowerCase()) || 
            (s.description || "").toLowerCase().includes(search.toLowerCase());
          return matchesStatus && matchesSearch;
        });

        return (
          <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
            <div className="section-header" style={{ marginBottom: "10px" }}>
              <h3 className="section-title">🛠️ Ordem de Serviços</h3>
              <button className="btn btn-primary" onClick={() => open()}>
                <Icon name="plus" size={15} color="#090b11" /> Novo Registro
              </button>
            </div>

            <div className="card" style={{ display: "flex", flexDirection: "column", gap: "12px", background: "var(--surface)" }}>
              <div style={{ position: "relative" }}>
                <input 
                  className="input" 
                  placeholder="Pesquisar por Placa, Carro ou Descrição..." 
                  value={search} 
                  onChange={e => setSearch(e.target.value)} 
                  style={{ paddingLeft: "40px" }}
                />
                <Icon name="search" size={16} color="var(--text-muted)" style={{ position: "absolute", left: "14px", top: "14px" }} />
              </div>

              <div className="filter-tabs">
                <button 
                  className={`filter-tab ${filterStatus === "" ? "active" : ""}`}
                  onClick={() => setFilterStatus("")}
                >
                  Todos
                </button>
                {Object.keys(STATUS_COLORS).map(s => (
                  <button 
                    key={s}
                    className={`filter-tab ${filterStatus === s ? "active" : ""}`}
                    onClick={() => setFilterStatus(s)}
                  >
                    {s}
                  </button>
                ))}
              </div>
            </div>

            <div className="list-container">
              {filtered.length === 0 ? (
                <div className="card empty-state">Nenhum serviço registrado neste filtro.</div>
              ) : (
                filtered.map(s => (
                  <div key={s.id} className="item-card">
                    <div>
                      <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                        <span className="plate-badge">
                          <span className="plate-top">BRASIL</span>
                          <span className="plate-number">{s.vehiclePlate}</span>
                        </span>
                        <span style={{ fontSize: "14px", fontWeight: 700 }}>{s.vehicleBrand} {s.vehicleModel}</span>
                      </div>
                      <div className="item-details" style={{ marginTop: "10px" }}>
                        <h4>{s.description.replace(/\|\|/g, " · ")}</h4>
                        <p>Entrada: {fmtDate(s.entryDate)} {s.exitDate ? ` · Saída: ${fmtDate(s.exitDate)}` : ""} · KM: {fmtKm(s.mileage)}</p>
                      </div>
                    </div>
                    <div>
                      <span className="label" style={{ marginBottom: "2px" }}>Mão de Obra</span>
                      <div style={{ fontSize: "13px", fontWeight: 600 }}>{fmt(s.laborValue)}</div>
                    </div>
                    <div>
                      <span className="label" style={{ marginBottom: "2px" }}>Peças</span>
                      <div style={{ fontSize: "13px", fontWeight: 600 }}>{fmt(s.partsValue)}</div>
                    </div>
                    <div>
                      <span className="label" style={{ marginBottom: "4px" }}>Status</span>
                      <span className={`badge badge-${statusClass(s.status)}`}>{s.status}</span>
                    </div>
                    <div className="actions-cell">
                      <button 
                        onClick={() => onOpenOS(s)} 
                        className="btn btn-accent" 
                        style={{ padding: "8px 12px", fontSize: "11px", gap: "4px" }}
                      >
                        <Icon name="file" size={13} color="#fff" /> OS
                      </button>
                      <button onClick={() => open(s)} className="icon-btn" title="Editar"><Icon name="edit" size={14} /></button>
                    </div>
                  </div>
                ))
              )}
            </div>

            {modal && (
              <div className="modal-overlay" onClick={close}>
                <div className="modal-content" onClick={e => e.stopPropagation()}>
                  <div className="modal-header">
                    <h3 className="modal-title">{editing ? "Editar Serviço" : "Nova Entrada de Veículo"}</h3>
                    <button className="modal-close" onClick={close}><Icon name="x" size={18} /></button>
                  </div>

                  <VehicleSelector vehicles={vehicles} value={form.vehicleId} onChange={(val) => setForm({ ...form, vehicleId: val })} />
                  
                  <div className="form-group">
                    <label className="label">Defeito / Serviço Principal *</label>
                    <textarea 
                      className="textarea"
                      placeholder="Descreva o serviço a ser feito..."
                      value={form.description ? form.description.split("||")[0] : ""}
                      onChange={e => setForm({ ...form, description: e.target.value })}
                    />
                  </div>

                  <div className="form-group">
                    <label className="label">Fornecimento das Peças</label>
                    <select className="select" value={partsOwner} onChange={e => setPartsOwner(e.target.value)}>
                      <option value="oficina">Oficina comprou tudo (Padrão)</option>
                      <option value="cliente">Cliente trouxe tudo</option>
                      <option value="mista">Fornecimento Misto (Oficina + Cliente)</option>
                    </select>
                  </div>

                  {partsOwner === "mista" && (
                    <div style={{ background: "var(--surface)", padding: "14px", borderRadius: "10px", marginBottom: "16px", border: "1px solid var(--border)" }}>
                      <div className="form-group">
                        <label className="label">O que a ASDCAR comprou?</label>
                        <input className="input" placeholder="Ex: Óleo, Filtros" value={oficinaPartsText} onChange={e => setOficinaPartsText(e.target.value)} />
                      </div>
                      <div className="form-group" style={{ marginBottom: 0 }}>
                        <label className="label">O que o Cliente trouxe?</label>
                        <input className="input" placeholder="Ex: Correia Dentada, Pastilhas" value={clientePartsText} onChange={e => setClientePartsText(e.target.value)} />
                      </div>
                    </div>
                  )}

                  <div className="form-grid-2">
                    <div className="form-group">
                      <label className="label">KM Atual</label>
                      <input className="input" type="number" value={form.mileage || ""} onChange={e => setForm({ ...form, mileage: e.target.value })} />
                    </div>
                    <div className="form-group">
                      <label className="label">{partsOwner === "cliente" ? "Peças (Cliente Forneceu)" : "Valor Peças ASDCAR (R$)"}</label>
                      <input 
                        className="input" 
                        type="number" 
                        value={partsOwner === "cliente" ? 0 : (form.partsValue || "")} 
                        onChange={e => setForm({ ...form, partsValue: e.target.value })} 
                        disabled={partsOwner === "cliente"} 
                      />
                    </div>
                  </div>

                  <div className="form-grid-2">
                    <div className="form-group">
                      <label className="label">Mão de Obra (R$)</label>
                      <input className="input" type="number" value={form.laborValue || ""} onChange={e => setForm({ ...form, laborValue: e.target.value })} />
                    </div>
                    <div className="form-group">
                      <label className="label">Status</label>
                      <select className="select" value={form.status} onChange={e => setForm({ ...form, status: e.target.value })}>
                        {Object.keys(STATUS_COLORS).map(s => <option key={s} value={s}>{s}</option>)}
                      </select>
                    </div>
                  </div>

                  <div className="form-grid-2">
                    <div className="form-group">
                      <label className="label">Data de Entrada</label>
                      <input className="input" type="date" value={form.entryDate || ""} onChange={e => setForm({ ...form, entryDate: e.target.value })} />
                    </div>
                    {form.status === "Entregue" && (
                      <div className="form-group">
                        <label className="label">Data de Entrega</label>
                        <input className="input" type="date" value={form.exitDate || today()} onChange={e => setForm({ ...form, exitDate: e.target.value })} />
                      </div>
                    )}
                  </div>

                  {form.status === "Entregue" && (
                    <div style={{ background: "var(--surface)", padding: "14px", borderRadius: "10px", border: "1px solid var(--success)", marginTop: "10px" }}>
                      <div className="form-group">
                        <label className="label">Forma de Pagamento</label>
                        <select className="select" value={form.paymentMethod} onChange={e => setForm({ ...form, paymentMethod: e.target.value })}>
                          {Object.keys(PAYMENT_METHODS).map(m => <option key={m} value={m}>{m}</option>)}
                          <option value="Múltiplo / Misto">Múltiplo / Misto (Cartão + Pix/Dinheiro)</option>
                        </select>
                      </div>

                      {form.paymentMethod === "Múltiplo / Misto" && (
                        <div style={{ marginTop: "12px", paddingTop: "12px", borderTop: "1px dashed var(--border)" }}>
                          <div className="form-grid-2">
                            <div className="form-group">
                              <label className="label">Pix ou Dinheiro (R$)</label>
                              <input className="input" type="number" value={form.mixedCash || ""} onChange={e => setForm({ ...form, mixedCash: e.target.value })} />
                            </div>
                            <div className="form-group">
                              <label className="label">Parte Cartão (R$)</label>
                              <input className="input" type="number" value={form.mixedCard || ""} onChange={e => setForm({ ...form, mixedCard: e.target.value })} />
                            </div>
                          </div>
                          <div className="form-group" style={{ marginBottom: 0 }}>
                            <label className="label">Plano do Cartão</label>
                            <select className="select" value={form.mixedCardMethod || "Débito"} onChange={e => setForm({ ...form, mixedCardMethod: e.target.value })}>
                              {Object.keys(PAYMENT_METHODS).filter(m => m !== "Dinheiro" && m !== "Pix").map(m => (
                                <option key={m} value={m}>{m}</option>
                              ))}
                            </select>
                          </div>
                        </div>
                      )}
                    </div>
                  )}

                                    {/* Seção Google Drive Fotos & Vistoria */}
                  <div style={{ background: "var(--surface)", padding: "14px", borderRadius: "12px", marginTop: "16px", border: "1px solid var(--border)" }}>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "10px" }}>
                      <label className="label" style={{ marginBottom: 0 }}>📷 Fotos & Vistoria do Veículo</label>
                      {driveUrl ? (
                        <span style={{ fontSize: "10px", color: "var(--success)", fontWeight: 700 }}>● Drive Conectado</span>
                      ) : (
                        <button className="btn btn-secondary" style={{ padding: "4px 8px", fontSize: "10px" }} onClick={onOpenDriveConfig}>⚙️ Conectar Drive</button>
                      )}
                    </div>

                    <div style={{ display: "flex", gap: "8px", marginBottom: "8px" }}>
                      <select className="select" value={photoType} onChange={e => setPhotoType(e.target.value)} style={{ flex: 1 }}>
                        <option value="Vistoria / Avarias">🚗 Vistoria (Arranhão / Batida)</option>
                        <option value="Diagnóstico / Defeito">🔍 Diagnóstico / Defeito</option>
                        <option value="Peça Antiga / Nova">⚙️ Peça Antiga / Nova</option>
                        <option value="Serviço Concluído">✅ Serviço Concluído</option>
                      </select>

                      <input 
                        type="file" 
                        ref={fileInputRef} 
                        accept="image/*" 
                        capture="environment" 
                        style={{ display: "none" }} 
                        onChange={e => handleUploadPhoto(e.target.files[0])} 
                      />
                      
                      <button 
                        className="btn btn-accent" 
                        style={{ padding: "8px 12px", fontSize: "11px", whiteSpace: "nowrap", gap: "4px" }}
                        onClick={() => {
                          if (!driveUrl) { onOpenDriveConfig(); return; }
                          fileInputRef.current.click();
                        }}
                        disabled={uploading}
                      >
                        <Icon name="camera" size={14} color="#fff" />
                        {uploading ? "Enviando..." : "Add Foto"}
                      </button>
                    </div>

                    {uploadStatus && <div style={{ fontSize: "11px", color: "var(--primary)", marginTop: "4px" }}>{uploadStatus}</div>}

                    {form.photos && form.photos.length > 0 && (
                      <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: "8px", marginTop: "12px" }}>
                        {form.photos.map((p, idx) => (
                          <div key={idx} style={{ position: "relative", borderRadius: "8px", overflow: "hidden", border: "1px solid var(--border)", background: "#000" }}>
                            <img src={p.url} alt={p.type} style={{ width: "100%", height: "75px", objectFit: "cover", cursor: "pointer" }} onClick={() => onZoomPhoto(p)} />
                            <div style={{ position: "absolute", bottom: 0, left: 0, right: 0, background: "rgba(0,0,0,0.75)", padding: "2px 4px", fontSize: "9px", color: "#fff", textOverflow: "ellipsis", overflow: "hidden", whiteSpace: "nowrap" }}>
                              {p.type.split(" ")[0]}
                            </div>
                            <button 
                              onClick={() => handleDeletePhoto(idx)} 
                              style={{ position: "absolute", top: "3px", right: "3px", background: "rgba(239, 68, 68, 0.85)", border: "none", color: "#fff", borderRadius: "4px", width: "18px", height: "18px", fontSize: "11px", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center" }}
                              title="Remover foto"
                            >
                              ×
                            </button>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>

                  <button className="btn btn-primary" style={{ width: "100%", marginTop: "20px", height: "46px" }} onClick={save}>
                    Salvar Informações
                  </button>
                </div>
              </div>
            )}
          </div>
        );
      }

      function FinanceTab({ services, expenses, loadAll, viewMode, setViewMode }: any) {
        const [modal, setModal] = useState(false);
        const [form, setForm] = useState({ expense_date: today() });
        const [selMonth, setSelMonth] = useState(new Date().getMonth());
        const [selYear, setSelYear] = useState(new Date().getFullYear());

        const totalIn = services.filter(s => s.status === "Entregue" && s.exitDate && new Date(s.exitDate + "T12:00:00").getMonth() === selMonth && new Date(s.exitDate + "T12:00:00").getFullYear() === selYear)
          .reduce((acc, s) => {
            if (s.paymentMethod === "Múltiplo / Misto") {
              const taxaCard = PAYMENT_METHODS[s.mixedCardMethod || "Débito"] || 0;
              const dinheiroPixLivre = Number(s.mixedCash || 0);
              if (viewMode === "labor") {
                const totalBrutoServico = (Number(s.partsValue) || 0) + (Number(s.laborValue) || 0);
                if (totalBrutoServico <= 0) return acc;
                const percentualLabor = Number(s.laborValue) / totalBrutoServico;
                return acc + (dinheiroPixLivre * percentualLabor) + ((Number(s.mixedCard || 0) * percentualLabor) * (1 - taxaCard / 100));
              } else {
                return acc + dinheiroPixLivre + (Number(s.mixedCard || 0) * (1 - taxaCard / 100));
              }
            }
            const taxa = PAYMENT_METHODS[s.paymentMethod] || 0;
            return viewMode === "labor" ? acc + (Number(s.laborValue || 0) * (1 - taxa / 100)) : acc + (s.netValue || 0);
          }, 0);

        const filteredExp = expenses.filter(e => e.expense_date && new Date(e.expense_date + "T12:00:00").getMonth() === selMonth && new Date(e.expense_date + "T12:00:00").getFullYear() === selYear);
        const totalOut = filteredExp.reduce((acc, e) => acc + Number(e.value || 0), 0);

        const saveExp = async () => {
          if (!form.category || !form.value) return alert("Preencha categoria e valor.");
          const row = { id: form.id || uid(), category: form.category, value: Number(form.value), supplier: form.supplier || "Geral", expense_date: form.expense_date || today() };
          const { error } = await supabase.from("expenses").upsert(row);
          if (!error) { await loadAll(); setModal(false); setForm({ expense_date: today() }); } else { alert("Erro ao salvar: " + error.message); }
        };

        const deleteExp = async (id) => {
          if (!confirm("Deseja realmente excluir esta despesa?")) return;
          const { error } = await supabase.from("expenses").delete().eq("id", id);
          if (!error) { await loadAll(); } else { alert("Erro ao deletar: " + error.message); }
        };

        return (
          <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
            <div className="section-header" style={{ marginBottom: "10px" }}>
              <h3 className="section-title">💰 Fluxo de Caixa</h3>
              <button className="btn btn-primary" onClick={() => { setForm({ expense_date: today() }); setModal(true); }}>
                <Icon name="plus" size={15} color="#090b11" /> Lançar Saída
              </button>
            </div>

            <div className="card" style={{ display: "flex", gap: "10px", alignItems: "center", background: "var(--surface)" }}>
              <div style={{ flex: 1 }}>
                <label className="label">Mês Financeiro</label>
                <select className="select" value={selMonth} onChange={(e) => setSelMonth(Number(e.target.value))}>
                  {MONTHS.map((m, i) => <option key={i} value={i}>{m}</option>)}
                </select>
              </div>
              <div style={{ width: 120 }}>
                <label className="label">Ano</label>
                <select className="select" value={selYear} onChange={(e) => setSelYear(Number(e.target.value))}>
                  {[2024, 2025, 2026, 2027].map(y => <option key={y} value={y}>{y}</option>)}
                </select>
              </div>
            </div>

            <div className="kpis-grid">
              <div className="kpi-card" style={{ borderLeft: "4px solid var(--success)" }}>
                <span className="kpi-label">{viewMode === "labor" ? "Entradas M.O. Líquida" : "Entradas Totais Líquidas"}</span>
                <div className="kpi-value" style={{ color: "var(--success)" }}>{fmt(totalIn)}</div>
              </div>
              <div className="kpi-card" style={{ borderLeft: "4px solid var(--danger)" }}>
                <span className="kpi-label">Despesas (Saídas)</span>
                <div className="kpi-value" style={{ color: "var(--danger)" }}>{fmt(totalOut)}</div>
              </div>
              <div className="kpi-card" style={{ gridColumn: "1 / -1", borderLeft: `4px solid ${(totalIn - totalOut) >= 0 ? "var(--success)" : "var(--danger)"}` }}>
                <span className="kpi-label">Margem Real do Mês (Lucro / Prejuízo)</span>
                <div className="kpi-value" style={{ fontSize: "22px", color: (totalIn - totalOut) >= 0 ? "var(--success)" : "var(--danger)" }}>
                  {fmt(totalIn - totalOut)}
                </div>
              </div>
            </div>

            <div className="card">
              <div className="section-header">
                <h3 className="section-title">📊 Relatório de Despesas</h3>
                <span style={{ fontSize: "11px", color: "var(--text-muted)" }}>{filteredExp.length} despesas este mês</span>
              </div>
              
              {filteredExp.length === 0 ? (
                <div className="empty-state">Nenhuma despesa registrada neste mês de referência.</div>
              ) : (
                <div className="list-container">
                  {filteredExp.map(e => (
                    <div key={e.id} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "12px 0", borderBottom: "1px solid var(--border)" }}>
                      <div>
                        <div style={{ fontSize: "14px", fontWeight: 700 }}>{e.category}</div>
                        <div style={{ fontSize: "11px", color: "var(--text-muted)", marginTop: "4px" }}>
                          Destino: {e.supplier} · Pago em: {fmtDate(e.expense_date)}
                        </div>
                      </div>
                      <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                        <div className="value-highlight" style={{ color: "var(--danger)", fontSize: "14px" }}>-{fmt(e.value)}</div>
                        <button 
                          onClick={() => { setForm(e); setModal(true); }} 
                          className="icon-btn"
                          title="Editar"
                        >
                          <Icon name="edit" size={13} />
                        </button>
                        <button 
                          onClick={() => deleteExp(e.id)} 
                          className="icon-btn"
                          style={{ color: "var(--danger)" }}
                          title="Excluir"
                        >
                          <Icon name="trash" size={13} />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {modal && (
              <div className="modal-overlay" onClick={() => setModal(false)}>
                <div className="modal-content" onClick={e => e.stopPropagation()}>
                  <div className="modal-header">
                    <h3 className="modal-title">{form.id ? "Editar Lançamento" : "Nova Despesa Interna"}</h3>
                    <button className="modal-close" onClick={() => setModal(false)}><Icon name="x" size={18} /></button>
                  </div>
                  
                  <div className="form-group">
                    <label className="label">Categoria do Gasto *</label>
                    <input className="input" placeholder="Ex: Aluguel, Luz, Ferramentas" value={form.category || ""} onChange={e => setForm({ ...form, category: e.target.value })} />
                  </div>

                  <div className="form-group">
                    <label className="label">Valor Pago (R$) *</label>
                    <input className="input" type="number" placeholder="0.00" value={form.value || ""} onChange={e => setForm({ ...form, value: e.target.value })} />
                  </div>

                  <div className="form-group">
                    <label className="label">Fornecedor / Destino</label>
                    <input className="input" placeholder="Ex: CPFL, Imobiliária, Mercado" value={form.supplier || ""} onChange={e => setForm({ ...form, supplier: e.target.value })} />
                  </div>

                  <div className="form-group">
                    <label className="label">Data de Vencimento / Pagamento</label>
                    <input className="input" type="date" value={form.expense_date || ""} onChange={e => setForm({ ...form, expense_date: e.target.value })} />
                  </div>

                  <button className="btn btn-primary" style={{ width: "100%", marginTop: "20px" }} onClick={saveExp}>
                    Salvar Despesa
                  </button>
                </div>
              </div>
            )}
          </div>
        );
      }

      function VehiclesTab({ vehicles, services, loadAll }: any) {
        const [modal, setModal] = useState(false);
        const [historyModal, setHistoryModal] = useState(false);
        const [selectedV, setSelectedV] = useState(null);
        const [editing, setEditing] = useState(null);
        const [search, setSearch] = useState("");
        const [form, setForm] = useState({});
        
        const open = (v = null) => { setEditing(v); setForm(v || {}); setModal(true); };
        const close = () => { setModal(false); setEditing(null); setForm({}); };

        const save = async () => {
          if (!form.plate || !form.brand || !form.model) return alert("Dados obrigatórios faltando.");
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

        const filtered = vehicles.filter(v => 
          !search || 
          (v.plate || "").toLowerCase().includes(search.toLowerCase()) || 
          (v.owner || "").toLowerCase().includes(search.toLowerCase()) || 
          (v.model || "").toLowerCase().includes(search.toLowerCase())
        );

        return (
          <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
            <div className="section-header" style={{ marginBottom: "10px" }}>
              <h3 className="section-title">🚗 Banco de Veículos</h3>
              <button className="btn btn-primary" onClick={() => open()}>
                <Icon name="plus" size={15} color="#090b11" /> Novo Cadastro
              </button>
            </div>

            <div className="card" style={{ background: "var(--surface)" }}>
              <div style={{ position: "relative" }}>
                <input 
                  className="input" 
                  placeholder="Buscar por placa, modelo ou nome de cliente..." 
                  value={search} 
                  onChange={e => setSearch(e.target.value)} 
                  style={{ paddingLeft: "40px" }}
                />
                <Icon name="search" size={16} color="var(--text-muted)" style={{ position: "absolute", left: "14px", top: "14px" }} />
              </div>
            </div>

            <div className="list-container">
              {filtered.length === 0 ? (
                <div className="card empty-state">Nenhum veículo registrado ou encontrado.</div>
              ) : (
                filtered.map(v => {
                  const count = services.filter(s => s.vehicleId === v.id).length;
                  return (
                    <div key={v.id} className="item-card">
                      <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                        <span className="plate-badge">
                          <span className="plate-top">BRASIL</span>
                          <span className="plate-number">{v.plate}</span>
                        </span>
                        <div>
                          <h4 style={{ fontSize: "15px", fontWeight: 700 }}>{v.brand} {v.model}</h4>
                          <p style={{ fontSize: "11px", color: "var(--text-muted)" }}>Ano: {v.year || "—"} · KM Inicial: {fmtKm(v.mileage)}</p>
                        </div>
                      </div>
                      <div>
                        <span className="label" style={{ marginBottom: "2px" }}>Proprietário</span>
                        <div style={{ fontSize: "13px", fontWeight: 600 }}>{v.owner || "Não informado"}</div>
                      </div>
                      <div>
                        <span className="label" style={{ marginBottom: "2px" }}>Contato</span>
                        <div style={{ fontSize: "13px", fontWeight: 600 }}>{v.phone || "—"}</div>
                      </div>
                      <div>
                        <span className="label" style={{ marginBottom: "2px" }}>Frequência</span>
                        <div style={{ fontSize: "13px", fontWeight: 600 }}>{count} Serviço{count !== 1 ? "s" : ""}</div>
                      </div>
                      <div className="actions-cell">
                        <button 
                          onClick={() => { setSelectedV(v); setHistoryModal(true); }} 
                          className="btn btn-secondary" 
                          style={{ padding: "8px 12px", fontSize: "11px" }}
                        >
                          <Icon name="history" size={13} color="var(--text-dim)" /> Histórico
                        </button>
                        <button onClick={() => open(v)} className="icon-btn" title="Editar"><Icon name="edit" size={14} /></button>
                      </div>
                    </div>
                  );
                })
              )}
            </div>

            {modal && (
              <div className="modal-overlay" onClick={close}>
                <div className="modal-content" onClick={e => e.stopPropagation()}>
                  <div className="modal-header">
                    <h3 className="modal-title">{form.id ? "Editar Registro" : "Novo Cadastro Automotivo"}</h3>
                    <button className="modal-close" onClick={close}><Icon name="x" size={18} /></button>
                  </div>

                  <div className="form-group">
                    <label className="label">Placa do Veículo *</label>
                    <input className="input" placeholder="Ex: ABC1D23" value={form.plate || ""} onChange={e => setForm({ ...form, plate: e.target.value.toUpperCase() })} />
                  </div>

                  <BrandSelector value={form.brand || ""} onChange={(val) => setForm({ ...form, brand: val })} />

                  <div className="form-group">
                    <label className="label">Modelo *</label>
                    <input className="input" placeholder="Ex: Corolla XEI, Gol G5" value={form.model || ""} onChange={e => setForm({ ...form, model: e.target.value })} />
                  </div>

                  <div className="form-grid-2">
                    <div className="form-group">
                      <label className="label">Ano</label>
                      <input className="input" placeholder="Ex: 2018" value={form.year || ""} onChange={e => setForm({ ...form, year: e.target.value })} />
                    </div>
                    <div className="form-group">
                      <label className="label">KM de Entrada Inicial</label>
                      <input className="input" type="number" placeholder="0" value={form.mileage || ""} onChange={e => setForm({ ...form, mileage: e.target.value })} />
                    </div>
                  </div>

                  <div className="form-group">
                    <label className="label">Cliente / Proprietário</label>
                    <input className="input" placeholder="Nome do Dono do Veículo" value={form.owner || ""} onChange={e => setForm({ ...form, owner: e.target.value })} />
                  </div>

                  <div className="form-group">
                    <label className="label">Telefone / WhatsApp</label>
                    <input className="input" placeholder="Ex: (11) 99999-9999" value={form.phone || ""} onChange={e => setForm({ ...form, phone: e.target.value })} />
                  </div>

                  <button className="btn btn-primary" style={{ width: "100%", marginTop: "20px" }} onClick={save}>
                    Confirmar Cadastro
                  </button>
                </div>
              </div>
            )}

            {historyModal && (
              <div className="modal-overlay" onClick={() => setHistoryModal(false)}>
                <div className="modal-content" style={{ maxWidth: "600px" }} onClick={e => e.stopPropagation()}>
                  <div className="modal-header">
                    <h3 className="modal-title">Histórico Geral: {selectedV?.plate}</h3>
                    <button className="modal-close" onClick={() => setHistoryModal(false)}><Icon name="x" size={18} /></button>
                  </div>

                  <div style={{ background: "var(--surface)", padding: "12px", borderRadius: "10px", marginBottom: "16px", fontSize: "13px" }}>
                    <strong>Proprietário:</strong> {selectedV?.owner || "Sem nome registrado"} <br/>
                    <strong>Veículo:</strong> {selectedV?.brand} {selectedV?.model} {selectedV?.year ? `(${selectedV.year})` : ""}
                  </div>

                  <div style={{ maxHeight: "350px", overflowY: "auto" }}>
                    {services.filter(s => s.vehicleId === selectedV?.id).length === 0 ? (
                      <div className="empty-state">Este veículo ainda não possui serviços registrados no banco.</div>
                    ) : (
                      services.filter(s => s.vehicleId === selectedV?.id).map(s => (
                        <div key={s.id} style={{ padding: "14px", background: "var(--surface)", borderRadius: "10px", marginBottom: "10px", borderLeft: `3px solid ${STATUS_COLORS[s.status] || "var(--border)"}` }}>
                          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
                            <span style={{ fontSize: "13px", fontWeight: 700 }}>{s.description.replace(/\|\|/g, " · ")}</span>
                            <span className={`badge badge-${statusClass(s.status)}`} style={{ padding: "3px 8px", fontSize: "9px" }}>{s.status}</span>
                          </div>
                          <div style={{ fontSize: "11px", color: "var(--text-muted)", marginTop: "6px" }}>
                            KM: {fmtKm(s.mileage)} | Entrada: {fmtDate(s.entryDate)} {s.exitDate ? `| Saída: ${fmtDate(s.exitDate)}` : ""}
                          </div>
                          
                          {s.photos && s.photos.length > 0 && (
                            <div style={{ display: "flex", gap: "6px", overflowX: "auto", marginTop: "10px", paddingBottom: "4px" }}>
                              {s.photos.map((p, pIdx) => (
                                <div key={pIdx} style={{ flexShrink: 0, position: "relative" }}>
                                  <img src={p.url} alt={p.type} style={{ width: "60px", height: "60px", borderRadius: "6px", objectFit: "cover", border: "1px solid var(--border)", cursor: "pointer" }} onClick={() => onZoomPhoto(p)} />
                                </div>
                              ))}
                            </div>
                          )}
                          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginTop: "8px", paddingTop: "8px", borderTop: "1px dashed var(--border)" }}>
                            <span style={{ fontSize: "10px", color: "var(--text-muted)" }}>Pagamento: {s.paymentMethod}</span>
                            <span style={{ fontSize: "12px", fontWeight: 800, color: "var(--success)" }}>Total: {fmt(Number(s.partsValue) + Number(s.laborValue))}</span>
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                  
                  <button className="btn btn-secondary" style={{ width: "100%", marginTop: "20px" }} onClick={() => setHistoryModal(false)}>
                    Fechar Janela
                  </button>
                </div>
              </div>
            )}
          </div>
        );
      }

      function ReportModal({ onClose, onGenerate }: any) {
        const [from, setFrom] = useState(today().slice(0, 8) + "01");
        const [to, setTo] = useState(today());
        return (
          <div className="modal-overlay" onClick={onClose}>
            <div className="modal-content" onClick={e => e.stopPropagation()}>
              <div className="modal-header">
                <h3 className="modal-title">Gerar Fechamento Financeiro</h3>
                <button className="modal-close" onClick={onClose}><Icon name="x" size={18} /></button>
              </div>
              
              <div className="form-group">
                <label className="label">Data de Início</label>
                <input className="input" type="date" value={from} onChange={e => setFrom(e.target.value)} />
              </div>

              <div className="form-group">
                <label className="label">Data de Término</label>
                <input className="input" type="date" value={to} onChange={e => setTo(e.target.value)} />
              </div>

              <button className="btn btn-primary" style={{ width: "100%", marginTop: "20px" }} onClick={() => onGenerate(from, to)}>
                Compilar Fechamento Comercial
              </button>
            </div>
          </div>
        );
      }

      function OSModal({ service, vehicles, onClose }: any) {
        const [email, setEmail] = useState("");
        const car = vehicles.find(v => v.id === service.vehicleId) || {};
        return (
          <div className="modal-overlay" onClick={onClose}>
            <div className="modal-content" onClick={e => e.stopPropagation()}>
              <div className="modal-header">
                <h3 className="modal-title">Emitir Ordem de Serviço (O.S.)</h3>
                <button className="modal-close" onClick={onClose}><Icon name="x" size={18} /></button>
              </div>
              
              <div className="form-group">
                <label className="label">Cliente</label>
                <input className="input" value={car.owner || "—"} disabled style={{ background: "var(--surface)", opacity: 0.7 }} />
              </div>

              <div className="form-group">
                <label className="label">E-mail de Contato (Opcional)</label>
                <input className="input" type="email" placeholder="cliente@email.com" value={email} onChange={e => setEmail(e.target.value)} />
              </div>

              <button className="btn btn-accent" style={{ width: "100%", marginTop: "20px" }} onClick={() => { generateOSFile(service, car, email); onClose(); }}>
                Gerar Via de Impressão (PDF)
              </button>
            </div>
          </div>
        );
      }

      function generateOSFile(s, car, email: any) {
        const tBruto = Number(s.partsValue || 0) + Number(s.laborValue || 0);
        let escopoPrincipal = s.description;
        let blocoPecasMistas = "";
        
        if (s.description?.includes("|| Peças Oficina:")) {
          const blocos = s.description.split("||");
          escopoPrincipal = blocos[0].trim();
          blocoPecasMistas = `
            <div style="margin-top:15px; padding:12px; background:#f8fafc; border-radius:6px; border:1px solid #e2e8f0;">
              <p style="margin-bottom:6px; font-size:11px;">⚙️ <strong>Peças fornecidas pela Oficina (ASDCAR):</strong> ${blocos[1]?.replace("Peças Oficina:", "")?.trim()}</p>
              <p style="font-size:11px;">👤 <strong>Peças trazidas pelo Cliente:</strong> ${blocos[2]?.replace("Peças Cliente:", "")?.trim()} (Sem ônus)</p>
            </div>`;
        } else if (s.description?.includes("(Cliente forneceu as peças)")) {
          escopoPrincipal = s.description.replace("(Cliente forneceu as peças)", "").trim();
          blocoPecasMistas = `<div style="margin-top:12px; padding:10px; background:#fffbeb; color:#b45309; border-radius:6px; border:1px solid #fef3c7; font-size:11px; font-style:italic;">⚠️ Nota: Todas as peças deste serviço foram providenciadas e fornecidas pelo próprio cliente.</div>`;
        }

        const html = `
        <!DOCTYPE html>
        <html lang="pt-BR">
        <head>
          <meta charset="UTF-8"/>
          <title>Ordem de Serviço - ASDCAR #${s.id.toUpperCase()}</title>
          <style>
            * { box-sizing: border-box; margin: 0; padding: 0; }
            body { font-family: 'Segoe UI', Arial, sans-serif; font-size: 12px; color: #1e293b; padding: 30px; line-height: 1.5; }
            .os-box { border: 1px solid #cbd5e1; padding: 25px; border-radius: 8px; max-width: 800px; margin: 0 auto; background: #fff; box-shadow: 0 4px 6px rgba(0,0,0,0.05); }
            .hdr { display: flex; justify-content: space-between; align-items: center; border-bottom: 2px solid #0f172a; padding-bottom: 15px; margin-bottom: 20px; }
            .hdr-logo h1 { font-size: 24px; font-weight: 800; color: #f97316; letter-spacing: 0.5px; }
            .hdr-logo p { color: #64748b; font-size: 11px; margin-top: 2px; text-transform: uppercase; }
            .hdr-meta { text-align: right; font-size: 11px; }
            .grid-info { display: grid; grid-template-columns: 1fr 1fr; gap: 15px; margin-bottom: 20px; }
            .section-block { background: #f8fafc; padding: 14px; border-radius: 6px; border: 1px solid #e2e8f0; }
            h2 { font-size: 12px; font-weight: 700; text-transform: uppercase; color: #0f172a; margin-bottom: 8px; border-bottom: 1px solid #cbd5e1; padding-bottom: 4px; }
            .service-details { margin-bottom: 20px; }
            .desc-box { font-size: 13px; font-weight: 500; padding: 12px; border: 1px solid #e2e8f0; border-radius: 6px; background: #fff; line-height: 1.6; }
            .financial-table { width: 100%; border-collapse: collapse; margin-top: 15px; }
            .financial-table th { background: #0f172a; color: #fff; padding: 8px 12px; font-size: 11px; text-align: left; text-transform: uppercase; }
            .financial-table td { padding: 10px 12px; border-bottom: 1px solid #e2e8f0; }
            .total-row { font-size: 14px; font-weight: 800; background: #f8fafc; border-top: 2px solid #0f172a !important; }
            .termos { font-size: 9px; color: #64748b; margin: 25px 0; text-align: justify; line-height: 1.4; border-top: 1px solid #e2e8f0; padding-top: 12px; }
            .assinaturas { display: grid; grid-template-columns: 1fr 1fr; gap: 40px; margin-top: 40px; }
            .sign-col { border-top: 1px solid #64748b; padding-top: 8px; text-align: center; font-size: 10px; font-weight: 600; text-transform: uppercase; }
            .btn-print { background: #f97316; color: #fff; border: none; padding: 12px; text-align: center; font-weight: 700; cursor: pointer; margin-bottom: 20px; border-radius: 6px; width: 100%; font-size: 14px; box-shadow: 0 4px 10px rgba(249, 115, 22, 0.2); }
            @media print {
              .btn-print { display: none; }
              body { padding: 0; }
              .os-box { border: none; box-shadow: none; padding: 0; }
            }
          </style>
        </head>
        <body>
          <button class="btn-print" onclick="window.print()">🖨️ IMPRIMIR COMPROVANTE / O.S. (SALVAR PDF)</button>
          
          <div class="os-box">
            <div class="hdr">
              <div class="hdr-logo">
                <h1>ASDCAR</h1>
                <p>Centro Automotivo & Manutenção</p>
              </div>
              <div class="hdr-meta">
                <strong>ORDEM DE SERVIÇO</strong><br/>
                O.S. ID: <strong>#${s.id.toUpperCase()}</strong><br/>
                Status: <strong>${s.status.toUpperCase()}</strong><br/>
                Data de Entrada: ${fmtDate(s.entryDate)}
              </div>
            </div>

            <div class="grid-info">
              <div class="section-block">
                <h2>👤 DADOS DO CLIENTE</h2>
                <p>Nome: <strong>${car.owner || '—'}</strong></p>
                <p>Telefone: <strong>${car.phone || '—'}</strong></p>
                <p>E-mail: <strong>${email || 'Não informado'}</strong></p>
              </div>
              <div class="section-block">
                <h2>🚗 FICHA DO VEÍCULO</h2>
                <p>Modelo: <strong>${car.brand || s.vehicleBrand} ${car.model || s.vehicleModel}</strong></p>
                <p>Placa: <strong style="text-transform: uppercase;">${s.vehiclePlate}</strong></p>
                <p>KM do Registro: <strong>${fmtKm(s.mileage)}</strong></p>
              </div>
            </div>

            <div class="service-details">
              <h2>🛠️ DESCRIÇÃO DO DIAGNÓSTICO E SERVIÇO</h2>
              <div class="desc-box">${escopoPrincipal}</div>
              ${blocoPecasMistas}
            </div>

            <div>
              <h2>💰 VALORES E PAGAMENTO</h2>
              <table class="financial-table">
                <thead>
                  <tr>
                    <th>Descrição da Despesa</th>
                    <th style="text-align: right; width: 150px;">Valor</th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td>Serviço de Mão de Obra Mecânica</td>
                    <td style="text-align: right; font-weight: 600;">${fmt(s.laborValue)}</td>
                  </tr>
                  <tr>
                    <td>Peças e Componentes Aplicados</td>
                    <td style="text-align: right; font-weight: 600;">${fmt(s.partsValue)}</td>
                  </tr>
                  <tr class="total-row">
                    <td>Valor Total do Orçamento</td>
                    <td style="text-align: right; color:#16a34a;">${fmt(tBruto)}</td>
                  </tr>
                </tbody>
              </table>
              ${s.status === "Entregue" ? `
                <div style="margin-top:12px; font-size:11px; color:#475569;">
                  Método de liquidação: <strong>${s.paymentMethod}</strong> ${s.exitDate ? ` | Pago em: <strong>${fmtDate(s.exitDate)}</strong>` : ""}
                </div>
              ` : ""}
            </div>

            ${s.photos && s.photos.length > 0 ? `
              <div style="margin-top:20px; page-break-inside:avoid;">
                <h2>📷 REGISTRO FOTOGRÁFICO DE VISTORIA</h2>
                <div style="display:grid; grid-template-columns:repeat(3, 1fr); gap:10px; margin-top:10px;">
                  ${s.photos.map(p => `
                    <div style="border:1px solid #cbd5e1; border-radius:6px; padding:6px; background:#f8fafc; text-align:center;">
                      <img src="${p.url}" style="width:100%; height:110px; object-fit:cover; border-radius:4px;" />
                      <div style="font-size:9px; font-weight:700; color:#475569; margin-top:4px;">${p.type}</div>
                    </div>
                  `).join("")}
                </div>
              </div>
            ` : ""}

            <div class="termos">
              <strong>TERMOS E GARANTIA:</strong> Oferecemos garantia legal de 90 dias a partir da data de entrega do serviço para serviços mecânicos de mão de obra e peças faturadas diretamente pela oficina. Peças fornecidas pelo próprio cliente não possuem cobertura de garantia civil ou responsabilidade mecânica da ASDCAR. A assinatura deste termo expressa plena aprovação e autorização das manutenções acima descritas.
            </div>

            <div class="assinaturas">
              <div class="sign-col">
                <div style="height:40px;"></div>
                ASDCAR Centro Automotivo
              </div>
              <div class="sign-col">
                <div style="height:40px;"></div>
                Assinatura do Cliente
              </div>
            </div>
          </div>
        </body>
        </html>
        `;

        const win = window.open("", "_blank");
        win.document.write(html);
        win.document.close();
      }

      function generatePDF(vehicles, services, expenses, from, to, viewMode: any) {
        const filteredServices = services.filter(s => 
          s.status === "Entregue" && 
          s.exitDate && 
          s.exitDate >= from && 
          s.exitDate <= to
        );

        const filteredExpenses = expenses.filter(e => 
          e.expense_date && 
          e.expense_date >= from && 
          e.expense_date <= to
        );

        const faturamentoTotal = filteredServices.reduce((acc, s) => {
          if (s.paymentMethod === "Múltiplo / Misto") {
            const taxaCard = PAYMENT_METHODS[s.mixedCardMethod || "Débito"] || 0;
            const dinheiroPixLivre = Number(s.mixedCash || 0);
            if (viewMode === "labor") {
              const totalBrutoServico = (Number(s.partsValue) || 0) + (Number(s.laborValue) || 0);
              if (totalBrutoServico <= 0) return acc;
              const percentualLabor = Number(s.laborValue) / totalBrutoServico;
              return acc + (dinheiroPixLivre * percentualLabor) + ((Number(s.mixedCard || 0) * percentualLabor) * (1 - taxaCard / 100));
            } else {
              return acc + dinheiroPixLivre + (Number(s.mixedCard || 0) * (1 - taxaCard / 100));
            }
          }
          const taxa = PAYMENT_METHODS[s.paymentMethod] || 0;
          return viewMode === "labor" ? acc + (Number(s.laborValue || 0) * (1 - taxa / 100)) : acc + (s.netValue || 0);
        }, 0);

        const totalPecas = filteredServices.reduce((acc, s) => acc + (Number(s.partsValue) || 0), 0);
        const totalMO = filteredServices.reduce((acc, s) => acc + (Number(s.laborValue) || 0), 0);
        const totalSaidas = filteredExpenses.reduce((acc, e) => acc + Number(e.value || 0), 0);
        const saldoFinal = faturamentoTotal - totalSaidas;

        const html = `
        <!DOCTYPE html>
        <html lang="pt-BR">
        <head>
          <meta charset="UTF-8"/>
          <title>Fechamento Comercial ASDCAR</title>
          <style>
            * { box-sizing: border-box; margin: 0; padding: 0; }
            body { font-family: 'Segoe UI', Arial, sans-serif; font-size: 11px; color: #1e293b; padding: 30px; line-height: 1.5; }
            .report-box { max-width: 900px; margin: 0 auto; background: #fff; }
            .hdr { display: flex; justify-content: space-between; align-items: center; border-bottom: 2px solid #0f172a; padding-bottom: 10px; margin-bottom: 20px; }
            .hdr h1 { font-size: 20px; font-weight: 800; color: #f97316; }
            .hdr p { font-size: 11px; color: #64748b; font-weight: 600; }
            .grid-summary { display: grid; grid-template-columns: repeat(4, 1fr); gap: 15px; margin-bottom: 25px; }
            .kpi { border: 1px solid #e2e8f0; background: #f8fafc; padding: 12px; border-radius: 6px; }
            .kpi strong { display: block; font-size: 15px; margin-top: 4px; color: #0f172a; }
            .kpi span { font-size: 9px; text-transform: uppercase; color: #64748b; font-weight: 700; }
            h2 { font-size: 11px; font-weight: 700; text-transform: uppercase; margin: 20px 0 8px 0; border-left: 3px solid #f97316; padding-left: 6px; color: #0f172a; }
            table { width: 100%; border-collapse: collapse; margin-bottom: 20px; }
            th { background: #f1f5f9; color: #475569; padding: 6px 8px; text-align: left; text-transform: uppercase; font-size: 9px; border-bottom: 1px solid #cbd5e1; }
            td { padding: 8px; border-bottom: 1px solid #f1f5f9; vertical-align: top; }
            .value-in { color: #16a34a; font-weight: 700; }
            .value-out { color: #dc2626; font-weight: 700; }
            .footer-meta { font-size: 9px; color: #64748b; text-align: center; margin-top: 30px; border-top: 1px solid #e2e8f0; padding-top: 12px; }
            .btn-print { background: #8b5cf6; color: #fff; border: none; padding: 12px; text-align: center; font-weight: 700; cursor: pointer; margin-bottom: 20px; border-radius: 6px; width: 100%; font-size: 14px; box-shadow: 0 4px 10px rgba(139, 92, 246, 0.2); }
            @media print {
              .btn-print { display: none; }
              body { padding: 0; }
            }
          </style>
        </head>
        <body>
          <button class="btn-print" onclick="window.print()">🖨️ IMPRIMIR RELATÓRIO COMERCIAL (SALVAR PDF)</button>
          
          <div class="report-box">
            <div class="hdr">
              <div>
                <h1>ASDCAR Centro Automotivo</h1>
                <p>Fechamento Comercial de Caixa</p>
              </div>
              <div style="text-align: right;">
                <p>Período: <strong>${fmtDate(from)} a ${fmtDate(to)}</strong></p>
                <p>Modelo de Filtro: <strong>${viewMode === "labor" ? "Apenas M.O. Líquida" : "Faturamento Bruto Líquido"}</strong></p>
              </div>
            </div>

            <div class="grid-summary">
              <div class="kpi">
                <span>Peças Bruto</span>
                <strong>${fmt(totalPecas)}</strong>
              </div>
              <div class="kpi">
                <span>Mão de Obra Bruta</span>
                <strong>${fmt(totalMO)}</strong>
              </div>
              <div class="kpi">
                <span>Entradas Líquidas (${viewMode === "labor" ? "M.O." : "Total"})</span>
                <strong style="color: #16a34a;">${fmt(faturamentoTotal)}</strong>
              </div>
              <div class="kpi" style="border-color: ${(saldoFinal) >= 0 ? '#bbf7d0' : '#fecaca'};">
                <span>Resultado Caixa (Líquido)</span>
                <strong style="color: ${(saldoFinal) >= 0 ? '#16a34a' : '#dc2626'};">${fmt(saldoFinal)}</strong>
              </div>
            </div>

            <h2>🛠️ Serviços Entregues (${filteredServices.length})</h2>
            <table>
              <thead>
                <tr>
                  <th style="width: 80px;">Saída</th>
                  <th style="width: 80px;">Veículo</th>
                  <th>Descrição do Serviço Realizado</th>
                  <th style="width: 100px;">Método Pag.</th>
                  <th style="text-align: right; width: 90px;">M.O. Bruta</th>
                  <th style="text-align: right; width: 90px;">Líquido OS</th>
                </tr>
              </thead>
              <tbody>
                ${filteredServices.map(s => `
                  <tr>
                    <td>${fmtDate(s.exitDate)}</td>
                    <td><strong style="text-transform: uppercase;">${s.vehiclePlate}</strong><br/><span style="color:#64748b; font-size:9px;">${s.vehicleBrand}</span></td>
                    <td>${s.description.replace(/\|\|/g, " · ")}</td>
                    <td>${s.paymentMethod}</td>
                    <td style="text-align: right; font-weight: 500;">${fmt(s.laborValue)}</td>
                    <td style="text-align: right;" class="value-in">${fmt(viewMode === "labor" ? (s.laborValue * (1 - (PAYMENT_METHODS[s.paymentMethod] || 0) / 100)) : s.netValue)}</td>
                  </tr>
                `).join("")}
              </tbody>
            </table>

            <h2>💸 Despesas Lançadas (${filteredExpenses.length})</h2>
            <table>
              <thead>
                <tr>
                  <th style="width: 100px;">Data</th>
                  <th>Categoria</th>
                  <th>Fornecedor / Destinatário</th>
                  <th style="text-align: right; width: 120px;">Valor Pago</th>
                </tr>
              </thead>
              <tbody>
                ${filteredExpenses.map(e => `
                  <tr>
                    <td>${fmtDate(e.expense_date)}</td>
                    <td><strong>${e.category}</strong></td>
                    <td>${e.supplier || 'Geral'}</td>
                    <td style="text-align: right;" class="value-out">-${fmt(e.value)}</td>
                  </tr>
                `).join("")}
              </tbody>
            </table>

            <div class="footer-meta">
              Relatório gerado em ${new Date().toLocaleDateString("pt-BR")} às ${new Date().toLocaleTimeString("pt-BR")} · ASDCAR AutoGestão
            </div>
          </div>
          </body>
        </html>
        `;

        const win = window.open("", "_blank");
        win.document.write(html);
        win.document.close();
      }
