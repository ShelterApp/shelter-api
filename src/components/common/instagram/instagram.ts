import logger from '@shelter/core/dist/utils/logger';
import fetch from 'isomorphic-unfetch';

const verifyAccessToken = async (accessToken: string) => {
  logger.info('@verifyAccessToken - Instagram');
  try {
    const res = await fetch(`https://graph.instagram.com/me?fields=id,username&access_token=${accessToken}`);

    if (!res.ok) {
      throw await res.json();
    }

    return await res.json();
  } catch (err) {
    logger.error(err);
    throw new Error(err.message || 'Verify instagram access token failed');
  }
};

export {
  verifyAccessToken,
};
