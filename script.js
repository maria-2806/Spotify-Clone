let currentsong = new Audio();
let songs;
let currFolder;

async function getSongs(folder) {
    currFolder = folder;
    let a = await fetch(`/${folder}/`);
    let response = await a.text();
    let div = document.createElement("div");
    div.innerHTML = response;
    let as = div.getElementsByTagName("a");
    songs = [];
    for (let index = 0; index < as.length; index++) {
        const element = as[index];
        if (element.href.endsWith(".mp3")) {
            songs.push(element.href.split(`/${folder}/`)[1]);
        }
    }

    let songUL = document.querySelector(".songList").getElementsByTagName("ul")[0];
    songUL.innerHTML = "";
    for (const song of songs) {
        let songName = song.replaceAll("%20", " ").replace(".mp3", ""); // Remove .mp3
        let [artist, title] = songName.split(" - "); // Split by " - "

        songUL.innerHTML += `<li data-song="${song}">
            <img class="invert" src="music-note-03-stroke-rounded.svg" alt="">
            <div class="info">
                <div>${title}</div> <!-- Song title -->
                <div>${artist}</div> <!-- Artist name -->
            </div>
            <div class="playnow">
                <img id="leftplay" src="playicon.svg" alt="">
            </div>
        </li>`;
    }

    Array.from(document.querySelector(".songList").getElementsByTagName("li")).forEach(e => {
        e.addEventListener("click", element => {
            let song = e.getAttribute("data-song");
            playMusic(song);
        });
    });
    return songs;
}

const playMusic = (track) => {
    document.querySelector(".playbar").style.display = "block";
    currentsong.src = `${currFolder}/` + track;

    currentsong.play();

    play.src = "pause.svg";
    let songName = track.replaceAll("%20", " ").replace(".mp3", ""); // Remove .mp3
    let [artist, title] = songName.split(" - "); // Split by " - "
    document.querySelector(".songinfo").innerHTML = `<div>${title}</div><div>${artist}</div>`; // Display song title and artist separately
    document.querySelector(".songtime").innerHTML = "00:00";
}

function secondsToMinutesSeconds(seconds) {
    if (isNaN(seconds) || seconds < 0) {
        return "00:00";
    }

    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = Math.floor(seconds % 60);

    const formattedMinutes = String(minutes).padStart(2, '0');
    const formattedSeconds = String(remainingSeconds).padStart(2, '0');

    return `${formattedMinutes}:${formattedSeconds}`;
}

async function displayAlbums() {
    console.log("displaying albums");
    let a = await fetch(`/songs/`);
    let response = await a.text();
    let div = document.createElement("div");
    div.innerHTML = response;
    let anchors = div.getElementsByTagName("a");
    let cardContainer = document.querySelector(".cardContainer");
    let array = Array.from(anchors);
    for (let index = 0; index < array.length; index++) {
        const e = array[index];
        if (e.href.includes("/songs") && !e.href.includes(".htaccess")) {
            let folder = e.href.split("/").slice(-2)[0];
            let a = await fetch(`/songs/${folder}/info.json`);
            let response = await a.json();
            cardContainer.innerHTML += ` <div data-folder="${folder}" class="card">
                <div class="play">
                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="36" height="36" fill="none">
                        <circle cx="12" cy="12" r="12" fill="#00C000" />
                        <polygon points="9,7 9,17 17,12" fill="#000000" />
                    </svg>
                </div>
                <img src="/songs/${folder}/cover.jpeg" alt="">
                <h2>${response.title}</h2>
                <p>${response.description}</p>
            </div>`;
        }
    }

    Array.from(document.getElementsByClassName("card")).forEach(e => {
        e.addEventListener("click", async item => {
            songs = await getSongs(`songs/${item.currentTarget.dataset.folder}`);
            playMusic(songs[0]);
        });
    });
}

async function main() {
    await getSongs("songs/ncs");
    await displayAlbums();

    play.addEventListener("click", () => {
        if (currentsong.paused) {
            currentsong.play();
            play.src = "pause.svg";
        } else {
            currentsong.pause();
            play.src = "playicon.svg";
        }
    });

    currentsong.addEventListener("timeupdate", () => {
        document.querySelector(".songtime").innerHTML = `${secondsToMinutesSeconds(currentsong.currentTime)}/${secondsToMinutesSeconds(currentsong.duration)}`;
        document.querySelector(".circle").style.width = (currentsong.currentTime / currentsong.duration) * 100 + "%";
    });

    document.querySelector(".seekbar").addEventListener("click", e => {
        let percent = (e.offsetX / e.target.getBoundingClientRect().width) * 100;
        document.querySelector(".circle").style.width = (e.offsetX / e.target.getBoundingClientRect().width) * 100 + "%";
        currentsong.currentTime = ((currentsong.duration) * percent) / 100;
    });

    document.querySelector(".hamburger").addEventListener("click", () => {
        document.querySelector(".left").style.left = 0;
    });

    document.querySelector(".close").addEventListener("click", () => {
        document.querySelector(".left").style.left = "-100%";
    });

    previous.addEventListener("click", () => {
        currentsong.pause();
        let index = songs.indexOf(currentsong.src.split("/").slice("-1")[0]);

        if ((index - 1) >= 0)
            playMusic(songs[index - 1]);
    });

    next.addEventListener("click", () => {
        currentsong.pause();
        let index = songs.indexOf(currentsong.src.split("/").slice("-1")[0]);

        if ((index + 1) < songs.length)
            playMusic(songs[index + 1]);
    });

    document.querySelector(".range").getElementsByTagName("input")[0].addEventListener("change", (e) => {
        currentsong.volume = parseInt(e.target.value) / 100;
        if (currentsong.volume > 0) {
            document.querySelector(".volume>img").src = document.querySelector(".volume>img").src.replace("mute.svg", "volume.svg");
        }
    });

    document.querySelector(".volume>img").addEventListener("click", e => {
        if (e.target.src.includes("volume.svg")) {
            e.target.src = e.target.src.replace("volume.svg", "mute.svg");
            currentsong.volume = 0;
            document.querySelector(".range").getElementsByTagName("input")[0].value = 0;
        } else {
            e.target.src = e.target.src.replace("mute.svg", "volume.svg");
            currentsong.volume = .10;
            document.querySelector(".range").getElementsByTagName("input")[0].value = 10;
        }
    });
}

main();
