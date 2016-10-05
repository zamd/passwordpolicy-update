#Password policy update script

Simple script to update password policies of muliple Auth0 tenants using management API. [See this document](https://auth0.com/docs/connections/database/password-strength#password-policies) for a list of valid password policies.


***To Run:***

- Clone the repo: 
`git clone `

- Make sure node version `4.3.2` or higher is installed
`node --version`

- Install depenedencies
`npm intstall`

- Create a Non-Interactive client in each Auth0 tenant and authorize it to `read:connection` and `update:connection` scopes for management API v2

- Create a tenant entry in `/config/default.json` file for each tenant
```
  "tenants" : [
        {
        }, 
        {
        }, 
    ]
 ```
    
- Copy the `client_id` and `client_secret` of the Non-Interactive client in `/config/default.json` file against the matching tenant details
```    
  "tenants" : [
        {
            "domain": "{tenant}.auth0.com",
            "client_id": "CLIENT_ID OF THE NON-INTERACTIVE CLIENT",
            "client_secret": "CLIENT_SECRET",
            "connection_name":"CONNECTION_NAME",
            "password_policy": "good"
        } 
    ]
```
- Run the script
`node index.js`

- The output shows the _updated_ passwordPolicy

```
info: getting token for 6bYyI6Yo7jx3UE72xQJAPRtQc6JgApo2...
info: getting token for szopv6S2OIkj7DFCGDF3ou6IhXZQPn3e...
info: updating connection policy to "good"...
info: getting connection_id for "apidb"...
info: updating connection policy to "good"...
info: getting connection_id for "apidb"...
info: patching connection "con_O4LudccTrPJWSCqi"...
info: patching connection "con_45SoxBbX0tAzVv5r"...
info: password policy for "apidb" updated successfully...
info: password policy for "apidb" updated successfully...
info: script completed. Updated password policy results:  0=good, 1=good
```