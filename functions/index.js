const functions = require('firebase-functions');
const admin = require('firebase-admin')
admin.initializeApp();

const FieldValue = admin.firestore.FieldValue
let sitesCol = admin.firestore().collection('sites')

exports.incrementGood = functions.https.onCall(async (data, context) => {
  const siteUrl = data["url"]
  const goodCount = data["goodCount"]
  if (!siteUrl) {
    throw Error("Value error. No url in request.")
  } else if (isNaN(goodCount)) {
    throw Error("Value error. good_count is NaN.")
  }
  let siteDoc = await getSiteDocument(siteUrl)
  await incrementSiteDocument(siteUrl, goodCount)
  return
});

// function onGet(req, resp) {
//   const url_encoded = req.query['url_encoded']
//   if (url_encoded == undefined || url_encoded == '') {
//     return res.send("Error: Value error. No url in request.")
//   }
//   let site_doc = await getSiteDocument(url_encoded)
//   return res.send(site_doc.good_count)
// }

// function checkUpdatable(client_access_log) {
//   if (!client_access_log.exists) {
//     return true
//   }
//   const now = new Date().getTime()
//   const last_modified = Date.parse(client_access_log.timestamp).getTime()
//   const day = 86400000
//   return now - last_modified > day
// }

async function getSiteDocument(siteUrl) {
  let siteDoc = await sitesCol.doc(siteUrl).get()
  if (siteDoc.exists) {
    return siteDoc
  } else {
    return await initSiteDocument(siteUrl)
  }
}

function initSiteDocument(siteUrl) {
  return sitesCol.doc(siteUrl).set({
    goodCount: 0
  }).then(() => {
    return {"goodCount": 0}
  })
}

function incrementSiteDocument(site_url, goodCount) {
  sitesCol.doc(site_url).update({"goodCount": FieldValue.increment(goodCount)})
  // sitesCol.doc(url_encoded).collection("access_log").doc(ip_adress).update([{"timestamp": FieldValue.timestamp}])
  // goodsCol.add({"good_count": good_count, "ip_adress": client_ip, "timestamp": FieldValue.timestamp})
}

// function getAccessLog(url_encoded, ip_adress) {
//   return sitesCol.doc(url_encoded).collection("access_log").doc(ip_adress).get()
// }



