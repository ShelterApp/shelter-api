import { User } from '@shelter/core';
import {
  ListQuery, Query,
  DEFAULT_QUERY, DEFAULT_LIST_QUERY,
} from '@shelter/core/dist/utils/express';

import Model, { Document } from './model';

class Repository {
  public static async list(
    listQuery: ListQuery = DEFAULT_LIST_QUERY,
  ): Promise<ReadonlyArray<User>> {
    const { query, populate, sort, skip, limit } = listQuery;
    console.log('@query', query);

    const documents = await Model.find(query)
      .populate(populate)
      .sort(sort)
      .skip(skip)
      .limit(limit)
      .exec();

    return documents.map(transform);
  }

  public static async count(
    listQuery: ListQuery = DEFAULT_LIST_QUERY,
  ): Promise<number> {
    const { query } = listQuery;

    return await Model.countDocuments(query).exec();
  }

  public static async get(
    id: string,
    query: Query = DEFAULT_QUERY,
  ): Promise<User> {
    const { populate } = query;

    const document = await Model.findById(id)
      .populate(populate)
      .exec();

    return transform(document);
  }

  public static async create(data: User): Promise<User> {
    const document = new Model(data);
    await document.$create();

    return transform(document);
  }

  public static async findOneOrCreate(data: User): Promise<User> {
    // tslint:disable-next-line:no-let
    let document = await Model.findOne({
      phone: data.phone,
    }).exec();

    if (document) {
      return transform(document);
    }

    document = new Model(data);

    await document.$create();

    return transform(document);
  }

  public static async updateLastLoginTimestamp(id: string): Promise<User> {
    const document = await Model.findById(id).exec();
    await document.$update({
      lastSignedIn: new Date(),
    });

    return transform(document);
  }

  public static async getByEmail(email: string, query: Query = DEFAULT_QUERY): Promise<User> {
    const { populate } = query;

    const document = await Model.findOne({
      email,
    })
    .populate(populate)
    .exec();

    return transform(document);
  }

  public static async update({ id, ...data }: any): Promise<User> {
    const document = await Model.findById(id).exec();
    await document.$update(data);

    return transform(document);
  }

  public static async delete(id: string): Promise<User> {
    const document = await Model.findById(id).exec();
    await document.$delete();

    return transform(document);
  }
}

const transform = (document: Document): User => {
  return document && document.toJSON();
};

export default Repository;
export { transform };
