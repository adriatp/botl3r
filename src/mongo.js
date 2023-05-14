const MongoClient = require('mongodb').MongoClient;

class Mongo {
  constructor(ip, port, db, user, pwd) {
    this.db = db;
    let uri = `mongodb://${user}:${pwd}@${ip}:${port}/${db}?authSource=admin`;
    this.client = new MongoClient(uri);
  }
  
  async listDatabases(){
    let databasesList = await this.client.db().admin().listDatabases();
    console.log("Databases:");
    databasesList.databases.forEach(db => console.log(` - ${db.name}`));
  }

  async get_first(collection_name) {
    try {
      await this.client.connect();
      let cursor = await this.client.db().collection(collection_name).find({}, { projection: {_id: 0}}).limit(1).toArray();
      return cursor[0];
    } catch (e) {
        console.error(e);
    } finally {
      await this.client.close();
    }
  }

  async get_last(collection_name) {
    try {
      await this.client.connect();
      let cursor = await this.client.db().collection(collection_name).find({}, { projection: {_id: 0}}).sort({ $natural: -1 }).limit(1).toArray();
      return cursor[0];
    } catch (e) {
        console.error(e);
    } finally {
      await this.client.close();
    }
  }

  async insert_one(collection_name, json) {
    try {
      await this.client.connect();
      await this.client.db().collection(collection_name).insertOne(json);
    } catch (e) {
        console.error(e);
    } finally {
      await this.client.close();
    }
  }
}

module.exports = { Mongo };