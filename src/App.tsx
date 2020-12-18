import React from 'react';
import { BrowserRouter as Router, Switch, Route, Link } from 'react-router-dom';
import { RankPage, StatePage } from "./pages";
import './App.css';
import styled from "styled-components";

import { ApolloProvider, ApolloClient, InMemoryCache } from '@apollo/client';

const TopMenuBar = styled.div`
  height: 30px;
  padding: 5px 0;
  border-bottom: solid black 1px;
`;

const TopMenuLink = styled(Link)`
  padding: 0 10px;
  font-size: 20px;
  width: 20px;
  text-align: center;
  display: block;
  text-decoration: none;
  color: black;
`;

const client = new ApolloClient({
  uri: "http://localhost:43114/graphql",
  cache: new InMemoryCache(),
});

const App: React.FC = () => (
  <Router>
    <ApolloProvider client={client}>
      <TopMenuBar>
        <TopMenuLink to="/rank">Rank</TopMenuLink>
      </TopMenuBar>
      <Switch>
        <Route path="/rank">
          <RankPage />
        </Route>
        <Route path="/state/:address">
          <StatePage />
        </Route>
      </Switch>
    </ApolloProvider>
  </Router>
)

export default App;
