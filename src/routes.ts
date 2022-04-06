import { Router } from 'express';

import { RoutesProps } from './components/types';
import auth from './components/auth';
import users from './components/users';
import services from './components/services';
import feedbacks from './components/feedbacks';
import files from './components/files';
import crisisLines from './components/crisis-lines';
import bot from './components/bot';
import staticPages from './components/static-pages';

const routes = (props: RoutesProps) => {
  const router = Router();

  // register components
  router.use(auth.path, auth.routes(props));
  router.use(users.path, users.routes(props));
  router.use(services.path, services.routes(props));
  router.use(feedbacks.path, feedbacks.routes(props));
  router.use(files.path, files.routes(props));
  router.use(crisisLines.path, crisisLines.routes(props));
  router.use(bot.path, bot.routes(props));
  router.use(staticPages.path, staticPages.routes(props));

  return router;
};

export default routes;
export { RoutesProps };
