import { Router } from 'express';
import { parseQueryMiddleware,
        parseListQueryMiddleware } from '@shelter/core/dist/utils/express';

import { PLURAL_NAME } from './constants';
import { validateCreate, validateUpdate } from './middleware';
import { list, create, count, getByCode, get, update } from './controller';

import { RoutesProps } from '../types';

const path = `/${PLURAL_NAME}`;

const routes = (_: RoutesProps) => {
  const router = Router();

  router.param('code', getByCode);

  router.route('/')
    .get(parseListQueryMiddleware, list)
    .post(validateCreate, create);

  router.route('/count')
    .get(parseListQueryMiddleware, count);

  router.route('/:code')
    .get(parseQueryMiddleware, get)
    .put(validateUpdate, update);

  return router;
};

export default { path, routes };
