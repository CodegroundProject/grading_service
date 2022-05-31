const consul = require("consul")
const CONSUL_ID = require('uuid').v4();
let details = {
    name: 'grading',
    address: process.env.HOST,
    port: process.env.PORT,
    id: CONSUL_ID,
    check: {
        ttl: '10s',
        deregister_critical_service_after: '1m'
    }
};

const consulClient = new consul()

let known_rce_instances = [];



const rceWatcher = consul().watch({
    method: consul().health.service,
    options: {
        service: 'Codeground RCE',
        passing: true
    }
});

rceWatcher.on('change', data => {
    known_rce_instances = [];
    data.forEach(entry => {
        console.log(entry)
        known_rce_instances.push(`http://${entry.Service.Address}:${entry.Service.Port}/api/rce`);
    });
});

const startHeartBeating = () => {
    consulClient.agent.service.register(details, err => {
        // schedule heartbeat
        if (err) {
            return
        }
        setInterval(() => {
            consulClient.agent.check.pass({ id: `service:${CONSUL_ID}` }, err => {
                if (err) throw new Error(err);
                console.log('told Consul that we are healthy');
            });
        }, 5 * 1000);

    });

    process.on('SIGINT', () => {
        console.log('SIGINT. De-Registering...');
        let details = { id: CONSUL_ID };

        consulClient.agent.service.deregister(details, (err) => {
            console.log('de-registered.', err);
            process.exit();
        });
    });

}

function getRCE() {
    console.log(known_rce_instances)
    return known_rce_instances[Math.floor(Math.random() * (known_rce_instances.length - 1))];
}

module.exports = { startHeartBeating, getRCE }