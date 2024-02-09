const endpoint ="/getUser"
let user_id;



fetch(endpoint).then( res => {
    if(res.ok){
        return res.json()
    }
}).then(data => {
    user_id = data.user_id
}).catch(err => {})