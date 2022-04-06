import { Router } from 'express';
import { parseQueryMiddleware,
        parseListQueryMiddleware } from '@shelter/core/dist/utils/express';
import { UserRole } from '@shelter/core/dist';

import { PLURAL_NAME } from './constants';
import { list, count, getById, get, update, togglePerm, togglePermSupperUser, del, setPermission} from './controller';
import { hasAuthorization } from '../auth/middleware';
import { validateUpdate, validateSetPermission } from './middleware';

import { RoutesProps } from '../types';

const path = `/${PLURAL_NAME}`;

const routes = (_: RoutesProps) => {
  const router = Router();

  router.param('id', getById);

  router.route('/')
    .get(hasAuthorization([UserRole.Administrator]), parseListQueryMiddleware, list);

  router.route('/count')
    .get(hasAuthorization([UserRole.Administrator]), parseListQueryMiddleware, count);

  router.route('/:id')
    .get(hasAuthorization([UserRole.Administrator]), parseQueryMiddleware, get)
    .put(hasAuthorization([UserRole.Administrator]), validateUpdate, update)
    .delete(hasAuthorization([UserRole.Administrator]), del)

  router.route('/:id/toggle-perm')
    .post(hasAuthorization([UserRole.Administrator]), parseQueryMiddleware, togglePerm);

  router.route('/:id/toggle-perm-supper-user')
    .post(hasAuthorization([UserRole.Administrator]), parseQueryMiddleware, togglePermSupperUser);

  router.route('/:id/set-permission')
    .post(hasAuthorization([UserRole.Administrator]), validateSetPermission, setPermission);

  return router;
};

export default { path, routes };
