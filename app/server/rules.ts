// execute at first
export default function middleware() {
    // put guard code here
}

// then match the available common methods
export function get() {
    // handle GET requests
}
export function post() {
    // handle POST requests
}
export function put() {
    // handle PUT requests
}
export function del() {
    // handle DELETE requests
}
export function patch() {
    // handle PATCH requests
}

// finally the last handler
export function all() {
    // handle all requests
}

// if said things happen
export function notFound() {
    // handle 404 not found
}
export function error() {
    // handle error responses
}
