import axios from 'axios';

const API_KEY = '38490370-b1a7edf456ff4537f6870c934';
const API_URL = 'https://pixabay.com/api/';
const perPage = 20;

export async function fetchImages(searchQuery, page) {
  try {
    const response = await axios.get(API_URL, {
      params: {
        key: API_KEY,
        q: searchQuery,
        image_type: 'photo',
        orientation: 'horizontal',
        safesearch: true,
        page: page,
        per_page: perPage,
      },
    });

    return response.data.hits;
  } catch (error) {
    console.error('Error fetching data:', error);
    return [];
  }
}
