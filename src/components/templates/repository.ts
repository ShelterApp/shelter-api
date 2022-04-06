import { Template } from '@shelter/core/dist';
import {
  ListQuery, Query,
  DEFAULT_QUERY, DEFAULT_LIST_QUERY,
} from '@shelter/core/dist/utils/express';

import Model, { Document } from './model';

class Repository {
  public static async list(
    listQuery: ListQuery = DEFAULT_LIST_QUERY,
  ): Promise<ReadonlyArray<Template>> {
    const { query, populate, sort, skip, limit } = listQuery;

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
  ): Promise<Template> {
    const { populate } = query;

    const document = await Model.findById(id)
      .populate(populate)
      .exec();

    return transform(document);
  }

  public static async getByKey(
    key: string,
    query: Query = DEFAULT_QUERY,
  ): Promise<Template> {
    const { populate } = query;

    const document = await Model.findOne({
      key,
    })
    .populate(populate)
    .exec();

    return transform(document);
  }

  public static async create(data: Template): Promise<Template> {
    const document = new Model(data);
    await document.$create();

    return transform(document);
  }

  public static async update({ id, ...data }: any): Promise<Template> {
    const document = await Model.findById(id).exec();
    await document.$update(data);

    return transform(document);
  }

  public static async delete(id: string): Promise<Template> {
    const document = await Model.findById(id).exec();
    await document.$delete();

    return transform(document);
  }

  // generated dedicated data
  public static async generatedDedicatedData(objects: ReadonlyArray<Template>): Promise<void> {
    for (const object of objects) {
      const { _id } = object;
      const document = await Model.findById(_id).exec();
      if (document) {
        continue;
      }

      await new Model(object).$create();
    }
  }
}

const transform = (document: Document): Template => {
  return document && document.toJSON();
};

export default Repository;
export { transform };
