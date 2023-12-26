import { createAction } from 'redux-actions';
import { filterBuilderTypes, filterBuilderValueTypes, sortDirections } from 'Helpers/Props';
import sortByName from 'Utilities/Array/sortByName';
import translate from 'Utilities/String/translate';
import createHandleActions from './Creators/createHandleActions';
import createSetClientSideCollectionFilterReducer from './Creators/Reducers/createSetClientSideCollectionFilterReducer';
import createSetClientSideCollectionSortReducer from './Creators/Reducers/createSetClientSideCollectionSortReducer';
import createSetTableOptionReducer from './Creators/Reducers/createSetTableOptionReducer';
import { filterPredicates, filters, sortPredicates } from './movieActions';

//
// Variables

export const section = 'sceneIndex';

//
// State

export const defaultState = {
  isSaving: false,
  saveError: null,
  isDeleting: false,
  deleteError: null,
  indexMode: 'scene',
  sortKey: 'sortTitle',
  sortDirection: sortDirections.ASCENDING,
  secondarySortKey: 'sortTitle',
  secondarySortDirection: sortDirections.ASCENDING,
  view: 'posters',

  posterOptions: {
    detailedProgressBar: false,
    size: 'large',
    showTitle: false,
    showMonitored: true,
    showQualityProfile: true,
    showReleaseDate: false,
    showTmdbRating: false,
    showRottenTomatoesRating: false,
    showSearchAction: false
  },

  overviewOptions: {
    detailedProgressBar: false,
    size: 'medium',
    showMonitored: true,
    showStudio: true,
    showQualityProfile: true,
    showAdded: false,
    showPath: false,
    showSizeOnDisk: false,
    showSearchAction: false
  },

  tableOptions: {
    showSearchAction: false
  },

  columns: [
    {
      name: 'select',
      columnLabel: 'Select',
      isSortable: false,
      isVisible: true,
      isModifiable: false,
      isHidden: true
    },
    {
      name: 'status',
      columnLabel: () => translate('ReleaseStatus'),
      isSortable: true,
      isVisible: true,
      isModifiable: false
    },
    {
      name: 'sortTitle',
      label: () => translate('SceneTitle'),
      isSortable: true,
      isVisible: true,
      isModifiable: false
    },
    {
      name: 'collection',
      label: () => translate('Collection'),
      isSortable: true,
      isVisible: false
    },
    {
      name: 'studio',
      label: () => translate('Studio'),
      isSortable: true,
      isVisible: true
    },
    {
      name: 'qualityProfileId',
      label: () => translate('QualityProfile'),
      isSortable: true,
      isVisible: true
    },
    {
      name: 'originalLanguage',
      label: () => translate('OriginalLanguage'),
      isSortable: true,
      isVisible: false
    },
    {
      name: 'added',
      label: () => translate('Added'),
      isSortable: true,
      isVisible: false
    },
    {
      name: 'year',
      label: () => translate('Year'),
      isSortable: true,
      isVisible: false
    },
    {
      name: 'inCinemas',
      label: () => translate('InCinemas'),
      isSortable: true,
      isVisible: false
    },
    {
      name: 'digitalRelease',
      label: () => translate('DigitalRelease'),
      isSortable: true,
      isVisible: false
    },
    {
      name: 'physicalRelease',
      label: () => translate('PhysicalRelease'),
      isSortable: true,
      isVisible: false
    },
    {
      name: 'runtime',
      label: () => translate('Runtime'),
      isSortable: true,
      isVisible: false
    },
    {
      name: 'path',
      label: () => translate('Path'),
      isSortable: true,
      isVisible: false
    },
    {
      name: 'sizeOnDisk',
      label: () => translate('SizeOnDisk'),
      isSortable: true,
      isVisible: false
    },
    {
      name: 'genres',
      label: () => translate('Genres'),
      isSortable: false,
      isVisible: false
    },
    {
      name: 'sceneStatus',
      label: () => translate('Status'),
      isSortable: true,
      isVisible: true
    },
    {
      name: 'tmdbRating',
      label: () => translate('TmdbRating'),
      isSortable: true,
      isVisible: false
    },
    {
      name: 'rottenTomatoesRating',
      label: () => translate('RottenTomatoesRating'),
      isSortable: true,
      isVisible: false
    },
    {
      name: 'tags',
      label: () => translate('Tags'),
      isSortable: false,
      isVisible: false
    },
    {
      name: 'actions',
      columnLabel: () => translate('Actions'),
      isVisible: true,
      isModifiable: false
    }
  ],

  sortPredicates: {
    ...sortPredicates,

    studio: function(item) {
      const studio = item.studio;

      return studio ? studio.toLowerCase() : '';
    },

    collection: function(item) {
      const { collection ={} } = item;

      return collection.title;
    },

    originalLanguage: function(item) {
      const { originalLanguage ={} } = item;

      return originalLanguage.name;
    },

    tmdbRating: function(item) {
      const { ratings = {} } = item;

      return ratings.tmdb ? ratings.tmdb.value : 0;
    },

    rottenTomatoesRating: function(item) {
      const { ratings = {} } = item;

      return ratings.rottenTomatoes ? ratings.rottenTomatoes.value : -1;
    }
  },

  selectedFilterKey: 'all',

  filters,
  filterPredicates,

  filterBuilderProps: [
    {
      name: 'monitored',
      label: () => translate('Monitored'),
      type: filterBuilderTypes.EXACT,
      valueType: filterBuilderValueTypes.BOOL
    },
    {
      name: 'isAvailable',
      label: () => translate('ConsideredAvailable'),
      type: filterBuilderTypes.EXACT,
      valueType: filterBuilderValueTypes.BOOL
    },
    {
      name: 'title',
      label: () => translate('Title'),
      type: filterBuilderTypes.STRING
    },
    {
      name: 'originalLanguage',
      label: () => translate('OriginalLanguage'),
      type: filterBuilderTypes.EXACT,
      optionsSelector: function(items) {
        const collectionList = items.reduce((acc, scene) => {
          if (scene.originalLanguage) {
            acc.push({
              id: scene.originalLanguage.name,
              name: scene.originalLanguage.name
            });
          }

          return acc;
        }, []);

        return collectionList.sort(sortByName);
      }
    },
    {
      name: 'status',
      label: () => translate('ReleaseStatus'),
      type: filterBuilderTypes.EXACT,
      valueType: filterBuilderValueTypes.RELEASE_STATUS
    },
    {
      name: 'studio',
      label: () => translate('Studio'),
      type: filterBuilderTypes.EXACT,
      optionsSelector: function(items) {
        const tagList = items.reduce((acc, scene) => {
          if (scene.studio) {
            acc.push({
              id: scene.studio,
              name: scene.studio
            });
          }

          return acc;
        }, []);

        return tagList.sort(sortByName);
      }
    },
    {
      name: 'collection',
      label: () => translate('Collection'),
      type: filterBuilderTypes.ARRAY,
      optionsSelector: function(items) {
        const collectionList = items.reduce((acc, scene) => {
          if (scene.collection && scene.collection.title) {
            acc.push({
              id: scene.collection.title,
              name: scene.collection.title
            });
          }

          return acc;
        }, []);

        return collectionList.sort(sortByName);
      }
    },
    {
      name: 'qualityProfileId',
      label: () => translate('QualityProfile'),
      type: filterBuilderTypes.EXACT,
      valueType: filterBuilderValueTypes.QUALITY_PROFILE
    },
    {
      name: 'added',
      label: () => translate('Added'),
      type: filterBuilderTypes.DATE,
      valueType: filterBuilderValueTypes.DATE
    },
    {
      name: 'year',
      label: () => translate('Year'),
      type: filterBuilderTypes.NUMBER
    },
    {
      name: 'inCinemas',
      label: () => translate('InCinemas'),
      type: filterBuilderTypes.DATE,
      valueType: filterBuilderValueTypes.DATE
    },
    {
      name: 'physicalRelease',
      label: () => translate('PhysicalRelease'),
      type: filterBuilderTypes.DATE,
      valueType: filterBuilderValueTypes.DATE
    },
    {
      name: 'digitalRelease',
      label: () => translate('DigitalRelease'),
      type: filterBuilderTypes.DATE,
      valueType: filterBuilderValueTypes.DATE
    },
    {
      name: 'runtime',
      label: () => translate('Runtime'),
      type: filterBuilderTypes.NUMBER
    },
    {
      name: 'path',
      label: () => translate('Path'),
      type: filterBuilderTypes.STRING
    },
    {
      name: 'sizeOnDisk',
      label: () => translate('SizeOnDisk'),
      type: filterBuilderTypes.NUMBER,
      valueType: filterBuilderValueTypes.BYTES
    },
    {
      name: 'genres',
      label: () => translate('Genres'),
      type: filterBuilderTypes.ARRAY,
      optionsSelector: function(items) {
        const genreList = items.reduce((acc, scene) => {
          scene.genres.forEach((genre) => {
            acc.push({
              id: genre,
              name: genre
            });
          });

          return acc;
        }, []);

        return genreList.sort(sortByName);
      }
    },
    {
      name: 'tmdbRating',
      label: () => translate('TmdbRating'),
      type: filterBuilderTypes.NUMBER
    },
    {
      name: 'tmdbVotes',
      label: () => translate('TmdbVotes'),
      type: filterBuilderTypes.NUMBER
    },
    {
      name: 'rottenTomatoesRating',
      label: () => translate('RottenTomatoesRating'),
      type: filterBuilderTypes.NUMBER
    },
    {
      name: 'tags',
      label: () => translate('Tags'),
      type: filterBuilderTypes.ARRAY,
      valueType: filterBuilderValueTypes.TAG
    }
  ]
};

