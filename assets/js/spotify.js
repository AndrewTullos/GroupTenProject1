const genreEl = document.getElementById('genre') //  The genre select element
const genre = genreEl.options[genreEl.selectedIndex].value
const trackContainer = document.getElementById('track-container')
const url = `https://spotify23.p.rapidapi.com/recommendations/?limit=50&seed_genres=${genre}`

let tracks = []

const options = {
	method: 'GET',
	headers: {
		'X-RapidAPI-Key': 'aba5c1c02emsh6e79445d4dbd7e9p188603jsnc5074fd8b954',
		'X-RapidAPI-Host': 'spotify23.p.rapidapi.com'
	}
}
//  Will be called to search for the tracks with the url defined based on the genre selected.
async function searchTracks(thisUrl) {
	try {
		const response = await fetch(thisUrl, options)
		const result = await response.json()
		return result
	} catch (error) {
		console.error(error)
	}
}

async function GeneratePlaylist(travelTime) {
	let thisResult = await searchTracks(url) //  Get the result based of the url designated
	let resultTracks = []
	let tracksDuration = 0
	let currentTrackIndex = 0
	while (tracksDuration <= travelTime) {
		//  Add tracks until the travel time is reached by the added duration of the songs
		let currentTrack = thisResult.tracks[currentTrackIndex]
		let thisTrack = {
			//  Create the new track object with all the required information
			name: currentTrack.name,
			artist: currentTrack.artists[0].name,
			duration: DurationInMinutes(currentTrack.duration_ms),
			url: currentTrack.external_urls.spotify
		}
		resultTracks.push(thisTrack) //  Add the created track to the list of output tracks
		currentTrackIndex++ //  Aggregate the variable for the index in the results
		tracksDuration += thisTrack.duration
	}
	DisplayTracks(resultTracks)
}

function DisplayTracks(tracks) {
	const trackContainer = document.getElementById('track-container'); // Assuming the container's ID is 'track-container'
	trackContainer.innerHTML = ''; // Clear previous content

	for (const track of tracks) {
		const element = document.createElement('p');
		element.textContent = `${track.name} by ${track.artist} - ${track.duration.toFixed('2')} mins\nlink: ${track.url}\n\n`;
		trackContainer.appendChild(element);
	}
}


function DurationInMinutes(duration) {
	let durationSeconds = duration / 1000
	let durationMinutes = durationSeconds / 60
	return durationMinutes
}
