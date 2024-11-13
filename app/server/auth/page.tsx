import { computed, state } from '@aldinh777/reactive';
import { login } from '../../../db/repositories/user.ts';

export default function () {
    const error = state('');
    const success = state('');
    return (
        <div>
            <h3>Auth</h3>
            <form
                on:submit={async (formData: FormData) => {
                    const username = formData.get('username') as string;
                    const password = formData.get('password') as string;
                    const user = await login(username, password);
                    if (user) {
                        const roles = user.userRoles.map((userRole) => userRole.role?.name).join(' | ');
                        success('logged in successfully as ' + roles);
                        error('');
                    } else {
                        success('');
                        error('wrong username or password');
                    }
                }}
            >
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
                </div>
            </form>
        </div>
    );
}
