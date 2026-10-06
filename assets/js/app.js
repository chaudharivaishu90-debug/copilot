const openModalBtn = document.getElementById('openModalBtn');
const closeModalBtn = document.getElementById('closeModalBtn');
const movieModal = document.getElementById('movieModal');
const movieForm = document.getElementById('movieForm');
const movieGrid = document.getElementById('movieGrid');
const searchInput = document.getElementById('searchInput');
const totalMoviesCount = document.getElementById('totalMoviesCount');
const modalTitle = document.getElementById('modalTitle');
const saveBtnText = document.getElementById('saveBtnText');

let movies = JSON.parse(localStorage.getItem('movies')) || [];
let editMode = false;
let editMovieId = null;

openModalBtn.addEventListener('click', () => openModal());
closeModalBtn.addEventListener('click', () => closeModal());

window.addEventListener('click', (e) => {
    if (e.target === movieModal) closeModal();
});

movieForm.addEventListener('submit', (e) => {
    e.preventDefault();
    saveMovie();
});

searchInput.addEventListener('input', (e) => {
    filterMovies(e.target.value);
});

function openModal(isEdit = false, movie = null) {
    movieModal.style.display = 'flex';
    if (isEdit && movie) {
        modalTitle.textContent = 'Edit Movie';
        saveBtnText.textContent = 'Update Movie';
        document.getElementById('movieTitle').value = movie.title;
        document.getElementById('movieGenre').value = movie.genre;
        document.getElementById('movieYear').value = movie.year;
        document.getElementById('movieDescription').value = movie.description;
        document.getElementById('movieImage').value = movie.image;
        editMode = true;
        editMovieId = movie.id;
    } else {
        modalTitle.textContent = 'Add Movie';
        saveBtnText.textContent = 'Save';
        movieForm.reset();
        editMode = false;
        editMovieId = null;
    }
}

function closeModal() {
    movieModal.style.display = 'none';
    movieForm.reset();
    editMode = false;
    editMovieId = null;
}

function saveMovie() {
    const title = document.getElementById('movieTitle').value.trim();
    const genre = document.getElementById('movieGenre').value.trim();
    const year = document.getElementById('movieYear').value.trim();
    const description = document.getElementById('movieDescription').value.trim();
    const image = document.getElementById('movieImage').value.trim();

    if (!title || !genre || !year || !description || !image) return;

    if (editMode) {
        movies = movies.map(movie => {
            if (movie.id === editMovieId) {
                return { id: movie.id, title, genre, year, description, image };
            }
            return movie;
        });
        Swal.fire({
            icon: 'success',
            title: 'Updated!',
            text: 'Movie updated successfully.',
            timer: 1500,
            showConfirmButton: false,
            background: '#1a1a1a',
            color: '#fff'
        });
    } else {
        const newMovie = {
            id: Date.now().toString(),
            title,
            genre,
            year,
            description,
            image
        };
        movies.push(newMovie);
        Swal.fire({
            icon: 'success',
            title: 'Added!',
            text: 'Movie added successfully.',
            timer: 1500,
            showConfirmButton: false,
            background: '#1a1a1a',
            color: '#fff'
        });
    }

    syncAndRender();
    closeModal();
}

function renderMovies(moviesToRender) {
    movieGrid.innerHTML = '';
    
    if (moviesToRender.length === 0) {
        movieGrid.innerHTML = `<p style="grid-column: 1/-1; text-align: center; color: #777; margin-top: 40px;">No movies found.</p>`;
        totalMoviesCount.textContent = '0';
        return;
    }

    totalMoviesCount.textContent = moviesToRender.length;

    moviesToRender.forEach(movie => {
        const card = document.createElement('div');
        card.classList.add('movie-card');
        
        card.innerHTML = `
            <div class="movie-poster">
                <img src="${movie.image}" alt="${movie.title}" onerror="this.src='https://via.placeholder.com/260x350?text=Image+Not+Found'">
            </div>
            <div class="movie-info">
                <h3>${movie.title}</h3>
                <span class="movie-meta">${movie.genre} (${movie.year})</span>
            </div>
            <div class="movie-overlay">
                <p class="movie-desc">${movie.description}</p>
                <div class="card-actions">
                    <button type="button" class="btn-edit" data-id="${movie.id}">Edit</button>
                    <button type="button" class="btn-delete" data-id="${movie.id}">Delete</button>
                </div>
            </div>
        `;
        movieGrid.appendChild(card);
    });
}

document.addEventListener('click', (e) => {
    const editBtn = e.target.closest('.btn-edit');
    const deleteBtn = e.target.closest('.btn-delete');

    if (editBtn) {
        const id = editBtn.getAttribute('data-id');
        const movieToEdit = movies.find(movie => movie.id === id);
        if (movieToEdit) {
            openModal(true, movieToEdit);
        }
    }

    if (deleteBtn) {
        const id = deleteBtn.getAttribute('data-id');
        Swal.fire({
            title: 'Are you sure?',
            text: "This movie will be deleted!",
            icon: 'warning',
            showCancelButton: true,
            confirmButtonColor: '#ff3c78',
            cancelButtonColor: '#333',
            confirmButtonText: 'Yes, delete it!',
            background: '#1a1a1a',
            color: '#fff'
        }).then((result) => {
            if (result.isConfirmed) {
                movies = movies.filter(movie => movie.id !== id);
                syncAndRender();
                Swal.fire({
                    icon: 'success',
                    title: 'Deleted!',
                    text: 'Movie has been deleted.',
                    timer: 1200,
                    showConfirmButton: false,
                    background: '#1a1a1a',
                    color: '#fff'
                });
            }
        });
    }
});

function filterMovies(query) {
    const lowerQuery = query.toLowerCase();
    const filtered = movies.filter(movie => 
        movie.title.toLowerCase().includes(lowerQuery) || 
        movie.genre.toLowerCase().includes(lowerQuery)
    );
    renderMovies(filtered);
}

function syncAndRender() {
    localStorage.setItem('movies', JSON.stringify(movies));
    renderMovies(movies);
}

renderMovies(movies);
localStorage.clear();