import { Router } from 'express';
import { parseQueryMiddleware,
        parseListQueryMiddleware } from '@shelter/core/dist/utils/express';

import { PLURAL_NAME } from './constants';
import { validateCreateServiceFeedback, validateCreateAppFeedback } from './middleware';
import { authenticate } from '../auth/middleware';
import {
  list,
  createServiceFeedback,
  createAppFeedback,
  count,
  getById,
  get,
  del,
  archive,
  createFiles,
} from './controller';

import { RoutesProps } from '../types';

const path = `/${PLURAL_NAME}`;

const routes = (_: RoutesProps) => {
  const router = Router();

  router.param('id', getById);

  router.route('/')
    .get(authenticate, parseListQueryMiddleware, list);

  router.route('/service')
    .post(validateCreateServiceFeedback, createFiles, createServiceFeedback);

  router.route('/app')
    .post(validateCreateAppFeedback, createAppFeedback);

  router.route('/count')
    .get(authenticate, parseListQueryMiddleware, count);

  router.route('/:id')
    .get(authenticate, parseQueryMiddleware, get)
    .delete(authenticate, del);

  router.route('/:id/archive')
    .post(authenticate, archive);

  return router;
};

export default { path, routes };
