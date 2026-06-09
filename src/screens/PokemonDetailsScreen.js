import React, { useEffect, useState } from "react";
import { StyleSheet, Text, View, ScrollView, ActivityIndicator, Dimensions, Pressable } from "react-native";
import { useTheme } from "@react-navigation/native";
import { getPokemonByName, getPokemonById, getPokemonSpecies, getEvolutionChain } from "../services/pokeApi";
import { TYPE_COLORS } from "../constants/typeColors";
import TypeBadge from "../components/TypeBadge";
import ImageGallery from "../components/ImageGallery";
import EvolutionChainBanner from "../components/EvolutionChainBanner";
const {
  width
} = Dimensions.get("window");
const CARD_WIDTH = Math.min(width - 64, 600);

// ─── helpers pra formatação e padronização de todos──────────

function capitalize(s) {
  return s.charAt(0).toUpperCase() + s.slice(1);
}
function formatName(s) {
  return s.split("-").map(capitalize).join(" ");
}
function formatGeneration(gen) {
  const map = {
    "generation-i": "Generation I",
    "generation-ii": "Generation II",
    "generation-iii": "Generation III",
    "generation-iv": "Generation IV",
    "generation-v": "Generation V",
    "generation-vi": "Generation VI",
    "generation-vii": "Generation VII",
    "generation-viii": "Generation VIII",
    "generation-ix": "Generation IX"
  };
  return map[gen] ?? gen;
}
function getGenderLabel(rate) {
  if (rate === -1) return "Genderless";
  const female = rate / 8 * 100;
  const male = 100 - female;
  return `♂ ${male.toFixed(0)}%  ·  ♀ ${female.toFixed(0)}%`;
}
function getCatchRate(rate) {
  const pct = (rate / 255 * 100).toFixed(1);
  return `${rate} / 255 (${pct}%)`;
}

// ─── shared sub-components ─────

// é um cartao de seção, é só a div que engloba as informações e imagens, etc
function SectionCard({
  children,
  style
}) {
  const {
    colors
  } = useTheme();
  return <View style={[styles.sectionCard, {
    backgroundColor: colors.card,
    borderColor: colors.border
  }, style]}>
      {children}
    </View>;
}
function SectionTitle({
  children
}) {
  const {
    colors
  } = useTheme();
  return <Text style={[styles.sectionTitle, {
    color: colors.text
  }]}>
      {children}
    </Text>;
}
function InfoRow({
  label,
  value
}) {
  const {
    colors
  } = useTheme();
  return <View style={[styles.infoRow, {
    borderBottomColor: colors.border + "40"
  }]}>
      <Text style={[styles.infoLabel, {
      color: colors.text
    }]}>{label}</Text>
      <Text style={[styles.infoValue, {
      color: colors.text
    }]}>{value}</Text>
    </View>;
}

// ─── Props ─────

// ─── tela de detalhes do pokemon especifico ────

