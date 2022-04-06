import logger from '@shelter/core/dist/utils/logger';
import fetch from 'isomorphic-unfetch';

const searchPlace = async (query: string) => {
  console.log('@searchPlace', query);
  try {
    const res = await fetch(`https://maps.googleapis.com/maps/api/place/textsearch/json?query=${query}&key=${process.env.GOOGLE_API_KEY}`);

    console.log('@', `https://maps.googleapis.com/maps/api/place/textsearch/json?query=${query}&key=${process.env.GOOGLE_API_KEY}`);

    if (!res.ok) {
      throw await res.json();
    }

    const result = await res.json();
    console.log('@result', result);

    if (!result.results || !result.results.length) {
      return;
    }

    return result.results[0];
  } catch (err) {
    logger.error(err);
    throw new Error(err.message || `Search google map failed - ${query}`);
  }
};

const searchGeoCode = async (address: string) => {
  try {
    console.log('@searchGeoCode', address);
    const res = await fetch(`https://maps.googleapis.com/maps/api/geocode/json?address=${address}&key=${process.env.GOOGLE_API_KEY}`);

    if (!res.ok) {
      throw await res.json();
    }

    const result = await res.json();
    console.log('@result', JSON.stringify(result, null, 2));

    if (!result.results || !result.results.length) {
      return;
    }

    return result.results[0];
  } catch (err) {
    logger.error(err);
    throw new Error(err.message || `Search google map failed - ${address}`);
  }
};

export {
  searchPlace,
  searchGeoCode,
};
