const reloadWsHost = 'localhost:3101'
const hotReloadsocket = new WebSocket(`ws://${reloadWsHost}/hr`)
hotReloadsocket.addEventListener('message', () => location.reload())
