import Notiflix from 'notiflix';
import { PixabayApi } from './fetchGallery';
import createGalleryCards from '../templates/create-gallery.hbs';
import SimpleLightbox from 'simplelightbox';
import 'simplelightbox/dist/simple-lightbox.min.css';

const formEl = document.querySelector('#search-form');
const galleryEl = document.querySelector('.gallery');

const pixabayApi = new PixabayApi();
const gallery = new SimpleLightbox('.gallery a');
const observer = new IntersectionObserver(
  (entries, observer) => {
    if (entries[0].isIntersecting) {
      loadMore();
    }
  },
  {
    root: null,
    rootMargin: '600px',
    threshold: 1,
  }
);

const onFormSubmit = async event => {
  event.preventDefault();

  pixabayApi.query = event.currentTarget.elements['searchQuery'].value.trim();
  pixabayApi.page = 1;

  if (pixabayApi.query === '') {
    galleryEl.innerHTML = '';
    event.target.reset();
    return;
  }

  try {
    const response = await pixabayApi.fetchPhotos();

    if (response.data.totalHits === 0) {
      galleryEl.innerHTML = '';
      event.target.reset();
      Notiflix.Notify.failure(
        'Sorry, there are no images matching your search query. Please try again.'
      );
      return;
    }

    Notiflix.Notify.success(
      `Hooray! We found ${response.data.totalHits} images.`
    );
    galleryEl.innerHTML = createGalleryCards(response.data.hits);
    gallery.refresh();
    observer.observe(document.querySelector('.target-element'));

    if (pixabayApi.page * pixabayApi.per_page > response.data.totalHits) {
      Notiflix.Notify.info(
        "We're sorry, but you've reached the end of search results."
      );
      observer.unobserve(document.querySelector('.target-element'));
    }
  } catch (error) {
    console.log(error);
  }
};

const loadMore = async event => {
  pixabayApi.page += 1;

  try {
    const response = await pixabayApi.fetchPhotos();

    if (pixabayApi.page * pixabayApi.per_page > response.data.totalHits) {
      Notiflix.Notify.info(
        "We're sorry, but you've reached the end of search results."
      );
      observer.unobserve(document.querySelector('.target-element'));
    }
    galleryEl.insertAdjacentHTML(
      'beforeend',
      createGalleryCards(response.data.hits)
    );

    gallery.refresh();
  } catch (error) {
    console.log(error);
  }
};

formEl.addEventListener('submit', onFormSubmit);
