import React, { useEffect, useMemo, useState } from "react";
import {
  AppBar, Toolbar, Typography, Container, Box, Tabs, Tab, IconButton, Button,
  Grid, Card, CardContent, CardHeader, TextField, Select, MenuItem, Chip,
  Paper, Table, TableBody, TableCell, TableContainer, TableHead, TableRow,
  Divider, Stack, Tooltip, Badge, Avatar,
  ThemeProvider, createTheme, CssBaseline,
  Dialog, DialogTitle, DialogContent, DialogActions
} from "@mui/material";
import {
  SportsSoccer, Upload, Download, RestartAlt, Add, Delete, Edit as EditIcon,
  Group, Leaderboard, History as HistoryIcon, NoteAdd, DarkMode, LightMode
} from "@mui/icons-material";

/* =================== Config / Helpers =================== */
const STORAGE = {
  PLAYERS: "mtt_players_mui_v1",
  MATCHES: "mtt_matches_mui_v1",
  WEIGHTS: "mtt_weights_mui_v1",
  THEME:   "mtt_theme_mui_v1",
};
const defaultWeights = { win: 3, loss: -1, goal: 2, assist: 1.5 };
const positions = ["Goleiro", "Zagueiro", "Volante", "Meia", "Atacante"];
const uuid = () => (crypto?.randomUUID ? crypto.randomUUID() : String(Date.now() + Math.random()));

