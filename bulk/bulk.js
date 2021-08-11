'use strict'

const dataset = require('../output.json')

require('array.prototype.flatmap').shim()
require('dotenv').config()
const { Client } = require('@elastic/elasticsearch')
const client = new Client({
  node: process.env.ELASTIC_URL,
  auth: {
    username: process.env.ELASTIC_USERNAME,
    password: process.env.ELASTIC_PASSWORD
  }
})

// reduce((dataset, doc) => dataset.concat([{ index: { _index: 'test' } }, doc]), []);

async function run() {
  const body = dataset.flatMap(doc => [{ index: { _index: 'test' } }, doc])
  // const body = reduce((dataset, doc) => dataset.concat([{ index: { _index: 'test' } }, doc]), []);

  const { body: bulkResponse } = await client.bulk({ refresh: true, body })

  if (bulkResponse.errors) {
    const erroredDocuments = []
    // The items array has the same order of the dataset we just indexed.
    // The presence of the `error` key indicates that the operation
    // that we did for the document has failed.
    bulkResponse.items.forEach((action, i) => {
      const operation = Object.keys(action)[0]
      if (action[operation].error) {
        erroredDocuments.push({
          // If the status is 429 it means that you can retry the document,
          // otherwise it's very likely a mapping error, and you should
          // fix the document before to try it again.
          status: action[operation].status,
          error: action[operation].error,
          operation: body[i * 2],
          document: body[i * 2 + 1]
        })
      }
    })
    console.log(erroredDocuments)
  }

  const { body: count } = await client.count({ index: 'test' })
  console.log(count)
}

run().catch(console.log)