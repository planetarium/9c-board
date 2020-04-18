import React from 'react';
import { BrowserRouter as Router, Switch, Route, Link } from 'react-router-dom';
import { RankPage, StatePage } from "./pages";
import './App.css';

const App: React.FC = () => (
  <Router>
    <div style={{height: "30px", padding: "5px 0", borderBottom: "solid black 1px"}}>
      <Link to="/rank" style={{padding: "0 10px", fontSize: "20px", width: "20px", textAlign: "center", display: "block", textDecoration: "none", color: "black"}}>Rank</Link>
    </div>
    <Switch>
      <Route path="/rank">
        <RankPage />
      </Route>
      <Route path="/state/:address">
        <StatePage />
      </Route>
    </Switch>
  </Router>
)

export default App;
