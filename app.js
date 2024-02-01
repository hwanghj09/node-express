const express = require('express');
const os = require('os');

const app = express();
const port = 3000;

app.set('view engine', 'ejs');

app.get('/', (req, res) => {
    const internalIP = getInternalIP();
    const externalIP = getExternalIP();
    const publicIP = getPublicIP();

    res.render('index', { internalIP, externalIP, publicIP });
});

function getInternalIP() {
    const interfaces = os.networkInterfaces();
    for (const interfaceName in interfaces) {
        const interfaceInfo = interfaces[interfaceName];
        for (const info of interfaceInfo) {
            if (info.family === 'IPv4' && !info.internal) {
                return info.address;
            }
        }
    }
    return 'Internal IP not found';
}

function getExternalIP() {
    const interfaces = os.networkInterfaces();
    for (const interfaceName in interfaces) {
        const interfaceInfo = interfaces[interfaceName];
        for (const info of interfaceInfo) {
            if (info.family === 'IPv4' && info.internal) {
                return info.address;
            }
        }
    }
    return 'External IP not found';
}

function getPublicIP() {
    // 여기에 공인 아이피를 확인하는 코드를 추가할 수 있습니다.
    // 실제로는 외부 서비스를 이용하거나 다른 방법을 사용해야 합니다.
    return 'Public IP not found';
}

app.listen(port, () => {
    console.log(`Server is running at http://localhost:${port}`);
});