import { City } from '@shelter/core/dist';
import {
  ListQuery, Query,
  DEFAULT_QUERY, DEFAULT_LIST_QUERY,
} from '@shelter/core/dist/utils/express';

import Model, { Document } from './model';

class Repository {
  public static async list(
    listQuery: ListQuery = DEFAULT_LIST_QUERY,
  ): Promise<ReadonlyArray<City>> {
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
  ): Promise<City> {
    const { populate } = query;

    const document = await Model.findById(id)
      .populate(populate)
      .exec();

    return transform(document);
  }

  public static async getByName(
    name: string,
    query: Query = DEFAULT_QUERY,
  ): Promise<City> {
    const { populate } = query;

    const document = await Model.findOne({
      name,
    })
    .populate(populate)
    .exec();

    return transform(document);
  }

  public static async findOne(
    query: any,
    defaultQuery: Query = DEFAULT_QUERY,
  ): Promise<City> {
    const { populate, select } = defaultQuery;

    const document = await Model.findOne(query)
      .populate(populate)
      .select(select)
      .exec();

    return transform(document);
  }

  public static async create(data: City): Promise<City> {
    const document = new Model(data);
    await document.$create();

    return transform(document);
  }

  public static async update({ id, ...data }: any): Promise<City> {
    const document = await Model.findById(id).exec();
    await document.$update(data);

    return transform(document);
  }

  public static async delete(id: string): Promise<City> {
    const document = await Model.findById(id).exec();
    await document.$delete();

    return transform(document);
  }

  public static async searchPartial(
    keyword: string,
    listQuery: ListQuery = DEFAULT_LIST_QUERY,
  ): Promise<ReadonlyArray<Document>> {
    const { query, populate, sort, skip, limit } = listQuery;
    return await Model.find({
      $or: [
        { search: new RegExp(keyword, 'gi') },
      ],
      ...query,
    })
    .populate(populate)
    .skip(skip)
    .limit(limit)
    .sort(sort)
    .exec();
  }

  public static async searchFull(
    keyword: string,
    listQuery: ListQuery = DEFAULT_LIST_QUERY,
  ): Promise<ReadonlyArray<Document>> {
    const { query, populate, skip, limit } = listQuery;
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

  public static async search(
      keyword: string,
      listQuery: ListQuery = DEFAULT_LIST_QUERY,
    ): Promise<ReadonlyArray<City>> {
    // tslint:disable-next-line:no-let
    let documents = await this.searchFull(keyword, listQuery);
    documents = documents && documents.length
              ? documents
              : await this.searchPartial(keyword, listQuery);

    return documents.map(transform);
  }
}

const transform = (document: Document): City => {
  return document && document.toJSON();
};

export default Repository;
export { transform };
