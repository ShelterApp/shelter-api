import logger from '@shelter/core/dist/utils/logger';
import fetch from 'isomorphic-unfetch';

const verifyAccessToken = async (accessToken: string) => {
  try {
    const res = await fetch(`https://www.googleapis.com/oauth2/v2/tokeninfo?access_token=${accessToken}`);

    if (!res.ok) {
      throw await res.json();
    }

    return await res.json();
  } catch (err) {
    logger.error(err);
    throw new Error(err.message || 'Verify google access token failed');
  }
};

export {
  verifyAccessToken,
};
