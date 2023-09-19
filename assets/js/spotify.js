let travelTime = 30;
let genreEl = document.getElementById('genre'); //The genre select element
let connectSpotifyEl = document.getElementById('connect-spotify'); //The button to search for tracks
let tracks = [];
var genreSelected = 'pop';
let url;

genreEl.addEventListener('change', function(event) {
	genreSelected = event.target.value;
	console.log(genreSelected);
	url = `https://spotify23.p.rapidapi.com/recommendations/?limit=50&seed_genres=${genreSelected}`;
})

console.log(url);
const options = {
	method: 'GET',
	headers: {
		'X-RapidAPI-Key': 'aba5c1c02emsh6e79445d4dbd7e9p188603jsnc5074fd8b954',
		'X-RapidAPI-Host': 'spotify23.p.rapidapi.com'
	}
};

async function searchTracks(thisUrl) {
	try {
		const response = await fetch(thisUrl, options);
		const result = await response.text();
		console.log(result);
	} catch (error) {
		console.error(error);
	}
}
searchTracks(url);
connectSpotifyEl.addEventListener('click', function(event) {
	console.log(genreSelected);
	let resultTracks = [];
	let tracksDuration = 0;
	let currentTrackIndex = 0;
	while (tracksDuration <= travelTime) {
		let currentTrack = thisResult.tracks[currentTrackIndex];
		let thisTrack = {
			name: currentTrack.name,
			artist: currentTrack.artists[0],
			duration: DurationInMinutes(currentTrack.duration_ms),
			url: currentTrack.external_urls[0]
		};
		resultTracks.push(thisTrack);
		currentTrackIndex++;
		tracksDuration += thisTrack.duration;
	}
	console.log(resultTracks);
})

function DurationInMinutes(duration) {
	let durationSeconds = duration / 1000;
	let durationMinutes = durationSeconds / 60;
	return durationMinutes;
}