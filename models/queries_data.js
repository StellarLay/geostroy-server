import mysql from 'mysql2';

// db connect START
const db_config = {
  host: 'mysql.hosting.nic.ru',
  user: 'geo3852847_mysql',
  password: 'X1-rZEfM',
  database: 'geo3852847_db',
  multipleStatements: true,
};

var connection;

function handleDisconnect() {
  connection = mysql.createConnection(db_config);
  connection.query('SET SESSION wait_timeout = 604800');

  connection.connect(function (err) {
    if (err) {
      console.log('error when connecting to db:', err);
      setTimeout(handleDisconnect, 2000);
    }
  });
  connection.on('error', function (err) {
    console.log('db error', err);
    if (err.code === 'PROTOCOL_CONNECTION_LOST') {
      handleDisconnect();
    } else {
      throw err;
    }
  });
}

handleDisconnect();
// db connect END

const addData = (body) => {
  return new Promise((resolve, reject) => {
    // Удаляем квадратные скобки
    let removeBrackets = body.replace(/\[|\]/g, '');

    // Получаем массив
    let data = removeBrackets.split(';');

    // По умолчанию ни к какой скважине датчик не привязан
    let piezometer_id = null;

    let adc_lvl = data[1];
    let lvl_m = data[2];
    let lvl_m_corr = data[3];
    let battery_voltage = data[4];
    let battery_charge = data[5];
    let error_code = data[6];
    let device_time = data[7];
    let working_mode = data[8];
    let working_sleep = data[9];
    let sleep_time = `${data[11]}:${data[10]}`;
    let message_arr_time = null;

    // Содержит ли adc_lvl цифры (Если нет, то это ошибка и присваиваем -1)
    let isDigitAdcLvl = /[0-9]/.test(adc_lvl);

    if (!isDigitAdcLvl) {
      adc_lvl = -1;
    }

    if (!!lvl_m || !!lvl_m_corr) {
      lvl_m = -1;
      lvl_m_corr = -1;
    }

    //connection.connect();

    const sqlAddSensor = `INSERT INTO sensors (name) VALUES ('${data[0]}')`;
    const sqlGetSensor = `SELECT sensor_id FROM sensors WHERE name='${data[0]}'`;

    // Добавляем датчик в sensors (Если его ещё нет)
    connection.query(sqlAddSensor, (error, results) => {
      // Получаем id датчика
      connection.query(sqlGetSensor, (error, results) => {
        // console.log(results[0].sensor_id);
        // console.log(adc_lvl);
        // console.log(lvl_m);
        // console.log(lvl_m_corr);
        // console.log(battery_voltage);
        // console.log(battery_charge);
        // console.log(error_code);
        // console.log(device_time);
        // console.log(working_mode);
        // console.log(sleep_time);

        const sqlAdd = `INSERT INTO sensors_data (sensor_id, piezometer_id, adc_lvl, lvl_m, lvl_m_corr, battery_voltage, battery_charge, error_code, device_time, message_arr_time, working_mode, sleep_time)
          VALUES (
            ${results[0].sensor_id},
            ${piezometer_id},
            ${adc_lvl},
            ${lvl_m},
            ${lvl_m_corr},
            ${battery_voltage},
            ${battery_charge},
            ${error_code},
            '${device_time}',
            '${message_arr_time}',
            ${working_mode},
            '${sleep_time}');`;

        //Связываем с объектом
        connection.query(sqlAdd, (error, results) => {
          if (error) {
            let message = error;
            reject({ message: message });
          }
          resolve(results);
        });
      });
    });
  });
};

export default {
  addData,
};
