import React, { Component } from 'react';
import { HashRouter as Router, Route } from 'react-router-dom';
import { Welcome } from './components/Welcome';
import { Game } from './components/Game';
import './App.css';
import 'semantic-ui-css/semantic.min.css'

class App extends Component {

  render() {
    return (
      <div className="App">
        <div className="ui container">
          <div className="background-image"></div>
          <Router>
            <Route path="/:id" component={Game} />
            <Route exact path="/" component={Welcome} />
          </Router>
        </div>
      </div>
    );
  }
}

export default App;
