// Dados oficiais de Irapuã/SP coletados na pesquisa (nov/2026).
// Cada indicador tem valor, ano e fonte. valor: null = ainda não confirmado (aparece como "a confirmar").
window.IRAPUA = window.IRAPUA || {};

IRAPUA.snapshot = {
  atualizadoEm: "2026-11-12",
  populacao:       { valor: 6867, ano: "2022", fonte: "IBGE · Censo 2022" },
  area:            { valor: 257.611, ano: "2025", fonte: "IBGE · área territorial", unidade: "km²" },
  densidade:       { valor: 26.66, ano: "2022", fonte: "IBGE · Censo 2022", unidade: "hab/km²" },
  pibPerCapita:    { valor: 41126.49, ano: "2023", fonte: "IBGE · PIB dos Municípios" },
  idhm:            { valor: 0.713, ano: "2010", fonte: "PNUD/IBGE · IDHM" },
  receita:         { valor: 49509622.92, ano: "2024", fonte: "IBGE/Siconfi · receita bruta realizada" },
  despesa:         { valor: 43130774.58, ano: "2024", fonte: "IBGE/Siconfi · despesa empenhada" },
  investimento:    { valor: null, ano: null, fonte: "Siconfi/TCE-SP (a confirmar)" },
  aguaAtendimento: { valor: 100, ano: null, fonte: "Água e Saneamento · operadora SABESP" },
  aguaPerdas:      { valor: 9.2, ano: null, fonte: "Água e Saneamento" },
  esgotoTratado:   { valor: null, ano: null, fonte: "SNIS (a confirmar)" },
  energiaDEC:      { valor: null, ano: null, fonte: "ANEEL DEC/FEC (a confirmar)" },
  ubs:             { valor: 2, ano: null, fonte: "SES-SP · UBS central + UBS/ESF" },
  ambulancias:     { valor: null, ano: null, fonte: "CNES/DATASUS (a confirmar)" },
  escolarizacao:   { valor: 98.25, ano: "2022", fonte: "IBGE · 6 a 14 anos" },
  ideb:            { valor: 6.5, ano: "2023", fonte: "INEP (a confirmar por etapa)" },
};
