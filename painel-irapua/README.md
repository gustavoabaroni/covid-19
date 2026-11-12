# Painel Irapuã: protótipo

Painel de gestão para a Prefeitura de Irapuã/SP. Mostra a cidade em 3D, as ocorrências marcadas no mapa e um HUD com indicadores públicos. Inclui uma **ouvidoria** para a população registrar reclamações e avaliar os serviços.

- `index.html` é o painel da prefeita: mapa 3D, satisfação, serviços, números da cidade e fila de ocorrências.
- `ouvidoria.html` é o formulário do cidadão: assunto, descrição, local no mapa, urgência, nota de 1 a 5 e contato opcional.

## Como abrir
Não precisa de build. Rode um servidor estático na pasta:

```bash
cd painel-irapua
python3 -m http.server 8000
# abra http://localhost:8000
```

Também funciona no GitHub Pages. O mapa precisa de internet para carregar o OpenStreetMap. Sem conexão, o painel mostra só as ocorrências em 3D e exibe um aviso.

## Como funciona
| Parte | Tecnologia | Observação |
|---|---|---|
| Mapa 3D | MapLibre GL 4.7.1 + OpenFreeMap (OpenStreetMap) + relevo AWS Terrarium | Grátis, sem chave. Os prédios saem do OSM; onde o OSM não tem altura, recebem 5 m. |
| Ocorrências | Colunas 3D: a cor indica a categoria e a altura indica a prioridade | Clique para ver detalhes e mudar o status (aberto → em andamento → resolvido). |
| Satisfação | Média das notas da ouvidoria, convertida para 0–100% | |
| Serviços | Status calculado pelas ocorrências abertas: Normal, Atenção ou Crítico (Crítico = há prioridade alta) | |
| Números da cidade | `data/snapshot.js` com fonte e ano de cada valor | Ao abrir, tenta atualizar população e PIB pela API do IBGE (SIDRA). |
| Ouvidoria | `localStorage` do navegador | Só no protótipo: as mensagens aparecem no painel **do mesmo navegador**. Dá para exportar e importar em JSON. |

As ocorrências em `data/ocorrencias-exemplo.js` são **fictícias** e aparecem marcadas como "exemplo". Elas existem só para a demonstração.

## Dados de Irapuã usados (pesquisa de nov/2026)
| Indicador | Valor | Fonte |
|---|---|---|
| População | 6.867 (Censo 2022) | IBGE |
| Área / densidade | 257,6 km² / 26,66 hab/km² | IBGE |
| PIB per capita | R$ 41.126,49 (2023) | IBGE |
| IDHM | 0,713 (2010) | PNUD/IBGE |
| Receita realizada | R$ 49,5 mi (2024) | IBGE/Siconfi |
| Despesa empenhada | R$ 43,1 mi (2024) | IBGE/Siconfi |
| Água | 100% atendidos, 9,2% de perdas; operadora SABESP | aguaesaneamento.org.br / ANA |
| Saúde | UBS central + UBS/ESF | SES-SP |
| Escolarização 6–14 anos | 98,25% (2022) | IBGE |
| IDEB rede pública | 6,5 (2023) | qualcep (conferir no INEP) |
| Centro urbano | 21°16′46″S 49°24′32″W, 428 m | Wikipédia |

**A confirmar** (aparecem como "a confirmar" no painel): investimento anual, número de ambulâncias (CNES), esgoto tratado (SNIS), distribuidora de energia e DEC/FEC (ANEEL), nota IEG-M do TCE-SP e a ouvidoria/e-SIC atual da prefeitura. Com acesso à prefeitura, esses dados saem direto dos setores. Para mudar um valor, edite `data/snapshot.js`.

## Próximos passos para virar produto
1. **Backend da ouvidoria** (Supabase ou Firebase): troque só as funções de `IRAPUA.armazenamento` em `js/ouvidoria.js`. Inclui login da prefeitura, moderação e notificação ao setor responsável.
2. **LGPD:** o contato do cidadão nunca aparece no mapa; definir prazo de retenção e um termo de uso.
3. **Integrações:** Siconfi/TCE-SP (Audesp) para investimento; CNES para a frota de saúde; avisos da distribuidora para quedas de energia; Fala.BR.
4. **Pontos fixos da cidade** (prefeitura, UBS, escolas, pista de skate) com coordenadas exatas levantadas com a prefeitura.
5. **Google Photorealistic 3D Tiles** (opcional, precisa de chave paga), se houver cobertura para Irapuã.
6. **Programa antitabagismo:** indicador no HUD quando o app for integrado.
