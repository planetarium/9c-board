import React, { useState } from 'react';
import { BrowserRouter as Router, Switch, Route, Link } from 'react-router-dom';
import { RankPage, StatePage } from "./pages";
import './App.css';
import styled from "styled-components";

import { ApolloProvider, ApolloClient, InMemoryCache, HttpLink } from '@apollo/client';

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

const UrlHostInput = styled.input`
  width: 20%;
  float: right;
`;

const GRAPHQL_ENDPOINT_KEY = "graphql-endpoint";
const DEFAULT_GRAPHQL_ENDPOINT = "/graphql";

const client = new ApolloClient({
  link: new HttpLink({
    uri: localStorage.getItem(GRAPHQL_ENDPOINT_KEY) ?? DEFAULT_GRAPHQL_ENDPOINT,
  }),
  cache: new InMemoryCache()
});

const App: React.FC = () => {
  const [graphQLEndpoint, setGraphQLEndpoint] = useState<string>(localStorage.getItem(GRAPHQL_ENDPOINT_KEY) ?? "/graphql");
  const onUrlChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const changedInputValue = event.target.value;
    if (changedInputValue !== null) {
      localStorage.setItem(GRAPHQL_ENDPOINT_KEY, changedInputValue);
      client.setLink(new HttpLink({
        uri: changedInputValue
      }))
      setGraphQLEndpoint(changedInputValue);
    }
  };

  return (
    <Router>
      <ApolloProvider client={client}>
        <TopMenuBar>
          <UrlHostInput value={graphQLEndpoint} onChange={onUrlChange} />
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
}

export default App;
