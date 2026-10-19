import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';

// Instancia única de la API. Declaramos los endpoints y RTK Query nos genera
// los hooks, el cache, los estados de carga/error y el dedupe de requests.
export const pokemonApi = createApi({
  reducerPath: 'pokemonApi',

  baseQuery: fetchBaseQuery({
    baseUrl: 'https://pokeapi.co/api/v2/',
  }),

  // El listado es estable: guardamos el cache 5 min para no repetir requests al navegar.
  keepUnusedDataFor: 300,

  // Al reconectar o volver a la pestaña, revalida en segundo plano lo que esté montado.
  refetchOnReconnect: true,
  refetchOnFocus: true,

  // Tags para invalidar de forma selectiva (no todo el cache de una).
  tagTypes: ['PokemonList', 'PokemonDetail', 'Types', 'Generations'],

  endpoints: (builder) => ({
    // Listado paginado: el infinite scroll solo va incrementando el offset.
    getPokemonList: builder.query({
      query: ({ offset = 0, limit = 20 }) => `pokemon?offset=${offset}&limit=${limit}`,
      providesTags: (result, error, { offset }) => [
        { type: 'PokemonList', id: `LIST_${offset}` },
        { type: 'PokemonList', id: 'LIST' },
      ],
    }),

    // Detalle por nombre o id (la PokeAPI acepta los dos).
    getPokemonDetail: builder.query({
      query: (nameOrId) => `pokemon/${nameOrId}`,
      providesTags: (result, error, nameOrId) => [
        { type: 'PokemonDetail', id: nameOrId },
      ],
    }),

    getTypes: builder.query({
      query: () => 'type',
      providesTags: ['Types'],
    }),

    // Detalle del tipo: trae todos sus pokemon. Lo usamos para filtrar por tipo.
    getTypeDetail: builder.query({
      query: (name) => `type/${name}`,
      providesTags: (result, error, name) => [{ type: 'Types', id: name }],
    }),

    getGenerations: builder.query({
      query: () => 'generation',
      providesTags: ['Generations'],
    }),

    // Especies: descripción, hábitat y los pokemon de cada generación (filtro por generación).
    getPokemonSpecies: builder.query({
      query: (nameOrId) => `pokemon-species/${nameOrId}`,
      providesTags: (result, error, nameOrId) => [
        { type: 'PokemonDetail', id: `species_${nameOrId}` },
      ],
    }),

    // Detalle de la generación: los nombres de esa generación (filtro por generación).
    getGenerationDetail: builder.query({
      query: (idOrName) => `generation/${idOrName}`,
      providesTags: (result, error, idOrName) => [
        { type: 'Generations', id: idOrName },
      ],
    }),
  }),
});

// Hooks autogenerados por endpoint: useXQuery (al montar) y useLazyXQuery.
// Usamos los lazy en los filtros porque la cantidad elegida es dinámica.
export const {
  useGetPokemonListQuery,
  useGetPokemonDetailQuery,
  useGetTypesQuery,
  useGetTypeDetailQuery,
  useLazyGetTypeDetailQuery,
  useGetGenerationsQuery,
  useGetPokemonSpeciesQuery,
  useGetGenerationDetailQuery,
  useLazyGetGenerationDetailQuery,
} = pokemonApi;
