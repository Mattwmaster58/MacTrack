import itertools

from litestar import Litestar, Router
from litestar.config.compression import CompressionConfig
from litestar.config.cors import CORSConfig

from database import init_db_from_app, db_plugins
from dependancies.transaction import provide_transaction
from routes.auth import signup, login, create_session_auth, current_user
from routes.data.search import search
from routes.user.filter import router as filter_router

cors_config = CORSConfig(allow_origins=["http://localhost:3000"], allow_credentials=True)
# logging_config = StructLoggingConfig()

# logging_config = LoggingConfig(
#     loggers={
#         "MacFlashback": {
#             "level": "DEBUG",
#             "handlers": ["queue_listener"],
#         }
#     }
# )
API_ROOT = "/api"
other_routes = [current_user, filter_router]
auth_excluded_routes = [search, login, signup]
auth_excluded_paths = [API_ROOT + p for p in itertools.chain(*[x.paths for x in auth_excluded_routes])]
session_auth = create_session_auth(auth_excluded_paths)
api_routes = [*auth_excluded_routes, *other_routes]
api_router = Router(path=API_ROOT, route_handlers=api_routes)

app = Litestar(
    route_handlers=[api_router],
    dependencies={"tx": provide_transaction},
    plugins=[*db_plugins],
    cors_config=cors_config,
    compression_config=CompressionConfig(backend="brotli"),
    on_startup=[init_db_from_app],
    on_app_init=[session_auth.on_app_init],
    # logging_config=logging_config,
    debug=True,  # required until this is fixed: https://github.com/litestar-org/litestar/issues/1804
)
