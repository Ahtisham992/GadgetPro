fetch('https://dns.google/resolve?name=_mongodb._tcp.cluster1.yvtj5.mongodb.net&type=SRV')
  .then(res => res.json())
  .then(data => console.log(JSON.stringify(data.Answer, null, 2)))
  .catch(err => console.error(err));
