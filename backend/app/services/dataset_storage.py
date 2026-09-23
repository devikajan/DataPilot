from pathlib import Path
import shutil


BASE_DIR = Path(__file__).resolve().parents[2]

DATASET_DIR = BASE_DIR / "datasets"
DATASET_DIR.mkdir(parents=True, exist_ok=True)


def save_dataset(file, filename: str) -> str:
    file_path = DATASET_DIR / filename

    with open(file_path, "wb") as buffer:
        shutil.copyfileobj(file.file, buffer)

    return str(file_path)


def get_dataset_path(filename: str) -> Path:
    return DATASET_DIR / filename