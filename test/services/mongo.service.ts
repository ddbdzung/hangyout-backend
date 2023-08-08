import * as mongoDB from 'mongodb';
import * as path from 'path';

import loadEnvFile from '../utils/loadEnvFile';

// https://www.mongodb.com/docs/drivers/node/current/fundamentals/crud/read-operations/text/#query-for-words
export enum IndexType {
  ASC = 1,
  DESC = -1,
  TEXT = 'text',
}

export class MongoDBService {
  private client: mongoDB.MongoClient;
  private db: mongoDB.Db;

  private _getDbName(uri: string) {
    const uriParts = uri.split('/');
    return uriParts[uriParts.length - 1];
  }

  constructor() {
    const ENV = process.env.NODE_ENV;
    const envFilePath = !ENV ? '.env' : `.${ENV}.env`;
    const envVars = loadEnvFile(path.join(__dirname, '..', '..', envFilePath));
    const uri = envVars['MONGODB_URI'].toString().trim();

    this.client = new mongoDB.MongoClient(uri);
    this.db = this.client.db(this._getDbName(uri));
  }

  getDb() {
    return this.db as mongoDB.Db;
  }

  getCollectionByName(name: string) {
    return this.db.collection(name.toLowerCase()) as mongoDB.Collection;
  }

  async dropDatabase(): Promise<void> {
    await this.db.dropDatabase();
  }

  async dropCollection(collectionName: string): Promise<void> {
    await this.db.dropCollection(collectionName.toLowerCase());
  }

  async close(): Promise<void> {
    await this.client.close();
  }

  async createIndex(
    collectionName: string,
    index: mongoDB.IndexSpecification,
    options: mongoDB.CreateIndexesOptions = {},
  ): Promise<void> {
    const collection = this.getCollectionByName(collectionName.toLowerCase());

    await collection.createIndex(index, options);
  }

  async insertMany(collectionName: string, docs: any[]): Promise<any> {
    const collection = this.getCollectionByName(collectionName.toLowerCase());
    return collection.insertMany(docs);
  }

  async deleteMany(collectionName: string, filter: any): Promise<any> {
    const collection = this.getCollectionByName(collectionName.toLowerCase());
    return collection.deleteMany(filter);
  }

  async find(
    collectionName: string,
    query: any,
    projection = {},
  ): Promise<any[]> {
    const collection = this.getCollectionByName(collectionName.toLowerCase());
    return collection.find(query).project(projection).toArray();
  }

  async queryForWord(
    collectionName: string,
    query: any,
    projection = {},
  ): Promise<any[]> {
    const collection = this.getCollectionByName(collectionName.toLowerCase());
    return collection
      .find({ $text: { $search: query } })
      .project(projection)
      .toArray();
  }
}
