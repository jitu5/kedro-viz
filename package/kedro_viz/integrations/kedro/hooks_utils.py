"""Utility functions for Kedro hooks implementation."""

import json
import logging
from datetime import datetime, timezone
from pathlib import Path
from typing import Any, Dict, List, Optional

import fsspec
from kedro.pipeline.node import Node as KedroNode

from kedro_viz.constants import VIZ_METADATA_ARGS
from kedro_viz.launchers.utils import _find_kedro_project
from kedro_viz.utils import _hash, _hash_input_output

logger = logging.getLogger(__name__)

TIME_FORMAT = "%Y-%m-%dT%H.%M.%S.%fZ"
EVENTS_DIR = VIZ_METADATA_ARGS["path"]
EVENTS_FILE = "kedro_pipeline_events.json"


def hash_node(node: Any) -> str:
    """Stable ID for KedroNode or I/O reference."""
    return _hash(str(node)) if isinstance(node, KedroNode) else _hash_input_output(node)


def create_dataset_event(
    event_type: str,
    dataset_name: str,
    dataset_value: Any = None,
    datasets: Optional[Dict[str, Any]] = None,
) -> Dict[str, Any]:
    """Generic builder for dataset load/save events.

    Args:
        event_type: Event type/name
        dataset_name: Dataset name
        dataset_value: Dataset data
        datasets: Dictionary of available datasets

    Returns:
        Dictionary with event data
    """
    event: Dict[str, Any] = {
        "event": event_type,
        "dataset": dataset_name,
        "node_id": _hash_input_output(dataset_name),
        "status": "Available",
    }

    if dataset_value is not None and datasets:
        size = compute_size(dataset_name, datasets)
        if size is not None:
            event["size_bytes"] = size  # only attach size when available
    return event


def extract_file_paths(dataset: Any) -> List[str]:
    """Extract file paths from a dataset object.

    Args:
        dataset: Dataset object to extract paths from

    Returns:
        List of file paths found in the dataset
    """
    paths = []
    for attr in ("filepath", "_filepath"):
        file_path = getattr(dataset, attr, None)
        if file_path:
            paths.append(file_path)
    return paths


def get_file_size(file_path: str) -> Optional[int]:
    """Get size of a file.

    Args:
        file_path: Path to the file

    Returns:
        File size in bytes, or None if file doesn't exist
    """
    try:
        filesystem, path = fsspec.core.url_to_fs(file_path)
        return filesystem.size(path) if filesystem.exists(path) else None
    except (
        OSError,
        ValueError,
        FileNotFoundError,
        AttributeError,
    ) as exc:  # pragma: no cover
        logger.debug("Unable to get file size for %s: %s", file_path, exc)
        return None


def compute_size(dataset_name: str, datasets: Dict[str, Any]) -> Optional[int]:
    """Determine file size for dataset with filepath attribute.

    Args:
        dataset_name: Dataset name
        datasets: Dictionary of available datasets

    Returns:
        File size in bytes, if available
    """
    dataset = datasets.get(dataset_name)
    if not dataset:
        return None

    # Look for filepath attributes and return size of first existing file
    file_paths = extract_file_paths(dataset)
    for file_path in file_paths:
        size = get_file_size(file_path)
        if size is not None:
            return size

    return None


def write_events(
    events: List[Dict[str, Any]],
    events_dir: str = EVENTS_DIR,
    events_file: str = EVENTS_FILE,
) -> None:
    """Persist events list to the project's .viz JSON file.

    Args:
        events: List of events to write
        events_dir: Directory to write events to
        events_file: Filename for events
    """
    try:
        project = _find_kedro_project(Path.cwd())
        if not project:
            logger.warning("No Kedro project found; skipping write.")
            return

        events_json = json.dumps(events, indent=2)
        write_events_to_file(project, events_dir, events_file, events_json)
    except (OSError, TypeError, ValueError) as exc:  # pragma: no cover
        logger.warning("Failed writing events: %s", exc)


def write_events_to_file(
    project_path: Path, events_dir: str, events_file: str, events_json: str
) -> None:
    """Write events JSON to file.

    Args:
        project_path: Path to the Kedro project
        events_dir: Directory to write events to
        events_file: Filename for events
        events_json: JSON string to write
    """
    path = project_path / events_dir / events_file
    path.parent.mkdir(parents=True, exist_ok=True)
    path.write_text(events_json, encoding="utf8")


def generate_timestamp() -> str:
    """Generate the timestamp.

    Returns:
        String representation of the current timestamp.

    """
    current_ts = datetime.now(tz=timezone.utc).strftime(TIME_FORMAT)
    return current_ts


def is_default_run(run_params: dict) -> bool:
    """
    Check if run_params are empty/have no values (full/default pipeline run).

    Only process full/default pipeline runs where all filtering parameters
    are empty or have no meaningful values.

    Args:
        run_params: Dictionary containing pipeline run parameters

    Returns:
        bool: True if it's a full/default pipeline run, False otherwise
    """
    # Extract parameters for debugging and checking
    pipeline_name = run_params.get("pipeline_name")
    tags = run_params.get("tags")
    from_nodes = run_params.get("from_nodes")
    to_nodes = run_params.get("to_nodes")
    node_names = run_params.get("node_names")
    from_inputs = run_params.get("from_inputs")
    to_outputs = run_params.get("to_outputs")
    namespace = run_params.get("namespace")

    # List of all filtering parameters to check
    filtering_params = [
        pipeline_name,
        tags,
        from_nodes,
        to_nodes,
        node_names,
        from_inputs,
        to_outputs,
        namespace,
    ]

    # True if none of the filtering params are set (i.e. full/default run)
    return not any(filtering_params)
