// HUD do painel da prefeita: indicadores, satisfação, filtros e lista de ocorrências.
(function () {
  const F = IRAPUA.fmt;
  const $ = (s) => document.querySelector(s);
  const filtrosAtivos = new Set(Object.keys(IRAPUA.categorias));
  let dados = IRAPUA.snapshot;
  let map, popup;

  // ---------- Satisfação ----------
  function satisfacao(lista) {
    const notas = lista.map((o) => Number(o.nota)).filter((n) => n >= 1 && n <= 5);
    if (!notas.length) return { pct: null, media: null, n: 0 };
    const media = notas.reduce((a, b) => a + b, 0) / notas.length;
    return { pct: ((media - 1) / 4) * 100, media, n: notas.length };
  }
  function corPct(p) { return p == null ? "#64748b" : p >= 66 ? "var(--ok)" : p >= 40 ? "var(--warn)" : "var(--bad)"; }

  function renderSatisfacao(lista) {
    const s = satisfacao(lista);
    const r = 36, c = 2 * Math.PI * r, off = c * (1 - (s.pct || 0) / 100);
    $("#satisfacao").innerHTML = `
      <svg class="gauge" viewBox="0 0 88 88" role="img" aria-label="Satisfação ${F.num(s.pct)}%">
        <circle class="trilho" cx="44" cy="44" r="${r}" fill="none" stroke-width="8"/>
        <circle cx="44" cy="44" r="${r}" fill="none" stroke="${corPct(s.pct)}" stroke-width="8" stroke-linecap="round"
          stroke-dasharray="${c}" stroke-dashoffset="${off}" transform="rotate(-90 44 44)"/>
        <text x="44" y="50" text-anchor="middle" font-size="19">${s.pct == null ? "—" : F.num(s.pct) + "%"}</text>
      </svg>
      <div class="legenda">
        <b>${s.media == null ? "Sem avaliações" : F.num(s.media, 1) + " de 5 ★"}</b><br>
        média de ${s.n} avaliações<br>da ouvidoria
      </div>`;
  }

  // ---------- Status dos serviços (a partir das ocorrências abertas) ----------
  function statusServico(lista, cats) {
    const abertas = lista.filter((o) => cats.includes(o.categoria) && o.status !== "resolvido");
    if (abertas.some((o) => Number(o.prioridade) >= 3)) return { txt: "Crítico", cor: "var(--bad)", n: abertas.length };
    if (abertas.length) return { txt: "Atenção", cor: "var(--warn)", n: abertas.length };
    return { txt: "Normal", cor: "var(--ok)", n: 0 };
  }

  function ind({ rot, val, fonte, barra, cor, largo }) {
    return `<div class="ind${largo ? " largo" : ""}">
      <div class="rot">${rot}</div>
      <div class="val">${val}</div>
      ${barra != null ? `<div class="barra"><i style="width:${Math.max(0, Math.min(100, barra))}%;background:${cor || "var(--accent)"}"></i></div>` : ""}
      <div class="fonte" title="${F.esc(fonte)}">${F.esc(fonte)}</div>
    </div>`;
  }
  const fonteDe = (x) => (x ? (x.valor == null ? "a confirmar · " : "") + x.fonte + (x.ano ? " · " + x.ano : "") : "");

  function renderServicos(lista) {
    const agua = statusServico(lista, ["agua"]);
    const energia = statusServico(lista, ["energia", "iluminacao"]);
    const saude = statusServico(lista, ["saude"]);
    const ruas = statusServico(lista, ["infraestrutura", "limpeza"]);
    const card = (rot, st, detalhe, fonte) => `<div class="ind">
      <div class="rot">${rot}</div>
      <div class="val" style="color:${st.cor}">● ${st.txt}</div>
      <div class="status-servico" style="color:var(--muted);font-weight:500">${st.n ? st.n + " pendente(s)" : "sem pendências"}${detalhe ? " · " + detalhe : ""}</div>
      <div class="fonte" title="${F.esc(fonte)}">${F.esc(fonte)}</div>
    </div>`;
    $("#servicos").innerHTML = [
      card("💧 Água", agua, dados.aguaAtendimento.valor != null ? F.pct(dados.aguaAtendimento.valor) + " atendidos" : "",
           `Perdas ${F.pct(dados.aguaPerdas.valor, 1)} · ${dados.aguaAtendimento.fonte}`),
      card("⚡ Energia e luz", energia, dados.energiaDEC.valor != null ? "DEC " + F.num(dados.energiaDEC.valor, 1) + " h" : "",
           fonteDe(dados.energiaDEC)),
      card("🚑 Saúde", saude, `${F.num(dados.ubs.valor)} UBS`,
           `Ambulâncias: ${dados.ambulancias.valor != null ? dados.ambulancias.valor : "a confirmar"} · ${dados.ubs.fonte}`),
      card("🚧 Ruas e limpeza", ruas, "", "Ocorrências da ouvidoria"),
    ].join("");
  }

  function renderIndicadores() {
    const d = dados;
    const exec = d.receita.valor && d.despesa.valor ? (d.despesa.valor / d.receita.valor) * 100 : null;
    $("#indicadores").innerHTML = [
      ind({ rot: "👥 População", val: F.num(d.populacao.valor), fonte: fonteDe(d.populacao) }),
      ind({ rot: "💰 PIB per capita", val: F.brl(d.pibPerCapita.valor), fonte: fonteDe(d.pibPerCapita) }),
      ind({ rot: "📈 IDHM", val: F.num(d.idhm.valor, 3), fonte: fonteDe(d.idhm), barra: (d.idhm.valor || 0) * 100, cor: "var(--accent)" }),
      ind({ rot: "🎒 Escolarização", val: F.pct(d.escolarizacao.valor, 1), fonte: fonteDe(d.escolarizacao), barra: d.escolarizacao.valor, cor: "var(--ok)" }),
      ind({ rot: "🏛️ Receita", val: F.brlCompacto(d.receita.valor), fonte: fonteDe(d.receita) }),
      ind({ rot: "🧾 Despesa", val: F.brlCompacto(d.despesa.valor), fonte: fonteDe(d.despesa), barra: exec, cor: "var(--warn)" }),
      ind({ rot: "🏗️ Investimento", val: d.investimento.valor != null ? F.brlCompacto(d.investimento.valor) : "a confirmar", fonte: fonteDe(d.investimento), largo: true }),
    ].join("");
    const vivo = (dados.aoVivo || []).length;
    $("#tag-dados").textContent = vivo ? "● ao vivo: " + dados.aoVivo.join(", ") : "dados oficiais";
  }

  // ---------- Filtros e lista ----------
  function renderFiltros(lista) {
    const cont = {};
    lista.forEach((o) => { if (o.status !== "resolvido") cont[o.categoria] = (cont[o.categoria] || 0) + 1; });
    $("#filtros").innerHTML = Object.entries(IRAPUA.categorias).map(([k, c]) =>
      `<span class="chip${filtrosAtivos.has(k) ? "" : " off"}" data-cat="${k}" role="button" tabindex="0" aria-pressed="${filtrosAtivos.has(k)}">
        <span class="ponto" style="background:${c.cor}"></span>${c.nome}<span class="n">${cont[k] || 0}</span></span>`).join("");
  }

  function visiveis(lista) { return lista.filter((o) => filtrosAtivos.has(o.categoria) || !IRAPUA.categorias[o.categoria]); }

  function renderLista(lista) {
    const ordem = { aberto: 0, andamento: 1, resolvido: 2 };
    const v = visiveis(lista).sort((a, b) => ordem[a.status] - ordem[b.status] || b.prioridade - a.prioridade || new Date(b.data) - new Date(a.data));
    $("#resumo").innerHTML = ["aberto", "andamento", "resolvido"].map((s) =>
      `<div><b style="color:${s === "aberto" ? "var(--bad)" : s === "andamento" ? "var(--warn)" : "var(--ok)"}">${lista.filter((o) => o.status === s).length}</b><span>${IRAPUA.status[s]}</span></div>`).join("");
    $("#lista").innerHTML = v.map((o) => {
      const c = IRAPUA.categorias[o.categoria] || IRAPUA.categorias.outros;
      return `<div class="oc" data-id="${F.esc(o.id)}" tabindex="0">
        <span class="faixa" style="background:${c.cor}"></span>
        <div><div class="t">${c.icone} ${F.esc(o.titulo)}</div>
        <div class="m"><span class="tag ${o.status}">${IRAPUA.status[o.status]}</span>
          <span>Prioridade ${IRAPUA.prioridades[o.prioridade] || "—"}</span><span>${F.data(o.data)}</span>
          ${o.origem === "exemplo" ? '<span class="tag exemplo">exemplo</span>' : '<span class="tag">cidadão</span>'}</div></div>
      </div>`;
    }).join("") || '<p style="color:var(--muted);font-size:12px">Nenhuma ocorrência nos filtros selecionados.</p>';
  }

  // ---------- Popup ----------
  function abrirOcorrencia(id, voar) {
    const o = IRAPUA.todasOcorrencias().find((x) => x.id === id);
    if (!o || !map) return;
    const c = IRAPUA.categorias[o.categoria] || IRAPUA.categorias.outros;
    if (voar) map.flyTo({ center: [o.lon, o.lat], zoom: 17, pitch: 62, speed: 0.9 });
    const html = `<div class="pop">
      <h3>${c.icone} ${F.esc(o.titulo)}</h3>
      <div class="linha"><span class="tag ${o.status}">${IRAPUA.status[o.status]}</span><span>${c.nome}</span><span>· ${F.esc(c.setor)}</span></div>
      <p>${F.esc(o.descricao || "")}</p>
      <div class="linha">Prioridade ${IRAPUA.prioridades[o.prioridade] || "—"} · ${F.data(o.data)}${o.nota ? " · nota " + o.nota + "★" : ""} · ${F.esc(o.id)}</div>
      <label class="linha">Atualizar status:
        <select data-status-id="${F.esc(o.id)}">${Object.entries(IRAPUA.status).map(([k, v]) => `<option value="${k}"${k === o.status ? " selected" : ""}>${v}</option>`).join("")}</select>
      </label>
    </div>`;
    if (popup) popup.remove();
    popup = new maplibregl.Popup({ offset: 14, maxWidth: "300px" }).setLngLat([o.lon, o.lat]).setHTML(html).addTo(map);
  }

  // ---------- Atualização geral ----------
  function atualizar() {
    const lista = IRAPUA.todasOcorrencias();
    renderSatisfacao(lista);
    renderServicos(lista);
    renderFiltros(lista);
    renderLista(lista);
    if (map && map.atualizarOcorrencias) map.atualizarOcorrencias(visiveis(lista));
  }

  function relogio() {
    $("#relogio").innerHTML = new Date().toLocaleString("pt-BR", { weekday: "long", day: "2-digit", month: "long", hour: "2-digit", minute: "2-digit" });
  }

  // ---------- Inicialização ----------
  document.addEventListener("DOMContentLoaded", async () => {
    relogio(); setInterval(relogio, 30000);
    renderIndicadores();
    atualizar();

    map = IRAPUA.criarMapa({
      container: "mapa",
      ocorrencias: visiveis(IRAPUA.todasOcorrencias()),
      aoFalharBase: () => {
        const a = $("#aviso-mapa");
        a.textContent = "Mapa base indisponível (sem conexão com o OpenStreetMap). Mostrando apenas as ocorrências.";
        a.style.display = "block";
      },
      aoFicarPronto: (m) => {
        m.on("click", "oc-pontos", (e) => abrirOcorrencia(e.features[0].properties.id));
        m.on("click", "oc-colunas", (e) => abrirOcorrencia(e.features[0].properties.id));
        ["oc-pontos", "oc-colunas"].forEach((l) => {
          m.on("mouseenter", l, () => (m.getCanvas().style.cursor = "pointer"));
          m.on("mouseleave", l, () => (m.getCanvas().style.cursor = ""));
        });
        document.body.dataset.mapaPronto = "1";
      },
    });
    window._mapa = map;

    // Filtros
    $("#filtros").addEventListener("click", (e) => {
      const chip = e.target.closest(".chip"); if (!chip) return;
      const k = chip.dataset.cat;
      filtrosAtivos.has(k) ? filtrosAtivos.delete(k) : filtrosAtivos.add(k);
      atualizar();
    });
    $("#lista").addEventListener("click", (e) => { const oc = e.target.closest(".oc"); if (oc) abrirOcorrencia(oc.dataset.id, true); });
    $("#lista").addEventListener("keydown", (e) => { if (e.key === "Enter") { const oc = e.target.closest(".oc"); if (oc) abrirOcorrencia(oc.dataset.id, true); } });

    // Mudança de status pela prefeitura
    document.addEventListener("change", (e) => {
      const id = e.target.dataset && e.target.dataset.statusId;
      if (!id) return;
      IRAPUA.armazenamento.alterarStatus(id, e.target.value);
      atualizar();
      abrirOcorrencia(id);
    });

    // Controles de câmera
    let girando = null;
    $("#btn-girar").addEventListener("click", (e) => {
      if (girando) { cancelAnimationFrame(girando); girando = null; e.target.textContent = "⟳ Girar"; return; }
      e.target.textContent = "⏸ Parar";
      const passo = () => { map.setBearing(map.getBearing() + 0.15); girando = requestAnimationFrame(passo); };
      passo();
    });
    $("#btn-centro").addEventListener("click", () => map.flyTo({ center: IRAPUA.config.centro, zoom: IRAPUA.config.zoom, pitch: IRAPUA.config.pitch, bearing: IRAPUA.config.bearing }));
    $("#btn-2d").addEventListener("click", (e) => {
      const em3d = map.getPitch() > 5;
      map.easeTo({ pitch: em3d ? 0 : IRAPUA.config.pitch, bearing: em3d ? 0 : IRAPUA.config.bearing });
      e.target.textContent = em3d ? "3D" : "2D";
    });

    // Abas no celular
    document.body.dataset.aba = "";
    document.querySelectorAll(".abas button").forEach((b) => b.addEventListener("click", () => {
      const aba = document.body.dataset.aba === b.dataset.aba ? "" : b.dataset.aba;
      document.body.dataset.aba = aba;
      document.querySelectorAll(".abas button").forEach((x) => x.classList.toggle("ativo", x.dataset.aba === aba));
    }));

    // Ouvidoria aberta em outra aba: atualiza o painel na hora.
    window.addEventListener("storage", atualizar);

    // Dados públicos ao vivo (IBGE) — substitui o snapshot quando disponível.
    try { dados = await IRAPUA.carregarDadosPublicos(); renderIndicadores(); } catch (e) { /* mantém snapshot */ }
  });
})();