export const persistState = [
  'sceneIndex.sortKey',
  'sceneIndex.sortDirection',
  'sceneIndex.selectedFilterKey',
  'sceneIndex.customFilters',
  'sceneIndex.view',
  'sceneIndex.columns',
  'sceneIndex.posterOptions',
  'sceneIndex.overviewOptions',
  'sceneIndex.tableOptions'
];

//
// Actions Types

export const SET_MOVIE_SORT = 'sceneIndex/setSceneSort';
export const SET_MOVIE_FILTER = 'sceneIndex/setSceneFilter';
export const SET_MOVIE_VIEW = 'sceneIndex/setSceneView';
export const SET_MOVIE_TABLE_OPTION = 'sceneIndex/setSceneTableOption';
export const SET_MOVIE_POSTER_OPTION = 'sceneIndex/setScenePosterOption';
export const SET_MOVIE_OVERVIEW_OPTION = 'sceneIndex/setSceneOverviewOption';
export const SET_MOVIE_INDEX_MODE = 'sceneIndex/setSceneIndexMode';

//
// Action Creators

export const setSceneSort = createAction(SET_MOVIE_SORT);
export const setSceneFilter = createAction(SET_MOVIE_FILTER);
export const setSceneView = createAction(SET_MOVIE_VIEW);
export const setSceneTableOption = createAction(SET_MOVIE_TABLE_OPTION);
export const setScenePosterOption = createAction(SET_MOVIE_POSTER_OPTION);
export const setSceneOverviewOption = createAction(SET_MOVIE_OVERVIEW_OPTION);
export const setSceneIndexMode = createAction(SET_MOVIE_INDEX_MODE);

//
// Reducers

export const reducers = createHandleActions({

  [SET_MOVIE_SORT]: createSetClientSideCollectionSortReducer(section),
  [SET_MOVIE_FILTER]: createSetClientSideCollectionFilterReducer(section),

  [SET_MOVIE_VIEW]: function(state, { payload }) {
    return Object.assign({}, state, { view: payload.view });
  },

  [SET_MOVIE_TABLE_OPTION]: createSetTableOptionReducer(section),

  [SET_MOVIE_POSTER_OPTION]: function(state, { payload }) {
    const posterOptions = state.posterOptions;

    return {
      ...state,
      posterOptions: {
        ...posterOptions,
        ...payload
      }
    };
  },

  [SET_MOVIE_OVERVIEW_OPTION]: function(state, { payload }) {
    const overviewOptions = state.overviewOptions;

    return {
      ...state,
      overviewOptions: {
        ...overviewOptions,
        ...payload
      }
    };
  },

  [SET_MOVIE_INDEX_MODE]: function(state, { payload }) {
    return Object.assign({}, state, { indexMode: payload.indexMode });
  }

}, defaultState, section);