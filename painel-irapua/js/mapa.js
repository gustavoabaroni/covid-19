// Mapa 3D de Irapuã (MapLibre GL + OpenStreetMap/OpenFreeMap, sem chave de API).
window.IRAPUA = window.IRAPUA || {};

(function () {
  const ESTILO_OFFLINE = {
    version: 8,
    sources: {},
    layers: [{ id: "fundo", type: "background", paint: { "background-color": "#0e1729" } }],
  };

  // Quadrado de ~raio metros em volta de um ponto, para a coluna 3D da ocorrência.
  function quadrado(lon, lat, raio) {
    const dLat = raio / 111320;
    const dLon = raio / (111320 * Math.cos((lat * Math.PI) / 180));
    return [[
      [lon - dLon, lat - dLat], [lon + dLon, lat - dLat],
      [lon + dLon, lat + dLat], [lon - dLon, lat + dLat], [lon - dLon, lat - dLat],
    ]];
  }

  function geojsonOcorrencias(lista) {
    const pontos = [], colunas = [];
    lista.forEach((o) => {
      const cat = IRAPUA.categorias[o.categoria] || IRAPUA.categorias.outros;
      const props = {
        id: o.id, categoria: o.categoria, cor: cat.cor, status: o.status,
        prioridade: Number(o.prioridade) || 2,
        altura: o.status === "resolvido" ? 6 : 18 + (Number(o.prioridade) || 2) * 22,
      };
      pontos.push({ type: "Feature", properties: props, geometry: { type: "Point", coordinates: [o.lon, o.lat] } });
      colunas.push({ type: "Feature", properties: props, geometry: { type: "Polygon", coordinates: quadrado(o.lon, o.lat, 7) } });
    });
    return {
      pontos: { type: "FeatureCollection", features: pontos },
      colunas: { type: "FeatureCollection", features: colunas },
    };
  }

  function realcarPredios(map) {
    const estilo = map.getStyle();
    const temExtrusao = estilo.layers.some((l) => l.type === "fill-extrusion");
    const fonteVetorial = Object.keys(estilo.sources).find((s) => estilo.sources[s].type === "vector");
    if (!temExtrusao && fonteVetorial) {
      map.addLayer({
        id: "predios-3d", type: "fill-extrusion", source: fonteVetorial, "source-layer": "building", minzoom: 13,
        paint: {
          "fill-extrusion-color": "#1e3a5f",
          "fill-extrusion-height": ["coalesce", ["get", "render_height"], 5],
          "fill-extrusion-base": ["coalesce", ["get", "render_min_height"], 0],
          "fill-extrusion-opacity": 0.85,
        },
      });
    }
    // Deixa os prédios num tom "holográfico" para combinar com o HUD.
    map.getStyle().layers.filter((l) => l.type === "fill-extrusion").forEach((l) => {
      map.setPaintProperty(l.id, "fill-extrusion-color", [
        "interpolate", ["linear"], ["coalesce", ["get", "render_height"], 5], 0, "#23406b", 20, "#3b6aa8",
      ]);
      map.setPaintProperty(l.id, "fill-extrusion-opacity", 0.9);
      // Prédios do OSM em cidades pequenas costumam vir sem altura: garante volume mínimo.
      map.setPaintProperty(l.id, "fill-extrusion-height", ["max", ["coalesce", ["get", "render_height"], 0], 5]);
    });
  }

  function escurecerBase(map) {
    map.getStyle().layers.forEach((l) => {
      try {
        if (l.type === "background") map.setPaintProperty(l.id, "background-color", "#0e1729");
        if (l.type === "fill" && /landuse|landcover|park|wood|grass|residential/.test(l.id)) map.setPaintProperty(l.id, "fill-opacity", 0.25);
        if (l.type === "fill" && /water/.test(l.id)) map.setPaintProperty(l.id, "fill-color", "#0c4a6e");
        if (l.type === "line" && /road|street|highway|transportation/.test(l.id)) map.setPaintProperty(l.id, "line-color", "#5b7398");
      } catch (e) { /* camada sem essa propriedade */ }
    });
  }

  function adicionarTerreno(map) {
    try {
      map.addSource("terreno", { type: "raster-dem", tiles: [IRAPUA.config.terreno], encoding: "terrarium", tileSize: 256, maxzoom: 14 });
      map.setTerrain({ source: "terreno", exaggeration: 1.4 });
    } catch (e) { console.warn("Terreno indisponível", e); }
  }

  function adicionarOcorrencias(map, lista) {
    const g = geojsonOcorrencias(lista);
    map.addSource("oc-colunas", { type: "geojson", data: g.colunas });
    map.addSource("oc-pontos", { type: "geojson", data: g.pontos });
    map.addLayer({
      id: "oc-halo", type: "circle", source: "oc-pontos",
      paint: {
        "circle-radius": ["interpolate", ["linear"], ["zoom"], 12, 6, 17, 26],
        "circle-color": ["get", "cor"], "circle-opacity": 0.18, "circle-blur": 0.6,
        "circle-pitch-alignment": "map",
      },
    });
    map.addLayer({
      id: "oc-colunas", type: "fill-extrusion", source: "oc-colunas",
      paint: {
        "fill-extrusion-color": ["get", "cor"],
        "fill-extrusion-height": ["get", "altura"],
        "fill-extrusion-base": 0,
        "fill-extrusion-opacity": 0.92,
      },
    });
    map.addLayer({
      id: "oc-pontos", type: "circle", source: "oc-pontos",
      paint: {
        "circle-radius": ["interpolate", ["linear"], ["zoom"], 12, 3, 17, 7],
        "circle-color": ["get", "cor"], "circle-stroke-color": "#ffffff", "circle-stroke-width": 1.5,
      },
    });
  }

  IRAPUA.criarMapa = function (opcoes) {
    const cfg = IRAPUA.config;
    const map = new maplibregl.Map({
      container: opcoes.container,
      style: cfg.estiloMapa,
      center: opcoes.centro || cfg.centro,
      zoom: opcoes.zoom ?? cfg.zoom,
      pitch: opcoes.pitch ?? cfg.pitch,
      bearing: opcoes.bearing ?? cfg.bearing,
      maxPitch: 80,
      attributionControl: { compact: true },
    });
    map.addControl(new maplibregl.NavigationControl({ visualizePitch: true }), "bottom-right");

    let pronto = false;
    let usouOffline = false;
    const aoCarregar = () => {
      if (pronto) return;
      pronto = true;
      if (!usouOffline) {
        escurecerBase(map);
        realcarPredios(map);
        if (opcoes.terreno !== false) adicionarTerreno(map);
      }
      if (opcoes.ocorrencias) adicionarOcorrencias(map, opcoes.ocorrencias);
      opcoes.aoFicarPronto && opcoes.aoFicarPronto(map, { offline: usouOffline });
    };
    map.on("load", aoCarregar);

    // Se o mapa base não carregar (sem internet / bloqueio), segue com um fundo simples.
    const irOffline = () => {
      if (pronto || usouOffline) return;
      usouOffline = true;
      map.setStyle(ESTILO_OFFLINE);
      map.once("style.load", aoCarregar);
      opcoes.aoFalharBase && opcoes.aoFalharBase();
    };
    const timer = setTimeout(irOffline, 8000);
    map.on("load", () => clearTimeout(timer));
    map.on("error", (e) => {
      const msg = String((e && e.error && e.error.message) || "");
      if (!map.isStyleLoaded() && /style|Failed to fetch|NetworkError|load/i.test(msg)) { clearTimeout(timer); irOffline(); }
    });

    map.atualizarOcorrencias = function (lista) {
      if (!map.getSource("oc-pontos")) return;
      const g = geojsonOcorrencias(lista);
      map.getSource("oc-pontos").setData(g.pontos);
      map.getSource("oc-colunas").setData(g.colunas);
    };
    return map;
  };
})();
