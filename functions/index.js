const functions = require('firebase-functions');
const admin = require('firebase-admin')
admin.initializeApp();

const FieldValue = admin.firestore.FieldValue
let sitesCol = admin.firestore().collection('sites')
let goodsCol = admin.firestore().collection('goods')

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

function onGet(req, resp) {
  const url_encoded = req.query['url_encoded']
  if (url_encoded == undefined || url_encoded == '') {
    return res.send("Error: Value error. No url in request.")
  }
  let site_doc = await getSiteDocument(url_encoded)
  return res.send(site_doc.good_count)
}

function onPost(req, res) {
  const url_encoded = req.params['url_encoded']
  const client_ip = request.get('fastly-client-ip')

  if (url_encoded == undefined || url_encoded == '') {
    return response.send("Error: Value error. No url in request.")
  }

  const good_count = Number(request.params.good_count)
  if (good_count == NaN) {
    return response.send("Error: Value error. good_count is NaN.")
  }
  let site_doc = await getSiteDocument(url_encoded)
  let access_log = await getAccessLog(url_encoded, client_ip)

  if (checkUpdatable(access_log)){
    incrementSiteDocument(url_encoded, client_ip, good_count)
    return res.send(Number(site_doc.good_count) + good_count)
  }
}

function checkUpdatable(client_access_log) {
  if (!client_access_log.exists) {
    return true
  }
  const now = new Date().getTime()
  const last_modified = Date.parse(client_access_log.timestamp).getTime()
  const day = 86400000
  return now - last_modified > day
}

async function getSiteDocument(url_encoded) {
  let site_doc = await sitesCol.doc(url_encoded).get('good_count')
  if (site_doc.exists) {
    return site_doc
  } else {
    return await initSiteDocument(url_encoded)
  }
}

function initSiteDocument(url_encoded) {
  return sitesCol.doc(url_encoded).set({
    good_count: 0
  })
}

function incrementSiteDocument(url_encoded, client_ip, good_count) {
  sitesCol.doc(url_encoded).collection("access_log").doc(ip_adress).update([{"timestamp": FieldValue.timestamp}])
  goodsCol.add({"good_count": good_count, "ip_adress": client_ip, "timestamp": FieldValue.timestamp})
}

function getAccessLog(url_encoded, ip_adress) {
  return sitesCol.doc(url_encoded).collection("access_log").doc(ip_adress).get()
}



