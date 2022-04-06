import { Router } from 'express';

import { PLURAL_NAME } from './constants';
import { create, get } from './controller';

import { RoutesProps } from '../types';

const path = `/${PLURAL_NAME}`;

const routes = (_: RoutesProps) => {
  const router = Router();

  router.route('/')
    .post(create);

  router.route('/:fileName')
    .get(get);

  return router;
};

export default { path, routes };
