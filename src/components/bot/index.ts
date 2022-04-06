import { Router } from 'express';

import { NAME } from './constants';
import { query, hook } from './controller';
import {
  validateQuery,
  validateHook,
} from './middleware';

import { RoutesProps } from '../types';

const path = `/${NAME}`;

const routes = (_: RoutesProps) => {
  const router = Router();

  router.route('/query')
    .post(validateQuery, query);

  router.route('/hook')
    .post(validateHook, hook);

  return router;
};

export default { path, routes };
