import Notiflix from 'notiflix';
import { PixabayApi } from './js/fetchGallery';
import createGalleryCards from './templates/create-gallery.hbs';
import SimpleLightbox from 'simplelightbox';
import 'simplelightbox/dist/simple-lightbox.min.css';

const formEl = document.querySelector('#search-form');
const galleryEl = document.querySelector('.gallery');
const loadMoreBtn = document.querySelector('.load-more');

const pixabayApi = new PixabayApi();
const gallery = new SimpleLightbox('.gallery a');

const onFormSubmit = async event => {
  event.preventDefault();

  pixabayApi.query = event.currentTarget.elements['searchQuery'].value.trim();

  if (pixabayApi.query === '') {
    galleryEl.innerHTML = '';
    loadMoreBtn.classList.add('is-hidden');
    event.target.reset();
    return;
  }

  try {
    const response = await pixabayApi.fetchPhotos();

    if (response.data.totalHits === 0) {
      galleryEl.innerHTML = '';
      loadMoreBtn.classList.add('is-hidden');
      event.target.reset();
      Notiflix.Notify.failure(
        'Sorry, there are no images matching your search query. Please try again.'
      );
      return;
    }
    if (pixabayApi.page * pixabayApi.per_page > response.data.totalHits) {
      loadMoreBtn.classList.add('is-hidden');
      Notiflix.Notify.info(
        "We're sorry, but you've reached the end of search results."
      );
    } else {
      loadMoreBtn.classList.remove('is-hidden');
      Notiflix.Notify.success(
        `Hooray! We found ${response.data.totalHits} images.`
      );
    }

    galleryEl.innerHTML = createGalleryCards(response.data.hits);
    gallery.refresh();
  } catch (error) {
    console.log(error);
  }
};

const onLoadMoreBtnClick = async event => {
  pixabayApi.page += 1;

  try {
    const response = await pixabayApi.fetchPhotos();

    if (pixabayApi.page * pixabayApi.per_page > response.data.totalHits) {
      loadMoreBtn.classList.add('is-hidden');
      Notiflix.Notify.info(
        "We're sorry, but you've reached the end of search results."
      );
    } else {
      loadMoreBtn.classList.remove('is-hidden');
    }
    galleryEl.insertAdjacentHTML(
      'beforeend',
      createGalleryCards(response.data.hits)
    );
    gallery.refresh();
    const { height: cardHeight } = document
      .querySelector('.gallery')
      .firstElementChild.getBoundingClientRect();

    window.scrollBy({
      top: cardHeight * 2,
      behavior: 'smooth',
    });
  } catch (error) {
    console.log(error);
  }
};

formEl.addEventListener('submit', onFormSubmit);
loadMoreBtn.addEventListener('click', onLoadMoreBtnClick);
