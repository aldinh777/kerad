import { computed, state } from '@aldinh777/reactive';
import { list } from '@aldinh777/reactive/list';
import { login } from '../../../db/repositories/user.ts';

export default async function Views(_: any) {
    const status = state('not logged in');
    const submitting = state(false);
    const disabledStyle = computed(() => (submitting() ? 'display: none;' : 'display: block'));
    const reverseDisabledStyle = computed(() => (!submitting() ? 'display: none;' : 'display: block'));
    const submitButton = <button style={disabledStyle}>Login</button>;
    const disabledButton = (
        <button disabled="" style={reverseDisabledStyle}>
            Login
        </button>
    );
    const buttons = list([submitButton, disabledButton]);

    async function userLogin(form: FormData) {
        submitting(true);
        const username = (form.get('username') as string) || '';
        const password = (form.get('password') as string) || '';
        const user = await login(username, password);
        if (user) {
            status('success');
        } else {
            status('failed');
        }
        submitting(false);
    }
    return (
        <div>
            <h1>Login Test</h1>
            <div>status : {status}</div>
            <form on:submit={userLogin}>
                <table>
                    <tr>
                        <th>
                            <label for="username">Username</label>
                        </th>
                        <td>
                            <input type="text" name="username" id="username" />
                        </td>
                    </tr>
                    <tr>
                        <th>
                            <label for="password">Password</label>
                        </th>
                        <td>
                            <input type="text" name="password" id="password" />
                        </td>
                    </tr>
                    <tr>
                        <td colspan={2}>{buttons}</td>
                    </tr>
                </table>
            </form>
        </div>
    );
}
