import React, { useEffect, useRef, useState } from "react";
import { StyleSheet, Text, View, Pressable, ScrollView, Platform, ActivityIndicator } from "react-native";
import { useTheme } from "@react-navigation/native";
import { getAllRegions, getAllTypes, getPokemonByName, getPokemonById, resolveFilters, getAllPokemonNames, getAllAbilityNames, getAllMoveNames } from "../services/pokeApi";
import AutocompleteInput from "../components/AutocompleteInput";
import PokeCard from "../components/PokeCard";
import PokemonDetailsScreen from "./PokemonDetailsScreen";

//e a tela principal, tem tudo

export default function PokedexScreen() {
  const {
    colors
  } = useTheme();
  const scrollRef = useRef(null);
  const resultsRef = useRef(null);
  const [mostrarAvancado, setMostrarAvancado] = useState(false);
  const [nomePokemon, setNomePokemon] = useState("");
  const [pokemonBuscado, setPokemonBuscado] = useState(null);
  const [andGate, setAndGate] = useState(false);
  const [mostrarDetalhes, setMostrarDetalhes] = useState(false);
  const [carregando, setCarregando] = useState(false);
  const [criterios, setCriterios] = useState([{
    id: "1",
    campo: "nome",
    valor: ""
  }]);
  const [regiaoSelecionada, setRegiaoSelecionada] = useState("Todas");
  const [tipoSelecionado, setTipoSelecionado] = useState("Todos");
  const [apenasLendarios, setApenasLendarios] = useState(false);
  const [regioes, setRegioes] = useState([]);
  const [tipos, setTipos] = useState([]);
  const [todosPokemonNames, setTodosPokemonNames] = useState([]);
  const [todasHabilidades, setTodasHabilidades] = useState([]);
  const [todosMovimentos, setTodosMovimentos] = useState([]);
  const [resultadosAvancados, setResultadosAvancados] = useState([]);
  const [mostrarResultados, setMostrarResultados] = useState(false);
  useEffect(() => {
    async function carregarDados() {
      try {
        const [reg, tip, pokeNames, abils, moves] = await Promise.all([getAllRegions(), getAllTypes(), getAllPokemonNames(), getAllAbilityNames(), getAllMoveNames()]);
        setRegioes(reg);
        setTipos(tip);
        setTodosPokemonNames(pokeNames);
        setTodasHabilidades(abils);
        setTodosMovimentos(moves);
      } catch (e) {
        console.log("erro ao carregar os dados", e);
      }
    }
    carregarDados();
  }, []);
  const adicionarCriterio = () => {
    const novoId = (Math.floor(Math.random() * 1000) + 1).toString();
    setCriterios([...criterios, {
      id: novoId,
      campo: "nome",
      valor: ""
    }]);
  };
  const removerCriterio = id => {
    if (criterios.length > 1) {
      setCriterios(criterios.filter(c => c.id !== id));
    }
  };
  const atualizarCriterio = (id, chave, valor) => {
    setCriterios(criterios.map(c => c.id === id ? {
      ...c,
      [chave]: valor
    } : c));
  };
  const limparTodosFiltros = () => {
    setCriterios([{
      id: "1",
      campo: "nome",
      valor: ""
    }]);
    setRegiaoSelecionada("Todas");
    setTipoSelecionado("Todos");
    setApenasLendarios(false);
    setResultadosAvancados([]);
    setMostrarResultados(false);
  };
  const getSuggestions = campo => {
    if (campo === "nome") return todosPokemonNames;
    if (campo === "habilidade") return todasHabilidades;
    if (campo === "movimento") return todosMovimentos;
    return [];
  };
  const executarBusca = async () => {
    if (!nomePokemon.trim()) {
      alert("Por favor, digite o nome de um Pokémon");
      return;
    }
    try {
      setCarregando(true);
      const pokemon = await getPokemonByName(nomePokemon.toLowerCase().trim());
      setPokemonBuscado(pokemon);
      setMostrarDetalhes(true);
    } catch (e) {
      alert("Pokémon não encontrado!");
      console.error(e);
    } finally {
      setCarregando(false);
    }
  };
  const executarBuscaAvancada = async () => {
    const filters = {
      criterios,
      regiaoSelecionada: regiaoSelecionada === "Todas" ? "" : regiaoSelecionada,
      tipoSelecionado: tipoSelecionado === "Todos" ? "" : tipoSelecionado,
      apenasLendarios
    };
    try {
      setCarregando(true);
      setMostrarResultados(false);
      const resp = await resolveFilters(filters);
      const lista = resp.data?.pokemon ?? [];
      if (lista.length === 0) {
        alert("Nenhum Pokémon encontrado com esses filtros.");
        return;
      }
      if (lista.length === 1) {
        // apenas um resultado → abre direto a tela de detalhes
        const pokemon = await getPokemonById(lista[0].id);
        setPokemonBuscado(pokemon);
        setMostrarDetalhes(true);
        return;
      }

      // múltiplos resultados → mostra PokeCards e rola para baixo
      setResultadosAvancados(lista);
      setMostrarResultados(true);
      setTimeout(() => {
        scrollRef.current?.scrollToEnd({
          animated: true
        });
      }, 300);
    } catch (e) {
      alert("Erro ao executar busca avançada.");
      console.error(e);
    } finally {
      setCarregando(false);
    }
  };
  const abrirDetalhes = async id => {
    try {
      setCarregando(true);
      const pokemon = await getPokemonById(id);
      setPokemonBuscado(pokemon);
      setMostrarDetalhes(true);
    } catch (e) {
      alert("Erro ao carregar Pokémon.");
    } finally {
      setCarregando(false);
    }
  };
  if (mostrarDetalhes && pokemonBuscado) {
    return <PokemonDetailsScreen pokemon={pokemonBuscado} onClose={() => {
      setMostrarDetalhes(false);
      setPokemonBuscado(null);
    }} />;
  }
  const numColumns = Platform.OS === "web" ? 4 : 2;
  return <ScrollView ref={scrollRef} style={{
    backgroundColor: colors.background
  }} contentContainerStyle={styles.scrollContainer} keyboardShouldPersistTaps="handled">
      <View style={styles.mainWrapper}>
        <Text style={[styles.title, {
        color: colors.text
      }]}>
          {mostrarAvancado ? "Busca Avançada" : "Pokédex"}
        </Text>

        {!mostrarAvancado ? <View style={[styles.sectionCard, {
        backgroundColor: colors.card,
        borderColor: colors.border
      }]}>
            <Text style={[styles.sectionTitle, {
          color: colors.text
        }]}>
              Procurar por nome:
            </Text>

            <View style={[styles.inputContainer, {
          zIndex: 1000,
          elevation: 1000
        }]}>
              <AutocompleteInput value={nomePokemon} onChangeText={setNomePokemon} suggestions={todosPokemonNames} placeholder="Digite o nome do Pokémon..." textColor={colors.text} borderColor={colors.border} bgColor={colors.background} cardColor={colors.card} />
            </View>

            <View style={[styles.actionButtonsContainer, {
          marginTop: 15
        }]}>
              <Pressable style={[styles.searchButton, {
            backgroundColor: colors.primary,
            flex: 1
          }]} onPress={() => setMostrarAvancado(true)}>
                <Text style={styles.searchButtonText}>Filtros Avançados</Text>
              </Pressable>
            </View>

            <View style={[styles.actionButtonsContainer, {
          marginTop: 15
        }]}>
              <Pressable style={[styles.searchButton, {
            backgroundColor: colors.primary,
            flex: 1,
            opacity: carregando ? 0.6 : 1
          }]} onPress={executarBusca} disabled={carregando}>
                <Text style={styles.searchButtonText}>
                  {carregando ? "Carregando..." : "Buscar por nome"}
                </Text>
              </Pressable>
            </View>
          </View> : <>
            <View style={[styles.actionButtonsContainer, {
          marginTop: 15
        }]}>
              <Pressable style={[styles.searchButton, {
            backgroundColor: colors.primary,
            flex: 1
          }]} onPress={() => setMostrarAvancado(false)}>
                <Text style={styles.searchButtonText}>
                  Ocultar filtros avançados
                </Text>
              </Pressable>
            </View>

            <View style={[styles.sectionCard, {
          backgroundColor: colors.card,
          borderColor: colors.border
        }]}>
              <Text style={[styles.sectionTitle, {
            color: colors.text
          }]}>
                Procurar por termo{"\n"}(obrigatoriamente é um ou, ou seja, se
                colocar um campo ele vai buscar TAMBEM por ele):
              </Text>

              {criterios.map((item, _) => <View key={item.id} style={styles.criteriaRow}>
                  <View style={styles.toggleFieldContainer}>
                    {["nome", "habilidade", "movimento"].map(f => <Pressable key={f} style={[styles.fieldToggleItem, item.campo === f && {
                backgroundColor: colors.primary
              }]} onPress={() => atualizarCriterio(item.id, "campo", f)}>
                        <Text style={[styles.fieldToggleText, {
                  color: item.campo === f ? "#fff" : colors.text
                }]}>
                          {f.charAt(0).toUpperCase() + f.slice(1)}
                        </Text>
                      </Pressable>)}
                  </View>

                  <View style={[styles.inputContainer, {
              zIndex: 100
            }]}>
                    <AutocompleteInput value={item.valor} onChangeText={text => atualizarCriterio(item.id, "valor", text)} suggestions={getSuggestions(item.campo)} placeholder={`Digite o ${item.campo}...`} textColor={colors.text} borderColor={colors.border} bgColor={colors.background} cardColor={colors.card} />

                    {criterios.length > 1 && <Pressable style={[styles.removeButton, {
                backgroundColor: colors.notification
              }]} onPress={() => removerCriterio(item.id)}>
                        <Text style={styles.removeButtonText}>✕</Text>
                      </Pressable>}
                  </View>
                </View>)}

              <Pressable style={[styles.addButton, {
            borderColor: colors.primary
          }]} onPress={adicionarCriterio}>
                <Text style={[styles.addButtonText, {
              color: colors.primary
            }]}>
                  ＋ Adicionar outro campo
                </Text>
              </Pressable>
            </View>

            <View style={[styles.sectionCard, {
          backgroundColor: colors.card,
          borderColor: colors.border
        }]}>
              <Text style={[styles.sectionTitle, {
            color: colors.text
          }]}>
                Filtrar por Região:
              </Text>
              <ScrollView horizontal showsHorizontalScrollIndicator={true} contentContainerStyle={styles.chipsContainer}>
                {regioes.map(regiao => <Pressable key={regiao.name} style={[styles.chip, {
              backgroundColor: colors.background,
              borderColor: colors.border
            }, regiaoSelecionada === regiao.name && {
              backgroundColor: colors.primary,
              borderColor: colors.primary
            }]} onPress={() => setRegiaoSelecionada(regiaoSelecionada === regiao.name ? "Todas" : regiao.name)}>
                    <Text style={[styles.chipText, {
                color: regiaoSelecionada === regiao.name ? "#fff" : colors.text
              }]}>
                      {regiao.name}
                    </Text>
                  </Pressable>)}
              </ScrollView>
            </View>

            <View style={[styles.sectionCard, {
          backgroundColor: colors.card,
          borderColor: colors.border
        }]}>
              <Text style={[styles.sectionTitle, {
            color: colors.text
          }]}>
                Filtrar por Tipo elemental:
              </Text>
              <ScrollView horizontal showsHorizontalScrollIndicator={true} contentContainerStyle={styles.chipsContainer}>
                {tipos.map(tipo => <Pressable key={tipo.name} style={[styles.chip, {
              backgroundColor: colors.background,
              borderColor: colors.border
            }, tipoSelecionado === tipo.name && {
              backgroundColor: colors.primary,
              borderColor: colors.primary
            }]} onPress={() => setTipoSelecionado(tipoSelecionado === tipo.name ? "Todos" : tipo.name)}>
                    <Text style={[styles.chipText, {
                color: tipoSelecionado === tipo.name ? "#fff" : colors.text
              }]}>
                      {tipo.name}
                    </Text>
                  </Pressable>)}
              </ScrollView>
            </View>

            <View style={[styles.sectionCard, {
          backgroundColor: colors.card,
          borderColor: colors.border,
          flexDirection: "row",
          justifyContent: "space-between",
          alignItems: "center"
        }]}>
              <Text style={[styles.sectionTitle, {
            color: colors.text,
            marginBottom: 0
          }]}>
                Apenas Lendários / Míticos
              </Text>
              <Pressable style={[styles.checkbox, {
            borderColor: colors.border,
            backgroundColor: apenasLendarios ? colors.primary : colors.background
          }]} onPress={() => setApenasLendarios(!apenasLendarios)}>
                {apenasLendarios && <Text style={styles.checkboxCheck}>✓</Text>}
              </Pressable>
            </View>

            <View style={styles.actionButtonsContainer}>
              <Pressable style={[styles.cleanButton, {
            borderColor: colors.border
          }]} onPress={limparTodosFiltros}>
                <Text style={[styles.cleanButtonText, {
              color: colors.text
            }]}>
                  Limpar filtros
                </Text>
              </Pressable>

              <Pressable style={[styles.searchButton, {
            backgroundColor: colors.primary,
            opacity: carregando ? 0.6 : 1
          }]} onPress={executarBuscaAvancada} disabled={carregando}>
                {carregando ? <ActivityIndicator color="#fff" size="small" /> : <Text style={styles.searchButtonText}>Busca avançada</Text>}
              </Pressable>
            </View>
          </>}

        {/* ── Resultados da Busca Avançada ──────────────────────── */}
        {mostrarResultados && resultadosAvancados.length > 0 && <View ref={resultsRef} style={[styles.resultsSection, {
        backgroundColor: colors.card,
        borderColor: colors.border
      }]}>
            <Text style={[styles.resultsTitle, {
          color: colors.text
        }]}>
              🔍 {resultadosAvancados.length} Pokémons encontrados
            </Text>

            <View style={styles.cardsGrid}>
              {resultadosAvancados.map(poke => <View key={poke.id} style={[styles.cardWrapper, {
            width: `${100 / numColumns}%`
          }]}>
                  <PokeCard id={poke.id} name={poke.name} onPress={() => abrirDetalhes(poke.id)} />
                </View>)}
            </View>
          </View>}
      </View>
    </ScrollView>;
}
const styles = StyleSheet.create({
  scrollContainer: {
    paddingVertical: 30,
    paddingHorizontal: 15,
    alignItems: "center"
  },
  mainWrapper: {
    width: "100%",
    maxWidth: 700
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    marginBottom: 25,
    textAlign: "center"
  },
  sectionCard: {
    borderWidth: 1,
    borderRadius: 16,
    padding: 16,
    marginBottom: 16,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2
    },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    zIndex: 10,
    overflow: "visible",
    elevation: 2
  },
  sectionTitle: {
    fontSize: 15,
    fontWeight: "700",
    marginBottom: 12,
    opacity: 0.9
  },
  criteriaRow: {
    marginBottom: 15,
    borderBottomWidth: 1,
    borderBottomColor: "rgba(150,150,150,0.1)",
    paddingBottom: 15,
    overflow: "visible"
  },
  toggleFieldContainer: {
    flexDirection: "row",
    borderRadius: 8,
    overflow: "hidden",
    marginBottom: 8,
    backgroundColor: "rgba(150,150,150,0.1)"
  },
  fieldToggleItem: {
    flex: 1,
    paddingVertical: 6,
    alignItems: "center",
    justifyContent: "center"
  },
  fieldToggleText: {
    fontSize: 12,
    fontWeight: "600"
  },
  inputContainer: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    overflow: "visible"
  },
  removeButton: {
    width: 45,
    height: 45,
    borderRadius: 8,
    justifyContent: "center",
    alignItems: "center"
  },
  removeButtonText: {
    color: "#fff",
    fontWeight: "bold"
  },
  addButton: {
    borderWidth: 1,
    borderStyle: "dashed",
    padding: 12,
    borderRadius: 8,
    alignItems: "center",
    marginTop: 5
  },
  addButtonText: {
    fontWeight: "600",
    fontSize: 14
  },
  chipsContainer: {
    gap: 8,
    paddingBottom: 5
  },
  chip: {
    borderWidth: 1,
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20
  },
  chipText: {
    fontSize: 13,
    fontWeight: "600"
  },
  checkbox: {
    width: 28,
    height: 28,
    borderWidth: 2,
    borderRadius: 6,
    justifyContent: "center",
    alignItems: "center"
  },
  checkboxCheck: {
    color: "#fff",
    fontWeight: "bold"
  },
  actionButtonsContainer: {
    flexDirection: Platform.OS === "web" ? "row" : "column-reverse",
    gap: 12,
    marginTop: 15,
    marginBottom: 5
  },
  cleanButton: {
    flex: Platform.OS === "web" ? 1 : 0,
    height: 55,
    borderWidth: 1,
    borderRadius: 12,
    justifyContent: "center",
    alignItems: "center"
  },
  cleanButtonText: {
    fontWeight: "600",
    fontSize: 16
  },
  searchButton: {
    flex: Platform.OS === "web" ? 2 : 0,
    height: 55,
    borderRadius: 12,
    justifyContent: "center",
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 4
    },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 4
  },
  searchButtonText: {
    color: "#fff",
    fontWeight: "bold",
    fontSize: 16,
    letterSpacing: 0.5
  },
  resultsSection: {
    borderWidth: 1,
    borderRadius: 16,
    padding: 16,
    marginTop: 8,
    marginBottom: 30
  },
  resultsTitle: {
    fontSize: 17,
    fontWeight: "800",
    marginBottom: 16
  },
  cardsGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 0,
    marginHorizontal: -6
  },
  cardWrapper: {
    paddingHorizontal: 6,
    paddingVertical: 6
  }
});