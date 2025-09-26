 
import React, { useState, useEffect } from "react"; 
import { collection, addDoc, onSnapshot } from "firebase/firestore"; 
import { db } from "./firebase"; 
 
export default function App() { 
  const [tab, setTab] = useState("ranking"); 
  const [players, setPlayers] = useState([]); 
  const [matches, setMatches] = useState([]); 
  const [name, setName] = useState(""); 
 
  useEffect(() =
    const unsubPlayers = onSnapshot(collection(db, "players"), snap =
      setPlayers(snap.docs.map(doc = id: doc.id, ...doc.data() }))); 
    }); 
    const unsubMatches = onSnapshot(collection(db, "matches"), snap =
      setMatches(snap.docs.map(doc = id: doc.id, ...doc.data() }))); 
    }); 
    return () = unsubPlayers(); unsubMatches(); }; 
  }, []); 
  return ( 
    <div style={{ display: "flex", height: "100vh", fontFamily: "Arial, sans-serif" }}> 
      {/* Sidebar */} 
      <aside style={{ width: "230px", background: "#111827", color: "white", padding: "20px" }}> 
        <h1 style={{ fontSize: "22px", marginBottom: "20px" }}>Meu Time Teu ?</h1> 
        <nav style={{ display: "flex", flexDirection: "column", gap: "15px" }}> 
          <button onClick={() = style={{ background: "none", border: "none", color: "white", textAlign: "left" }}>Ranking ??</button> 
          <button onClick={() = style={{ background: "none", border: "none", color: "white", textAlign: "left" }}>Jogadores ??</button> 
          <button onClick={() = style={{ background: "none", border: "none", color: "white", textAlign: "left" }}>Partidas ?</button> 
        </nav> 
      </aside> 
 
      {/* Conte£do */} 
      <main style={{ flex: 1, padding: "30px", background: "#f9fafb", overflowY: "auto" }}> 
      </main> 
    </div> 
  ); 
} 
function Players({ players, name, setName }) { 
  async function addPlayer() { 
    if (!name.trim()) return; 
    await addDoc(collection(db, "players"), { name, goals: 0, assists: 0, wins: 0, losses: 0 }); 
    setName(""); 
  } 
  return ( 
    <div> 
      <h2>Jogadores ??</h2> 
      <input value={name} onChange={(e) = placeholder="Nome do jogador" /> 
      <button onClick={addPlayer}>Adicionar</button> 
      <ul>{players.map(p = key={p.id}>{p.name} - Gols:{p.goals}</li>)}</ul> 
    </div> 
  ); 
} 
 
function Matches({ players }) { 
  return ( 
    <div> 
      <h2>Partidas ?</h2> 
      <p>Aqui vamos registrar Time A vs Time B.</p> 
    </div> 
  ); 
} 
 
function Ranking({ players, matches }) { 
  return ( 
    <div> 
      <h2>Ranking ??</h2> 
      <p>Ranking ser  calculado aqui.</p> 
    </div> 
  ); 
} 
function Matches({ players }) { 
  const [timeA, setTimeA] = useState([]); 
  const [timeB, setTimeB] = useState([]); 
  const [resultado, setResultado] = useState(""); 
 
  async function salvarPartida() { 
    await addDoc(collection(db, "matches"), { 
      timeA, 
      timeB, 
      resultado, 
      createdAt: new Date().toISOString() 
    }); 
    setTimeA([]); setTimeB([]); setResultado(""); 
  } 
 
  return ( 
    <div> 
      <h2>Registrar Partida ?</h2> 
      <div style={{ display: "flex", gap: "20px" }}> 
        <div> 
          {players.map(p =
            <button key={p.id} onClick={() =, p.name])}>{p.name}</button> 
          ))} 
          <p>Selecionados: {timeA.join(", ")}</p> 
        </div> 
 
        <div> 
          {players.map(p =
            <button key={p.id} onClick={() =, p.name])}>{p.name}</button> 
          ))} 
          <p>Selecionados: {timeB.join(", ")}</p> 
        </div> 
      </div> 
 
      <div style={{ marginTop: "20px" }}> 
        <label>Resultado: 
          <select value={resultado} onChange={(e) =
          </select> 
        </label> 
      </div> 
 
    </div> 
  ); 
} 
function Ranking() { 
  const [ranking, setRanking] = useState([]); 
 
  useEffect(() =
    const q = query(collection(db, "matches"), orderBy("createdAt", "asc")); 
    const unsub = onSnapshot(q, (snap) =
      let scores = {}; 
 
      snap.docs.forEach(doc =
        const m = doc.data(); 
        m.timeA.forEach(p =
          if (!scores[p]) scores[p] = { nome: p, pontos: 0, vitorias: 0, derrotas: 0 }; 
        }); 
        m.timeB.forEach(p =
          if (!scores[p]) scores[p] = { nome: p, pontos: 0, vitorias: 0, derrotas: 0 }; 
        }); 
 
        if (m.resultado === "timeA") { 
          m.timeA.forEach(p = scores[p].pontos += 3; scores[p].vitorias++; }); 
          m.timeB.forEach(p = scores[p].derrotas++; }); 
        } else if (m.resultado === "timeB") { 
          m.timeB.forEach(p = scores[p].pontos += 3; scores[p].vitorias++; }); 
          m.timeA.forEach(p = scores[p].derrotas++; }); 
        } else if (m.resultado === "empate") { 
          m.timeA.forEach(p = scores[p].pontos += 1; }); 
          m.timeB.forEach(p = scores[p].pontos += 1; }); 
        } 
      }); 
 
      const arr = Object.values(scores).sort((a, b) = - a.pontos); 
      setRanking(arr); 
    }); 
    return () =
  }, []); 
 
  return ( 
    <div style={{ marginTop: "30px" }}> 
      <table border="1" cellPadding="8"> 
        <thead> 
          <tr> 
          </tr> 
        </thead> 
        <tbody> 
          {ranking.map((r, i) =
            <tr key={i}> 
            </tr> 
          ))} 
        </tbody> 
      </table> 
    </div> 
  ); 
} 
function Historico() { 
  const [matches, setMatches] = useState([]); 
 
  useEffect(() =
    const q = query(collection(db, "matches"), orderBy("createdAt", "desc")); 
    const unsub = onSnapshot(q, (snap) =
      const arr = snap.docs.map(d = id: d.id, ...d.data() })); 
      setMatches(arr); 
    }); 
    return () =
  }, []); 
 
  return ( 
    <div style={{ marginTop: "30px" }}> 
      {matches.map(m =
        <div key={m.id} style={{ border: "1px solid #ddd", padding: "10px", marginBottom: "10px", borderRadius: "8px" }}> 
          <p>Time A: {m.timeA.join(", ")} </p> 
          <p>Time B: {m.timeB.join(", ")} </p> 
        </div> 
      ))} 
    </div> 
  ); 
} 
