const config = require('config'),
      bluebird = require('bluebird'),
      winston = require('winston'),
      request = bluebird.promisifyAll(require('request')),
      co = require('co');

const processors =  config.get('tenants').map(tenant=>process(tenant));

Promise.all(processors).then(results=>winston.info('script completed. Updated password policy results: ',results));

function process(tenant){
    return co(function*() { 
        try {
            var token = yield getApiToken(tenant.domain, tenant.client_id, tenant.client_secret);
            var newPolicy = yield udpatePasswordPolicy(tenant.domain, tenant.connection_name, token,"good");
            winston.info(`password policy for "${tenant.connection_name}" updated successfully...`);

            return newPolicy;

        }catch(err){
            winston.error(err);
            throw new Error(`policy update failed for "${tenant.domain}"...`);
        }
    });
}

function udpatePasswordPolicy(domain, connection_name, token, policy){
    return co(function*(){
        winston.info(`updating connection policy to "${policy}"...`);
        var connection_id = yield getConnectionId(domain,connection_name,token);
        var body = {
            options: {
                passwordPolicy: policy
            }
        };
        var updatedConnection = yield patchConnection(domain, connection_id, token, body);
        return updatedConnection.options.passwordPolicy;
    });
}

function patchConnection(domain, id, token, body){
    return co(function*() {
        winston.info(`patching connection "${id}"...`);
        var response = 
        yield request.patchAsync({
            url:`https://${domain}/api/v2/connections/${id}`,
            json: body,
            headers: {
                "Authorization": `Bearer ${token}`
            }
        });
        if (response.statusCode!=200){
            winston.error(response.body);
            throw new Error('Update conneciton failed.')
        }
        return response.body;
    })
    .catch(onError)
    ;
}
function getConnectionId(domain, connection_name, token) {
    return co(function*(){
        winston.info(`getting connection_id for "${connection_name}"...`);
        var response = yield request.getAsync({
            url: `https://${domain}/api/v2/connections?name=${connection_name}&fields=id&include_fields=true`,
            headers: {
                "Authorization": `Bearer ${token}`
            }
        });
        var connection = JSON.parse(response.body);

        if (connection.length===0){
            throw new Error(`connection_id lookup failed. Make sure domain:"${domain}" and connection:"${connection_name}" are correct...`);
        }
        // extract connection_id from the response... 
        return connection.shift().id;
    });
}

function getApiToken(domain, client_id, client_secret){
    return co(function*() { 
     winston.info(`getting token for ${client_id}...`);

     var tokenReponse = 
     yield request.postAsync({
            url: `https://${domain}/oauth/token`,
            json: {
                client_id: client_id,
                client_secret: client_secret,
                grant_type: "client_credentials",
                audience: `https://${domain}/api/v2/`
            }
        });
        if (tokenReponse.statusCode!=200){
            winston.error(tokenReponse.body);
            throw new Error(`Token call failed. Make sure client_id ${client_id} is authorized to call management api v2`);
        }
        return tokenReponse.body.access_token;
    });
}

function onError(err){
    winston.error(err);
}