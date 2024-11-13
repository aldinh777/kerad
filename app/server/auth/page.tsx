import type { ServerContext } from '@aldinh777/kerad-core';
import { computed, state } from '@aldinh777/reactive';
import { login } from '../../../db/repositories/user.ts';
import { sessionByCookie } from '../../../lib/tools/session.ts';

export default function (_: any, context: ServerContext) {
    const sessionData = sessionByCookie(context);
    const error = state('');
    const success = state('');
    const user = sessionData.get('user');

    async function handleLogin(formData: FormData) {
        const username = formData.get('username') as string;
        const password = formData.get('password') as string;
        const user = await login(username, password);
        if (user) {
            const roles = user.userRoles.map((userRole) => userRole.role?.name).join(' | ');
            sessionData.set('user', user);
            success('logged in successfully as ' + roles);
            error('');
        } else {
            success('');
            error('wrong username or password');
        }
    }

    return (
        <div>
            <div>{user ? 'Logged In as : ' + user.username : 'Not Logged In'}</div>
            <div>{user ? 'Roles : ' + user.userRoles.map((userRole: any) => userRole.role?.name).join(' | ') : ''}</div>
            <h3>Auth</h3>
            <form on:submit={handleLogin}>
                {computed(() => (success() ? <div style={{ color: 'green' }}>{success}</div> : <></>))}
                {computed(() => (error() ? <div style={{ color: 'red' }}>{error}</div> : <></>))}
                <div>
                    <label htmlFor="username">Username</label>
                    <input type="text" name="username" id="username" />
                </div>
                <div>
                    <label htmlFor="password">Password</label>
                    <input type="password" name="password" id="password" />
                </div>
                <div>
                    <button type="submit">Login</button>
                    <button on:click={() => sessionData.delete('user')}>Logout</button>
                </div>
            </form>
        </div>
    );
}
