import { PokemonData, Result, SpeciesData, EvolutionStage } from "../types/pokemon";
import { PokeApiData } from "../types/pokeApiRaw";

const BASE_URL = "https://pokeapi.co/api/v2/";
const GRAPHQL_URL = "https://graphql.pokeapi.co/v1beta2/";

// ─── Filter types ─────────────────────────────────────────────────────────────

export interface CriterioBusca {
  id: string;
  campo: "nome" | "habilidade" | "movimento";
  valor: string;
}

export interface Filters {
  criterios: CriterioBusca[];
  regiaoSelecionada: string;
  tipoSelecionado: string;
  apenasLendarios: boolean;
}

// ─── GraphQL helpers ──────────────────────────────────────────────────────────

function resolveQuery(filters: Filters): string {
  const clauses: string[] = [];

  if (filters.apenasLendarios) {
    clauses.push("{ pokemonspecy: { is_legendary: { _eq: true } } }");
  }

  if (filters.tipoSelecionado) {
    clauses.push(
      `{ pokemontypes: { type: { name: { _eq: "${filters.tipoSelecionado}" } } } }`,
    );
  }

  if (filters.regiaoSelecionada) {
    clauses.push(
      `{ pokemonspecy: { generation: { region: { name: { _eq: "${filters.regiaoSelecionada}" } } } } }`,
    );
  }

  for (const crit of filters.criterios) {
    if (!crit.valor.trim()) continue;

    switch (crit.campo) {
      case "nome":
        clauses.push(`{ name: { _ilike: "%${crit.valor}%" } }`);
        break;
      case "habilidade":
        clauses.push(
          `{ pokemonabilities: { ability: { name: { _ilike: "%${crit.valor}%" } } } }`,
        );
        break;
      case "movimento":
        clauses.push(
          `{ pokemonmoves: { move: { name: { _ilike: "%${crit.valor}%" } } } }`,
        );
        break;
    }
  }

  const whereArgument =
    clauses.length > 0 ? `(where: { _or: [ ${clauses.join(", ")} ] })` : "";

  return `query CustomQuery { pokemon${whereArgument} { id name } }`;
}

export async function resolveFilters(filters: Filters) {
  const query = resolveQuery(filters);
  console.log("fetching query", query);
  return (await (
    await fetch(GRAPHQL_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json", Accept: "*/*" },
      body: JSON.stringify({
        query: query,
        variables: null,
        operationName: "CustomQuery",
      }),
    })
  ).json()) as { data: { pokemon: { id: number; name: string }[] } };
}

export async function getLegendaryPokemonIds(): Promise<number[]> {
  return (
    (await (
      await fetch(GRAPHQL_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json", Accept: "*/*" },
        body: JSON.stringify({
          query:
            "query GetLegendaryPokemon { pokemonspecies(where: {is_legendary: {_eq: true}}) { id } }",
          variables: null,
          operationName: "GetLegendaryPokemon",
        }),
      })
    ).json()) as { data: { pokemonspecies: { id: number }[] } }
  ).data.pokemonspecies.map((pokemon) => pokemon.id);
}

// ─── tradutor de PokeApiData → PokemonData ──────
// converte a resposta bruta da API para a interface simplificada usada pelo app

function translatePokeApiDataToPokemonData(apiData: PokeApiData): PokemonData {
  return { // funcao feita pra nao ser lida. eu fiz com ia e é simplesmente um ultra hardcode desgraçado
    id: apiData.id,
    name: apiData.name,
    height: apiData.height,
    weight: apiData.weight,
    base_experience: apiData.base_experience,
    types: apiData.types.map((type) => ({
      type: { name: type.type.name },
    })),
    abilities: apiData.abilities.map((ability) => ({
      ability: { name: ability.ability.name },
      is_hidden: ability.is_hidden,
    })),
    stats: apiData.stats.map((stat) => ({
      base_stat: stat.base_stat,
      effort: stat.effort,
      stat: { name: stat.stat.name },
    })),
    moves: apiData.moves.map((move) => ({
      move: { name: move.move.name },
    })),
    sprites: {
      front_default: apiData.sprites.front_default,
      back_default: apiData.sprites.back_default,
      front_female: apiData.sprites.front_female,
      back_female: apiData.sprites.back_female,
      front_shiny: apiData.sprites.front_shiny,
      back_shiny: apiData.sprites.back_shiny,
      front_shiny_female: apiData.sprites.front_shiny_female,
      back_shiny_female: apiData.sprites.back_shiny_female,
      other: apiData.sprites.other,
    },
  };
}

// "helpers" da pokeapi

