import { useLoaderData, useSearchParams } from "remix";
import { useState } from "react";
import * as Ably from "ably";

import { getVulnerabilities } from "~/db.server";

export const loader = async () => getVulnerabilities();

export default function Index() {
  const vulnerabilities = useLoaderData();
  const [searchParams] = useSearchParams();

  const ably = new Ably.Realtime(
    "7YC25Q.12JClg:r9IBW4nN3UyZsfw_sa8tonN41v8NMHsW5WVrjaRqju4"
  );
  const channel = ably.channels.get("all");

  channel.subscribe((message) => {
    console.log("recevied", JSON.parse(message.data));
  });

  setTimeout(() => {
    channel.publish(
      "all",
      JSON.stringify({
        test: 1,
      })
    );
  }, 5000);

  const PAGE_SIZE = 15;

  const type = searchParams.get("type") || "All";
  const platform = searchParams.get("platform") || "All";
  const port = searchParams.get("port") || "All";

  let [page, setPage] = useState(1);

  const filters = vulnerabilities.reduce(
    (acc, v) => ({
      types: [...new Set([...acc.types, v.type])],
      platforms: [...new Set([...acc.platforms, v.platform])],
      ports: v.port ? [...new Set([...acc.ports, v.port])] : acc.ports,
    }),
    {
      types: [],
      platforms: [],
      ports: [],
    }
  );

  const filteredVulnerabilities = vulnerabilities.filter(
    (v) =>
      (type !== "All" ? v.type === type : true) &&
      (platform !== "All" ? v.platform === platform : true) &&
      (port !== "All" ? v.port === port : true)
  );

  const totalPages =
    Math.floor(filteredVulnerabilities.length / PAGE_SIZE) +
    (filteredVulnerabilities.length % PAGE_SIZE > 0 ? 1 : 0);

  return (
    <div
      style={{ fontFamily: "system-ui, sans-serif", lineHeight: "1.4" }}
      className="container p-2 pt-5"
    >
      <h1 className="mb-3">Application Security Control</h1>
      <form className="mb-3">
        <div className="row mb-3">
          <div className="col-4">
            <div className="form-floating">
              <select
                className="form-select"
                id="floatingSelect1"
                name="type"
                aria-label="Type"
                defaultValue={type}
              >
                <option value="All">All</option>

                {filters.types.map((f) => (
                  <option key={f} value={f}>
                    {f}
                  </option>
                ))}
              </select>
              <label htmlFor="floatingSelect1">Type</label>
            </div>
          </div>
          <div className="col-4">
            <div className="form-floating">
              <select
                className="form-select"
                id="floatingSelect2"
                aria-label="Platform"
                name="platform"
                defaultValue={platform}
              >
                <option value="All">All</option>

                {filters.platforms.map((f) => (
                  <option key={f} value={f}>
                    {f}
                  </option>
                ))}
              </select>
              <label htmlFor="floatingSelect2">Platform</label>
            </div>
          </div>
          <div className="col-4">
            <div className="form-floating">
              <select
                className="form-select"
                id="floatingSelect3"
                aria-label="Port"
                name="port"
                defaultValue={port}
              >
                <option value="All">All</option>

                {filters.ports.map((f) => (
                  <option key={f} value={f}>
                    {f}
                  </option>
                ))}
              </select>
              <label htmlFor="floatingSelect3">Port</label>
            </div>
          </div>
        </div>
        <div className="row">
          <div className="col">
            <button type="submit" className="btn btn-primary">
              Filter
            </button>
          </div>
        </div>
      </form>
      <table className="table table-borderless table-striped">
        <thead>
          <tr>
            <th scope="col">Id</th>
            <th scope="col">Description</th>
            <th scope="col">Type</th>
            <th scope="col">Platform</th>
            <th scope="col">Port</th>
            <th scope="col">Verified</th>
            <th scope="col">Author</th>
          </tr>
        </thead>
        <tbody>
          {filteredVulnerabilities
            .slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE)
            .map((v) => (
              <tr key={v.id}>
                <th scope="row">{v.id}</th>
                <td>{v.description}</td>
                <td>{v.type}</td>
                <td>{v.platform}</td>
                <td>{v.port || "N/A"}</td>
                <td>{v.verified ? "Yes" : "No"}</td>
                <td>{v.author}</td>
              </tr>
            ))}
        </tbody>
      </table>
      <nav>
        <ul className="pagination">
          <li
            className={`page-item ${page < 2 && "disabled"}`}
            onClick={() => page > 1 && setPage(page - 1)}
          >
            <a className="page-link">Previous</a>
          </li>
          {new Array(totalPages).fill(0).map((_, index) => (
            <li
              key={index}
              className={`page-item ${index + 1 === page && "active"}`}
              onClick={() => setPage(index + 1)}
            >
              <a className="page-link" href="#">
                {index + 1}
              </a>
            </li>
          ))}
          <li
            className={`page-item ${page >= totalPages && "disabled"}`}
            onClick={() => page < totalPages && setPage(page + 1)}
          >
            <a className="page-link" href="#">
              Next
            </a>
          </li>
        </ul>
      </nav>
    </div>
  );
}
