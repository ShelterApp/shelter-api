import logger from '@shelter/core/dist/utils/logger';
import fetch from 'isomorphic-unfetch';

const checkCredentials = async (email: string, password: string) => {
  try {
    const res = await fetch(`${process.env.FIREBASE_API_URL}/v1/accounts:signInWithPassword?key=${process.env.FIREBASE_API_TOKEN}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        email,
        password,
      }),
    });

    if (!res.ok) {
      throw await res.json();
    }

    const result = await res.json();

    return result.registered;
  } catch (err) {
    logger.error(err);
    throw new Error(err.message || 'Login firebase failed');
  }
};

const pushNotification = async (deviceToken: string, message: string) => {
  if (!deviceToken) {
    return;
  }
  try {
    const res = await fetch('https://fcm.googleapis.com/fcm/send', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `key=${process.env.FIREBASE_SERVER_KEY}`,
      },
      body: JSON.stringify({
        to: deviceToken,
        notification: {
          title: 'ShelterApp',
          body: message,
        },
      }),
    });

    if (!res.ok) {
      throw await res.json();
    }

    const result = await res.json();

    return result.registered;
  } catch (err) {
    logger.error(err);
    throw new Error(err.message || 'Push notification by firebase failed');
  }
};

export {
  checkCredentials,
  pushNotification,
};
