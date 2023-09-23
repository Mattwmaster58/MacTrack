import tomllib
from pathlib import Path

from litestar.di import Provide

from data.config_model import Config


def get_config() -> Config:
    config_path = Path(__file__).parents[1] / "config.toml"
    raw_config = tomllib.load(open(config_path, "rb"))
    return Config.model_validate(raw_config)


provide_config = Provide(get_config)
