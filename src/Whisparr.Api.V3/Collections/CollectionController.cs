using System.Collections.Generic;
using System.Linq;
using Microsoft.AspNetCore.Mvc;
using NzbDrone.Common.Extensions;
using NzbDrone.Core.Configuration;
using NzbDrone.Core.Datastore.Events;
using NzbDrone.Core.Languages;
using NzbDrone.Core.Messaging.Commands;
using NzbDrone.Core.Messaging.Events;
using NzbDrone.Core.Movies;
using NzbDrone.Core.Movies.Collections;
using NzbDrone.Core.Movies.Commands;
using NzbDrone.Core.Movies.Events;
using NzbDrone.Core.Organizer;
using NzbDrone.SignalR;
using Whisparr.Http;
using Whisparr.Http.REST;
using Whisparr.Http.REST.Attributes;

namespace Whisparr.Api.V3.Collections
{
    [V3ApiController]
    public class CollectionController : RestControllerWithSignalR<CollectionResource, MovieCollection>,
                                        IHandle<CollectionAddedEvent>,
                                        IHandle<CollectionEditedEvent>,
                                        IHandle<CollectionDeletedEvent>
    {
        private readonly IMovieCollectionService _collectionService;
        private readonly IMovieService _movieService;
        private readonly IMovieMetadataService _movieMetadataService;
        private readonly IConfigService _configService;
        private readonly IBuildFileNames _fileNameBuilder;
        private readonly INamingConfigService _namingService;
        private readonly IManageCommandQueue _commandQueueManager;

        public CollectionController(IBroadcastSignalRMessage signalRBroadcaster,
                                    IMovieCollectionService collectionService,
                                    IMovieService movieService,
                                    IMovieMetadataService movieMetadataService,
                                    IConfigService configService,
                                    IBuildFileNames fileNameBuilder,
                                    INamingConfigService namingService,
                                    IManageCommandQueue commandQueueManager)
            : base(signalRBroadcaster)
        {
            _collectionService = collectionService;
            _movieService = movieService;
            _movieMetadataService = movieMetadataService;
            _configService = configService;
            _fileNameBuilder = fileNameBuilder;
            _namingService = namingService;
            _commandQueueManager = commandQueueManager;
        }

        protected override CollectionResource GetResourceById(int id)
        {
            return MapToResource(_collectionService.GetCollection(id));
        }

        [HttpGet]
        public List<CollectionResource> GetCollections(int? tmdbId)
        {
            var collectionResources = new List<CollectionResource>();

            if (tmdbId.HasValue)
            {
                var collection = _collectionService.FindByTmdbId(tmdbId.Value);

                if (collection != null)
                {
                    collectionResources.AddIfNotNull(MapToResource(collection));
                }
            }
            else
            {
                collectionResources = MapToResource(_collectionService.GetAllCollections()).ToList();
            }

            return collectionResources;
        }

        [RestPutById]
        public ActionResult<CollectionResource> UpdateCollection(CollectionResource collectionResource)
        {
            var collection = _collectionService.GetCollection(collectionResource.Id);

            var model = collectionResource.ToModel(collection);

            var updatedMovie = _collectionService.UpdateCollection(model);

            return Accepted(updatedMovie.Id);
        }

        [HttpPut]
        public ActionResult UpdateCollections(CollectionUpdateResource resource)
        {
            var collectionsToUpdate = _collectionService.GetCollections(resource.CollectionIds);

            foreach (var collection in collectionsToUpdate)
            {
                if (resource.Monitored.HasValue)
                {
                    collection.Monitored = resource.Monitored.Value;
                }

                if (resource.QualityProfileId.HasValue)
                {
                    collection.QualityProfileId = resource.QualityProfileId.Value;
                }

                if (resource.RootFolderPath.IsNotNullOrWhiteSpace())
                {
                    collection.RootFolderPath = resource.RootFolderPath;
                }

                if (resource.MonitorMovies.HasValue)
                {
                    var movies = _movieService.GetMoviesByCollectionTmdbId(collection.TmdbId);

                    movies.ForEach(c => c.Monitored = resource.MonitorMovies.Value);

                    _movieService.UpdateMovie(movies, true);
                }
            }

            var updated = _collectionService.UpdateCollections(collectionsToUpdate.ToList()).ToResource();

            _commandQueueManager.Push(new RefreshCollectionsCommand());

            return Accepted(updated);
        }

        private IEnumerable<CollectionResource> MapToResource(List<MovieCollection> collections)
        {
            // Avoid calling for naming spec on every movie in filenamebuilder
            var namingConfig = _namingService.GetConfig();
            var existingMoviesTmdbIds = _movieService.AllMovieWithCollectionsTmdbIds();
            var configLanguage = (Language)_configService.MovieInfoLanguage;

            var allCollectionMovies = _movieMetadataService.GetMoviesWithCollections()
                .GroupBy(x => x.CollectionTmdbId)
                .ToDictionary(x => x.Key, x => (IEnumerable<MovieMetadata>)x);

            foreach (var collection in collections)
            {
                var resource = collection.ToResource();

                allCollectionMovies.TryGetValue(collection.TmdbId, out var collectionMovies);

                if (collectionMovies != null)
                {
                    foreach (var movie in collectionMovies)
                    {
                        var movieResource = movie.ToResource();
                        movieResource.Folder = _fileNameBuilder.GetMovieFolder(new Movie { MovieMetadata = movie }, namingConfig);

                        if (!existingMoviesTmdbIds.Contains(movie.TmdbId))
                        {
                            resource.MissingMovies++;
                        }

                        resource.Movies.Add(movieResource);
                    }
                }

                yield return resource;
            }
        }

        private CollectionResource MapToResource(MovieCollection collection)
        {
            var resource = collection.ToResource();
            var existingMoviesTmdbIds = _movieService.AllMovieWithCollectionsTmdbIds();
            var namingConfig = _namingService.GetConfig();
            var configLanguage = (Language)_configService.MovieInfoLanguage;

            foreach (var movie in _movieMetadataService.GetMoviesByCollectionTmdbId(collection.TmdbId))
            {
                var movieResource = movie.ToResource();
                movieResource.Folder = _fileNameBuilder.GetMovieFolder(new Movie { MovieMetadata = movie }, namingConfig);

                if (!existingMoviesTmdbIds.Contains(movie.TmdbId))
                {
                    resource.MissingMovies++;
                }

                resource.Movies.Add(movieResource);
            }

            return resource;
        }

        [NonAction]
        public void Handle(CollectionAddedEvent message)
        {
            BroadcastResourceChange(ModelAction.Created, MapToResource(message.Collection));
        }

        [NonAction]
        public void Handle(CollectionEditedEvent message)
        {
            BroadcastResourceChange(ModelAction.Updated, MapToResource(message.Collection));
        }

        [NonAction]
        public void Handle(CollectionDeletedEvent message)
        {
            BroadcastResourceChange(ModelAction.Deleted, message.Collection.Id);
        }
    }
}