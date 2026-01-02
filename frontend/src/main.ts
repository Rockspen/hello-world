interface Movie {
  title: string;
  platform: string;
}

interface MovieListResponse {
  movies: Movie[];
}

const API_URL = 'http://localhost:8000/movies';

const form = document.getElementById('movie-form') as HTMLFormElement;
const titleInput = document.getElementById('title') as HTMLInputElement;
const platformInput = document.getElementById('platform') as HTMLInputElement;
const list = document.getElementById('movie-list') as HTMLElement;
const messageBox = document.getElementById('message') as HTMLElement;

function showMessage(text: string, type: 'error' | 'success'): void {
  messageBox.textContent = text;
  messageBox.className = `message ${type}`;
}

function clearMessage(): void {
  messageBox.textContent = '';
  messageBox.className = '';
}

function renderMovies(movies: Movie[]): void {
  list.innerHTML = '';

  if (movies.length === 0) {
    list.innerHTML = '<p class="empty">No movies tracked yet. Add one above!</p>';
    return;
  }

  movies.forEach((movie) => {
    const card = document.createElement('article');
    card.className = 'card';

    const info = document.createElement('div');
    const title = document.createElement('strong');
    title.textContent = movie.title;
    const platform = document.createElement('span');
    platform.className = 'pill';
    platform.textContent = movie.platform;
    info.append(title, platform);

    const removeButton = document.createElement('button');
    removeButton.textContent = 'Remove';
    removeButton.style.background = '#ef4444';
    removeButton.style.padding = '0.65rem 1rem';
    removeButton.onclick = () => deleteMovie(movie.title);

    card.append(info, removeButton);
    list.appendChild(card);
  });
}

async function fetchMovies(): Promise<void> {
  try {
    const response = await fetch(API_URL);
    if (!response.ok) {
      throw new Error('Failed to load movies');
    }
    const data: MovieListResponse = await response.json();
    renderMovies(data.movies);
    clearMessage();
  } catch (error) {
    console.error(error);
    showMessage('Could not load movies. Make sure the API is running.', 'error');
  }
}

async function addMovie(movie: Movie): Promise<void> {
  try {
    const response = await fetch(API_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(movie),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.detail || 'Failed to add movie');
    }

    const data: MovieListResponse = await response.json();
    renderMovies(data.movies);
    showMessage('Movie added!', 'success');
    form.reset();
  } catch (error) {
    console.error(error);
    showMessage(error instanceof Error ? error.message : 'Error adding movie', 'error');
  }
}

async function deleteMovie(title: string): Promise<void> {
  try {
    const response = await fetch(`${API_URL}/${encodeURIComponent(title)}`, { method: 'DELETE' });
    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.detail || 'Failed to delete movie');
    }
    const data: MovieListResponse = await response.json();
    renderMovies(data.movies);
    showMessage('Movie removed.', 'success');
  } catch (error) {
    console.error(error);
    showMessage(error instanceof Error ? error.message : 'Error removing movie', 'error');
  }
}

form.addEventListener('submit', (event) => {
  event.preventDefault();
  const movie: Movie = {
    title: titleInput.value.trim(),
    platform: platformInput.value.trim(),
  };

  if (!movie.title || !movie.platform) {
    showMessage('Please enter both title and platform.', 'error');
    return;
  }

  addMovie(movie);
});

fetchMovies();
