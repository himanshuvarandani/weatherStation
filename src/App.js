import React from 'react'
import Plot from 'react-plotly.js'

import './App.css'

import { withFirebase } from './Firebase'

const formatDate = (date) => ((date.getMonth()+1).toString()+"-"+date.getDate().toString()+"-"+date.getFullYear().toString())

const App = (props) => {
  const [loading, setLoading] = React.useState(true)
  const [readings, setReadings] = React.useState({})
  const [RoomTemp, setRoomTemp] = React.useState("")
  const [Humidity, setHumidity] = React.useState("")
  const [lightIntensity, setLightIntensity] = React.useState("")
  const [width, setWidth] = React.useState()
  const [height, setHeight] = React.useState()
  const [today, setToday] = React.useState(formatDate(new Date()))

  const setCurrentReadings = (readings) => {
    setToday(formatDate(new Date()))
    setRoomTemp("")
    setHumidity("")

    if (readings) {
      if (readings["Light Intensity"]) {
        if (readings["Light Intensity"][today]) {
          Object.keys(readings["Light Intensity"][today]).forEach((key) => {
            if (Number(key.replaceAll(':', '')) > Number(lightIntensity.replaceAll(':', ''))) {
              setLightIntensity(key)
            }
          })
        }
      }
    
      if ( readings["Room Temp"] && readings["Room Temp"][today]) {
        Object.keys(readings["Room Temp"][today]).forEach((key) => {
          if (Number(key.replaceAll(':', '')) > Number(RoomTemp.replaceAll(':', ''))) {
            setRoomTemp(key)
          }
        })
      }

      if ( readings.Humidity && readings.Humidity[today]) {
        Object.keys(readings.Humidity[today]).forEach((key) => {
          if (Number(key.replaceAll(':', '')) > Number(Humidity.replaceAll(':', ''))) {
            setHumidity(key)
          }
        })
      }
    }
  }

  React.useEffect(() => {
    if (window.innerWidth > 600) {
      setWidth(0.8*window.innerWidth)
      setHeight(0.4*window.innerWidth)
    } else {
      setWidth(0.9*window.innerWidth)
      setHeight(0.9*window.innerWidth)
    }

    
    props.firebase
      .readings()
      .on("value", (snapshot) => {
        console.log(snapshot.val());
        setReadings(snapshot.val())
        setCurrentReadings(snapshot.val())
        setLoading(false)
      })
  }, [])

  
  return (
    <div className="container">
      <br />
      <h1 className="text-center"><b>Weather Station</b></h1>

      <br />
      { !loading ? (readings ? (
        <div className="readings">
          <div>
            <h3>Weather</h3>
            
            <div className="text-center">
              <p>{ readings["Room Temp"] ? (readings["Room Temp"][today] ? readings["Room Temp"][today][RoomTemp] : "No readings") : "No readings" }</p>
              
              <br />
              <h5>{ readings["Light Intensity"] ? (readings["Light Intensity"][today] ? (readings["Light Intensity"][today][lightIntensity]>=400 ? "Day" : "Night" ) : "No readings") : "No readings" }</h5>
            </div>
          </div>
        </div>
      ) : "No readings.") : "Loading ..." }
      
      <br />
      { !loading ? (readings ? (
        <div className="d-flex flex-column align-items-center">
          { readings.Humidity ? (readings.Humidity[today] ? (
            <Plot
              data={[
                {
                  x: Object.keys(readings.Humidity[today]),
                  y: Object.values(readings.Humidity[today]),
                  type: 'scatter',
                  mode: 'lines+markers',
                  marker: {color: 'blue'},
                  line: { color: 'rgb(92, 131, 150)' }
                },
              ]}
              layout={ {width: width, height: height, title: 'Humidity Plot', margin: { l: 60, r: 30, pad: 4 }} }
            />
          ) : null) : null }
          
          <br />
          { readings["Room Temp"] ? (readings["Room Temp"][today] ? (
            <Plot
              data={[
                {
                  x: Object.keys(readings["Room Temp"][today]),
                  y: Object.values(readings["Room Temp"][today]),
                  type: 'scatter',
                  mode: 'lines+markers',
                  marker: {color: 'blue'},
                  line: { color: 'rgb(92, 131, 150)' }
                },
              ]}
              layout={ {width: width, height: height, title: 'Room Temperature Plot', margin: { l: 60, r: 30, pad: 4 }} }
            />
          ) : null) : null }
          
          <br />
        </div>
      ) : null) : "Loading ..." }
    </div>
  )
}

export default withFirebase(App)
