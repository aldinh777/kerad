const hotReloadsocket = new WebSocket(`ws://localhost:3101/hr`)
hotReloadsocket.addEventListener('message', () => location.reload())
