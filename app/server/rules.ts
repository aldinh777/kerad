// execute at first
export default function middleware() {
    // console.log('default');
}

// then match the available common methods
export function get() {
    // console.log('get');
}
export function post() {
    // console.log('post');
}
export function put() {
    // console.log('put');
}
export function del() {
    // console.log('delete');
}
export function patch() {
    // console.log('patch');
}

// finally the last handler
export function all() {
    // console.log('all');
}

// if said things happen
export function notFound() {
    // console.log('not found');
}
export function error() {
    // console.log('error');
}
