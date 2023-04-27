import mysql from 'mysql2';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import * as EmailValidator from 'email-validator';

// Костылим импорт конфига
import { createRequire } from 'module';
const require = createRequire(import.meta.url);
const config = require('../config/default.json');

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

// Check tokens START
// * Проверяем, просрочен ли access_token
const checkToken = (access_token) => {
  return jwt.verify(access_token, config.jwtAccessSecret, (err, user) => {
    if (err) {
      return true;
    }
  });
};
// Check tokens END

const getObjects = (body) => {
  return new Promise((resolve, reject) => {
    const { access_name, user_id } = body;

    let sql = '';

    // Если вы администратор, то выводим все объекты
    if (access_name === 'Администратор') {
      sql = `SELECT * FROM objects;`;
    }

    // Если заказчик, то выводим его объекты
    else if (access_name === 'Клиент' || access_name === 'Гость') {
      sql = `SELECT ob.id, ob.name, uob.user_id FROM objects AS ob 
      INNER JOIN users_objects AS uob ON uob.object_id = ob.id 
      WHERE uob.user_id = ${user_id};`;
    }

    connection.connect();
    connection.query(sql, (error, results) => {
      const isInvalidToken = checkToken(body.access_token);

      // Если токен просрочен
      if (isInvalidToken) {
        let message = 'Invalid Token';
        resolve({ results, message });
      }

      if (error) {
        let message = 'Объекты не найдены.';
        reject({ ...error, message: message });
      }

      resolve(results);
    });
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
    // const sql = `SELECT sd.id, sd.sensor_id, sd.piezometer_id, error_code, battery_voltage, battery_charge, s.name AS sensor_name, lvl_m, lvl_m_corr, device_time, message_arr_time
    // FROM sensors_data AS sd
    // INNER JOIN sensors AS s ON s.sensor_id = sd.sensor_id
    // WHERE sd.piezometer_id = ${piezo_id}
    // ORDER BY message_arr_time DESC`;

    const sql = `SELECT sd.id, sd.sensor_id, sd.piezometer_id, sd.adc_lvl, sd.lvl_m, sd.lvl_m_corr, sd.battery_voltage, sd.battery_charge, sd.error_code, s.name AS sensor_name, sd.device_time, sd.message_arr_time, sd.working_mode, sd.sleep_time
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

const removeObject = (object_id) => {
  return new Promise((resolve, reject) => {
    connection.connect();

    const sql = `DELETE FROM objects WHERE id=${object_id}`;

    connection.query(sql, (error, results) => {
      if (error) {
        let message = 'Не удалось удалить объект...';
        reject({ ...error, message: message });
      }
      resolve(results);
    });
  });
};

const removePiezo = (piezo_id) => {
  return new Promise((resolve, reject) => {
    connection.connect();

    const sql = `DELETE FROM piezometers WHERE id=${piezo_id}`;

    connection.query(sql, (error, results) => {
      if (error) {
        let message = 'Не удалось удалить скважину...';
        reject({ ...error, message: message });
      }
      resolve(results);
    });
  });
};

const removeUser = (user_id) => {
  return new Promise((resolve, reject) => {
    connection.connect();

    const sql = `DELETE FROM users WHERE id=${user_id}`;

    connection.query(sql, (error, results) => {
      if (error) {
        let message = 'Не удалось удалить пользователя...';
        reject({ ...error, message: message });
      }
      resolve(results);
    });
  });
};

const getUsers = (body) => {
  return new Promise((resolve, reject) => {
    connection.connect();

    const sql = `SELECT u.id, u.FIO, u.email, u.access_lvl, al.name AS access_name
    FROM users AS u
    INNER JOIN access_levels AS al ON al.id = u.access_lvl;`;

    connection.query(sql, (error, results) => {
      const isInvalidToken = checkToken(body.access_token);

      // Если токен просрочен
      if (isInvalidToken) {
        let message = 'Invalid Token';
        resolve({ results, message });
      }

      if (error) {
        let message = 'Пользователи не найдены...';
        reject({ ...error, message: message });
      }

      resolve(results);
    });
  });
};

const getAccessLevels = () => {
  return new Promise((resolve, reject) => {
    connection.connect();

    const sql = `SELECT id, name as value, name as label FROM access_levels;`;

    connection.query(sql, (error, results) => {
      if (error) {
        let message = 'Данные не найдены...';
        reject({ ...error, message: message });
      }

      resolve(results);
    });
  });
};

// Получение объектов, привязанных к user_id
const getObjectsOfUser = (user_id) => {
  return new Promise((resolve, reject) => {
    connection.connect();

    const sql = `SELECT uob.user_id, uob.object_id, ob.name
    FROM objects AS ob
    INNER JOIN users_objects AS uob ON uob.object_id = ob.id
    WHERE uob.user_id = ${user_id};`;

    connection.query(sql, (error, results) => {
      if (error) {
        let message = 'Данные не найдены...';
        reject({ ...error, message: message });
      }

      resolve(results);
    });
  });
};

// Запрос на редактирование юзера
const updateUser = (body) => {
  return new Promise((resolve, reject) => {
    const { user_id, FIO, email, access_lvl } = body;

    connection.connect();

    const sql = `UPDATE users AS u
    SET u.FIO = '${FIO}', u.email = '${email}', u.access_lvl = ${access_lvl}
    WHERE u.id = ${user_id};`;

    connection.query(sql, (error, results) => {
      if (error) {
        let message = error;
        reject({ ...error, message: message });
      }
      resolve(results);
    });
  });
};

// Запрос на добавление юзера
const addUser = (body) => {
  return new Promise((resolve, reject) => {
    const { FIO, email, password, access_lvl } = body;

    const saltRounds = 12;
    const hash = bcrypt.hashSync(password, saltRounds);

    if (FIO !== '' && email !== '' && password !== '') {
      connection.connect();

      const sql = `INSERT INTO users (FIO, email, password, access_lvl) VALUES ('${FIO}', '${email}', '${hash}', ${access_lvl})`;

      connection.query(sql, (error, results) => {
        if (error) {
          let message;

          if (error.code === 'ER_DUP_ENTRY') {
            message = 'Пользователь с таким email уже существует';
          } else {
            message = error;
          }

          reject({ message: message });
        }
        resolve(results);
      });
    }
  });
};

// Запрос на обновление привязанных к юзеру объектов
const updateUsersOfObjects = (body, user_id) => {
  return new Promise((resolve, reject) => {
    connection.connect();

    // Получаем объекты и приводим к виду ?, ?, ?
    let getObjectsId = body.activeObjects.map((item) => item.id);
    let objectsIdJoin = getObjectsId.join(', ');

    let sqlDelete = '';
    // Удаляем те объекты, которые юзер убрал
    if (body.activeObjects.length !== 0) {
      sqlDelete = `DELETE FROM users_objects WHERE user_id = ${user_id} AND (object_id) NOT IN (${objectsIdJoin});`;
    } else {
      sqlDelete = `DELETE FROM users_objects WHERE user_id = ${user_id};`;
    }

    // Затем если был добавлен новый объект, то вставляем его, а если объект уже существует, то ничего не делаем (оставляем запись)
    const sqlInsert = `INSERT INTO users_objects (user_id, object_id) VALUES ${[
      body.activeObjects.map((item) => '(' + [user_id, item.id] + ')'),
    ]} AS newRow ON DUPLICATE KEY UPDATE user_id = newRow.user_id, object_id = newRow.object_id;`;

    connection.query(`${sqlDelete} ${sqlInsert}`, (error, results) => {
      if (error) {
        let message = error;
        reject({ ...error, message: message });
      }
      resolve(results);
    });
  });
};

// Запрос на добавление скважины
const createPiezometer = (body) => {
  return new Promise((resolve, reject) => {
    const { name, object_id, user_id } = body;

    connection.connect();

    const sqlAdd = `INSERT INTO piezometers (name, user_id) VALUES ('${name}', ${user_id})`;
    const sqlGet = `SELECT id FROM piezometers WHERE name='${name}'`;

    // Добавляем новую скважину
    connection.query(sqlAdd, (error, results) => {
      if (error) {
        let message;

        if (error.code === 'ER_DUP_ENTRY') {
          message = 'Данная скважина уже существует!';
        } else {
          message = error;
        }

        reject({ message: message });
      }

      // Получаем её id
      connection.query(sqlGet, (error, results) => {
        if (error) {
          let message = error;
          reject({ message: message });
        }

        const sqlBind = `INSERT INTO objects_piezometers_sensors (object_id, piezometer_id) VALUES (${object_id}, ${results[0].id})`;
        // Связываем с объектом
        connection.query(sqlBind, (error, results) => {
          if (error) {
            let message = error;
            reject({ message: message });
          }

          resolve(results);
        });
        //resolve(results);
      });
      //resolve(results);
    });
  });
};

// Auth query START
const authUser = (body) => {
  return new Promise((resolve, reject) => {
    const { email, password } = body;
    //console.log(body);
    connection.connect();

    const sql = `SELECT u.id, u.email, u.password, u.access_lvl, al.name AS access_name FROM users AS u
    INNER JOIN access_levels AS al ON u.access_lvl = al.id WHERE email="${email}"`;

    connection.query(sql, async (error, results) => {
      let message = '';
      let isMatch;
      let user;

      // Если пользователя нет в БД
      if (!results[0]) {
        reject({ ...error, message: 'Пользователь не найден!' });
      }

      // Если логин или пароль не заполнены
      else if (!email || !password) {
        reject({ ...error, message: 'Логин или пароль введены неверно!' });
      }

      // Валидация email
      else if (!EmailValidator.validate(email)) {
        reject({ ...error, message: 'Email введен некорректно!' });
      }

      // Проверяем соответствие пароля с БД
      else {
        isMatch = await bcrypt.compare(password, results[0].password);
      }

      // Если пароль не совпадает
      if (!isMatch) {
        message = 'Неверный пароль, попробуйте ещё раз';
        reject({ ...error, message: message });
      }

      // Генерируем jwt и формируем тело для отправки ответа
      else {
        // Access token
        const accessToken = jwt.sign(
          { user_id: results[0].id },
          config.jwtAccessSecret,
          {
            expiresIn: config.expiresInAccess,
          }
        );

        // Refresh token
        const refreshToken = jwt.sign(
          { user_id: results[0].id },
          config.jwtRefreshSecret,
          {
            expiresIn: config.expiresInRefresh,
          }
        );

        user = results[0];
        user.accessToken = accessToken;
        user.refreshToken = refreshToken;
      }

      // Прочие ошибки
      if (error) {
        message = 'Что-то пошло не так, попробуйте снова...';
        reject({ ...error, message: message });
      }

      resolve(user);
    });
  });
};
// Auth query END

// Reset pass query START
const resetPass = (body) => {
  return new Promise(async (resolve, reject) => {
    const { email, newpass } = body;
    //console.log(body);
    connection.connect();

    // Хэшируем пароль
    const hashedPassword = await bcrypt.hash(newpass, 12);
    const sql = `UPDATE users SET password = '${hashedPassword}' WHERE email = '${email}';`;

    connection.query(sql, async (error, results) => {
      let message = '';

      // Если логин или пароль не заполнены
      if (!email) {
        reject({ ...error, message: 'Введите email!' });
      }

      // Если пользователя нет в БД
      else if (results.affectedRows === 0) {
        reject({
          ...error,
          message: 'Пользователь с указанным email не найден!',
        });
      }

      // Валидация email
      else if (!EmailValidator.validate(email)) {
        reject({ ...error, message: 'Email введен некорректно!' });
      }

      // Прочие ошибки
      if (error) {
        message = 'Что-то пошло не так, попробуйте снова...';
        reject({ ...error, message: message });
      }

      resolve(results);
    });
  });
};
// Reset pass query END

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
  removeObject,
  authUser,
  resetPass,
  getUsers,
  removeUser,
  getAccessLevels,
  getObjectsOfUser,
  updateUser,
  addUser,
  updateUsersOfObjects,
  createPiezometer,
  removePiezo,
};
