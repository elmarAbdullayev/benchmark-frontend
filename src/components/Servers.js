import React, { useState } from 'react';
import { Button } from "react-bootstrap"; 
import "../css/server.css";

function Servers() {

  const [uviType, setUviType] = useState("sync");
  const [uviRequests, setUviRequests] = useState(10);
  const [guniType, setGuniType] = useState("sync");
  const [guniRequests, setGuniRequests] = useState(10);

  const urlUvicorn = uviType === "sync" ? "http://127.0.0.1:8000/get_sync_uvicorn_function" : "http://127.0.0.1:8000/get_async_uvicorn_function";

const uvicornClick = async () => {
  try {
    // mehrere Requests gleichzeitig schicken
    const requests = Array.from({ length: uviRequests }, () =>
      fetch(urlUvicorn, { method: "GET" })
    );

    // alle Responses sammeln
    const responses = await Promise.all(requests);

    // in JSON umwandeln
    const results = await Promise.all(responses.map(res => res.json()));

    // an Funktion übergeben
    sendResults(results, responses);

  } catch (error) {
    console.error("Fehler bei fetch:", error);
  }
};

const sendResults = (data, responses) => {
  console.log("Sending results to server:", data, responses[0].status);
  let durchschnitt = 0;
for (let i = 0; i < data.length; i++) {
  const obj = Array.isArray(data[i]) ? data[i][0] : data[i]; // immer Objekt sichern
  durchschnitt += obj.duration_ms;
}
  console.log("Durchschnittliche Dauer (ms):", durchschnitt / data.length);
   const request = fetch("http://localhost:8000/save_result", {
     method: "POST",
     headers: { "Content-Type": "application/json" },
     body: JSON.stringify({ data: data, status: responses[0].status })
   });

};


  const urlGunicorn = guniType === "sync" ? "http://localhost:8001/get_sync_gunicorn_function" : "http://localhost:8001/get_async_gunicorn_function";

  const gunicornClick = async () => {
    const requests = Array.from({ length: guniRequests }, () =>
      fetch(urlGunicorn, { 
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ req_number: guniRequests })
      }).then(res => res.json())
    );
    const results = await Promise.all(requests);
    console.log(results);
  }

  // Hier neue funktion schreiben,die die anzahl und status und noch benötigte Daten der anfragen nimmt und diese an den server schickt

  return (
    <div className="container">
      
      <div className="server-card">
        <h1>Uvicorn</h1>

        <div>Type:</div>
        <select onChange={(e) => setUviType(e.target.value)}>
          <option value="sync">Sync</option> 
          <option value="async">Async</option>
        </select>

        <div>Requests:</div>
        <select onChange={(e) => setUviRequests(Number(e.target.value))}>
          <option value="10">10</option> 
          <option value="20">20</option>
          <option value="50">50</option>
          <option value="100">100</option>
          <option value="200">200</option>
          <option value="500">500</option>
          <option value="700">700</option>
          <option value="1000">1000</option>
        </select>

        <Button onClick={uvicornClick}>Submit</Button>
      </div>

      <div className="server-card">
        <h1>Gunicorn</h1>

        <div>Type:</div>
        <select onChange={(e) => setGuniType(e.target.value.toLowerCase())}>
          <option value="sync">Sync</option> 
          <option value="async">Async</option>
        </select>

        <div>Requests:</div>
        <select onChange={(e) => setGuniRequests(Number(e.target.value))}>
          <option value="10">10</option> 
          <option value="20">20</option>
          <option value="50">50</option>
          <option value="100">100</option>
          <option value="200">200</option>
          <option value="500">500</option>
          <option value="700">700</option>
          <option value="1000">1000</option>
        </select>

        <Button onClick={gunicornClick}>Submit</Button>
      </div>

    </div>
  )
}

export default Servers;
