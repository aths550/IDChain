const axios = require("axios");
const FormData = require("form-data");
const fs = require("fs");
const path = require("path");

const cacheDir = path.join(__dirname, "../cache");
if (!fs.existsSync(cacheDir)) {
  fs.mkdirSync(cacheDir, { recursive: true });
}

function prepareMetadataKeyvalues(jsonBody, keyvalues = {}) {
  const merged = { ...keyvalues };
  for (const [key, value] of Object.entries(jsonBody)) {
    if (value === null || value === undefined) continue;
    if (typeof value === "object") continue;
    const safeKey = key.substring(0, 100);
    const safeVal = String(value).substring(0, 200);
    merged[safeKey] = safeVal;
  }
  return merged;
}

function reconstructFromKeyvalues(keyvalues) {
  const obj = {};
  for (const [k, v] of Object.entries(keyvalues)) {
    if (v === "true") {
      obj[k] = true;
    } else if (v === "false") {
      obj[k] = false;
    } else if (!isNaN(v) && v !== "") {
      obj[k] = Number(v);
    } else {
      obj[k] = v;
    }
  }
  return obj;
}

exports.uploadToIPFS = async (filePath, fileName, keyvalues = {}) => {
  const url = `https://api.pinata.cloud/pinning/pinFileToIPFS`;

  let data = new FormData();
  data.append("file", fs.createReadStream(filePath));

  const metadata = JSON.stringify({
    name: fileName,
    keyvalues
  });
  data.append("pinataMetadata", metadata);

  const pinataOptions = JSON.stringify({
    cidVersion: 0,
  });
  data.append("pinataOptions", pinataOptions);

  try {
    const response = await axios.post(url, data, {
      maxBodyLength: "Infinity",
      headers: {
        "Content-Type": `multipart/form-data; boundary=${data._boundary}`,
        pinata_api_key: process.env.PINATA_API_KEY,
        pinata_secret_api_key: process.env.PINATA_SECRET_API_KEY,
      },
    });
    return response.data.IpfsHash;
  } catch (error) {
    console.error("Error uploading to Pinata IPFS:", error);
    throw error;
  }
};

exports.pinJSONToIPFS = async (jsonBody, name, keyvalues = {}) => {
  const url = `https://api.pinata.cloud/pinning/pinJSONToIPFS`;
  
  const mergedKeyvalues = prepareMetadataKeyvalues(jsonBody, keyvalues);

  const data = {
    pinataMetadata: {
      name: name,
      keyvalues: mergedKeyvalues
    },
    pinataContent: jsonBody
  };

  try {
    const response = await axios.post(url, data, {
      headers: {
        pinata_api_key: process.env.PINATA_API_KEY,
        pinata_secret_api_key: process.env.PINATA_SECRET_API_KEY,
      },
    });
    const cid = response.data.IpfsHash;
    
    // Save to cache immediately
    try {
      const cachePath = path.join(cacheDir, `${cid}.json`);
      fs.writeFileSync(cachePath, JSON.stringify(jsonBody, null, 2), "utf8");
    } catch (cacheErr) {
      console.error("Error writing to IPFS cache:", cacheErr.message);
    }

    return cid;
  } catch (error) {
    console.error("Error pinning JSON to Pinata:", error);
    throw error;
  }
};

exports.queryPinataFiles = async (metadataQueryParams) => {
  let url = `https://api.pinata.cloud/data/pinList?status=pinned`;
  
  for (const [key, value] of Object.entries(metadataQueryParams)) {
    const valString = JSON.stringify({ value: value, op: "eq" });
    url += `&metadata[keyvalues][${key}]=${encodeURIComponent(valString)}`;
  }

  let retries = 3;
  while (retries > 0) {
    try {
      const response = await axios.get(url, {
        headers: {
          pinata_api_key: process.env.PINATA_API_KEY,
          pinata_secret_api_key: process.env.PINATA_SECRET_API_KEY,
        },
      });
      return response.data.rows;
    } catch (error) {
      console.error(`Error querying Pinata files (${retries} retries left):`, error.response ? error.response.data : error.message);
      retries--;
      if (retries === 0) throw error;
      // Exponential backoff: Wait 1s, then 2s
      await new Promise(resolve => setTimeout(resolve, (4 - retries) * 1000));
    }
  }
};

exports.getFromIPFS = async (cid) => {
  const cachePath = path.join(cacheDir, `${cid}.json`);

  // 1. Try local cache
  if (fs.existsSync(cachePath)) {
    try {
      const cachedData = fs.readFileSync(cachePath, "utf8");
      return JSON.parse(cachedData);
    } catch (err) {
      console.error("Cache read error, falling back:", err.message);
    }
  }

  // 2. Try Gateways in sequence
  const gateways = [
    {
      url: `https://gateway.pinata.cloud/ipfs/${cid}`,
      headers: {}
    },
    {
      url: `https://ipfs.io/ipfs/${cid}`,
      headers: {
        "User-Agent": "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36"
      }
    }
  ];

  for (const gw of gateways) {
    try {
      const response = await axios.get(gw.url, { headers: gw.headers, timeout: 5000 });
      if (response.data) {
        // Save to cache
        try {
          fs.writeFileSync(cachePath, JSON.stringify(response.data, null, 2), "utf8");
        } catch (cacheErr) {
          console.error("Error saving fetched data to cache:", cacheErr.message);
        }
        return response.data;
      }
    } catch (err) {
      console.warn(`Gateway fetch failed for ${gw.url}:`, err.response ? err.response.status : err.message);
    }
  }

  // 3. Fallback: Query metadata from Pinata Pin List API
  try {
    const listUrl = `https://api.pinata.cloud/data/pinList?hashContains=${cid}`;
    const response = await axios.get(listUrl, {
      headers: {
        pinata_api_key: process.env.PINATA_API_KEY,
        pinata_secret_api_key: process.env.PINATA_SECRET_API_KEY,
      },
      timeout: 5000
    });
    if (response.data && response.data.rows && response.data.rows.length > 0) {
      const pin = response.data.rows[0];
      if (pin.metadata && pin.metadata.keyvalues) {
        const reconstructed = reconstructFromKeyvalues(pin.metadata.keyvalues);
        // Save to cache
        try {
          fs.writeFileSync(cachePath, JSON.stringify(reconstructed, null, 2), "utf8");
        } catch (cacheErr) {
          console.error("Error saving reconstructed data to cache:", cacheErr.message);
        }
        return reconstructed;
      }
    }
  } catch (err) {
    console.error("Fallback query to Pinata Pin List failed:", err.message);
  }

  throw new Error(`Failed to retrieve content for CID ${cid} from all gateways and fallbacks.`);
};

exports.unpinFile = async (cid) => {
  const url = `https://api.pinata.cloud/pinning/unpin/${cid}`;
  
  // Also clean up from local cache if unpinned
  try {
    const cachePath = path.join(cacheDir, `${cid}.json`);
    if (fs.existsSync(cachePath)) {
      fs.unlinkSync(cachePath);
    }
  } catch (err) {
    console.error("Error clearing cached file upon unpin:", err.message);
  }

  try {
    await axios.delete(url, {
      headers: {
        pinata_api_key: process.env.PINATA_API_KEY,
        pinata_secret_api_key: process.env.PINATA_SECRET_API_KEY,
      },
    });
    return true;
  } catch (error) {
    console.error("Error unpinning from Pinata:", error);
    throw error;
  }
};
