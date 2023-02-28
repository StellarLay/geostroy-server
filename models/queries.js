import mysql from 'mysql2';

// db connect
const connection = mysql.createConnection({
  host: 'mysql.hosting.nic.ru',
  user: 'geo3852847_mysql',
  password: 'X1-rZEfM',
  database: 'geo3852847_db',
});

const getObjects = () => {
  return new Promise((resolve, reject) => {
    connection.connect();

    connection.query(
      'SELECT * FROM objects',
      //[email, password],
      (error, results) => {
        if (error) {
          let message = 'Объекты не найдены.';
          reject({ ...error, message: message });
        }
        //connection.end();
        resolve(results);
      }
    );
  });
};

const getPiezometers = (object_id) => {
  return new Promise((resolve, reject) => {
    connection.connect();
    const sql = `SELECT * FROM objects_piezometers_sensors INNER JOIN piezometers ON objects_piezometers_sensors.piezometer_id = piezometers.id WHERE object_id=${object_id}`;

    connection.query(sql, (error, results) => {
      if (error) {
        let message = 'Скважины не найдены.';
        reject({ ...error, message: message });
      }
      resolve(results);
    });
  });
};

const getSensors = (piezo_id) => {
  return new Promise((resolve, reject) => {
    connection.connect();
    const sql = `SELECT sd.id, sd.sensor_id, sd.piezometer_id, error_code, battery_voltage, battery_charge, s.name AS sensor_name, lvl_m, lvl_m_corr, device_time, message_arr_time
    FROM sensors_data AS sd 
    INNER JOIN sensors AS s ON s.sensor_id = sd.sensor_id
    WHERE sd.piezometer_id = ${piezo_id}
    ORDER BY message_arr_time DESC`;

    connection.query(sql, (error, results) => {
      if (error) {
        let message = 'На данной скважине нет датчика.';
        reject({ ...error, message: message });
      }
      resolve(results);
    });
  });
};

const getObjectsPiezoSensors = (piezo_id) => {
  return new Promise((resolve, reject) => {
    connection.connect();
    const sql = `SELECT piezometer_id, sensor_id FROM objects_piezometers_sensors WHERE piezometer_id=${piezo_id}`;
    //const sql = `SELECT ops.piezometer_id, ops.sensor_id, s.name FROM objects_piezometers_sensors AS ops INNER JOIN sensors AS s ON s.sensor_id = ops.sensor_id WHERE piezometer_id = ${piezo_id}`;

    connection.query(sql, (error, results) => {
      if (error) {
        let message = 'Такой скважины нет...';
        reject({ ...error, message: message });
      }
      resolve(results);
    });
  });
};

const unBindSensor = (piezo_id) => {
  return new Promise((resolve, reject) => {
    connection.connect();
    const sql = `UPDATE objects_piezometers_sensors
    SET sensor_id = null
    WHERE piezometer_id = ${piezo_id}`;

    connection.query(sql, (error, results) => {
      if (error) {
        let message = 'Не удалось отвязать датчик...';
        reject({ ...error, message: message });
      }
      resolve(results);
    });
  });
};

const getUnbindSensors = () => {
  return new Promise((resolve, reject) => {
    connection.connect();

    const sql = `SELECT * FROM sensors WHERE sensor_id NOT IN (
      SELECT ops.sensor_id
      FROM objects_piezometers_sensors AS ops 
      INNER JOIN sensors AS s ON s.sensor_id = ops.sensor_id 
    )`;

    connection.query(sql, (error, results) => {
      if (error) {
        let message = 'Свободных датчиков нет...';
        reject({ ...error, message: message });
      }
      resolve(results);
    });
  });
};

const addSensorToPiezo = (piezo_id, sensor_id) => {
  return new Promise((resolve, reject) => {
    connection.connect();

    const sql = `UPDATE objects_piezometers_sensors SET sensor_id = ${sensor_id} WHERE piezometer_id = ${piezo_id}`;

    connection.query(sql, (error, results) => {
      if (error) {
        let message = 'Не удалось привязать датчик...';
        reject({ ...error, message: message });
      }
      resolve(results);
    });
  });
};

const getSensorName = (sensor_id) => {
  return new Promise((resolve, reject) => {
    connection.connect();

    const sql = `SELECT name FROM sensors WHERE sensor_id = ${sensor_id}`;

    connection.query(sql, (error, results) => {
      if (error) {
        let message = 'Не удалось получить датчик...';
        reject({ ...error, message: message });
      }
      resolve(results);
    });
  });
};

const addSensorData = (body) => {
  return new Promise((resolve, reject) => {
    const {
      sensor_id,
      piezometer_id,
      adc_lvl,
      lvl_m,
      lvl_m_corr,
      battery_voltage,
      battery_charge,
      error_code,
      device_time,
      message_arr_time,
      working_mode,
      sleep_time,
    } = body;

    connection.connect();

    const sql = `INSERT INTO sensors_data (sensor_id, piezometer_id, adc_lvl, lvl_m, lvl_m_corr, battery_voltage, battery_charge, error_code, device_time, message_arr_time, working_mode, sleep_time)
    VALUES (
      ${sensor_id}, 
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

    connection.query(sql, (error, results) => {
      if (error) {
        let message = error;
        reject({ ...error, message: message });
      }
      resolve(results);
    });
  });
};

export default {
  getObjects,
  getPiezometers,
  getSensors,
  getObjectsPiezoSensors,
  unBindSensor,
  getUnbindSensors,
  addSensorToPiezo,
  getSensorName,
  addSensorData,
};
