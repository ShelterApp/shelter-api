import logger from '@shelter/core/dist/utils/logger';
import * as GmailSend from 'gmail-send';

import { EmailSending } from './types';

const send = async ({ to, subject, html }: EmailSending) => {
  try {
    const send = GmailSend({
      to,
      subject,
      user: process.env.CONTACT_EMAIL_USERNAME,
      pass: process.env.CONTACT_EMAIL_PASSWORD,
    });

    return await send({
      html,
    });
  } catch (err) {
    logger.error(err);
    throw new Error(err.message || 'Login firebase failed');
  }
};

const sendResetPassword = async ({
  email,
  resetPasswordLink,
}) => {
  return await send({
    to: email,
    subject: 'Reset your password for ShelterApp',
    html: `
<p>Hello,</p>

<p>Follow this link to reset your ShelterApp password for your ${email} account.</p>

<a  href="${resetPasswordLink}">Reset password link</a>

<p>If you didn’t ask to reset your password, you can ignore this email.</p>

<p>Thanks,</p>

<p>Your ShelterApp team</p>
<a href="https://shelterapp.org">https://shelterapp.org</a>
<p>shelterappinfo@gmail.com</p>
    `,
  });
};

const sendWelcome = async ({
  email,
}) => {
  const documentUrl = 'https://drive.google.com/drive/u/3/folders/1LycihLc3o8g2E_r9TD0ICF1p8pzZmfOz';

  return await send({
    to: email,
    subject: 'Welcome to ShelterApp',
    html: `
<p>Hi There,</p>
</br>

<p>Thanks for signing up! Please check out our <a href="${documentUrl}">documentation</a> to get started. If you need any help,please reach out to us using give feedback in the app or email us at <a href="mailto:shelterappinfo@gmail.com">shelterappinfo@gmail.com</a>.</p>
</br>

<p>Thanks,</p>
<p>Your ShelterApp team</p>
<a href="https://shelterapp.org">https://shelterapp.org</a>
<p>shelterappinfo@gmail.com</p>
    `,
  });
};

const sendServiceFeedbackToProvider = async ({
  email,
  userName,
  userEmail,
  userPhone,
  userMessage,
  serviceName,
}) => {
  console.log('@serviceName', serviceName);
  const linkUrl = 'https://www.shelterapp.org/';

  return await send({
    to: email,
    subject: `Feedback from ShelterApp User: ${userName}`,
    html: `
    <p>Hi There,</p>

    <p>We have a request from one of our <a href="${linkUrl}">ShelterApp</a> users ${userName} looking for help. Can you please contact the user about it? Below are some of the details shared by the user.</p>

    </br>
    <p><strong>User Info</strong></p>
    <p>Name: ${userName}</p>
    <p>Email: ${userEmail}</p>
    <p>Phone: ${userPhone}</p>
    <p>Message:</p>
    <p>${userMessage}</p>

    </br>
    <p>You can also login into the app with your credentials to checkout this user feedback. Please let us know if you have any issues with login or viewing feedback in the app.</p>

    </br>
    <p>Thanks,</p>
    <p>Your ShelterApp team</p>
    <a href="https://shelterapp.org">https://shelterapp.org</a>
    <p>shelterappinfo@gmail.com</p>
        `,
  });
};

const sendServiceFeedbackToUser = async ({
  email,
  serviceName,
  servicePhone,
  serviceEmail,
}) => {
  return await send({
    to: email,
    subject: `Re: ${serviceName}`,
    html: `
<p>Hi There,</p>
</br>

<p>Thanks for reaching out in our app. We forwarded your feedback request to ${serviceName}. You can also reach them at ${servicePhone} or email them at ${serviceEmail} to get more information regarding your request.</p>
</br>

<p>Thanks,</p>
<p>Your ShelterApp team</p>
<a href="https://shelterapp.org">https://shelterapp.org</a>
<p>shelterappinfo@gmail.com</p>
    `,
  });
};

const sendAppFeedbackToUser = async ({
  email,
}) => {
  return await send({
    to: email,
    subject: `Thanks for reaching out in our app`,
    html: `
<p>Hi There,</p>
</br>

<p>Thanks for reaching out in our app. We will check your feedback and reach out to you if we need more information.</p>
</br>

<p>Thanks,</p>
<p>Your ShelterApp team</p>
<a href="https://shelterapp.org">https://shelterapp.org</a>
<p>shelterappinfo@gmail.com</p>
    `,
  });
};

const sendReportIncorrectInfoToUser = async ({
  email,
}) => {
  return await send({
    to: email,
    subject: `Thanks for reaching out in our app`,
    html: `
<p>Hi There,</p>
</br>

<p>Thanks for reaching out in our app. We will check your feedback and reach out to you if we need more information.</p>
</br>

<p>Thanks,</p>
<p>Your ShelterApp team</p>
<a href="https://shelterapp.org">https://shelterapp.org</a>
<p>shelterappinfo@gmail.com</p>
    `,
  });
};


export {
  send,
  sendResetPassword,
  sendWelcome,
  sendServiceFeedbackToProvider,
  sendServiceFeedbackToUser,
  sendAppFeedbackToUser,
  sendReportIncorrectInfoToUser,
};
