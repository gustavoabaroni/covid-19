// Armazenamento das manifestações da ouvidoria.
// PROTÓTIPO: grava no navegador (localStorage). Para produção, troque apenas
// as funções de IRAPUA.armazenamento por chamadas a um backend (Supabase, Firebase, API da prefeitura).
window.IRAPUA = window.IRAPUA || {};

(function () {
  const CHAVE = "irapua.ouvidoria.v1";
  const CHAVE_STATUS = "irapua.status.v1"; // status alterado pela prefeitura nas ocorrências de exemplo

  function ler(chave, padrao) {
    try {
      const v = localStorage.getItem(chave);
      return v ? JSON.parse(v) : padrao;
    } catch (e) {
      return padrao;
    }
  }
  function gravar(chave, valor) {
    try {
      localStorage.setItem(chave, JSON.stringify(valor));
      return true;
    } catch (e) {
      return false;
    }
  }

  IRAPUA.armazenamento = {
    listarCidadao() {
      return ler(CHAVE, []);
    },
    adicionar(manifestacao) {
      const lista = ler(CHAVE, []);
      const nova = {
        id: "OUV-" + Date.now().toString(36).toUpperCase(),
        data: new Date().toISOString(),
        status: "aberto",
        origem: "cidadao",
        ...manifestacao,
      };
      lista.push(nova);
      const ok = gravar(CHAVE, lista);
      return ok ? nova : null;
    },
    alterarStatus(id, status) {
      const lista = ler(CHAVE, []);
      const item = lista.find((o) => o.id === id);
      if (item) {
        item.status = status;
        gravar(CHAVE, lista);
      } else {
        const mapa = ler(CHAVE_STATUS, {});
        mapa[id] = status;
        gravar(CHAVE_STATUS, mapa);
      }
    },
    statusSalvos() {
      return ler(CHAVE_STATUS, {});
    },
    exportar() {
      return JSON.stringify({ exportadoEm: new Date().toISOString(), manifestacoes: ler(CHAVE, []), status: ler(CHAVE_STATUS, {}) }, null, 2);
    },
    importar(texto) {
      const obj = JSON.parse(texto);
      const atuais = ler(CHAVE, []);
      const ids = new Set(atuais.map((o) => o.id));
      (obj.manifestacoes || []).forEach((o) => { if (!ids.has(o.id)) atuais.push(o); });
      gravar(CHAVE, atuais);
      gravar(CHAVE_STATUS, { ...ler(CHAVE_STATUS, {}), ...(obj.status || {}) });
      return atuais.length;
    },
    limpar() {
      try { localStorage.removeItem(CHAVE); localStorage.removeItem(CHAVE_STATUS); } catch (e) {}
    },
  };

  // Todas as ocorrências: exemplos de demonstração + manifestações reais dos cidadãos.
  IRAPUA.todasOcorrencias = function () {
    const status = IRAPUA.armazenamento.statusSalvos();
    const exemplos = (IRAPUA.ocorrenciasExemplo || []).map((o) => ({ ...o, origem: "exemplo", status: status[o.id] || o.status }));
    return exemplos.concat(IRAPUA.armazenamento.listarCidadao());
  };
})();
