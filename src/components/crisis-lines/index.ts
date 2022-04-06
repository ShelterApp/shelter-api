import { Router } from 'express';
import { parseQueryMiddleware,
        parseListQueryMiddleware } from '@shelter/core/dist/utils/express';
import { UserRole } from '@shelter/core/dist';

import { PLURAL_NAME } from './constants';
import { validateCreate, validateUpdate } from './middleware';
import { hasAuthorization } from '../auth/middleware';
import { list, create, count, getById, get, update, del } from './controller';

import { RoutesProps } from '../types';

const path = `/${PLURAL_NAME}`;

const routes = (_: RoutesProps) => {
  const router = Router();

  router.param('id', getById);

  router.route('/')
    .get(parseListQueryMiddleware, list)
    .post(hasAuthorization([UserRole.Administrator]), validateCreate, create);

  router.route('/count')
    .get(parseListQueryMiddleware, count);

  router.route('/:id')
    .get(parseQueryMiddleware, get)
    .put(hasAuthorization([UserRole.Administrator]), validateUpdate, update)
    .delete(hasAuthorization([UserRole.Administrator]), del);

  return router;
};

export default { path, routes };
