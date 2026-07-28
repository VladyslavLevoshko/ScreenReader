есть проблема с подгрузкой вокрера после сборки. Подозреваю путь к ресурсам в микроблинке
    resourcesLocation: "http://localhost:5173/resources",
после сборки локальный сервер вайта пропадает и не удается найти файл. На виндовс после сборки и запуска все ок, начинаем сканировать => net::ERR_CONNECTION_REFUSED

ключ микроблинка должен браться из главного процесса

индекс html навести порядок:
      content="connect-src *; default-src 'self'; script-src 'self' blob: 'wasm-unsafe-eval'; worker-src 'self' blob:; img-src 'self' data: blob:"    />
