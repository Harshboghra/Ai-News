"use client";
import {  useEffect, useState } from "react";
import socket from "../services/socket";

export default function Home() {
  const [news, setNews] = useState([]);

  useEffect(() => {
    socket.on("news:new", (data) => {
      console.log('data', data)
      setNews((prev) => [data, ...prev] as any);
    });

    return () => {
      socket.off("news:new");
    };
  }, []);

  return (
    <main>
      <h1>Live News</h1>
      {news.map((item: any) => (
        <div key={item._id}>
          <h3>{item.title}</h3>
          <p>{item.source}</p>
        </div>
      ))}
    </main>
  );
}
