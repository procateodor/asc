// import axios from "axios";

// export const getUsers = async () => {
//   try {
//     const params = new URLSearchParams();
//     params.append("MIME Type", "application/x-www-form-urlencoded");
//     params.append(
//       "query",
//       `PREFIX users: <http://www.semanticweb.org/ontologies/users#>
// PREFIX rdf: <http://www.w3.org/1999/02/22-rdf-syntax-ns#>
// PREFIX owl: <http://www.w3.org/2002/07/owl#>
// SELECT *
// WHERE {
//     ?user rdf:type users:User ;
//           users:user_id ?uid ;
//           users:name ?name ;
//           users:email ?email ;
//           users:password ?password ;
//           }
// LIMIT 30`
//     );

//     const { data } = await axios.post(
//       "http://127.0.0.1:7200/repositories/asc",
//       params,
//       {
//         headers: {
//           Accept: "application/sparql-results+json",
//           "Content-Type": "application/x-www-form-urlencoded",
//         },
//       }
//     );

//     console.log(data);
//   } catch (error) {
//     console.log(error);
//   }
// };

const { RDFMimeType } = require("graphdb").http;
const { RepositoryClientConfig, RDFRepositoryClient } =
  require("graphdb").repository;
const { JsonLDParser } = require("graphdb").parser;
const { GetQueryPayload, QueryType } = require("graphdb").query;

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
  new Promise((resolve) => {
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
        stream.on("end", () => {
          try {
            const final = JSON.parse(data.toString());
            resolve(
              final.results.bindings.map((result) => ({
                "@type": "https://schema.org/Report",
                id: Number(result.id.value),
                articleBody: result.articleBody.value,
                articleSection: result.articleSection.value,
                url: result.url.value,
                genre: result.genre.value,
                keywords: result.keywords.value,
              }))
            );
          } catch (error) {
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
