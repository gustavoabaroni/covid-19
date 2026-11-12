// Dados públicos de Irapuã.
// 1) Começa com o snapshot (data/snapshot.js), que tem fonte e ano de cada número.
// 2) Tenta atualizar ao vivo pelas APIs abertas do IBGE (agregados SIDRA). Se falhar, fica o snapshot.
window.IRAPUA = window.IRAPUA || {};

(function () {
  const IBGE = "https://servicodados.ibge.gov.br/api/v3/agregados";
  const cod = () => IRAPUA.config.codigoIbge;

  async function sidra(agregado, variavel, periodo = "-1") {
    const url = `${IBGE}/${agregado}/periodos/${periodo}/variaveis/${variavel}?localidades=N6[${cod()}]`;
    const ctrl = new AbortController();
    const t = setTimeout(() => ctrl.abort(), 7000);
    try {
      const r = await fetch(url, { signal: ctrl.signal });
      if (!r.ok) throw new Error("HTTP " + r.status);
      const j = await r.json();
      const serie = j[0].resultados[0].series[0].serie;
      const ano = Object.keys(serie).sort().pop();
      const valor = Number(serie[ano]);
      if (!isFinite(valor)) throw new Error("valor inválido");
      return { valor, ano };
    } finally {
      clearTimeout(t);
    }
  }

  IRAPUA.carregarDadosPublicos = async function () {
    const base = JSON.parse(JSON.stringify(IRAPUA.snapshot || {}));
    base.aoVivo = [];

    const tarefas = [
      // População estimada (IBGE, Estimativas de População)
      sidra(6579, 9324).then((r) => {
        base.populacao = { valor: r.valor, ano: r.ano, fonte: "IBGE · estimativa (ao vivo)" };
        base.aoVivo.push("população");
      }),
      // PIB a preços correntes (mil R$) -> recalcula PIB per capita
      sidra(5938, 37).then((r) => {
        const pop = base.populacao && base.populacao.valor;
        if (pop) {
          base.pibPerCapita = { valor: (r.valor * 1000) / pop, ano: r.ano, fonte: "IBGE · PIB municipal (ao vivo)" };
          base.aoVivo.push("PIB per capita");
        }
      }),
    ];
    // Executa em sequência para o PIB per capita usar a população atualizada.
    for (const t of tarefas) {
      try { await t; } catch (e) { /* mantém snapshot */ }
    }
    return base;
  };
})();
