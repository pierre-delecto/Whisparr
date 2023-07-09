using NzbDrone.Core.Indexers;
using Whisparr.Http;

namespace Whisparr.Api.V3.Indexers
{
    [V3ApiController]
    public class IndexerController : ProviderControllerBase<IndexerResource, IndexerBulkResource, IIndexer, IndexerDefinition>
    {
        public static readonly IndexerResourceMapper ResourceMapper = new IndexerResourceMapper();
        public static readonly IndexerBulkResourceMapper BulkResourceMapper = new IndexerBulkResourceMapper();

        public IndexerController(IndexerFactory indexerFactory)
            : base(indexerFactory, "indexer", ResourceMapper, BulkResourceMapper)
        {
        }
    }
}