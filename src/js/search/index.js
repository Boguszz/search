import itemTemplate from '../templates/item-template.hbs';
import axios from 'axios';
import { Notify } from 'notiflix/build/notiflix-notify-aio';

const { search, result, loader } = {
  search: document.querySelector('.search'),
  result: document.querySelector('.result'),
  loader: document.querySelector('.loader'),
};

let currentPage = 1;
let totalHits = 0;
let searchValue = '';

search.addEventListener('submit', onSubmitSearchForm);

async function onSubmitSearchForm(e) {
  e.preventDefault();
  searchValue = e.target.search.value;
  currentPage = 1;

  if (searchValue === '') {
    return;
  }

  const response = await featchVideo(searchValue, currentPage);
  totalHits = response.totalHits;

  try {
    if (response.totalHits > 0) {
      result.innerHTML = '';
      Notify.success(`${response.totalHits} videos were found for your request`);
      renderMarkup(response.hits);
    }

    if (response.totalHits === 0) {
      Notify.failure('No results were found for your search. Please clarify your request');
      result.innerHTML = '';
      loader.classList.add('is-hidden');
    }
  } catch (error) {
    console.log(error);
  }

  infiniteScroll();
}

async function featchVideo(value, page) {
  const url = 'https://pixabay.com/api/videos/';
  const key = '11240134-58b8f655e9e0f8ae8b6e8e7de';
  const filter = `?key=${key}&q=${value}&video_type=film&per_page=12&page=${page}`;

  loader.classList.remove('is-hidden');
  return await axios(`${url}${filter}`).then(response => response.data);
}

function renderMarkup(arr) {
  const markup = arr.map(item => itemTemplate(item)).join('');
  result.insertAdjacentHTML('beforeend', markup);
}

function infiniteScroll() {
  const options = {
    root: null,
    rootMargin: '0px',
    threshold: 0.1,
  };

  function callback(entries) {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        currentPage += 1;
        featchVideo(searchValue, currentPage).then(response => renderMarkup(response.hits));
      }
    });
  }

  const observer = new IntersectionObserver(callback, options);

  const target = document.querySelector('.sentinel');
  observer.observe(target);
}
