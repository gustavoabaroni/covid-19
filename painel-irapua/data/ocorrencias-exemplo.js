// OCORRÊNCIAS FICTÍCIAS, apenas para demonstração do painel.
// As posições são aproximadas, distribuídas em volta do centro da cidade.
// Em uso real, esta lista vem da ouvidoria (cidadãos) e dos setores da prefeitura.
window.IRAPUA = window.IRAPUA || {};

(function () {
  const [lon0, lat0] = IRAPUA.config.centro;
  const p = (dx, dy) => ({ lon: lon0 + dx * 0.001, lat: lat0 + dy * 0.001 }); // ~100 m por unidade
  const dias = (n) => new Date(Date.now() - n * 864e5).toISOString();

  IRAPUA.ocorrenciasExemplo = [
    { id: "EX-01", categoria: "esporte_lazer", titulo: "Pista de skate com rachaduras", descricao: "Pista com rachaduras e ferragem exposta; jovens pararam de usar.", ...p(3.2, -2.1), prioridade: 2, status: "aberto", data: dias(12), nota: 2, bairro: "Exemplo" },
    { id: "EX-02", categoria: "saude", titulo: "Ambulância em manutenção", descricao: "Uma das ambulâncias está parada na oficina; transporte para Rio Preto atrasando.", ...p(-0.6, 0.8), prioridade: 3, status: "andamento", data: dias(3), nota: 1, bairro: "Centro" },
    { id: "EX-03", categoria: "energia", titulo: "Queda de energia no bairro", descricao: "Moradores relatam quedas frequentes à noite.", ...p(-4.1, 2.6), prioridade: 3, status: "aberto", data: dias(1), nota: 1, bairro: "Exemplo" },
    { id: "EX-04", categoria: "infraestrutura", titulo: "Calçada quebrada perto da escola", descricao: "Raízes levantaram a calçada; risco para crianças e idosos.", ...p(1.4, 1.9), prioridade: 2, status: "aberto", data: dias(8), nota: 2, bairro: "Exemplo" },
    { id: "EX-05", categoria: "infraestrutura", titulo: "Buraco na rua", descricao: "Buraco grande depois da chuva.", ...p(-2.3, -1.2), prioridade: 2, status: "andamento", data: dias(5), nota: 3, bairro: "Exemplo" },
    { id: "EX-06", categoria: "iluminacao", titulo: "Poste apagado", descricao: "Três postes sem luz na mesma rua.", ...p(2.6, 3.4), prioridade: 1, status: "aberto", data: dias(15), nota: 3, bairro: "Exemplo" },
    { id: "EX-07", categoria: "agua", titulo: "Vazamento de água na via", descricao: "Água limpa correndo há dois dias.", ...p(0.9, -3.0), prioridade: 2, status: "resolvido", data: dias(20), nota: 4, bairro: "Exemplo" },
    { id: "EX-08", categoria: "limpeza", titulo: "Terreno com lixo e mato alto", descricao: "Foco de dengue em potencial.", ...p(-3.4, -2.8), prioridade: 2, status: "aberto", data: dias(9), nota: 2, bairro: "Exemplo" },
    { id: "EX-09", categoria: "saude", titulo: "Fila para consulta na UBS", descricao: "Agendamento com espera longa para clínico geral.", ...p(0.3, 0.4), prioridade: 2, status: "andamento", data: dias(6), nota: 2, bairro: "Centro" },
    { id: "EX-10", categoria: "esporte_lazer", titulo: "Praça precisa de manutenção", descricao: "Brinquedos quebrados no parquinho.", ...p(-0.2, -0.3), prioridade: 1, status: "resolvido", data: dias(30), nota: 5, bairro: "Centro" },
    { id: "EX-11", categoria: "seguranca", titulo: "Pedido de ronda noturna", descricao: "Moradores pedem mais rondas na saída da cidade.", ...p(4.5, 0.6), prioridade: 1, status: "aberto", data: dias(11), nota: 3, bairro: "Exemplo" },
    { id: "EX-12", categoria: "educacao", titulo: "Telhado da escola com goteira", descricao: "Sala de aula interditada em dias de chuva.", ...p(1.9, 1.2), prioridade: 3, status: "aberto", data: dias(4), nota: 2, bairro: "Exemplo" },
    { id: "EX-13", categoria: "agua", titulo: "Água com cheiro forte", descricao: "Reclamação de três casas na mesma quadra.", ...p(-1.6, 2.2), prioridade: 2, status: "aberto", data: dias(2), nota: 2, bairro: "Exemplo" },
    { id: "EX-14", categoria: "infraestrutura", titulo: "Faixa de pedestre apagada", descricao: "Pintura sumiu em frente à praça.", ...p(0.1, -0.9), prioridade: 1, status: "resolvido", data: dias(25), nota: 4, bairro: "Centro" },
    { id: "EX-15", categoria: "iluminacao", titulo: "Iluminação do campo de futebol", descricao: "Refletores queimados; jogos à noite suspensos.", ...p(-2.9, 0.4), prioridade: 1, status: "aberto", data: dias(18), nota: 3, bairro: "Exemplo" },
  ];
})();
