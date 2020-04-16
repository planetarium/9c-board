import React from 'react';
import { BrowserRouter as Router, Switch, Route } from 'react-router-dom';
import { RankPage, StatePage } from "./pages";
import './App.css';

const App: React.FC = () => (
  <Router>
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