export async function getPokemonByName(name: string): Promise<PokemonData> {
  const apiResult = (await (
    await fetch(BASE_URL + "pokemon/" + name)
  ).json()) as PokeApiData;
  return translatePokeApiDataToPokemonData(apiResult);
}

export async function getPokemonById(id: number): Promise<PokemonData> {
  const apiResult = (await (
    await fetch(BASE_URL + "pokemon/" + id)
  ).json()) as PokeApiData;
  return translatePokeApiDataToPokemonData(apiResult);
}

export async function getAllRegions(): Promise<Result[]> {
  return (await (await fetch(BASE_URL + "region")).json()).results as Result[];
}

export async function getAllTypes(): Promise<Result[]> {
  return (await (await fetch(BASE_URL + "type")).json()).results as Result[];
}

export async function getAllPokemonNames(): Promise<string[]> {
  const res = await fetch(BASE_URL + "pokemon?limit=10000");
  const data = await res.json();
  return (data.results as { name: string }[]).map((p) => p.name);
}

export async function getAllAbilityNames(): Promise<string[]> {
  const res = await fetch(BASE_URL + "ability?limit=10000");
  const data = await res.json();
  return (data.results as { name: string }[]).map((a) => a.name);
}

export async function getAllMoveNames(): Promise<string[]> {
  const res = await fetch(BASE_URL + "move?limit=10000");
  const data = await res.json();
  return (data.results as { name: string }[]).map((m) => m.name);
}
// essa é especial pq faz uma limpeza e reformatação
export async function getPokemonSpecies(speciesUrl: string): Promise<SpeciesData> {
  const raw = await (await fetch(speciesUrl)).json();

  const enFlavorEntry = raw.flavor_text_entries?.find(
    (e: any) => e.language.name === "en"
  );
  const enGenus = raw.genera?.find((g: any) => g.language.name === "en");

  return {
    id: raw.id,
    name: raw.name,
    genus: enGenus?.genus ?? "",
    flavor_text: enFlavorEntry?.flavor_text
      ?.replace(/\f/g, " ")
      .replace(/\n/g, " ") ?? "",
    generation: raw.generation?.name ?? "",
    habitat: raw.habitat?.name ?? null,
    color: raw.color?.name ?? "",
    shape: raw.shape?.name ?? "",
    capture_rate: raw.capture_rate ?? 0,
    base_happiness: raw.base_happiness ?? 0,
    gender_rate: raw.gender_rate ?? -1,
    egg_groups: (raw.egg_groups as { name: string }[])?.map((g) => g.name) ?? [],
    growth_rate: raw.growth_rate?.name ?? "",
    hatch_counter: raw.hatch_counter ?? null,
    forms_switchable: raw.forms_switchable ?? false,
    is_baby: raw.is_baby ?? false,
    is_legendary: raw.is_legendary ?? false,
    is_mythical: raw.is_mythical ?? false,
    evolution_chain_url: raw.evolution_chain?.url ?? "",
  };
}

function extractIdFromUrl(url: string): number {
  const parts = url.replace(/\/$/, "").split("/");
  return parseInt(parts[parts.length - 1], 10);
}

export async function getEvolutionChain(chainUrl: string): Promise<EvolutionStage[][]> {
  if (!chainUrl) return [];
  const raw = await (await fetch(chainUrl)).json();

  function buildPaths(node: any, currentPath: EvolutionStage[]): EvolutionStage[][] {
    const speciesId = extractIdFromUrl(node.species.url);
    const details = node.evolution_details?.[0];

    let condition: string | null = null;
    if (details) {
      const extras: string[] = [];
      if (details.min_happiness) extras.push(`Happiness ≥ ${details.min_happiness}`);
      if (details.min_affection) extras.push(`Affection ≥ ${details.min_affection}`);
      if (details.time_of_day) extras.push(details.time_of_day);
      if (details.known_move) extras.push(`Knows ${details.known_move.name}`);
      if (details.location) extras.push(`at ${details.location.name}`);
      if (details.held_item) extras.push(`Holding ${details.held_item.name}`);
      if (details.needs_overworld_rain) extras.push("Rain");
      if (extras.length) condition = extras.join(" · ");
    }

    const stage: EvolutionStage = {
      id: speciesId,
      name: node.species.name,
      minLevel: details?.min_level ?? null,
      trigger: details?.trigger?.name ?? null,
      item: details?.item?.name ?? null,
      condition,
    };

    const newPath = [...currentPath, stage];

    if (!node.evolves_to || node.evolves_to.length === 0) {
      return [newPath];
    }

    const allPaths: EvolutionStage[][] = [];
    for (const next of node.evolves_to) {
      allPaths.push(...buildPaths(next, newPath));
    }
    return allPaths;
  }

  return buildPaths(raw.chain, []);
}
