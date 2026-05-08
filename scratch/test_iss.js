import axios from 'axios';

async function test() {
  try {
    const res = await axios.get('https://api.wheretheiss.at/v1/satellites/25544');
    console.log(res.data);
  } catch (e) {
    console.error(e);
  }
}

test();
