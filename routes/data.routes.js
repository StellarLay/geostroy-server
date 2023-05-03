import { Router } from 'express';
import { addData, getSettings } from '../controllers/data.js';

const router = Router();

router.get('/add', addData);
router.get('/settings', getSettings);

export default router;

// http://data.programdatamera.ru/?data=[
// Номер;
// АЦП;
// Глубина в см;
// глубина с корректировкой в см;
// Напряжение аккумулятора;
// Процент заряда;
// Код ошибки;
// Время по устройству;
// текущий режим работы;
// Текущий режим сна (больше часа или меньше);
// Время сна (минут, если есть часы);
// Время сна (часы, если нет минут)
// ]
