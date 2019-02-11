import React, { Component } from "react"

import "./App.css"
import { BrowserRouter as Router, Route, Switch } from "react-router-dom"
import Notfound from "./components/Notfound"
import ForecastOneCity from "./components/ForecastOneCity"
import Home from "./components/Home"
import Header from './components/Header';
import Question from './components/Question';
import "bootstrap/dist/css/bootstrap.css"


class App extends Component {
	render() {
		return (
			<Router>
				<div className="App container">
					<Header></Header>
					<Switch>
						<Route path="/forecast/:cityname" component={ForecastOneCity} />
						<Route path="/question/:id" component={Question} />
						<Route path="/" exact component={Home} />
						<Route exact path="*" component={Notfound} />
					</Switch>
				</div>
			</Router>
		)
	}
}

export default App
