// Configuração compartilhada entre o painel e a ouvidoria.
window.IRAPUA = window.IRAPUA || {};

IRAPUA.config = {
  municipio: "Irapuã",
  uf: "SP",
  codigoIbge: "3521507",
  prefeita: "Reni Aparecida da Silva",
  // Centro urbano (praça da matriz, aproximado). Ajustar se necessário.
  centro: [-49.4089, -21.2794], // [lon, lat] — 21°16′46″S 49°24′32″W
  zoom: 15.4,
  pitch: 60,
  bearing: -20,
  estiloMapa: "https://tiles.openfreemap.org/styles/liberty",
  terreno: "https://elevation-tiles-prod.s3.amazonaws.com/terrarium/{z}/{x}/{y}.png",
};

// Categorias das ocorrências: cor no mapa, ícone e órgão responsável.
IRAPUA.categorias = {
  infraestrutura: { nome: "Ruas e calçadas", cor: "#f97316", icone: "🚧", setor: "Obras" },
  iluminacao:     { nome: "Iluminação pública", cor: "#facc15", icone: "💡", setor: "Obras / CPFL" },
  energia:        { nome: "Falta de energia", cor: "#eab308", icone: "⚡", setor: "Distribuidora" },
  agua:           { nome: "Água e esgoto", cor: "#38bdf8", icone: "💧", setor: "Água e Esgoto" },
  saude:          { nome: "Saúde", cor: "#ef4444", icone: "🚑", setor: "Saúde" },
  esporte_lazer:  { nome: "Esporte e lazer", cor: "#a855f7", icone: "🛹", setor: "Esportes" },
  limpeza:        { nome: "Limpeza e lixo", cor: "#84cc16", icone: "🧹", setor: "Serviços Urbanos" },
  seguranca:      { nome: "Segurança", cor: "#64748b", icone: "🛡️", setor: "Guarda / PM" },
  educacao:       { nome: "Educação", cor: "#14b8a6", icone: "🎒", setor: "Educação" },
  outros:         { nome: "Outros", cor: "#94a3b8", icone: "📌", setor: "Gabinete" },
};

IRAPUA.status = {
  aberto: "Aberto",
  andamento: "Em andamento",
  resolvido: "Resolvido",
};

IRAPUA.prioridades = { 1: "Baixa", 2: "Média", 3: "Alta" };

IRAPUA.fmt = {
  num: (v, d = 0) => (v == null || isNaN(v) ? "—" : Number(v).toLocaleString("pt-BR", { maximumFractionDigits: d, minimumFractionDigits: d })),
  brl: (v) => (v == null || isNaN(v) ? "—" : Number(v).toLocaleString("pt-BR", { style: "currency", currency: "BRL", maximumFractionDigits: 0 })),
  brlCompacto: (v) => {
    if (v == null || isNaN(v)) return "—";
    if (Math.abs(v) >= 1e6) return "R$ " + (v / 1e6).toLocaleString("pt-BR", { maximumFractionDigits: 1 }) + " mi";
    if (Math.abs(v) >= 1e3) return "R$ " + (v / 1e3).toLocaleString("pt-BR", { maximumFractionDigits: 0 }) + " mil";
    return IRAPUA.fmt.brl(v);
  },
  pct: (v, d = 0) => (v == null || isNaN(v) ? "—" : Number(v).toLocaleString("pt-BR", { maximumFractionDigits: d }) + "%"),
  data: (iso) => {
    try { return new Date(iso).toLocaleDateString("pt-BR", { day: "2-digit", month: "short" }); } catch (e) { return iso; }
  },
  esc: (s) => String(s ?? "").replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c])),
};
