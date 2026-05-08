import axios from 'axios';

async function test() {
  try {
    const res = await axios.get('https://ok.surf/api/v1/cors/news-feed');
    console.log(Object.keys(res.data));
    console.log(res.data['Technology'][0]);
  } catch (e) {
    console.error(e);
  }
}

test();
