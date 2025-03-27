import logging
import logging.config
import yaml

with open('config/logging.yml', 'rt', encoding="utf-8") as f:
    logging.config.dictConfig(yaml.safe_load(f.read()))

log = logging.getLogger('root')
