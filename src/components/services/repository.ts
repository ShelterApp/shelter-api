import { Service } from '@shelter/core/dist';
import {
  ListQuery, Query,
  DEFAULT_QUERY, DEFAULT_LIST_QUERY,
} from '@shelter/core/dist/utils/express';
import logger from '@shelter/core/dist/utils/logger';

import Model, { Document } from './model';

class Repository {
  public static async list(
    listQuery: ListQuery = DEFAULT_LIST_QUERY,
  ): Promise<ReadonlyArray<Service>> {
    const { query, populate, sort, skip, limit, select } = listQuery;
    console.log('@query', JSON.stringify(query, null, 2));

    const documents = await Model.find(query)
      .populate(populate)
      .select(select)
      .sort(query.location ? {} : sort)
      .skip(skip)
      .limit(limit)
      .exec();

    console.log('@documents', documents.length);

    return documents.map(transform);
  }

  public static async count(
    listQuery: ListQuery = DEFAULT_LIST_QUERY,
  ): Promise<number> {
    const { query } = listQuery;

    return await Model.count(query).exec();
  }

  public static async get(
    id: string,
    query: Query = DEFAULT_QUERY,
  ): Promise<Service> {
    const { populate } = query;

    const document = await Model.findById(id)
      .populate(populate)
      .exec();

    return transform(document);
  }

  public static async findOne(
    condition: any,
    query: Query = DEFAULT_QUERY,
  ): Promise<Service> {
    const { populate, select = [] } = query;
    const document = await Model.findOne(condition)
      .populate(populate)
      .select(select)
      .exec();
    
      return transform(document);
  }

  public static async create(data: Service): Promise<Service> {
    const document = new Model(data);
    await document.$create();

    return transform(document);
  }

  public static async update({ id, ...data }: any): Promise<Service> {
    const document = await Model.findById(id).exec();
    await document.$update(data);

    return transform(document);
  }

  public static async increaseLikes(id: string): Promise<Service> {
    const document = await Model.findById(id).exec();
    await document.$update({
      likes: document.likes + 1,
    });

    return transform(document);
  }

  public static async delete(id: string): Promise<Service> {
    const document = await Model.findById(id).exec();
    await document.$delete();

    return transform(document);
  }

  // generated dedicated data
  public static async generatedDedicatedData(objects: ReadonlyArray<Service>): Promise<void> {
    for (const object of objects) {
      const { _id } = object;
      const document = await Model.findById(_id).exec();
      if (document) {
        continue;
      }

      await new Model(object).$create();
    }
  }

  public static async searchServiceSummary(
    keyword: string,
    listQuery: ListQuery = DEFAULT_LIST_QUERY,
  ): Promise<ReadonlyArray<Document>> {
    const { query, populate, skip, limit } = listQuery;
    logger.info('@keyword', keyword);

    return await Model.find(
      {
        $text: { $search: keyword },
        ...query,
      },
      {
        score: { $meta: 'textScore' },
      },
    )
    .populate(populate)
    .skip(skip)
    .limit(limit)
    .sort({
      score: { $meta: 'textScore' },
    }).exec();
  }
}

const transform = (document: Document): Service => {
  return document && document.toJSON();
};

export default Repository;
export { transform };
