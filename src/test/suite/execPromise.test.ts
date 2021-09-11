import assert from 'assert';
import execPromise from '../../execPromise';

const suiteDesc = 'Test execAsync';
suite(suiteDesc, () => {
    test('test stdout', async () => {
        const { stdout, stderr } = await execPromise('echo string');
        assert(stdout.trim() === 'string');
        assert(stderr.trim() === '');
    });

    test('test stderr', async () => {
        const { stdout, stderr } = await execPromise('echo string 1>&2');
        assert(stdout.trim() === '');
        assert(stderr.trim() === 'string');
    });

    test('test stdin', async () => {
        const cmd = process.platform === 'win32' ? 'findstr x*' : 'echo';
        const { stdout, stderr } = await execPromise(cmd, 'string');
        assert(stdout.trim() === 'string');
        assert(stderr.trim() === '');
    });
});
