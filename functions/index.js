const functions = require('firebase-functions');
const admin = require('firebase-admin')
admin.initializeApp();

const FieldValue = admin.firestore.FieldValue
let sitesCol = admin.firestore().collection('sites')
// let goodsCol = admin.firestore().collection('goods')

exports.good = functions.https.onRequest(async (request, response) => {
  const method = request.method
  switch (method) {
    case "GET":
      return onGet(request, response)
    case "POST":
      return onPost(request, response)
    default:
      return response.send("Error: Unknown method.")
  }
});

// function onGet(req, resp) {
//   const url_encoded = req.query['url_encoded']
//   if (url_encoded == undefined || url_encoded == '') {
//     return res.send("Error: Value error. No url in request.")
//   }
//   let site_doc = await getSiteDocument(url_encoded)
//   return res.send(site_doc.good_count)
// }

async function onPost(req, res) {
  const site_url = req.body['url']
  const good_count = Number(req.body.good_count)

  if (site_url == undefined || site_url == '') {
    return res.send("Error: Value error. No url in request.")
  }
  if (good_count == NaN) {
    return res.send("Error: Value error. good_count is NaN.")
  }

  let site_doc = await getSiteDocument(site_url)
  // let access_log = await getAccessLog(url_encoded, client_ip)

  // if (checkUpdatable(access_log)){
  await incrementSiteDocument(site_url, good_count)
  return res.send("OK")
  // }
}

// function checkUpdatable(client_access_log) {
//   if (!client_access_log.exists) {
//     return true
//   }
//   const now = new Date().getTime()
//   const last_modified = Date.parse(client_access_log.timestamp).getTime()
//   const day = 86400000
//   return now - last_modified > day
// }

async function getSiteDocument(site_url) {
  let site_doc = await sitesCol.doc(site_url).get()
  if (site_doc.exists) {
    return site_doc
  } else {
    return await initSiteDocument(site_url)
  }
}

function initSiteDocument(site_url) {
  return sitesCol.doc(site_url).set({
    good_count: 0
  }).then(() => {
    return {"good_count": 0}
  })
}

function incrementSiteDocument(site_url, good_count) {
  sitesCol.doc(site_url).update({"good_count": FieldValue.increment(good_count)})
  // sitesCol.doc(url_encoded).collection("access_log").doc(ip_adress).update([{"timestamp": FieldValue.timestamp}])
  // goodsCol.add({"good_count": good_count, "ip_adress": client_ip, "timestamp": FieldValue.timestamp})
}

// function getAccessLog(url_encoded, ip_adress) {
//   return sitesCol.doc(url_encoded).collection("access_log").doc(ip_adress).get()
// }



