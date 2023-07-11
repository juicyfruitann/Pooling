# Quick start
- Инструмент [k6](https://k6.io/) (написан на GO, скрипты на JS), [установка](https://k6.io/docs/getting-started/installation/) как бинарь
- [Предварительная настройка нагрузочной машины](https://k6.io/docs/misc/fine-tuning-os/)
- Запуск `k6 run --out influxdb=http://10.98.92.107:8086/myk6db file.js`
  - Для экспорта метрик нужен подключенный VPN
 - [Отчет](https://prometheus.ks.devlogics.ru/d/XKhgaUpik/load-testing-k6-results?orgId=1&from=1643267681180&to=1643268442892&var-Measurement=http_req_duration&var-URL=All&var-datasource=Prometheus&var-cluster=&var-namespace=pooling-test5)
- На проде пулинга 6 api, 3 reports скейлить можно [в даше кубера](https://kubernetes.ks.devlogics.ru/#/deployment?namespace=pooling-test5)

# Tests
- [helper.js](helper.js) - нагрузка помогатора по складам или кладру

# Utils
- [token.js](token.js) - генерирует пользователей и токенов для дальнейшего нагрузочного тестирования. Время жизни токена 16 минут