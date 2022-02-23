require('dotenv').config()
const Bull = require('bull')

const cluster = require('cluster')
const emailProcess = require('../src/processes/email.process')
const numWorkers = 4
const emailQueue = new Bull('email', {
  redis: process.env.REDIS_URL
})

emailQueue.process(emailProcess)


const sendEmail = data => {
  emailQueue.add(data, {
    attempts: 2
  })
}

module.exports = {sendEmail}
// if (cluster.isMaster) {
//   for (let i = 0; i < numWorkers; i++) {
//     cluster.fork()
//   }
//
//   cluster.on('online', function(worker) {
//     // Let's create a few jobs for the queue workers
//     for (let i = 0; i < 500; i++) {
//       queue.add({foo: 'bar'})
//     }
//
//   })
//
//   cluster.on('exit', function(worker, code, signal) {
//     console.log('worker ' + worker.process.pid + ' died')
//   })
// } else {
//   queue.process(function(job, jobDone) {
//     console.log('Job done by worker', cluster.worker.id, job.id)
//     jobDone()
//   })
// }
//На базе первой части, сделать поддержку запроса, позволяющего получить на email
// аналитический отчёт.
// Параметры запроса:
// ❏ start_date — начало интервала
// ❏ end_date — конец интервала
// ❏ email — куда отправить отчёт
// Поля в ответе:
// ❏ message: “Report generation started”
// Запрос должен добавляет задачу на генерацию отчёта в очередь фоновых задач,
// обрабатывающуюся отдельным процессом. Готовый отчёт отправляется на email
// указанный в задаче.
// Отчёт должен представлять собой таблицу со столбцами:
// ❏ nickname
// ❏ email
// ❏ количество записей за период
// ❏ количество комментариев за период
// Строки в отчёте должны быть отсортированы по значению вычисляемому как
// (количество постов + количество комментариев/10). Таблицу можно оформить как в
// виде html таблицы так и при помощи ASCII символов — внешний вид не имеет
// значения.