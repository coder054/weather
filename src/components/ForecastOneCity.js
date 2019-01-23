import React, {Component} from 'react'

class ForecastOneCity extends Component{
	componentWillMount(){
		console.log(this.props )
	}

  render(){
    return (
      <div className="ForecastOneCity-wrapper">
        ForecastOneCity: citiname {this.props.match.params.cityname }
      </div>
    )
  }
}

export default ForecastOneCity