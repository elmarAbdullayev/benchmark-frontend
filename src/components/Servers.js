// src/components/Servers.jsx
import React, { useState } from 'react';
import { Button } from "react-bootstrap";
import "../css/server.css";

// 🔹 Einzelne Server-Karte für Auswahl und Submit
function ServerCard({ title, type, setType, requestValue, setRequestValue, onRun, requestOptions }) {
  return (
    <div className="server-card">
      <h1>{title}</h1>
      <div>Type:</div>
      <select value={type} onChange={(e) => setType(e.target.value)}>
        <option value="sync">Sync</option>
        <option value="async">Async</option>
      </select>

      <div>Requests:</div>
      <select value={requestValue} onChange={(e) => setRequestValue(Number(e.target.value))}>
        {requestOptions.map(v => <option key={v} value={v}>{v}</option>)}
      </select>

      <Button onClick={onRun}>Submit</Button>
    </div>
  );
}

// 🔹 Hauptkomponente für Server-Benchmarking
function Servers() {
  const [uviType, setUviType] = useState("sync");
  const [uviRequests, setUviRequests] = useState(10);
  const [guniType, setGuniType] = useState("sync");
  const [guniRequests, setGuniRequests] = useState(10);
  const [notification, setNotification] = useState("");

  const requestOptions = [10, 20, 50, 100, 200, 500, 700, 1000, 10000];

  // 🔹 Notification anzeigen für kurze Zeit
  const showNotification = (msg) => {
    setNotification(msg);
    setTimeout(() => setNotification(""), 5000);
  };

  // 🔹 Concurrency-Limiter
  const pLimit = (limit) => {
    const queue = [];
    let active = 0;

    const run = (fn, resolve, reject) => {
      active++;
      fn().then(resolve).catch(reject).finally(() => {
        active--;
        if (queue.length > 0) {
          const next = queue.shift();
          run(next.fn, next.resolve, next.reject);
        }
      });
    };

    return (fn) => new Promise((resolve, reject) => {
      if (active < limit) run(fn, resolve, reject);
      else queue.push({ fn, resolve, reject });
    });
  };

  // 🔹 Requests senden und Ergebnisse sammeln
  const fetchRequests = async (count, url, server) => {
    try {
      showNotification(`${server} test gestartet: ${count} Requests`);

      const firstResponse = await fetch(`${url}?_=${Date.now()}`);
      if (!firstResponse.ok) throw new Error(`Server Fehler: ${firstResponse.status}`);

      const firstResult = await firstResponse.json();
      let test_session_id = Array.isArray(firstResult)
        ? firstResult[0]?.session_id
        : firstResult?.session_id;

      if (!test_session_id) return showNotification(`${server}: Fehler - Session ID fehlt`);
      test_session_id = Number(test_session_id);

      const limit = pLimit(5);
      const requests = Array.from({ length: count - 1 }, (_, index) =>
        limit(async () => {
          const start = performance.now();
          const response = await fetch(`${url}?test_session_id=${test_session_id}&_=${Date.now()}`);
          const duration_ms = performance.now() - start;
          return { response, duration_ms, request_id: index + 2 };
        })
      );

      const allResults = await Promise.all(requests);
      const allResultsWithFirst = [{ response: firstResponse, duration_ms: 0, request_id: 1 }, ...allResults];

      await sendResults(allResultsWithFirst, test_session_id, server);
      showNotification(`${server}: ${count} Requests abgeschlossen! Session ID: ${test_session_id}`);
    } catch (err) {
      console.error(err);
      showNotification(`Fehler: ${err.message}`);
    }
  };

  const urlUvicorn = uviType === "sync"
    ? "http://127.0.0.1:8000/get_sync_uvicorn_function"
    : "http://127.0.0.1:8000/get_async_uvicorn_function";

  const urlGunicorn = guniType === "sync"
    ? "http://localhost:8001/get_sync_gunicorn_function"
    : "http://localhost:8001/get_async_gunicorn_function";

  // 🔹 Ergebnisse an Backend senden
  const sendResults = async (allResults, test_session_id, server) => {
    const baseUrl = server === "gunicorn" ? "http://localhost:8001" : "http://localhost:8000";

    for (const item of allResults) {
      const payload = {
        test_session_id: Number(test_session_id),
        success_status: Boolean(item.response.ok),
        status: Number(item.response.status),
        request_id: Number(item.request_id),
        duration_ms: Number(item.duration_ms)
      };
      await fetch(`${baseUrl}/save_result`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload)
      });
    }
  };

  // 🔹 Streamlit Buttons
  const openStats = () => window.open('http://localhost:8501', '_blank');
  const openHardware = () => window.open('http://localhost:8502', '_blank');
  const openBenchmark = () => window.open('http://localhost:8503', '_blank');

  return (
    <>
      <div className="container-bench">
        <ServerCard
          title="Uvicorn"
          type={uviType}
          setType={setUviType}
          requestValue={uviRequests}
          setRequestValue={setUviRequests}
          onRun={() => fetchRequests(uviRequests, urlUvicorn, "uvicorn")}
          requestOptions={requestOptions}
        />
        <ServerCard
          title="Gunicorn"
          type={guniType}
          setType={setGuniType}
          requestValue={guniRequests}
          setRequestValue={setGuniRequests}
          onRun={() => fetchRequests(guniRequests, urlGunicorn, "gunicorn")}
          requestOptions={requestOptions}
        />
      </div>

      {notification && <div className="notification">{notification}</div>}

      <div className="bottom-buttons-wrapper">
        <div className="results-info">Wählen Sie hier die gewünschte Ergebniskategorie aus.</div>
        <div className="bottom-buttons">
          <Button onClick={openStats}>Stats (Min / Avg / Max)</Button>
          <Button onClick={openHardware}>Hardware Info</Button>
          <Button onClick={openBenchmark}>Benchmark Overview</Button>
        </div>
      </div>
    </>
  );
}

export default Servers;
