import { good } from "../../functions";

const apiRoute = "http://localhost:5001/test-d9104/us-central1"
const goodURL = apiRoute + "/good"

const firebaseConfig = {
  apiKey: "AIzaSyATFlc90BK6PjVqOXmy1nmpuvCvvsrR5og",
  authDomain: "test-d9104.firebaseapp.com",
  databaseURL: "https://test-d9104.firebaseio.com",
  projectId: "test-d9104",
  storageBucket: "test-d9104.appspot.com",
  messagingSenderId: "95028767661",
  appId: "1:95028767661:web:92b4940f598286d1c30f24"
};
firebase.initializeApp(firebaseConfig);


window.addEventListener("DOMContentLoaded", async function() {
    const goodButton = document.querySelector("#good_button")
    let clicked = false
    let clickable = true
    let goodCount = 0
    let standardValue = 0
    let multiClickValue = 0.3
    let defaultGoodCount, changable

    try {
        defaultGoodCount = await fetchGoodCount()
        changable = await fetchGoodChangeable()
    } catch(e) {
        showError(goodButton, 1, e)
    }

    goodButton.textContent = `Good: ${defaultGoodCount}`

    if (!changable) return

    // auth user
    firebase.auth().signInAnonymously().catch(function(error) {
        console.error("failed to auth user.")
        clickable = false
        showError(goodButton, 2, error)
    });

    goodButton.addEventListener("click", (e) => {
        if (!clickable) {
            console.log("not clickable. timeout or maximum.")
            return
        } else if (!clicked) {
            clicked = true
            goodButton.textContent = "Good: sending"
            window.setTimeout(async function() {
                clickable = false
                try {
                    await postGood(goodCount)
                } catch(e) {
                    showError(goodButton, 3, e)
                }
                goodButton.textContent = `Good: ${defaultGoodCount + goodCount}`
            }, 5000)
        }

        standardValue += multiClickValue
        goodCount += Math.ceil(standardValue)
        goodButton.textContent = `Good: ${defaultGoodCount} +${goodCount}`
    })
})

async function fetchGoodCount() {
    return 0
}

async function fetchGoodChangeable() {
    return true
}

function postGood(goodCount) {
    let url = encodeURIComponent(document.referrer)
    if (!url) {
        url = encodeURIComponent("https://hoge.example.com/test?test=fuga")
    }
    return fetch(goodURL, {
        method: "POST",
        headers: {
            "Content-Type": "application/json"
        },
        body: JSON.stringify({
            "url": url,
            "good_count": goodCount
        })
    }).then((res) => {
        if (!res.ok) throw Error("Network error is occur.")
    })
}

async function postError(error) {
    return
}

function showError(button, errorCode, error) {
    console.error(error)
    button.textContent = `error: ${errorCode}`
    postError(error)
}

