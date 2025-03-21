import sys
import logging

log = logging.getLogger(__name__)
log.addHandler(logging.StreamHandler(sys.stdout))
log.addHandler(logging.FileHandler('epz-bot.log'))