export default function PokemonDetailsScreen({
  pokemonIdentifier,
  route,
  pokemon: initialPokemon,
  onClose
}) {
  const {
    colors
  } = useTheme();
  const identifier = pokemonIdentifier || route?.params?.pokemonIdentifier;
  const [pokemon, setPokemon] = useState(initialPokemon || null);
  const [species, setSpecies] = useState(null);
  const [evolutionPaths, setEvolutionPaths] = useState([]);
  const [loading, setLoading] = useState(!initialPokemon);
  const [images, setImages] = useState([]);
  const [pendingId, setPendingId] = useState(null);
  useEffect(() => {
    async function load(data) {
      const raw = data.sprites;
      const imgs = [];
      // funcao helper pra adicionar mais rapido a labe e a imagem
      const add = (uri, label) => {
        if (uri) imgs.push({
          uri,
          label
        });
      };
      add(raw.other?.["official-artwork"]?.front_default, "Official Art");
      add(raw.other?.["official-artwork"]?.front_shiny, "Official Art (Shiny)");
      add(raw.front_default, "Front");
      add(raw.front_shiny, "Front Shiny");
      add(raw.front_female, "Front ♀");
      add(raw.front_shiny_female, "Front ♀ Shiny");
      add(raw.back_default, "Back");
      add(raw.back_shiny, "Back Shiny");
      add(raw.back_female, "Back ♀");
      add(raw.back_shiny_female, "Back ♀ Shiny");
      setImages(imgs);
      setPokemon(data);
      try {
        const speciesUrl = `https://pokeapi.co/api/v2/pokemon-species/${data.id}/`;
        const sp = await getPokemonSpecies(speciesUrl);
        setSpecies(sp);
        if (sp.evolution_chain_url) {
          const paths = await getEvolutionChain(sp.evolution_chain_url);
          setEvolutionPaths(paths);
        }
      } catch (e) {
        console.error("Erro ao carregar espécie/cadeia de evolução", e);
      }
    }
    async function carregarPokemon() {
      try {
        setLoading(true);
        let data;
        if (typeof identifier === "number") {
          data = await getPokemonById(identifier);
        } else {
          data = await getPokemonByName(identifier);
        }
        await load(data);
      } catch (e) {
        console.error("Erro ao carregar Pokémon", e);
      } finally {
        setLoading(false);
      }
    }
    if (initialPokemon) {
      load(initialPokemon).then(() => setLoading(false));
    } else {
      carregarPokemon();
    }
  }, [identifier]);
  useEffect(() => {
    if (pendingId === null) return;
    async function nav() {
      try {
        setLoading(true);
        setSpecies(null);
        setEvolutionPaths([]);
        const data = await getPokemonById(pendingId);
        setPendingId(null);
        const raw = data.sprites;
        const imgs = [];
        const add = (uri, label) => {
          if (uri) imgs.push({
            uri,
            label
          });
        };
        add(raw.other?.["official-artwork"]?.front_default, "Official Art");
        add(raw.other?.["official-artwork"]?.front_shiny, "Official Art (Shiny)");
        add(raw.front_default, "Front");
        add(raw.front_shiny, "Front Shiny");
        add(raw.front_female, "Front ♀");
        add(raw.front_shiny_female, "Front ♀ Shiny");
        add(raw.back_default, "Back");
        add(raw.back_shiny, "Back Shiny");
        add(raw.back_female, "Back ♀");
        add(raw.back_shiny_female, "Back ♀ Shiny");
        setImages(imgs);
        setPokemon(data);
        const speciesUrl = `https://pokeapi.co/api/v2/pokemon-species/${data.id}/`;
        const sp = await getPokemonSpecies(speciesUrl);
        setSpecies(sp);
        if (sp.evolution_chain_url) {
          const paths = await getEvolutionChain(sp.evolution_chain_url);
          setEvolutionPaths(paths);
        }
      } catch (e) {
        console.error("Erro ao navegar para Pokémon", e);
      } finally {
        setLoading(false);
      }
    }
    nav();
  }, [pendingId]);
  if (loading || !pokemon) {
    return <View style={[styles.centerContainer, {
      backgroundColor: colors.background
    }]}>
        <ActivityIndicator size="large" color={colors.primary} />
        <Text style={{
        color: colors.text,
        marginTop: 10
      }}>
          Carregando dados...
        </Text>
      </View>;
  }
  const mainType = pokemon.types[0]?.type.name ?? "normal";
  const accentColor = TYPE_COLORS[mainType] ?? colors.primary;
  const getStatBarWidth = baseStat => `${Math.min(baseStat / 255 * 100, 100)}%`;
  const statColors = {
    hp: "#FF5959",
    attack: "#F5AC78",
    defense: "#FAE078",
    "special-attack": "#9DB7F5",
    "special-defense": "#A7DB8D",
    speed: "#FA92B2"
  };
  const totalStats = pokemon.stats.reduce((a, s) => a + s.base_stat, 0);
  const badges = [];
  if (species?.is_legendary) badges.push("⭐ Legendary");
  if (species?.is_mythical) badges.push("✨ Mythical");
  if (species?.is_baby) badges.push("🍼 Baby");
  return <ScrollView style={{
    backgroundColor: colors.background
  }} contentContainerStyle={styles.scrollContainer}>
      <View style={styles.mainWrapper}>
        {/* Botão voltar */}
        {onClose && <Pressable onPress={onClose} style={styles.closeButton}>
            <Text style={[styles.closeButtonText, {
          color: colors.text
        }]}>
              ← Voltar
            </Text>
          </Pressable>}

        {/* Cabeçalho */}
        <View style={styles.header}>
          <View style={{
          flex: 1
        }}>
            <Text style={[styles.title, {
            color: colors.text
          }]}>
              {formatName(pokemon.name)}
            </Text>
            {species?.genus ? <Text style={[styles.genus, {
            color: accentColor
          }]}>
                {species.genus}
              </Text> : null}
            {badges.length > 0 && <View style={styles.badgeRow}>
                {badges.map(b => <View key={b} style={[styles.badgeChip, {
              backgroundColor: accentColor + "33",
              borderColor: accentColor
            }]}>
                    <Text style={[styles.badgeText, {
                color: accentColor
              }]}>
                      {b}
                    </Text>
                  </View>)}
              </View>}
          </View>
          <Text style={[styles.subtitle, {
          color: colors.text
        }]}>
            #{pokemon.id.toString().padStart(3, "0")}
          </Text>
        </View>

        {/* Tipos */}
        <View style={styles.typeRow}>
          {pokemon.types.map(t => <TypeBadge key={t.type.name} typeName={t.type.name} />)}
        </View>

        {/* Descrição Pokédex */}
        {species?.flavor_text ? <SectionCard>
            <Text style={[styles.flavorText, {
          color: colors.text
        }]}>
              {`"${species.flavor_text}"`}
            </Text>
          </SectionCard> : null}

        {/* Galeria de imagens */}
        <ImageGallery images={images} pokemon={pokemon} />

        {/* Banner da cadeia evolutiva */}
        {evolutionPaths.length > 0 && <EvolutionChainBanner paths={evolutionPaths} currentId={pokemon.id} accentColor={accentColor} onPress={id => {
        if (id !== pokemon.id) setPendingId(id);
      }} />}

        {/* Espécie & Origem */}
        <SectionCard>
          <SectionTitle>Espécie & Origem</SectionTitle>
          {species?.generation ? <InfoRow label="Geração" value={formatGeneration(species.generation)} /> : null}
          {species?.habitat ? <InfoRow label="Habitat" value={capitalize(species.habitat)} /> : null}
          {species?.color ? <InfoRow label="Cor" value={capitalize(species.color)} /> : null}
          {species?.shape ? <InfoRow label="Forma" value={formatName(species.shape)} /> : null}
          {species?.growth_rate ? <InfoRow label="Taxa de crescimento" value={formatName(species.growth_rate)} /> : null}
          {species?.hatch_counter != null ? <InfoRow label="Ciclos de ovo" value={`${species.hatch_counter} ciclos (~${(species.hatch_counter + 1) * 255} passos)`} /> : null}
          {species?.forms_switchable ? <InfoRow label="Formas alteráveis" value="Sim" /> : null}
        </SectionCard>

        {/* Fisiologia & Criação */}
        <SectionCard>
          <SectionTitle>Fisiologia & Criação</SectionTitle>
          <InfoRow label="Altura" value={`${pokemon.height / 10} m`} />
          <InfoRow label="Peso" value={`${pokemon.weight / 10} kg`} />
          <InfoRow label="Exp. Base" value={pokemon.base_experience} />
          {species != null && <>
              <InfoRow label="Taxa de captura" value={getCatchRate(species.capture_rate)} />
              <InfoRow label="Felicidade base" value={species.base_happiness} />
              <InfoRow label="Gênero" value={getGenderLabel(species.gender_rate)} />
              {species.egg_groups.length > 0 && <InfoRow label="Grupos de ovo" value={species.egg_groups.map(formatName).join(" · ")} />}
            </>}
        </SectionCard>

        {/* Treinamento */}
        <SectionCard>
          <SectionTitle>Treinamento</SectionTitle>
          <InfoRow label="EV Yield" value={pokemon.stats.filter(s => s.effort > 0).map(s => `${s.effort} ${s.stat.name.toUpperCase().replace(/-/g, " ")}`).join(" · ") || "—"} />
          <InfoRow label="Exp. Base" value={pokemon.base_experience ?? "—"} />
          {species != null && <>
              <InfoRow label="Felicidade base" value={species.base_happiness} />
              <InfoRow label="Taxa de captura" value={getCatchRate(species.capture_rate)} />
            </>}
        </SectionCard>

        {/* Habilidades */}
        <SectionCard>
          <SectionTitle>Habilidades</SectionTitle>
          {pokemon.abilities.map(a => <View key={a.ability.name} style={[styles.abilityRow, {
          borderLeftColor: a.is_hidden ? accentColor + "80" : accentColor
        }]}>
              <Text style={[styles.abilityName, {
            color: colors.text
          }]}>
                {formatName(a.ability.name)}
              </Text>
              {a.is_hidden && <View style={[styles.hiddenTag, {
            backgroundColor: accentColor + "33"
          }]}>
                  <Text style={[styles.hiddenTagText, {
              color: accentColor
            }]}>
                    Oculta
                  </Text>
                </View>}
            </View>)}
        </SectionCard>

        {/* Atributos Base */}
        <SectionCard>
          <SectionTitle>Atributos Base</SectionTitle>
          {pokemon.stats.map(s => {
          const barColor = statColors[s.stat.name] ?? accentColor;
          return <View key={s.stat.name} style={styles.statRow}>
                <Text style={[styles.statName, {
              color: colors.text
            }]}>
                  {s.stat.name.toUpperCase().replace(/-/g, " ")}
                </Text>
                <Text style={[styles.statValue, {
              color: colors.text
            }]}>
                  {s.base_stat}
                </Text>
                <View style={[styles.statBarBackground, {
              backgroundColor: colors.border
            }]}>
                  <View style={[styles.statBarFill, {
                backgroundColor: barColor,
                width: getStatBarWidth(s.base_stat)
              }]} />
                </View>
              </View>;
        })}
          <View style={[styles.statRow, {
          marginTop: 10,
          borderTopWidth: 1,
          borderTopColor: colors.border + "40",
          paddingTop: 10
        }]}>
            <Text style={[styles.statName, {
            color: colors.text
          }]}>TOTAL</Text>
            <Text style={[styles.statValue, {
            color: accentColor,
            fontWeight: "900"
          }]}>
              {totalStats}
            </Text>
            <View style={{
            flex: 4
          }} />
          </View>
        </SectionCard>

        {/* Movimentos */}
        <SectionCard>
          <SectionTitle>Movimentos ({pokemon.moves.length})</SectionTitle>
          <View style={styles.movesContainer}>
            {pokemon.moves.slice(0, 40).map(m => <View key={m.move.name} style={[styles.moveChip, {
            backgroundColor: colors.background,
            borderColor: colors.border
          }]}>
                <Text style={[styles.moveText, {
              color: colors.text
            }]}>
                  {formatName(m.move.name)}
                </Text>
              </View>)}
            {pokemon.moves.length > 40 && <View style={[styles.moveChip, {
            backgroundColor: "transparent",
            borderWidth: 0
          }]}>
                <Text style={[styles.moveText, {
              color: accentColor,
              fontWeight: "bold"
            }]}>
                  +{pokemon.moves.length - 40} mais...
                </Text>
              </View>}
          </View>
        </SectionCard>
      </View>
    </ScrollView>;
}
const styles = StyleSheet.create({
  centerContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center"
  },
  scrollContainer: {
    paddingVertical: 24,
    paddingHorizontal: 15,
    alignItems: "center"
  },
  mainWrapper: {
    width: "100%",
    maxWidth: 700
  },
  closeButton: {
    alignSelf: "flex-start",
    paddingHorizontal: 12,
    paddingVertical: 8,
    marginBottom: 10
  },
  closeButtonText: {
    fontSize: 15,
    fontWeight: "700"
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: 10,
    paddingHorizontal: 4
  },
  title: {
    fontSize: 30,
    fontWeight: "900",
    lineHeight: 36
  },
  genus: {
    fontSize: 14,
    fontWeight: "600",
    marginTop: 2,
    marginBottom: 6,
    opacity: 0.9
  },
  subtitle: {
    fontSize: 22,
    fontWeight: "bold",
    marginTop: 6
  },
  badgeRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 6,
    marginTop: 4
  },
  badgeChip: {
    borderWidth: 1,
    borderRadius: 12,
    paddingHorizontal: 8,
    paddingVertical: 2
  },
  badgeText: {
    fontSize: 11,
    fontWeight: "700"
  },
  typeRow: {
    flexDirection: "row",
    gap: 8,
    marginBottom: 16,
    paddingHorizontal: 4
  },
  flavorText: {
    fontSize: 15,
    lineHeight: 22,
    fontStyle: "italic",
    opacity: 0.85
  },
  sectionCard: {
    borderWidth: 1,
    borderRadius: 16,
    padding: 16,
    marginBottom: 14,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2
    },
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 2
  },
  sectionTitle: {
    fontSize: 17,
    fontWeight: "800",
    marginBottom: 14,
    letterSpacing: 0.2
  },
  infoRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingVertical: 7,
    borderBottomWidth: 1
  },
  infoLabel: {
    fontWeight: "600",
    fontSize: 14,
    opacity: 0.75
  },
  infoValue: {
    fontSize: 14,
    fontWeight: "500",
    textAlign: "right",
    flex: 1,
    marginLeft: 12
  },
  abilityRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    borderLeftWidth: 3,
    paddingLeft: 10,
    paddingVertical: 8,
    marginBottom: 6
  },
  abilityName: {
    fontSize: 15,
    fontWeight: "600"
  },
  hiddenTag: {
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 8
  },
  hiddenTagText: {
    fontSize: 11,
    fontWeight: "700"
  },
  statRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 8
  },
  statName: {
    flex: 2,
    fontSize: 10,
    fontWeight: "700",
    letterSpacing: 0.5
  },
  statValue: {
    width: 38,
    fontSize: 14,
    fontWeight: "bold",
    textAlign: "right",
    marginRight: 10
  },
  statBarBackground: {
    flex: 4,
    height: 8,
    borderRadius: 4,
    overflow: "hidden"
  },
  statBarFill: {
    height: "100%",
    borderRadius: 4
  },
  movesContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 6
  },
  moveChip: {
    borderWidth: 1,
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 8
  },
  moveText: {
    fontSize: 12,
    fontWeight: "600"
  }
});