import { SerialPort } from 'serialport';

SerialPort.list()
  .then(ports => {
    const found = ports.some(port => port.path === '/dev/ttyS0');
    if (found) {
      console.log('/dev/ttyS0');
    } else {
      console.log('null');
    }
  })
  .catch(err => {
    console.error('Error listing ports:', err);
    console.log('null');
  });