import React, { Component } from "react"
import axios from "axios"
import randomCities from '../data/randomCities';
import { config } from '../data/config';


class Home extends Component {
	state = {
		weatherList: [],
	}
	componentWillMount() {
		let requestList = []
		for (let i = 0; i < randomCities.length; i++) {
			let { name, country } = randomCities[i]
			requestList.push(
				axios.get(
					`${config.root_url_current_weather}?appid=${
						config.app_key
					}&q=${name},${country}`
				)
			)
		}

		Promise.all(requestList)
			.then(values => {
				console.log(values)
				this.setState({ weatherList: values })
			})
			.catch(err => console.log(err))
	}

	render() {
		return (
			<div className="App">
				<ul>
					{this.state.weatherList.length && this.state.weatherList
						? this.state.weatherList.map((item, key) => (
								<li key={key}> {item.data.main.temp}s </li>
						  ))
						: null}
				</ul>
			</div>
		)
	}
}

export default Home
