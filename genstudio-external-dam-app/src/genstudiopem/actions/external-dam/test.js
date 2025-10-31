const lib = require("@adobe/aio-lib-files");

const namespace = "3399078-492fuchsiatahr";
const auth =
  "6b47cbd8-897c-4a9b-a2e3-15436540831b:o2POhXuoT68u1eXNyiGtiN7Q2hnusoPYj5b2egobtHRVpTa5QvD6TiyDtx1378X2";
const targetUrl =
  "https://monkeith.bynder.com/m/7dbfbe4c502012c8/webimage-DKDR01824_4_KA4C13K3_CUF_ALT4.png";
async function main() {
  const files = await lib.init({ ow: { namespace, auth } });
  // console.log(files);
  const res = await files.write("test/test.txt", "some private content");
  // console.log(res);
  const url = await files.generatePresignURL("test/test.txt", {
    expiryInSeconds: 6000,
  });
  console.log(url);

  // donwload file from targetUrl
  // const target = await fetch(targetUrl);
}

main();
