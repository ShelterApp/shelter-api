import logger from '@shelter/core/dist/utils/logger';
import fetch from 'isomorphic-unfetch';
import oauth from 'oauth-sign';
import uuid from 'uuid';

const verifyAccessToken = async (accessToken: string, accessTokenSecret: string) => {
  try {
    const consumerKey = process.env.TWITTER_CONSUMER_ID;
    const consumerSecret = process.env.TWITTER_CONSUMER_SECRET;

    const url = 'https://api.twitter.com/1.1/account/verify_credentials.json';
    const timestamp = Date.now() / 1000;
    const nonce = uuid.v4().replace(/-/g, '');

    const params: any = {
      include_email: true,
      oauth_consumer_key: consumerKey,
      oauth_nonce: nonce,
      oauth_signature_method: 'HMAC-SHA1',
      oauth_timestamp: timestamp,
      oauth_token: accessToken,
      oauth_version: '1.0',
    };

    // tslint:disable-next-line:no-object-mutation
    params.oauth_signature = oauth.hmacsign('GET', url, params, consumerSecret, accessTokenSecret);
    const auth = Object.keys(params).sort().map((k) => {
      // tslint:disable-next-line:prefer-template
      return k + '="' + oauth.rfc3986(params[k]) + '"';
    }).join(', ');

    const res = await fetch(`${url}?include_email=true`, {
      headers: {
        Authorization: `OAuth ${auth}`,
      },
    });

    if (!res.ok) {
      throw await res.json();
    }

    return await res.json();
  } catch (err) {
    logger.error(err);
    throw new Error(err.message || 'Verify twitter access token failed');
  }
};

export {
  verifyAccessToken,
};
