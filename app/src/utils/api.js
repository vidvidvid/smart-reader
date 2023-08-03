async function postData(url = '', data = {}) {
  // Default options are marked with *
  console.log(process.env.REACT_APP_SUPABASE_ANON_KEY);
  const response = await fetch(url, {
    method: 'POST',
    // mode: 'no-cors',
    cache: 'no-cache',
    // credentials: 'same-origin',
    headers: {
      'Content-Type': 'application/json',
      Authorization: 'Bearer ' + process.env.REACT_APP_SUPABASE_ANON_KEY,
    },
    // redirect: 'follow',
    // referrerPolicy: 'no-referrer',
    body: JSON.stringify(data),
  });
  console.log('response', response);
  return response.json();
}

export default postData;
