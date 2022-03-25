import { ChildProcess, exec } from 'child_process';

const execPromise = async (cmd: string, stdin?: string) => {
    return new Promise<{ stdout: string; stderr: string }>(
        (resolve, reject) => {
            const reorderProcess: ChildProcess = exec(
                cmd,
                (error, stdout, stderr) => {
                    if (error) {
                        reject(error);
                        return;
                    }
                    resolve({ stdout, stderr });
                }
            );
            if (stdin) {
                // send code to be formatted into stdin
                reorderProcess.stdin?.write(stdin);
                reorderProcess.stdin?.end();
            }
        }
    );
};

export default execPromise;
