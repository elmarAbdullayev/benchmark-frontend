import React, { useState } from 'react'
import {Button} from "react-bootstrap"; 

 function Servers() {

  const [uviType, setUviType] = useState("sync");
  const [uviRequests, setUviRequests] = useState(10);
  const [guniType, setGuniType] = useState("sync");
  const [guniRequests, setGuniRequests] = useState(10);

  const urlUvicorn = uviType === "sync" ? "http://127.0.0.1:8000/get_sync_uvicorn_function" : "http://127.0.0.1:8000/get_async_uvicorn_function";


const uvicornClick = async () => {
  const requests = Array.from({ length: uviRequests }, () =>
    fetch(urlUvicorn, { method: "POST",headers: { "Content-Type": "application/json" },body: JSON.stringify({ req_number: uviRequests }) }).then(res => res.json())
  );

  const results = await Promise.all(requests);
  console.log(results);
};


  const urlGunicorn = guniType === "sync" ? "http://localhost:8000/get_sync_gunicorn_function" : "http://localhost:8000/get_async_gunicorn_function";

    const gunicornClick = async()=>{
      const requests = Array.from({length:guniRequests},()=>
        fetch(urlGunicorn, {method:"POST",headers:{"Content-Type": "application/json" },body:JSON.stringify({req_number: guniRequests })}).then(res=>res.json())
      )
      const results = await Promise.all(requests);
      console.log(results);
  }

  return (

    <div className="container mt-5 d-flex justify-content-around">

    <div className='d-flex flex-column align-items-center gap-3'>
     <h1>Uvicorn</h1>

     <select name="" id="" className='w-100' onChange={(e)=>setUviType(e.target.value)}>
      <option value="sync">Sync</option> 
      <option value="async">Async</option>
     </select>

<div>Request.</div>
      <select name="" id="" className='w-100' onChange={(e)=>setUviRequests(e.target.value)}>
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


    <div  className='d-flex flex-column align-items-center gap-3'>
    <h1>Gunicorn</h1>
    
      <select name="" id=""  className='w-100' onChange={(e)=>setGuniType(e.target.value)}>
      <option value="Sync">Sync</option> 
      <option value="Async">Async</option>
     </select>

<div>Request.</div>

      <select name="" id="" className='w-100' onChange={(e)=>setGuniRequests(e.target.value)}>
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