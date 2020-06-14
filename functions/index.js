const functions = require('firebase-functions');
const admin = require('firebase-admin')
admin.initializeApp();

const FieldValue = admin.firestore.FieldValue
let sitesCol = admin.firestore().collection('sites')
let goodsCol = admin.firestore().collection('goods')

exports.incrementGood = functions.https.onCall(async (data, context) => {
  const siteUrl = data["url"]
  const goodCount = data["goodCount"]
  const uid = getUid(context)
  if (!siteUrl) {
    throw Error("Value error. No url in request.")
  } else if (isNaN(goodCount)) {
    throw Error("Value error. good_count is NaN.")
  }
  
  const siteDoc = await getSiteDocument(siteUrl, uid)
  if (!checkUpdatable(siteDoc, uid)) {
    throw Error("Forbidden access. One day has passed since the last Good to update")
  }
  await incrementSiteDocument(siteUrl, goodCount, uid)
  return
});

exports.getGood = functions.https.onCall(async (data, context) => {
  const siteUrl = data["url"]
  const uid = getUid(context)
  const siteDoc = await getSiteDocument(siteUrl, uid)
  return {
    "goodCount": siteDoc.goodCount,
    "updatable": checkUpdatable(siteDoc, uid)
  }
})

function getUid(context) {
  if (!context.auth) {
    return undefined
  } else {
    return context.auth.uid
  }
}

async function getSiteDocument(siteUrl, uid) {
  let siteDoc = await sitesCol.doc(siteUrl).get()
  if (siteDoc.exists) {
    return siteDoc.data()
  } else {
    return initSiteDocument(siteUrl)
  }
}

function initSiteDocument(siteUrl) {
  return sitesCol.doc(siteUrl).set({
    goodCount: 0,
    lastModified: {}
  }).then(() => {
    return {"goodCount": 0, "lastModified": {}}
  })
}

function incrementSiteDocument(siteUrl, goodCount, uid) {
  let data = {}
  data["goodCount"] = FieldValue.increment(goodCount)
  data[`lastModified.${uid}`] = FieldValue.serverTimestamp()
  sitesCol.doc(siteUrl).update(data)
  goodsCol.add({"good_count": goodCount, "uid": uid, "timestamp": FieldValue.serverTimestamp(), "url": siteUrl})
}

function checkUpdatable(siteDoc, uid) {
  if (!uid || !siteDoc.lastModified[uid]) return true
  const now = new Date().getTime()
  const lastModified = siteDoc.lastModified[uid].toDate().getTime()
  const day = 86400000
  return (now - lastModified) > day
}



