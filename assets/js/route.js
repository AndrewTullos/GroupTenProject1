const myAPIKey = 'aae43d1f2f8f4ba8aceacce104a02fe4'
const fromWaypoint = [38.937165, -77.04559] // latutude, longitude
const toWaypoint = [38.881152, -76.990693] // latitude, longitude
const travelType = 'drive' // walk bicycle drive
const url = `https://api.geoapify.com/v1/routing?waypoints=${fromWaypoint.join(',')}|${toWaypoint.join(
	','
)}&mode=${travelType}&units=imperial&apiKey=${myAPIKey}`

fetch(url)
	.then((res) => res.json())
	.then(
		(data) => {
			timeSeconds = data.features[0].properties.time
			time = Math.round(timeSeconds / 60)
			// console.log(data)
			console.log(time)
			return time
		},
		(error) => console.log(err)
	)
