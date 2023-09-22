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
	while (tracksDuration <= travelTime && currentTrackIndex < 50) {
		//  Add tracks until the travel time is reached by the added duration of the songs
		let currentTrack = thisResult.tracks[currentTrackIndex]
		let thisTrack = {
			//  Create the new track object with all the required information
			name: currentTrack.name,
			album: currentTrack.album.name,
			image: currentTrack.album.images[2].url,
			artist: currentTrack.artists[0].name,
			duration: songLength(currentTrack.duration_ms),
			url: currentTrack.external_urls.spotify
		}
		resultTracks.push(thisTrack) //  Add the created track to the list of output tracks
		currentTrackIndex++ //  Aggregate the variable for the index in the results
		tracksDuration += DurationInMinutes(currentTrack.duration_ms)
	}
	DisplayTracks(resultTracks)
}

function DisplayTracks(tracks) {
	const trackContainer = document.getElementById('playlist-container')
	const tableBodyEl = document.getElementById('table-body')
	tableBodyEl.innerHTML = '' // Clear previous content
	trackContainer.classList.remove('hidden')

	for (const track of tracks) {
		const row = document.createElement('tr')
		row.className = 'bg-white border-b dark:bg-gray-900 dark:border-gray-700'
		row.innerHTML = `
		<td class="px-2">${track.name}</td>
		<td class="px-6">${track.artist}</td>
		<td
			scope="row"
			class="px-1 py-1 font-medium float-right text-gray-900 whitespace-nowrap dark:text-white">
			<img
			class="w-[64px]"
			src=${track.image}
			alt="album art" />
		</td>
		<td class="px-4">${track.album}</td>
		<td class="px-2">${track.duration}</td>
		<td class="px-2">
			<a
				href="${track.url}"
				class="font-medium text-blue-600 dark:text-blue-500 hover:underline"
			>Song</a
			>
		</td>
		`

		tableBodyEl.appendChild(row)
	}
}
//  Convert ms to min:sec output
function songLength(duration) {
	let minutes = Math.floor(duration / 60000)
	let seconds = ((duration % 60000) / 1000).toFixed(0)
	let songTime = seconds == 60 ? minutes + 1 + ':00' : minutes + ':' + (seconds < 10 ? '0' : '') + seconds
	return songTime
}

function DurationInMinutes(duration) {
	let durationSeconds = duration / 1000
	let durationMinutes = durationSeconds / 60
	return durationMinutes
}
