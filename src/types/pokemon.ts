// interfaces usadas pelo app (camada de domínio simplificada)
// as interfaces brutas da PokeAPI ficam em pokeApiRaw.ts

export interface Type {
  type: { name: string };
}

export interface Ability {
  ability: { name: string };
  is_hidden: boolean;
}

export interface Stat {
  base_stat: number;
  effort: number;
  stat: { name: string };
}

export interface Move {
  move: { name: string };
}

export interface Sprites {
  front_default: string | null;
  back_default: string | null;
  front_female: string | null;
  back_female: string | null;
  front_shiny: string | null;
  back_shiny: string | null;
  front_shiny_female: string | null;
  back_shiny_female: string | null;
  other?: {
    "official-artwork"?: {
      front_default: string | null;
      front_shiny: string | null;
    };
  };
}

export interface PokemonData {
  id: number;
  name: string;
  height: number;
  weight: number;
  base_experience: number;
  types: Type[];
  abilities: Ability[];
  stats: Stat[];
  moves: Move[];
  sprites: Sprites;
}

export interface Props {
  route: {
    params: {
      pokemonIdentifier: string | number;
    };
  };
}

export interface Result {
  name: string;
  id: number;
}

export interface SpeciesData {
  id: number;
  name: string;
  genus: string;              // ex: "Seed Pokémon"
  flavor_text: string;        // Descrição da Pokédex (EN)
  generation: string;         // ex: "generation-i"
  habitat: string | null;     // ex: "grassland"
  color: string;              // ex: "green"
  shape: string;              // ex: "quadruped"
  capture_rate: number;       // 0–255
  base_happiness: number;
  gender_rate: number;        // -1 = sem gênero, 0–8 (proporção ♀ / 8)
  egg_groups: string[];
  growth_rate: string;        // ex: "medium-slow"
  hatch_counter: number | null; // ciclos base do ovo
  forms_switchable: boolean;
  is_baby: boolean;
  is_legendary: boolean;
  is_mythical: boolean;
  evolution_chain_url: string;
}

export interface EvolutionStage {
  id: number;
  name: string;
  minLevel: number | null;
  trigger: string | null;     // ex: "level-up", "use-item", "trade"
  item: string | null;        // nome do item (quando ativado por item)
  condition: string | null;   // condição extra (felicidade, horário, etc.)
}