/* =================== App =================== */
export default function App() {
  const [tab, setTab] = useState(1); // 0=Plantel, 1=Partida, 2=Ranking, 3=Histórico, 4=Ideias
  const [players, setPlayers] = useState([]);
  const [matches, setMatches] = useState([]);
  const [weights, setWeights] = useState(defaultWeights);

  // tema claro/escuro
  const [mode, setMode] = useState(() => localStorage.getItem(STORAGE.THEME) || "light");
  const theme = useMemo(() => createTheme({ palette: { mode } }), [mode]);

  // boot
  useEffect(() => {
    const p = localStorage.getItem(STORAGE.PLAYERS);
    const m = localStorage.getItem(STORAGE.MATCHES);
    const w = localStorage.getItem(STORAGE.WEIGHTS);
    if (p) setPlayers(JSON.parse(p));
    if (m) setMatches(JSON.parse(m));
    if (w) setWeights(JSON.parse(w));
  }, []);
  // persist
  useEffect(() => localStorage.setItem(STORAGE.PLAYERS, JSON.stringify(players)), [players]);
  useEffect(() => localStorage.setItem(STORAGE.MATCHES, JSON.stringify(matches)), [matches]);
  useEffect(() => localStorage.setItem(STORAGE.WEIGHTS, JSON.stringify(weights)), [weights]);
  useEffect(() => localStorage.setItem(STORAGE.THEME, mode), [mode]);

  // KPIs
  const summary = useMemo(() => {
    let winsA = 0, winsB = 0, goals = 0, assists = 0;
    matches.forEach(m => {
      if (m.scoreA > m.scoreB) winsA++; else if (m.scoreB > m.scoreA) winsB++;
      Object.values(m.stats || {}).forEach(s => { goals += s.g || 0; assists += s.a || 0; });
    });
    return { matches: matches.length, winsA, winsB, goals, assists };
  }, [matches]);

  // ações cabeçalho
  function handleExport() {
    const dump = { players, matches, weights, exportedAt: new Date().toISOString() };
    const blob = new Blob([JSON.stringify(dump, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = Object.assign(document.createElement("a"), {
      href: url, download: `meutimeteu_${new Date().toISOString().slice(0,19)}.json`
    });
    a.click(); URL.revokeObjectURL(url);
  }
  function handleImport(file) {
    const rd = new FileReader();
    rd.onload = () => {
      try {
        const j = JSON.parse(rd.result);
        if (Array.isArray(j.players) && Array.isArray(j.matches)) {
          setPlayers(j.players); setMatches(j.matches); setWeights(j.weights || defaultWeights);
          alert("Importado com sucesso!");
        } else alert("JSON inválido.");
      } catch (e) { alert("Erro no JSON: " + e.message); }
    };
    rd.readAsText(file);
  }
  function handleReset() {
    if (!confirm("Zerar tudo?")) return;
    setPlayers([]); setMatches([]); setWeights(defaultWeights);
    localStorage.removeItem(STORAGE.PLAYERS);
    localStorage.removeItem(STORAGE.MATCHES);
    localStorage.removeItem(STORAGE.WEIGHTS);
  }

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <Box sx={{ minHeight: "100vh", bgcolor: mode==="light" ? "linear-gradient(180deg, #f8fafc, #eef2f7)" : "background.default" }}>
        {/* Header */}
        <AppBar position="sticky" elevation={0} color="inherit" sx={{ borderBottom: "1px solid", borderColor: "divider", bgcolor: "background.paper" }}>
          <Toolbar sx={{ gap: 2 }}>
            <Badge color="primary" badgeContent="PRO" overlap="circular">
              <Box sx={{
                width: 36, height: 36, borderRadius: 2,
                background: "linear-gradient(135deg,#2563eb,#10b981)",
                display: "grid", placeItems: "center", color: "#fff", fontWeight: 700
              }}>MT</Box>
            </Badge>
            <Typography variant="h6" sx={{ fontWeight: 700 }}>Meu Time Teu</Typography>
            <Box sx={{ flex: 1 }} />
            <Stack direction="row" spacing={1} alignItems="center">
              {/* tema */}
              <Tooltip title={mode==="light" ? "Tema escuro" : "Tema claro"}>
                <IconButton onClick={() => setMode(m => m==="light" ? "dark" : "light")}>
                  {mode==="light" ? <DarkMode /> : <LightMode />}
                </IconButton>
              </Tooltip>
              {/* dados */}
              <Tooltip title="Exportar JSON">
                <IconButton onClick={handleExport}><Download /></IconButton>
              </Tooltip>
              <Tooltip title="Importar JSON">
                <Button size="small" variant="outlined" startIcon={<Upload />} component="label">
                  Importar
                  <input hidden type="file" accept="application/json" onChange={(e)=>e.target.files?.[0] && handleImport(e.target.files[0])}/>
                </Button>
              </Tooltip>
              <Tooltip title="Zerar tudo">
                <IconButton color="error" onClick={handleReset}><RestartAlt /></IconButton>
              </Tooltip>
            </Stack>
          </Toolbar>

          <Toolbar variant="dense" sx={{ justifyContent: "center" }}>
            <Tabs
              value={tab}
              onChange={(_, v) => setTab(v)}
              textColor="primary"
              indicatorColor="primary"
              variant="scrollable"
              allowScrollButtonsMobile
              sx={{ "& .MuiTab-root": { textTransform: "none", fontWeight: 600 } }}
            >
              <Tab icon={<Group fontSize="small" />} iconPosition="start" label="Plantel" />
              <Tab icon={<SportsSoccer fontSize="small" />} iconPosition="start" label="Partida" />
              <Tab icon={<Leaderboard fontSize="small" />} iconPosition="start" label="Ranking" />
              <Tab icon={<HistoryIcon fontSize="small" />} iconPosition="start" label="Histórico" />
              <Tab icon={<NoteAdd fontSize="small" />} iconPosition="start" label="Ideias" />
            </Tabs>
          </Toolbar>
        </AppBar>

        {/* Conteúdo */}
        <Container sx={{ py: 3, maxWidth: 1200 }}>
          {/* KPIs */}
          <Grid container spacing={2} sx={{ mb: 2 }}>
            <Grid item xs={6} md={2.4}><KPI title="Partidas" value={summary.matches} color="#0f172a" /></Grid>
            <Grid item xs={6} md={2.4}><KPI title="Vitórias A" value={summary.winsA} color="#2563eb" /></Grid>
            <Grid item xs={6} md={2.4}><KPI title="Vitórias B" value={summary.winsB} color="#059669" /></Grid>
            <Grid item xs={6} md={2.4}><KPI title="Gols" value={summary.goals} color="#f59e0b" /></Grid>
            <Grid item xs={6} md={2.4}><KPI title="Assistências" value={summary.assists} color="#a21caf" /></Grid>
          </Grid>

          {tab === 0 && <Plantel players={players} setPlayers={setPlayers} />}
          {tab === 1 && <Partida players={players} matches={matches} setMatches={setMatches} />}
          {tab === 2 && <Ranking players={players} matches={matches} weights={weights} setWeights={setWeights} />}
          {tab === 3 && <Historico matches={matches} setMatches={setMatches} />}
          {tab === 4 && <Ideias />}
        </Container>
      </Box>
    </ThemeProvider>
  );
}

/* =================== Pequenos componentes =================== */
function KPI({ title, value, color }) {
  return (
    <Card sx={{ borderRadius: 3, bgcolor: "background.paper", boxShadow: "0 8px 24px rgba(2,6,23,0.06)" }}>
      <CardContent>
        <Typography variant="caption" color="text.secondary">{title}</Typography>
        <Typography variant="h5" sx={{ fontWeight: 700, color }}>{value}</Typography>
      </CardContent>
    </Card>
  );
}

/* =================== Plantel (com avatar) =================== */
function Plantel({ players, setPlayers }) {
  const [name, setName] = useState("");
  const [pos, setPos] = useState("Atacante");
  const [avatar, setAvatar] = useState("");

  function add() {
    const n = name.trim();
    if (!n) return alert("Informe um nome.");
    setPlayers([...players, { id: uuid(), name: n, pos, avatar }]);
    setName(""); setAvatar("");
  }
  function remove(id) {
    if (!confirm("Remover jogador?")) return;
    setPlayers(players.filter(p => p.id !== id));
  }

  return (
    <Grid container spacing={2}>
      <Grid item xs={12}>
        <Card sx={{ borderRadius: 3 }}>
          <CardContent>
            <Stack direction={{ xs: "column", sm: "row" }} spacing={2}>
              <TextField label="Nome do jogador" fullWidth value={name} onChange={e=>setName(e.target.value)} />
              <Select value={pos} onChange={e=>setPos(e.target.value)}>
                {positions.map(p => <MenuItem key={p} value={p}>{p}</MenuItem>)}
              </Select>
              <TextField label="Avatar URL (opcional)" fullWidth value={avatar} onChange={e=>setAvatar(e.target.value)} />
              <Button variant="contained" startIcon={<Add />} onClick={add}>Adicionar</Button>
            </Stack>
          </CardContent>
        </Card>
      </Grid>

      {players.length === 0 ? (
        <Grid item xs={12}>
          <Paper sx={{ p:3, textAlign:"center", borderRadius:3 }} variant="outlined">
            <Typography color="text.secondary">Nenhum jogador ainda. Adicione acima.</Typography>
          </Paper>
        </Grid>
      ) : (
        players.map(p => (
          <Grid key={p.id} item xs={12} md={6} lg={4}>
            <Card sx={{ borderRadius: 3 }}>
              <CardHeader
                avatar={<Avatar src={p.avatar || undefined}>{(p.name || "?").slice(0,2).toUpperCase()}</Avatar>}
                title={p.name}
                subheader={p.pos}
              />
              <CardContent>
                <Stack direction="row" spacing={1}>
                  <Button
                    variant="outlined"
                    startIcon={<EditIcon />}
                    onClick={()=>{
                      const novo = prompt("Novo nome:", p.name);
                      if (!novo) return;
                      const novaPos = prompt("Nova posição (Goleiro/Zagueiro/Volante/Meia/Atacante):", p.pos) || p.pos;
                      const novoAvatar = prompt("URL do avatar (opcional):", p.avatar || "") || "";
                      setPlayers(players.map(x => x.id===p.id ? { ...x, name: novo, pos: novaPos, avatar: novoAvatar } : x));
                    }}
                  >
                    Editar
                  </Button>
                  <Button variant="outlined" color="error" startIcon={<Delete />} onClick={()=>remove(p.id)}>Remover</Button>
                </Stack>
              </CardContent>
            </Card>
          </Grid>
        ))
      )}
    </Grid>
  );
}

/* =================== Partida (A vs B) =================== */
function Partida({ players, matches, setMatches }) {
  const [teamA, setTeamA] = useState([]);
  const [teamB, setTeamB] = useState([]);
  const [scoreA, setScoreA] = useState(0);
  const [scoreB, setScoreB] = useState(0);
  const [notes, setNotes] = useState("");
  const [stats, setStats] = useState({}); // { id: { team, g, a } }

  useEffect(() => {
    const base = {};
    teamA.forEach(id => base[id] = { team: "A", g: 0, a: 0 });
    teamB.forEach(id => base[id] = { team: "B", g: 0, a: 0 });
    setStats(base);
  }, [teamA.join(","), teamB.join(",")]);

  const pool = players.filter(p => !teamA.includes(p.id) && !teamB.includes(p.id));
  const toA = (id) => { if (!teamA.includes(id)) setTeamA([...teamA, id]); setTeamB(teamB.filter(x=>x!==id)); };
  const toB = (id) => { if (!teamB.includes(id)) setTeamB([...teamB, id]); setTeamA(teamA.filter(x=>x!==id)); };
  const kick = (id) => { setTeamA(teamA.filter(x=>x!==id)); setTeamB(teamB.filter(x=>x!==id)); };
  const setStat = (id, field, val) => setStats(prev => ({ ...prev, [id]: { ...(prev[id]||{team: teamA.includes(id)?"A":"B"}), [field]: Math.max(0, Number(val)||0) } }));

  function save() {
    if (teamA.length === 0 || teamB.length === 0) return alert("Selecione jogadores nos dois times.");
    const rosterSnapshot = Object.fromEntries(players.map(p => [p.id, { name: p.name, pos: p.pos, avatar: p.avatar }]));
    const entry = {
      id: uuid(),
      date: new Date().toISOString(),
      teamA, teamB,
      scoreA: Number(scoreA)||0, scoreB: Number(scoreB)||0,
      notes,
      stats,
      rosterSnapshot,
    };
    setMatches([...matches, entry]);
    setTeamA([]); setTeamB([]); setScoreA(0); setScoreB(0); setNotes(""); setStats({});
    alert("Partida salva!");
  }

  return (
    <Grid container spacing={2}>
      {/* Disponíveis */}
      <Grid item xs={12} md={4}>
        <Card sx={{ borderRadius: 3, height: "100%" }}>
          <CardHeader title="Disponíveis" subheader="Envie para A ou B" />
          <CardContent>
            <Stack spacing={1}>
              {pool.length === 0 && <Typography variant="body2" color="text.secondary">Todos alocados.</Typography>}
              {pool.map(p => (
                <Stack key={p.id} direction="row" spacing={1} alignItems="center">
                  <Chip label={`${p.name} • ${p.pos}`} />
                  <Button size="small" variant="outlined" onClick={()=>toA(p.id)}>A</Button>
                  <Button size="small" variant="outlined" onClick={()=>toB(p.id)}>B</Button>
                </Stack>
              ))}
            </Stack>
          </CardContent>
        </Card>
      </Grid>

      {/* Time A */}
      <Grid item xs={12} md={4}>
        <Card sx={{ borderRadius: 3, height: "100%" }}>
          <CardHeader title="Time A" subheader="Jogadores e gols" />
          <CardContent>
            <Stack direction="row" spacing={1} alignItems="center" sx={{ mb:2 }}>
              <Typography>Gols:</Typography>
              <TextField type="number" size="small" value={scoreA} onChange={e=>setScoreA(e.target.value)} sx={{ width:100 }}/>
            </Stack>
            <Stack spacing={1}>
              {teamA.length===0 && <Typography variant="body2" color="text.secondary">Sem jogadores.</Typography>}
              {teamA.map(id => {
                const p = players.find(x=>x.id===id);
                return (
                  <Stack key={id} direction="row" spacing={1} alignItems="center">
                    <Chip label={`${p?.name} • ${p?.pos}`} />
                    <TextField size="small" label="G" type="number" value={stats[id]?.g||0} onChange={e=>setStat(id,"g",e.target.value)} sx={{ width:70 }}/>
                    <TextField size="small" label="A" type="number" value={stats[id]?.a||0} onChange={e=>setStat(id,"a",e.target.value)} sx={{ width:70 }}/>
                    <IconButton onClick={()=>kick(id)}><Delete /></IconButton>
                  </Stack>
                );
              })}
            </Stack>
          </CardContent>
        </Card>
      </Grid>

      {/* Time B */}
      <Grid item xs={12} md={4}>
        <Card sx={{ borderRadius: 3, height: "100%" }}>
          <CardHeader title="Time B" subheader="Jogadores e gols" />
          <CardContent>
            <Stack direction="row" spacing={1} alignItems="center" sx={{ mb:2 }}>
              <Typography>Gols:</Typography>
              <TextField type="number" size="small" value={scoreB} onChange={e=>setScoreB(e.target.value)} sx={{ width:100 }}/>
            </Stack>
            <Stack spacing={1}>
              {teamB.length===0 && <Typography variant="body2" color="text.secondary">Sem jogadores.</Typography>}
              {teamB.map(id => {
                const p = players.find(x=>x.id===id);
                return (
                  <Stack key={id} direction="row" spacing={1} alignItems="center">
                    <Chip label={`${p?.name} • ${p?.pos}`} color="success" variant="outlined"/>
                    <TextField size="small" label="G" type="number" value={stats[id]?.g||0} onChange={e=>setStat(id,"g",e.target.value)} sx={{ width:70 }}/>
                    <TextField size="small" label="A" type="number" value={stats[id]?.a||0} onChange={e=>setStat(id,"a",e.target.value)} sx={{ width:70 }}/>
                    <IconButton onClick={()=>kick(id)}><Delete /></IconButton>
                  </Stack>
                );
              })}
            </Stack>
          </CardContent>
        </Card>
      </Grid>

      {/* Notas e Salvar */}
      <Grid item xs={12}>
        <Card sx={{ borderRadius: 3 }}>
          <CardContent>
            <Stack direction={{ xs: "column", md: "row" }} spacing={2} alignItems="center">
              <TextField label="Notas da partida (opcional)" fullWidth value={notes} onChange={e=>setNotes(e.target.value)} />
              <Button variant="contained" startIcon={<SportsSoccer />} onClick={save}>Salvar partida</Button>
            </Stack>
          </CardContent>
        </Card>
      </Grid>
    </Grid>
  );
}

/* =================== Ranking =================== */
function Ranking({ players, matches, weights, setWeights }) {
  const totals = useMemo(() => {
    const base = Object.fromEntries(players.map(p => [p.id, { ...p, apps:0, wins:0, losses:0, goals:0, assists:0 }]));
    matches.forEach(m => {
      const aWon = m.scoreA > m.scoreB, bWon = m.scoreB > m.scoreA;
      m.teamA.forEach(id => { if (!base[id]) return; base[id].apps++; if (aWon) base[id].wins++; else if (bWon) base[id].losses++; });
      m.teamB.forEach(id => { if (!base[id]) return; base[id].apps++; if (bWon) base[id].wins++; else if (aWon) base[id].losses++; });
      Object.entries(m.stats||{}).forEach(([pid,s]) => { if (!base[pid]) return; base[pid].goals += s.g||0; base[pid].assists += s.a||0; });
    });
    return Object.values(base);
  }, [players, matches]);

  const score = (p) => (p.wins*weights.win) + (p.losses*weights.loss) + (p.goals*weights.goal) + (p.assists*weights.assist);
  const ranked = [...totals].sort((a,b)=>score(b)-score(a));
  const setW = (k, v) => setWeights(prev => ({ ...prev, [k]: Number(v) }));

  return (
    <Grid container spacing={2}>
      <Grid item xs={12} md={4}>
        <Card sx={{ borderRadius: 3 }}>
          <CardHeader title="Pesos do Score" subheader="Ajuste e veja o ranking ao vivo" />
          <CardContent>
            <Stack spacing={2}>
              <TextField label="Vitória" type="number" value={weights.win}   onChange={e=>setW("win", e.target.value)} />
              <TextField label="Derrota" type="number" value={weights.loss}  onChange={e=>setW("loss", e.target.value)} />
              <TextField label="Gol"     type="number" value={weights.goal}  onChange={e=>setW("goal", e.target.value)} />
              <TextField label="Assist." type="number" value={weights.assist}onChange={e=>setW("assist", e.target.value)} />
            </Stack>
          </CardContent>
        </Card>
      </Grid>

      <Grid item xs={12} md={8}>
        <Card sx={{ borderRadius: 3 }}>
          <CardHeader title="Ranking de Jogadores" subheader="Ordenado por score" />
          <CardContent>
            {ranked.length === 0 ? (
              <Paper sx={{ p:3, textAlign:"center", borderRadius:3 }} variant="outlined">
                <Typography color="text.secondary">Cadastre jogadores e registre partidas para ver o ranking.</Typography>
              </Paper>
            ) : (
              <TableContainer component={Paper} sx={{ borderRadius: 2 }}>
                <Table size="small">
                  <TableHead>
                    <TableRow>
                      <TableCell>#</TableCell>
                      <TableCell>Jogador</TableCell>
                      <TableCell>Pos</TableCell>
                      <TableCell>J</TableCell>
                      <TableCell>V</TableCell>
                      <TableCell>D</TableCell>
                      <TableCell>G</TableCell>
                      <TableCell>A</TableCell>
                      <TableCell align="right">Score</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {ranked.map((p,i)=>(
                      <TableRow key={p.id}>
                        <TableCell>{i===0?"🥇":i===1?"🥈":i===2?"🥉":i+1}</TableCell>
                        <TableCell>
                          <Stack direction="row" spacing={1} alignItems="center">
                            <Avatar src={p.avatar || undefined} sx={{ width:24, height:24 }}>{(p.name||"?").slice(0,1).toUpperCase()}</Avatar>
                            {p.name}
                          </Stack>
                        </TableCell>
                        <TableCell>{p.pos}</TableCell>
                        <TableCell>{p.apps}</TableCell>
                        <TableCell>{p.wins}</TableCell>
                        <TableCell>{p.losses}</TableCell>
                        <TableCell>{p.goals}</TableCell>
                        <TableCell>{p.assists}</TableCell>
                        <TableCell align="right"><b>{score(p).toFixed(2)}</b></TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
            )}
          </CardContent>
        </Card>
      </Grid>
    </Grid>
  );
}

/* =================== Histórico (com edição) =================== */
function Historico({ matches, setMatches }) {
  const [editing, setEditing] = useState(null); // partida
  const [editA, setEditA] = useState(0);
  const [editB, setEditB] = useState(0);
  const [editNotes, setEditNotes] = useState("");

  function remove(id){
    if (!confirm("Excluir esta partida?")) return;
    setMatches(matches.filter(m => m.id !== id));
  }
  function openEdit(m) {
    setEditing(m);
    setEditA(m.scoreA);
    setEditB(m.scoreB);
    setEditNotes(m.notes || "");
  }
  function saveEdit() {
    setMatches(matches.map(x => x.id===editing.id ? { ...x, scoreA: Number(editA)||0, scoreB: Number(editB)||0, notes: editNotes } : x));
    setEditing(null);
  }

  return (
    <Stack spacing={2}>
      {matches.length===0 && (
        <Paper sx={{ p:3, textAlign:"center", borderRadius:3 }} variant="outlined">
          <Typography color="text.secondary">Sem partidas. Registre uma no menu “Partida”.</Typography>
        </Paper>
      )}
      {matches.slice().reverse().map(m=>(
        <Card key={m.id} sx={{ borderRadius: 3 }}>
          <CardContent>
            <Stack direction="row" justifyContent="space-between" alignItems="center">
              <Typography variant="body2" color="text.secondary">
                {new Date(m.date).toLocaleString()}
              </Typography>
              <Stack direction="row" spacing={1} alignItems="center">
                <Chip
                  label={`${m.scoreA} x ${m.scoreB}`}
                  color={m.scoreA>m.scoreB ? "primary" : m.scoreB>m.scoreA ? "success" : "default"}
                  variant="outlined"
                />
                <IconButton onClick={()=>openEdit(m)}><EditIcon /></IconButton>
                <IconButton color="error" onClick={()=>remove(m.id)}><Delete /></IconButton>
              </Stack>
            </Stack>

            <Grid container spacing={2} sx={{ mt:1 }}>
              <Grid item xs={12} md={6}>
                <Paper variant="outlined" sx={{ p:2, borderRadius:2 }}>
                  <Typography variant="subtitle2" sx={{ mb:1 }}>Time A</Typography>
                  <Table size="small">
                    <TableHead><TableRow><TableCell>Jogador</TableCell><TableCell>G</TableCell><TableCell>A</TableCell></TableRow></TableHead>
                    <TableBody>
                      {m.teamA.map(id=>(
                        <TableRow key={id}>
                          <TableCell>
                            <Stack direction="row" spacing={1} alignItems="center">
                              <Avatar src={m.rosterSnapshot?.[id]?.avatar || undefined} sx={{ width:24, height:24 }}>
                                {(m.rosterSnapshot?.[id]?.name || "?").slice(0,1).toUpperCase()}
                              </Avatar>
                              {m.rosterSnapshot?.[id]?.name || `Jogador ${id.slice(-4)}`}
                            </Stack>
                          </TableCell>
                          <TableCell>{m.stats?.[id]?.g || 0}</TableCell>
                          <TableCell>{m.stats?.[id]?.a || 0}</TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </Paper>
              </Grid>
              <Grid item xs={12} md={6}>
                <Paper variant="outlined" sx={{ p:2, borderRadius:2 }}>
                  <Typography variant="subtitle2" sx={{ mb:1 }}>Time B</Typography>
                  <Table size="small">
                    <TableHead><TableRow><TableCell>Jogador</TableCell><TableCell>G</TableCell><TableCell>A</TableCell></TableRow></TableHead>
                    <TableBody>
                      {m.teamB.map(id=>(
                        <TableRow key={id}>
                          <TableCell>
                            <Stack direction="row" spacing={1} alignItems="center">
                              <Avatar src={m.rosterSnapshot?.[id]?.avatar || undefined} sx={{ width:24, height:24 }}>
                                {(m.rosterSnapshot?.[id]?.name || "?").slice(0,1).toUpperCase()}
                              </Avatar>
                              {m.rosterSnapshot?.[id]?.name || `Jogador ${id.slice(-4)}`}
                            </Stack>
                          </TableCell>
                          <TableCell>{m.stats?.[id]?.g || 0}</TableCell>
                          <TableCell>{m.stats?.[id]?.a || 0}</TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </Paper>
              </Grid>
            </Grid>

            {m.notes && (
              <Box sx={{ mt:2 }}>
                <Divider sx={{ mb:1 }}/>
                <Typography variant="body2"><b>Notas:</b> {m.notes}</Typography>
              </Box>
            )}
          </CardContent>
        </Card>
      ))}

      {/* Dialog de edição */}
      <Dialog open={!!editing} onClose={()=>setEditing(null)} fullWidth maxWidth="xs">
        <DialogTitle>Editar partida</DialogTitle>
        <DialogContent>
          <Stack direction="row" spacing={2} sx={{ mt:1, mb:2 }}>
            <TextField label="Gols A" type="number" value={editA} onChange={e=>setEditA(e.target.value)} fullWidth />
            <TextField label="Gols B" type="number" value={editB} onChange={e=>setEditB(e.target.value)} fullWidth />
          </Stack>
          <TextField
            label="Notas"
            value={editNotes}
            onChange={e=>setEditNotes(e.target.value)}
            fullWidth multiline minRows={3}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={()=>setEditing(null)}>Cancelar</Button>
          <Button variant="contained" onClick={saveEdit}>Salvar</Button>
        </DialogActions>
      </Dialog>
    </Stack>
  );
}

/* =================== Ideias =================== */
function Ideias() {
  return (
    <Card sx={{ borderRadius: 3 }}>
      <CardHeader title="💡 Ideias / Roadmap" subheader="O que dá pra adicionar depois" />
      <CardContent>
        <ul style={{ margin: 0, paddingLeft: "1.2rem" }}>
          <li>Notas 1–10 por jogador e impacto no score</li>
          <li>Filtros por período (últimas N partidas) e por posição</li>
          <li>Exportar PDF do ranking e do histórico</li>
          <li>Compartilhar link somente-leitura</li>
          <li>Skins (dark/gramado) e avatar por jogador</li>
        </ul>
      </CardContent>
    </Card>
  );
}
