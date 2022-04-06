import { Router } from 'express';
import { parseQueryMiddleware,
        parseListQueryMiddleware } from '@shelter/core/dist/utils/express';
import { UserRole } from '@shelter/core/dist';

import { PLURAL_NAME } from './constants';
import { validateCreate, validateUpdate, validateListOfServiceId,
        validateUpdateAvailableBeds, validateSearchCityOrZip,
        } from './middleware';
import { authenticate, hasAuthorization } from '../auth/middleware';
import { list, create, count, getById, get, update, del,
        likes, approveServices, removeServices,
        listOfBeds, updateAvailableBeds, searchCityOrZip,
        testSearch } from './controller';

import { RoutesProps } from '../types';

const path = `/${PLURAL_NAME}`;

const routes = (_: RoutesProps) => {
  const router = Router();

  router.param('id', getById);

  router.route('/')
    .get(parseListQueryMiddleware, list)
    .post(authenticate, validateCreate, create);

  router.route('/count')
    .get(parseListQueryMiddleware, count);

  router.route('/approve-services')
    .post(hasAuthorization([UserRole.Administrator]), validateListOfServiceId, approveServices);

  router.route('/remove-services')
    .post(hasAuthorization([UserRole.Administrator]), validateListOfServiceId, removeServices);

  router.route('/search-city-or-zip')
    .post(validateSearchCityOrZip, searchCityOrZip);

  router.route('/beds')
    .get(parseListQueryMiddleware, authenticate, listOfBeds);

  router.route('/update-available-beds')
    .post(authenticate, validateUpdateAvailableBeds, updateAvailableBeds);

  router.route('/test-search')
    .get(parseListQueryMiddleware, testSearch);

  router.route('/:id')
    .get(parseQueryMiddleware, get)
    .put(authenticate, validateUpdate, update)
    .delete(authenticate, del);

  router.route('/:id/likes')
    .post(likes);

  return router;
};

export default { path, routes };
