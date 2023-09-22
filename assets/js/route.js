// Replace with your Geoapify API keys
const GEOAPIFY_API_KEY = 'aae43d1f2f8f4ba8aceacce104a02fe4'

// Initialize MaplibreGL map
const map = new maplibregl.Map({
	container: 'map',
	style: `https://maps.geoapify.com/v1/styles/klokantech-basic/style.json?apiKey=${GEOAPIFY_API_KEY}`,
	center: [-98, 30],
	zoom: 4
})

// Handle route finding
document.getElementById('generate').addEventListener('click', (e) => {
	e.preventDefault()
	const startAddressEl = document.getElementById('start-address')
	const endAddressEl = document.getElementById('end-address')
	const travelTypeEl = document.getElementById('travel-type')
	const startAddress = startAddressEl.value
	const endAddress = endAddressEl.value
	const travelType = travelTypeEl.options[travelTypeEl.selectedIndex].value
	// Validate address inputs
	if (startAddress === '' || endAddress === '') {
		startAddressEl.value = ''
		endAddressEl.value = ''
		return
	}
	//  Reset form inputs
	startAddressEl.value = ''
	endAddressEl.value = ''
	travelTypeEl.selectedIndex = 0

	// Use Geoapify Autocomplete API to get place details
	// Fetch starting address
	fetch(`https://api.geoapify.com/v1/geocode/autocomplete?text=${startAddress}&apiKey=${GEOAPIFY_API_KEY}`)
		.then((response) => response.json())
		.then((startData) => {
			if (startData.features.length > 0) {
				const startCoordinates = startData.features[0].geometry.coordinates
				//  Fetch ending address
				fetch(`https://api.geoapify.com/v1/geocode/autocomplete?text=${endAddress}&apiKey=${GEOAPIFY_API_KEY}`)
					.then((response) => response.json())
					.then((endData) => {
						if (endData.features.length > 0) {
							const endCoordinates = endData.features[0].geometry.coordinates

							// Use Geoapify Route API to get route data
							fetch(
								`https://api.geoapify.com/v1/routing?waypoints=lonlat:${startCoordinates.join(
									','
								)}|lonlat:${endCoordinates.join(
									','
								)}&mode=${travelType}&details=route_details,elevation&units=imperial&apiKey=${GEOAPIFY_API_KEY}`
							)
								.then((response) => response.json())
								.then((data) => {
									routeData = data
									let travelTime = routeData.features[0].properties.time / 60
									const steps = []
									const instructions = []
									const stepPoints = []
									coordinates = routeData.properties.waypoints
									routeData.features[0].properties.legs.forEach((leg, legIndex) => {
										const legGeometry = routeData.features[0].geometry.coordinates[legIndex]
										leg.steps.forEach((step, index) => {
											if (step.instruction) {
												instructions.push({
													type: 'Feature',
													geometry: {
														type: 'Point',
														coordinates: legGeometry[step.from_index]
													},
													properties: {
														text: step.instruction.text
													}
												})
											}

											if (index !== 0) {
												stepPoints.push({
													type: 'Feature',
													geometry: {
														type: 'Point',
														coordinates: legGeometry[step.from_index]
													},
													properties: step
												})
											}

											if (step.from_index === step.to_index) {
												// destination point
												return
											}

											const stepGeometry = legGeometry.slice(step.from_index, step.to_index + 1)
											steps.push({
												type: 'Feature',
												geometry: {
													type: 'LineString',
													coordinates: stepGeometry
												},
												properties: step
											})
										})
									})

									routeStepsData = {
										type: 'FeatureCollection',
										features: steps
									}

									instructionsData = {
										type: 'FeatureCollection',
										features: instructions
									}

									stepPointsData = {
										type: 'FeatureCollection',
										features: stepPoints
									}

									if (map.getLayer('route-layer')) {
										map.removeLayer('route-layer')
										map.removeSource('route')
								
									}

									if (map.getLayer('points-layer')) {
										map.removeLayer('points-layer')
										map.removeSource('points')
								
									}

									map.addSource('route', {
										type: 'geojson',
										data: routeData
									})

									map.addSource('points', {
										type: 'geojson',
										data: instructionsData
									})

									//  Call drawRoute()
									drawRoute()
									

									// Fit map to route
									map.fitBounds(coordinates, { padding: 10 })

									//  Call generatePlaylist() in spotify.js
									GeneratePlaylist(travelTime)
									// Reset genre input
									genreEl.selectedIndex = 0
									
								})
								.catch((error) => console.error(error))
						} else {
							console.error('End address not found.')
						}
					})
					.catch((error) => console.error(error))
			} else {
				console.error('Start address not found.')
			}
		})
		.catch((error) => console.error(error))
})

function drawRoute() {
	if (!routeData) {
		return
	}

	if (map.getLayer('route-layer')) {
		map.removeLayer('route-layer')

	}

	if (map.getLayer('points-layer')) {
		map.removeLayer('points-layer')
		
	} else {
		map.getSource('route').setData(routeData)
		map.addLayer({
			id: 'route-layer',
			type: 'line',
			source: 'route',
			layout: {
				'line-cap': 'round',
				'line-join': 'round'
			},
			paint: {
				'line-color': '#6084eb',
				'line-width': 8
			},
			filter: ['==', '$type', 'LineString']
		})

		map.getSource('points').setData(instructionsData)
		map.addLayer({
			id: 'points-layer',
			type: 'circle',
			source: 'points',
			paint: {
				'circle-radius': 4,
				'circle-color': '#fff',
				'circle-stroke-color': '#aaa',
				'circle-stroke-width': 1
			}
		})
	}
}
