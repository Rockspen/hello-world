from pathlib import Path
from typing import List

from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, Field
import json

DATA_PATH = Path(__file__).resolve().parent.parent / "data" / "movies.json"

app = FastAPI(title="Movie Tracker API", version="1.0.0")
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


class Movie(BaseModel):
    title: str = Field(..., description="Movie title")
    platform: str = Field(..., description="Streaming platform where the movie can be found")


class MovieList(BaseModel):
    movies: List[Movie]


def _load_movies() -> List[Movie]:
    if not DATA_PATH.exists():
        return []
    with DATA_PATH.open("r", encoding="utf-8") as f:
        data = json.load(f)
    return [Movie(**item) for item in data]


def _save_movies(movies: List[Movie]) -> None:
    DATA_PATH.parent.mkdir(parents=True, exist_ok=True)
    with DATA_PATH.open("w", encoding="utf-8") as f:
        json.dump([movie.dict() for movie in movies], f, indent=2)


@app.get("/movies", response_model=MovieList)
def get_movies() -> MovieList:
    return MovieList(movies=_load_movies())


@app.post("/movies", response_model=MovieList, status_code=201)
def add_movie(movie: Movie) -> MovieList:
    movies = _load_movies()
    if any(existing.title.lower() == movie.title.lower() for existing in movies):
        raise HTTPException(status_code=400, detail="Movie already exists")
    movies.append(movie)
    _save_movies(movies)
    return MovieList(movies=movies)


@app.delete("/movies/{title}", response_model=MovieList)
def delete_movie(title: str) -> MovieList:
    movies = _load_movies()
    filtered = [movie for movie in movies if movie.title.lower() != title.lower()]
    if len(filtered) == len(movies):
        raise HTTPException(status_code=404, detail="Movie not found")
    _save_movies(filtered)
    return MovieList(movies=filtered)


@app.on_event("startup")
def ensure_data_file() -> None:
    DATA_PATH.parent.mkdir(parents=True, exist_ok=True)
    if not DATA_PATH.exists():
        _save_movies([])
