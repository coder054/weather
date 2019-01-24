import React, { Component } from "react"
import axios from "axios"
import { config } from "../data/config"
import moment from "moment"
import { convertKelvinToCelsius } from "../helpers"
import update from "immutability-helper"

var LineChart = require("react-chartjs").Line

var chartOptions = {
	///Boolean - Whether grid lines are shown across the chart
	scaleShowGridLines: true,

	//String - Colour of the grid lines
	scaleGridLineColor: "rgba(0,0,0,.05)",

	//Number - Width of the grid lines
	scaleGridLineWidth: 1,

	//Boolean - Whether to show horizontal lines (except X axis)
	scaleShowHorizontalLines: true,

	//Boolean - Whether to show vertical lines (except Y axis)
	scaleShowVerticalLines: true,

	//Boolean - Whether the line is curved between points
	bezierCurve: true,

	//Number - Tension of the bezier curve between points
	bezierCurveTension: 0.4,

	//Boolean - Whether to show a dot for each point
	pointDot: true,

	//Number - Radius of each point dot in pixels
	pointDotRadius: 4,

	//Number - Pixel width of point dot stroke
	pointDotStrokeWidth: 1,

	//Number - amount extra to add to the radius to cater for hit detection outside the drawn point
	pointHitDetectionRadius: 20,

	//Boolean - Whether to show a stroke for datasets
	datasetStroke: true,

	//Number - Pixel width of dataset stroke
	datasetStrokeWidth: 2,

	//Boolean - Whether to fill the dataset with a colour
	datasetFill: true,

	//String - A legend template
	legendTemplate:
		'<ul class="<%=name.toLowerCase()%>-legend"><% for (var i=0; i<datasets.length; i++){%><li><span style="background-color:<%=datasets[i].strokeColor%>"><%if(datasets[i].label){%><%=datasets[i].label%><%}%></span></li><%}%></ul>',

	//Boolean - Whether to horizontally center the label and point dot inside the grid
	offsetGridLines: false,
}

class ForecastOneCity extends Component {
	state = {
		loaded: false,
		dataForecast: {},
		day: "today",
		chartData: {
			labels: [
				"00:00",
				"03:00",
				"06:00",
				"09:00",
				"12:00",
				"15:00",
				"18:00",
				"21:00",
			],
			datasets: [
				{
					label: "Temperature",
					fillColor: "rgba(220,220,220,0.2)",
					strokeColor: "rgba(220,220,220,1)",
					pointColor: "rgba(220,220,220,1)",
					pointStrokeColor: "#fff",
					pointHighlightFill: "#fff",
					pointHighlightStroke: "rgba(220,220,220,1)",
					data: [10, 66, 59, 80, 81, 56, 55, 40],
				},
				{
					label: "Humidity",
					fillColor: "rgba(151,187,205,0.2)",
					strokeColor: "rgba(151,187,205,1)",
					pointColor: "rgba(151,187,205,1)",
					pointStrokeColor: "#fff",
					pointHighlightFill: "#fff",
					pointHighlightStroke: "rgba(151,187,205,1)",
					data: [1, 28, 48, 40, 19, 86, 27, 90],
				},
			],
		},
	}

	componentDidUpdate(prevProps, prevState) {
		// only update chart if the data has changed
		if (prevProps.match.params.cityname !== this.props.match.params.cityname) {
			this.fetchData()
		}
	}

	async fetchData() {
		this.setState({ loaded: false })
		let today = moment().format("YYYY-MM-DD")
		let day2 = moment(new Date())
			.add(1, "days")
			.format("YYYY-MM-DD")
		let day3 = moment(new Date())
			.add(2, "days")
			.format("YYYY-MM-DD")
		let day4 = moment(new Date())
			.add(3, "days")
			.format("YYYY-MM-DD")
		let day5 = moment(new Date())
			.add(4, "days")
			.format("YYYY-MM-DD")

		this.setState({ today, day2, day3, day4, day5 })

		let cityname = this.props.match.params.cityname
		console.log("fetch data for" + cityname)

		try {
			let forecastData = await axios.get(
				`${config.root_url_5days_forecast}?appid=${
					config.app_key
				}&q=${cityname}`
			)
			this.setState({ dataForecast: forecastData })
			this.caculateData()
			this.setState({ show: true })
			this.setState({ loaded: true })
			this.setState({ cityNotFound: false })
		} catch (err) {
			console.log(err)
			this.setState({ cityNotFound: true, loaded: true })
		}
		console.log(this.state)
	}

	async componentDidMount() {
		console.log("cwm")
		this.fetchData()
	}

	async caculateData() {
		let day = this.state[this.state.day]

		let dataList = this.state.dataForecast.data.list.filter(item => {
			return item.dt_txt.includes(day)
		})

		let tempList = []
		let humidityList = []

		for (let i = 0; i < dataList.length; i++) {
			tempList.push(convertKelvinToCelsius(dataList[i].main.temp))
			humidityList.push(dataList[i].main.humidity)
		}

		if (this.state.day == "today") {
			for (let i = 0; i < 8 - dataList.length; i++) {
				tempList.unshift(null)
				humidityList.unshift(null)
			}
		}

		let newState = update(this.state, {
			chartData: {
				datasets: {
					[0]: { data: { $set: tempList } },
					[1]: { data: { $set: humidityList } },
				},
			},
		})

		this.setState(newState)
	}

	async changeDay(day) {
		await this.setState({ day })
		this.caculateData()
	}

	renderContent() {
		if (!this.state.loaded) {
			return <div>Fetching data...</div>
		} else {
			if (this.state.cityNotFound) {
				return <div>City not found</div>
			} else {
				return (
					<div>
						<p className="title">
							Weather Forecast for{" "}
							<span className="cityname">
								{this.props.match.params.cityname}
							</span>{" "}
							in 5 days
						</p>
						{this.state.show ? (
							<LineChart
								data={this.state.chartData}
								options={chartOptions}
								width="900"
								height="450"
							/>
						) : (
							<div> Loading... </div>
						)}

						<div>
							<button
								onClick={() => {
									this.changeDay("today")
								}}
								className="btn btn-info mr-2"
							>
								{" "}
								{this.state.today}{" "}
							</button>
							<button
								onClick={() => {
									this.changeDay("day2")
								}}
								className="btn btn-info mr-2"
							>
								{" "}
								{this.state.day2}{" "}
							</button>
							<button
								onClick={() => {
									this.changeDay("day3")
								}}
								className="btn btn-info mr-2"
							>
								{" "}
								{this.state.day3}{" "}
							</button>
							<button
								onClick={() => {
									this.changeDay("day4")
								}}
								className="btn btn-info mr-2"
							>
								{" "}
								{this.state.day4}{" "}
							</button>
							<button
								onClick={() => {
									this.changeDay("day5")
								}}
								className="btn btn-info mr-2"
							>
								{" "}
								{this.state.day5}{" "}
							</button>
						</div>

						<div>
							{" "}
							Day: {this.state[this.state.day]} - ({this.state.day}){" "}
						</div>
					</div>
				)
			}
		}
	}

	render() {
		return <div className="ForecastOneCity-wrapper">{this.renderContent()}</div>
	}
}

export default ForecastOneCity
