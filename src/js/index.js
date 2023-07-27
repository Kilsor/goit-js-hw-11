import { fetchImages } from './api.js';
import Notiflix from 'notiflix';
import SimpleLightbox from 'simplelightbox';
// Додатковий імпорт стилів SimpleLightbox
import 'simplelightbox/dist/simple-lightbox.min.css';
import 'intersection-observer'; // Імпортуємо бібліотеку Intersection Observer

let currentPage = 1;
let isLoading = false;

const searchForm = document.getElementById('search-form');
const galleryContainer = document.querySelector('.gallery');

// Прослуховуємо подію submit на формі пошуку та викликаємо функцію onSubmitForm
searchForm.addEventListener('submit', onSubmitForm);

// Функція, що обробляє подію submit на формі пошуку
async function onSubmitForm(event) {
  event.preventDefault();
  const searchQuery = getSearchQueryFromForm();

  // Скидаємо сторінку на початок при новому пошуковому запиті
  currentPage = 1;

  const images = await fetchImages(searchQuery, currentPage);
  displayGallery(images);
  currentPage++;
  addIntersectionObserver(); // Додаємо спостерігача Intersection Observer

  if (images.length === 0) {
    showNoResultsMessage();
  }
}

// Функція для додавання спостерігача Intersection Observer
function addIntersectionObserver() {
  const options = {
    root: null,
    rootMargin: '0px',
    threshold: 0.5,
  };

  const observer = new IntersectionObserver(onIntersection, options);
  const sentinel = document.createElement('div');
  sentinel.classList.add('sentinel');
  galleryContainer.appendChild(sentinel);
  observer.observe(sentinel);
}

// Функція, що викликається, коли спостерігач Intersection Observer знаходиться в зоні видимості
async function onIntersection(entries, observer) {
  if (isLoading || entries[0].intersectionRatio <= 0) return;

  isLoading = true;
  const searchQuery = getSearchQueryFromForm();
  const images = await fetchImages(searchQuery, currentPage);

  if (images.length > 0) {
    appendGalleryMarkup(images);
    currentPage++;
  } else {
    observer.disconnect(); // Відключаємо спостерігач, якщо зображення закінчились
    showEndOfResultsMessage();
  }

  isLoading = false;
}

// Функція для відображення зображень у галереї
function displayGallery(images) {
  const galleryMarkup = createGalleryMarkup(images);
  replaceGalleryMarkup(galleryMarkup);

  // Ініціалізуємо SimpleLightbox за допомогою селектора
  const lightbox = new SimpleLightbox('.gallery a', {
    /* Опції для налаштування SimpleLightbox */
  });
}

// Функція для заміни розмітки галереї в DOM
function replaceGalleryMarkup(galleryMarkup) {
  galleryContainer.innerHTML = galleryMarkup;
}

// Функція для додавання зображень до галереї при натисканні на кнопку "Load more"
function appendGalleryMarkup(images) {
  const galleryMarkup = createGalleryMarkup(images);
  galleryContainer.insertAdjacentHTML('beforeend', galleryMarkup);

  // Отримуємо тільки нові посилання на зображення, які ще не мають ініціалізованого SimpleLightbox
  const newImageLinks = galleryContainer.querySelectorAll(
    '.photo-card:not(.sl-initialized)'
  );
  newImageLinks.forEach(link => {
    link.classList.add('sl-initialized'); // Додаємо клас для позначення ініціалізованих елементів
  });

  // Оновлюємо галерею
  const lightbox = new SimpleLightbox(newImageLinks, {
    /* Опції для налаштування SimpleLightbox */
  });
}

// Функція для створення розмітки зображень для галереї
function createGalleryMarkup(images) {
  return images
    .map(
      image => `
    <a href="${image.webformatURL}" class="photo-card"> <!-- Обгортаємо картку зображення у посилання -->
      <img src="${image.webformatURL}" alt="${image.tags}" loading="lazy" />
      <div class="info">
        <p class="info-item"><b>Likes:</b> ${image.likes}</p>
        <p class="info-item"><b>Views:</b> ${image.views}</p>
        <p class="info-item"><b>Comments:</b> ${image.comments}</p>
        <p class="info-item"><b>Downloads:</b> ${image.downloads}</p>
      </div>
    </a>
  `
    )
    .join('');
}

// Функція для отримання пошукового запиту з форми
function getSearchQueryFromForm() {
  const formData = new FormData(searchForm);
  return formData.get('searchQuery');
}

// Функція для показу повідомлення про відсутність результатів пошуку
function showNoResultsMessage() {
  Notiflix.Notify.failure(
    'Sorry, there are no images matching your search query. Please try again.'
  );
}

// Функція для показу повідомлення про кінець результатів пошуку
function showEndOfResultsMessage() {
  Notiflix.Notify.info(
    "We're sorry, but you've reached the end of search results."
  );
}
