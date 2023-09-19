// Replace with your Geoapify API keys
const GEOAPIFY_API_KEY = 'aae43d1f2f8f4ba8aceacce104a02fe4'

// Initialize MaplibreGL map
const map = new maplibregl.Map({
	container: 'map',
	style: `https://maps.geoapify.com/v1/styles/klokantech-basic/style.json?apiKey=${GEOAPIFY_API_KEY}`,
	center: [-98, 30],
	zoom: 5
})

// Handle route finding
document.getElementById('find-route').addEventListener('click', () => {
	const startAddress = document.getElementById('start-address').value
	const endAddress = document.getElementById('end-address').value

	// Use Geoapify Autocomplete API to get place details
	fetch(`https://api.geoapify.com/v1/geocode/autocomplete?text=${startAddress}&apiKey=${GEOAPIFY_API_KEY}`)
		.then((response) => response.json())
		.then((startData) => {
			if (startData.features.length > 0) {
				const startCoordinates = startData.features[0].geometry.coordinates

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
								)}&mode=drive&details=route_details,elevation&units=imperial&apiKey=${GEOAPIFY_API_KEY}`
							)
								.then((response) => response.json())
								.then((data) => {
									console.log(data)
									routeData = data
									const steps = []
									const instructions = []
									const stepPoints = []
									coordinates = routeData.properties.waypoints
									console.log(coordinates)
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

									map.addSource('route', {
										type: 'geojson',
										data: routeData
									})

									map.addSource('points', {
										type: 'geojson',
										data: instructionsData
									})

									addLayerEvents()
									drawRoute()

									// Fit map to route
									map.fitBounds(coordinates, { padding: 10 })
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
		// }

		// if (document.getElementById('showDetails').checked) {
		map.getSource('route').setData(routeStepsData)
		map.addLayer({
			id: 'route-layer',
			type: 'line',
			source: 'route',
			layout: {
				'line-join': 'round',
				'line-cap': 'round'
			},
			paint: {
				'line-color': [
					'match',
					['get', 'road_class'],
					'motorway',
					'#009933',
					'trunk',
					'#00cc99',
					'primary',
					'#009999',
					'secondary',
					'#00ccff',
					'tertiary',
					'#9999ff',
					'residential',
					'#9933ff',
					'service_other',
					'#ffcc66',
					'unclassified',
					'#666699',
					/* other */
					'#666699'
				],
				'line-width': 8
			}
		})

		map.getSource('points').setData(stepPointsData)
		map.addLayer({
			id: 'points-layer',
			type: 'circle',
			source: 'points',
			paint: {
				'circle-radius': 4,
				'circle-color': '#ddd',
				'circle-stroke-color': '#aaa',
				'circle-stroke-width': 1
			}
		})
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

function addLayerEvents() {
	map.on('mouseenter', 'route-layer', () => {
		map.getCanvas().style.cursor = 'pointer'
	})

	map.on('mouseleave', 'route-layer', () => {
		map.getCanvas().style.cursor = ''
	})

	map.on('mouseenter', 'points-layer', () => {
		map.getCanvas().style.cursor = 'pointer'
	})

	map.on('mouseleave', 'points-layer', () => {
		map.getCanvas().style.cursor = ''
	})

	map.on('click', 'route-layer', (e) => {
		if (document.getElementById('showDetails').checked) {
			const stepData = e.features[0].properties
			const propertiesToShow = ['surface', 'elevation', 'elevation_gain']
			const dataToShow = {}
			propertiesToShow.forEach((property) => {
				if (stepData[property] || stepData[property] === 0) {
					dataToShow[property] = stepData[property]
				}
			})

			showPopup(dataToShow, e.lngLat)
		} else {
			showPopup(
				{
					distance: `${e.features[0].properties.distance} m`,
					time: `${e.features[0].properties.time} s`
				},
				e.lngLat
			)
		}
		e.preventDefault()
	})

	map.on('click', 'points-layer', (e) => {
		const properties = e.features[0].properties
		const point = e.features[0].geometry.coordinates

		if (properties.text) {
			popup.setText(properties.text)
			popup.setLngLat(point)
			popup.addTo(map)
			e.preventDefault()
		}
	})
}