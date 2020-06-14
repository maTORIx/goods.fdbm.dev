// firebase settings
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
const cloudFunc = {
    increment: firebase.functions().httpsCallable("incrementGood"),
    getStatus: firebase.functions().httpsCallable("getGood")
}
if (location.hostname == "localhost") {
    firebase.functions().useFunctionsEmulator("http://localhost:5001");
}

let url = encodeURIComponent(document.referrer)
if (url == "") url = encodeURIComponent("https://test.example.com/fizz/buzz?huga=hoge")

window.addEventListener("DOMContentLoaded", async function() {
    const goodButton = document.querySelector("#good_button")
    let clicked = false
    let clickable = true
    let goodCount = 0
    let standardValue = 0
    let multiClickValue = 0.3
    let defaultGoodCount, updatable

    // fetch data
    try {
        let result = await cloudFunc.getStatus({"url": url})
        console.log(result.data)
        defaultGoodCount = result.data.goodCount
        updatable = result.data.updatable
    } catch(e) {
        showError(goodButton, 1, e)
    }
    goodButton.textContent = `Good: ${defaultGoodCount}`
    if (!updatable) {
        return
    }

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


function postGood(goodCount) {
    return cloudFunc.increment({"url": url, "goodCount": goodCount})
}

async function postError(error) {
    return
}

function showError(button, errorCode, error) {
    console.error(error)
    button.textContent = `error: ${errorCode}`
    postError(error)
}

