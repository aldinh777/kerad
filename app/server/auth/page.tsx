import type { ServerContext } from '@aldinh777/kerad-core';
import { computed, state } from '@aldinh777/reactive';

export default function (_: any, context: ServerContext) {
    const user = context.session.userState;

    const success = state('');
    const color = state('red');

    async function handleLogin(formData: FormData) {
        const username = formData.get('username') as string;
        const password = formData.get('password') as string;
        const user = await context.session.login(username, password);
        if (user) {
            success('Login Success. Welcome ' + username + ' | ' + user.roles.join(' | '));
            color('green');
        } else {
            context.session.logout();
            success('Username or Password is incorrect');
            color('red');
        }
    }

    return (
        <div>
            <div>{computed(() => (user() ? 'Logged In as : ' + user()!.username : 'Not Logged In'))}</div>
            <div>{computed(() => (user() ? 'Roles : ' + user()!.roles.join(' | ') : ''))}</div>
            <h3>Auth</h3>
            <form on:submit={handleLogin}>
                <div style={{ color: color }}>{success}</div>
                <div>
                    <label for="username">Username</label>
                    <input type="text" name="username" id="username" />
                </div>
                <div>
                    <label for="password">Password</label>
                    <input type="password" name="password" id="password" />
                </div>
                <div>
                    <button type="submit">Login</button>
                    <button on:click={() => context.session.logout()}>Logout</button>
                </div>
            </form>
        </div>
    );
}
