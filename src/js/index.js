import { fetchImages } from './api.js';
import Notiflix from 'notiflix';
import SimpleLightbox from 'simplelightbox';
// Додатковий імпорт стилів SimpleLightbox
import 'simplelightbox/dist/simple-lightbox.min.css';

let currentPage = 1;

const searchForm = document.getElementById('search-form');
const galleryContainer = document.querySelector('.gallery');
const loadMoreBtn = document.querySelector('.load-more');

// Прослуховуємо подію submit на формі пошуку та викликаємо функцію onSubmitForm
searchForm.addEventListener('submit', onSubmitForm);

// Прослуховуємо подію click на кнопці "Load more" та викликаємо функцію onLoadMoreClick
loadMoreBtn.addEventListener('click', onLoadMoreClick);

// Функція, що обробляє подію submit на формі пошуку
async function onSubmitForm(event) {
  event.preventDefault();

  // Отримуємо значення пошукового запиту з форми
  const searchQuery = getSearchQueryFromForm();

  // Виконуємо запит до API для отримання зображень
  const images = await fetchImages(searchQuery, 1);

  if (images.length > 0) {
    // Відображаємо отримані зображення у галереї
    displayNewGallery(images); // Використовуємо displayNewGallery для заміни галереї при новому пошуковому запиті
    currentPage = 2;
    showLoadMoreBtn();
  } else {
    // Відображаємо повідомлення про відсутність результатів пошуку
    showNoResultsMessage();

    // Ховаємо кнопку "Load more", оскільки результатів немає
    hideLoadMoreBtn();
  }
}

// Функція, що обробляє подію click на кнопці "Load more"
async function onLoadMoreClick() {
  // Отримуємо значення пошукового запиту з форми
  const searchQuery = getSearchQueryFromForm();

  // Виконуємо запит до API для отримання наступної порції зображень
  const images = await fetchImages(searchQuery, currentPage);

  if (images.length > 0) {
    // Відображаємо отримані зображення у галереї
    appendGalleryMarkup(images); // Використовуємо appendGalleryMarkup для додавання зображень до попередньої галереї
    currentPage++;

    // Плавно прокручуємо сторінку вниз після завантаження нової групи зображень
    await smoothScrollToNextGroup();
  } else {
    // Якщо зображення більше немає, ховаємо кнопку "Load more" та відображаємо відповідне повідомлення
    hideLoadMoreBtn();
    showEndOfResultsMessage();
  }
}

// Функція для отримання пошукового запиту з форми
function getSearchQueryFromForm() {
  const formData = new FormData(searchForm);
  return formData.get('searchQuery');
}

// Функція для відображення зображень у галереї після нового пошукового запиту
function displayNewGallery(images) {
  const galleryMarkup = createGalleryMarkup(images);
  replaceGalleryMarkup(galleryMarkup);

  // Ініціалізуємо SimpleLightbox для всіх посилань на зображення
  const lightbox = new SimpleLightbox('.gallery a', {
    /* Опції для налаштування SimpleLightbox */
  });

  // Оновлюємо галерею
  lightbox.refresh();
}

// Функція для заміни розмітки галереї в DOM
function replaceGalleryMarkup(galleryMarkup) {
  galleryContainer.innerHTML = galleryMarkup;
}

// Функція для додавання зображень до галереї при натисканні на кнопку "Load more"
function appendGalleryMarkup(images) {
  const galleryMarkup = createGalleryMarkup(images);
  galleryContainer.insertAdjacentHTML('beforeend', galleryMarkup);

  // Якщо SimpleLightbox вже був ініціалізований, оновлюємо його, інакше створюємо новий
  if (lightbox) {
    lightbox.refresh();
  } else {
    lightbox = new SimpleLightbox('.gallery a', {
      /* Опції для налаштування SimpleLightbox */
    });
  }

  // Оновлюємо галерею
  lightbox.refresh();
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

let lightbox; // Оголошуємо змінну для зберігання SimpleLightbox

// Функція для плавного прокручування сторінки вниз після завантаження нової групи зображень
async function smoothScrollToNextGroup() {
  const { height: cardHeight } = document
    .querySelector('.gallery')
    .firstElementChild.getBoundingClientRect();

  // Затримка перед прокручуванням
  await new Promise(resolve => setTimeout(resolve, 500));

  window.scrollBy({
    top: cardHeight * 2, // Множимо на 2, щоб прокрутити на висоту двох карток
    behavior: 'smooth',
  });
}

// Функція для показу кнопки "Load more"
function showLoadMoreBtn() {
  loadMoreBtn.style.display = 'block';
}

// Функція для ховання кнопки "Load more"
function hideLoadMoreBtn() {
  loadMoreBtn.style.display = 'none';
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
