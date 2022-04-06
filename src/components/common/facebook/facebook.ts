import logger from '@shelter/core/dist/utils/logger';
import fetch from 'isomorphic-unfetch';

const verifyAccessToken = async (accessToken: string) => {
  try {
    const res = await fetch(`https://graph.facebook.com/me?access_token=${accessToken}`);

    if (!res.ok) {
      throw await res.json();
    }

    return await res.json();
  } catch (err) {
    logger.error(err);
    throw new Error(err.message || 'Verify facebook access token failed');
  }
};

export {
  verifyAccessToken,
};
