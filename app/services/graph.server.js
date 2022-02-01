const { RDFMimeType } = require("graphdb").http;
const { RepositoryClientConfig, RDFRepositoryClient } =
  require("graphdb").repository;
const { JsonLDParser } = require("graphdb").parser;
const { GetQueryPayload, QueryType } = require("graphdb").query;
const { client } = require("~/libs/connection");

const readTimeout = 30000;
const writeTimeout = 30000;
const config = new RepositoryClientConfig("http://127.0.0.1:7200")
  .setEndpoints(["http://127.0.0.1:7200/repositories/asc"])
  .setHeaders({
    Accept: RDFMimeType.SPARQL_RESULTS_JSON,
  })
  .setReadTimeout(readTimeout)
  .setWriteTimeout(writeTimeout);
const repository = new RDFRepositoryClient(config);

repository.registerParser(new JsonLDParser());

const getReports = () =>
  new Promise(async (resolve) => {
    const value = await client.get("reports");

    if (value) {
      resolve(JSON.parse(value)),
        {
          EX: 10,
        };
    }

    const payload = new GetQueryPayload()
      .setQuery(
        `
        PREFIX report: <https://schema.org/Report>
        PREFIX rdf: <http://www.w3.org/1999/02/22-rdf-syntax-ns#>
        PREFIX owl: <http://www.w3.org/2002/07/owl#>

        SELECT *
        WHERE {
            ?report rdf:type report:Report ;
                    report:identifier ?id;
                    report:articleBody ?articleBody;
                    report:articleSection ?articleSection ;
                    report:url ?url ;
                    report:genre ?genre ;
                    report:keywords ?keywords .
        }
      `
      )
      .setQueryType(QueryType.SELECT)
      .setResponseType(RDFMimeType.SPARQL_RESULTS_JSON);

    repository
      .query(payload)
      .then((stream) => {
        const data = [];
        stream.on("data", (bindings) => {
          data.push(bindings);
        });

        stream.on("end", async () => {
          try {
            const final = JSON.parse(data.toString().replace(" ,:", " :"));

            const reports = final.results.bindings.map((result) => ({
              "@type": "https://schema.org/Report",
              id: Number(result.id.value),
              articleBody: result.articleBody.value,
              articleSection: result.articleSection.value,
              url: result.url.value,
              genre: result.genre.value,
              keywords: result.keywords.value,
            }));

            await client.set("reports", JSON.stringify(reports));
            resolve(reports);
          } catch {
            resolve([]);
          }
        });
      })
      .catch(() => {
        resolve([]);
      });
  });

module.exports = {
  getReports,
};
