import logging

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger("workflow-builder")

def log_info(message: str):
    logger.info(message)

def log_error(message: str):
    logger.error(message)